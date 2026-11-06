/**
 * turn-resume — Client half.
 *
 * The substitute for the recovery card. A keyed Chat renderer cannot be taken
 * over (the shipped package registers `turn-error` first and the first live entry
 * wins), so this watches the Chat snapshot instead: when the last node of the
 * transcript is an interrupted turn, a chip appears under the composer and drafts
 * the continuation into the draft.
 *
 * It never replaces anything — it is one additive cell in
 * `conversation.composer.dock`, so removing the bundle leaves the composer as the
 * shell built it.
 */
window.__ModuleLoader__.load({
  id: '@tal-shin/dsh-turn-resume',
  factory(require) {
    const React = require('react');
    const h = React.createElement;

    const TEXT = {
      en: {
        label: 'Continue the interrupted turn',
        filled: 'Draft ready',
        dismiss: 'Dismiss',
        hint: 'Drafts a continuation into the composer; nothing is sent.',
        promptStep:
          'The previous turn was interrupted at step {step}. Check the current workspace state first, then continue the unfinished work.',
        promptPlain:
          'The previous turn was interrupted. Check the current workspace state first, then continue the unfinished work.',
      },
      zh: {
        label: '继续被中断的一轮',
        filled: '已填入输入框',
        dismiss: '忽略',
        hint: '把续跑提示填进输入框，不会直接发送。',
        promptStep: '上一轮在第 {step} 步被中断。请先检查工作区当前状态，再继续未完成的步骤。',
        promptPlain: '上一轮被中断了。请先检查工作区当前状态，再继续未完成的步骤。',
      },
    };

    const fill = (template, token, value) => String(template).split(token).join(String(value));

    function translator(ctx) {
      const preferZh = String(navigator.language || '').toLowerCase().startsWith('zh');
      const fallback = (key) => (preferZh ? TEXT.zh : TEXT.en)[key] ?? '';
      try {
        const locale = ctx.get('locale');
        if (!locale) return fallback;
        locale.register('turn-resume', 'en', TEXT.en);
        locale.register('turn-resume', 'zh', TEXT.zh);
        const bound = locale.bind('turn-resume');
        return (key) => {
          try {
            const value = bound(key);
            return value && value !== key ? value : fallback(key);
          } catch {
            return fallback(key);
          }
        };
      } catch {
        return fallback;
      }
    }

    /**
     * The marker of an interrupted tail, or '' when the transcript does not end
     * in one. Scanning stops at the first real content node going backwards, so a
     * new turn, a steering message or a streaming step hides the chip again.
     */
    function selectInterruptedTail(snapshot) {
      const order = snapshot?.order;
      const nodes = snapshot?.nodes;
      if (!order || !nodes) return '';
      for (let i = order.length - 1; i >= 0; i -= 1) {
        const node = nodes.get(order[i]);
        if (!node) continue;
        const kind = node.kind;
        if (kind === 'turn-error') {
          const seq = node.data?.seq ?? order[i];
          const step = typeof node.data?.step === 'number' && node.data.step > 0 ? node.data.step : 0;
          return `${seq}:${step}`;
        }
        if (
          kind === 'user' ||
          kind === 'assistant-step' ||
          kind === 'tool-call' ||
          kind === 'steering' ||
          kind === 'command' ||
          kind === 'command-input' ||
          kind === 'question-reply'
        ) {
          return '';
        }
      }
      return '';
    }

    const CSS = `
.dtr-dock {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  margin-top: 6px;
}
.dtr-chip {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  height: 26px;
  padding: 0 11px;
  border-radius: 13px;
  border: 0.5px solid var(--dsw-alias-border-l2);
  background: color-mix(in srgb, var(--dsw-alias-bg-base) 74%, transparent);
  -webkit-backdrop-filter: blur(10px) saturate(160%);
  backdrop-filter: blur(10px) saturate(160%);
  color: var(--dsw-alias-label-secondary);
  font: inherit;
  font-size: 12px;
  line-height: 1;
  cursor: pointer;
  transition: background-color var(--glass-instant, .14s) ease, color var(--glass-instant, .14s) ease;
}
.dtr-chip:hover {
  background: var(--dsw-alias-interactive-bg-hover);
  color: var(--dsw-alias-label-primary);
}
.dtr-chip:focus-visible {
  outline: var(--dsw-focus-ring-width, 2px) solid var(--dsw-focus-ring-color, var(--dsw-alias-state-business-primary));
  outline-offset: 1px;
}
.dtr-dot {
  width: 6px; height: 6px; border-radius: 50%;
  background: var(--dsw-alias-state-error-primary);
}
.dtr-done .dtr-dot { background: var(--dsw-alias-state-success-primary); }
.dtr-dismiss {
  width: 22px; height: 22px;
  border: none; border-radius: 50%;
  background: transparent;
  color: var(--dsw-alias-label-tertiary);
  font: inherit; font-size: 14px; line-height: 1;
  cursor: pointer;
}
.dtr-dismiss:hover {
  background: var(--dsw-alias-interactive-bg-hover);
  color: var(--dsw-alias-label-primary);
}
.dtr-dismiss:focus-visible {
  outline: var(--dsw-focus-ring-width, 2px) solid var(--dsw-focus-ring-color, var(--dsw-alias-state-business-primary));
  outline-offset: 1px;
}
`;

    function apply(ctx) {
      const t = translator(ctx);

      ctx.effect(() => {
        const element = document.createElement('style');
        element.setAttribute('data-turn-resume', '');
        element.textContent = CSS;
        (document.head ?? document.documentElement).append(element);
        return () => element.remove();
      }, 'turn-resume: stylesheet');

      function ResumeChip(props) {
        const marker = props.useChat(selectInterruptedTail);
        const [dismissed, setDismissed] = React.useState('');
        const [done, setDone] = React.useState(false);

        if (!marker || dismissed === marker) return null;
        const step = Number(String(marker).split(':')[1]) || 0;

        const insert = (text) => {
          try {
            const span = props.inputActions.captureInsertion();
            if (props.inputActions.insertText(text, span) !== false) return true;
          } catch {
            /* the editor refused the caret insertion */
          }
          try {
            props.inputActions.setDraft(text);
            return true;
          } catch {
            return false;
          }
        };

        const resume = () => {
          const text = step > 0 ? fill(t('promptStep'), '{step}', step) : t('promptPlain');
          if (!insert(text)) return;
          setDone(true);
          window.setTimeout(() => setDone(false), 2400);
        };

        return h(
          'div',
          { className: 'dtr-dock' },
          h(
            'button',
            {
              type: 'button',
              className: done ? 'dtr-chip dtr-done' : 'dtr-chip',
              onClick: resume,
              title: t('hint'),
            },
            h('span', { className: 'dtr-dot', 'aria-hidden': 'true' }),
            h('span', null, done ? t('filled') : t('label')),
          ),
          h(
            'button',
            {
              type: 'button',
              className: 'dtr-dismiss',
              onClick: () => setDismissed(marker),
              'aria-label': t('dismiss'),
            },
            '×',
          ),
        );
      }

      ctx.slots.inject('conversation.composer.dock', () =>
        ctx.slots.register(
          { name: 'conversation.composer.dock', id: 'turn-resume', order: 5 },
          ResumeChip,
        ),
      );
    }

    return { inject: ['slots'], apply };
  },
});
