/**
 * turn-alert — Client half.
 *
 * The shell only raises a desktop notification when an update is ready; a turn
 * that finishes while you are in another window is silent. This module adds one
 * listener: every completed turn mounts a cell in `conversation.chat.turnTail`,
 * and that mount is the completion signal. It notifies only when the window is
 * out of focus, once per turn, and never for turns that are merely scrolled
 * back into view (those mount while the window is focused).
 */
window.__ModuleLoader__.load({
  id: '@tal-shin/dsh-turn-alert',
  factory(require) {
    const { useEffect } = require('react');

    const TEXT = {
      en: { finished: 'This turn has finished.' },
      zh: { finished: '这一轮已经跑完了。' },
    };

    /** De-duplicates mounts of the same turn (StrictMode, re-renders, scrolling). */
    const seen = new Set();

    function translator(ctx) {
      const preferZh = String(navigator.language || '').toLowerCase().startsWith('zh');
      const fallback = (key) => (preferZh ? TEXT.zh : TEXT.en)[key] ?? '';
      try {
        const locale = ctx.get('locale');
        if (!locale) return fallback;
        locale.register('turn-alert', 'en', TEXT.en);
        locale.register('turn-alert', 'zh', TEXT.zh);
        const bound = locale.bind('turn-alert');
        return (key) => {
          try {
            const value = bound(key);
            return value && value !== key ? value : fallback(key);
          } catch {
            return fallback(key);
          }
        };
      } catch {
        // A locale failure must never take the alert down with it.
        return fallback;
      }
    }

    function raise(title, body, tag) {
      try {
        const notification = new Notification(title, { body, tag, silent: false });
        notification.onclick = () => {
          try {
            window.focus();
          } catch {
            /* the window is gone */
          }
          notification.close();
        };
        return notification;
      } catch {
        return undefined;
      }
    }

    function maybeNotify(sessionId, seq, t) {
      if (typeof Notification === 'undefined') return;
      if (document.visibilityState === 'visible' && document.hasFocus()) return;

      const key = `${sessionId ?? '-'}:${seq ?? '-'}`;
      if (seen.has(key)) return;
      seen.add(key);

      const title = document.title || 'DeepSeek Harness';
      const body = t('finished');

      if (Notification.permission === 'granted') {
        raise(title, body, key);
        return;
      }
      if (Notification.permission === 'denied') return;
      Promise.resolve(Notification.requestPermission?.())
        .then((result) => {
          if (result === 'granted') raise(title, body, key);
        })
        .catch(() => {});
    }

    function apply(ctx) {
      const t = translator(ctx);

      function TurnAlert(props) {
        const { sessionId, seq } = props;
        useEffect(() => {
          maybeNotify(sessionId, seq, t);
        }, [sessionId, seq]);
        return null;
      }

      ctx.slots.inject('conversation.chat.turnTail', () =>
        ctx.slots.register(
          { name: 'conversation.chat.turnTail', id: 'turn-alert', order: 90 },
          TurnAlert,
        ),
      );
    }

    return { inject: ['slots'], apply };
  },
});
