/**
 * workbench — Client half.
 *
 * Replaces the right panel's start page through `sidebar.right.tab.guide`, the
 * chain the shell publishes for exactly this. The page shows what the session is
 * doing: state and usage, the latest changes, the plan and tasks, subagents, and
 * the tool doors the start page already offered.
 *
 * Everything shown comes from the session itself; a section with nothing real to
 * say stays out of the way. Rows open the shell's own pages, so reviewing changes
 * or reading a plan works exactly as it does from the transcript. Disabling the
 * bundle brings the stock start page back.
 */
window.__ModuleLoader__.load({
  id: '@tal-shin/dsh-workbench',
  factory(require) {
    const React = require('react');
    const h = React.createElement;
    const primitives = require('@deepseek-ai/dsh-client-ui-primitives');

    const TEXT = {
      zh: {
        running: '运行中', idle: '空闲', fresh: '新会话', stats: '{turns} 轮 · {steps} 步',
        rowProgress: '进度', rowSpeed: '速度', rowUsage: '用量', rowCache: '缓存命中', rowModel: '模型耗时', rowTools: '工具耗时',
        speed: '{tps} tok/s', tokens: '{tokens} tok', seconds: '{value} 秒', minutes: '{value} 分钟', context: '上下文', contextUsed: '已使用 {percent}%',
        contextOf: '{used} / {window}', ctxMessages: '消息', ctxTools: '工具定义', ctxSystem: '系统提示',
        ctxOther: '其他', ctxFree: '剩余空间',
        changes: '改动', changed: '{count} 个文件', changesOf: '第 {turn} 轮', noChanges: '还没有文件改动',
        changesExpired: '差异只在本次运行内保留，这里列出改过的文件', reviewAll: '查看全部改动', binary: '二进制', oversized: '文件过大',
        plan: '计划', openPlan: '查看计划', tasks: '任务', tasksDone: '{done} / {total} 完成',
        subagents: '子智能体', subagentRunning: '运行中', subagentDone: '已结束', tools: '工具',
        title: '工作台', browsePlugins: '浏览更多插件', createPlugin: '创建你的插件', createPrompt: '创建一个带右侧栏入口的 DSH 插件。',
      },
      en: {
        running: 'Running', idle: 'Idle', fresh: 'New session', stats: '{turns} turns · {steps} steps',
        rowProgress: 'Progress', rowSpeed: 'Speed', rowUsage: 'Usage', rowCache: 'Cache hit', rowModel: 'Model time', rowTools: 'Tool time',
        speed: '{tps} tok/s', tokens: '{tokens} tok', seconds: '{value} s', minutes: '{value} min', context: 'Context', contextUsed: '{percent}% used',
        contextOf: '{used} / {window}', ctxMessages: 'Messages', ctxTools: 'Tool definitions', ctxSystem: 'System prompt',
        ctxOther: 'Other', ctxFree: 'Free space',
        changes: 'Changes', changed: '{count} files', changesOf: 'Turn {turn}', noChanges: 'No file changes yet',
        changesExpired: 'Diffs last for this run only, so these are the files touched', reviewAll: 'Review all changes', binary: 'Binary', oversized: 'Too large',
        plan: 'Plan', openPlan: 'Open plan', tasks: 'Tasks', tasksDone: '{done} of {total} done',
        subagents: 'Subagents', subagentRunning: 'Running', subagentDone: 'Finished', tools: 'Tools',
        title: 'Workbench', browsePlugins: 'Browse other plugins', createPlugin: 'Create your plugin', createPrompt: 'Create a DSH plugin with a right sidebar entry.',
      },
    };

    /** Last dragged right panel width, and the width before any drag. */
    const WIDTH_KEY = 'dsh.workbench.rightbarWidth';
    const DEFAULT_WIDTH = 360;

    const fill = (template, values) =>
      Object.entries(values).reduce((text, [key, value]) => text.split(`{${key}}`).join(String(value)), String(template));

    function translator(ctx) {
      const preferZh = String(navigator.language || '').toLowerCase().startsWith('zh');
      const fallback = (key) => (preferZh ? TEXT.zh : TEXT.en)[key] ?? key;
      try {
        const locale = ctx.get('locale');
        if (!locale) return fallback;
        locale.register('workbench', 'en', TEXT.en);
        locale.register('workbench', 'zh', TEXT.zh);
        const bound = locale.bind('workbench');
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

    const compact = (value) => {
      if (value >= 1e6) return `${(value / 1e6).toFixed(1)}M`;
      if (value >= 1e3) return `${(value / 1e3).toFixed(1)}K`;
      return String(value);
    };

    /** Walk the transcript newest-first; `visit` returns a value to stop. */
    function findLast(chat, kind, visit) {
      const { order, nodes } = chat;
      if (!order || !nodes) return undefined;
      for (let i = order.length - 1; i >= 0; i -= 1) {
        const node = nodes.get(order[i]);
        if (node?.kind !== kind) continue;
        const found = visit(node);
        if (found !== undefined) return found;
      }
      return undefined;
    }

    /** `seq:turn` of the newest announced change set, or ''. */
    const selectChanges = (chat) =>
      findLast(chat, 'turn-tail', (node) => {
        const turn = node.location?.turn;
        const changes = turn?.data?.get?.('deliverables')?.changes;
        return changes ? `${changes.seq}:${turn.turn}` : undefined;
      }) ?? '';

    const toolOf = (node, name) => (node.data?.root?.name === name ? node.data.root : undefined);

    /**
     * Files the newest writing turn touched, as JSON. Summaries live in the Host's
     * memory and end with the run; tool calls are durable, so this outlives them.
     */
    const selectTouched = (chat) => {
      let turn = null;
      const paths = [];
      for (let i = (chat.order?.length ?? 0) - 1; i >= 0; i -= 1) {
        const node = chat.nodes.get(chat.order[i]);
        if (node?.kind !== 'tool-call') continue;
        const root = node.data?.root;
        if (!root || root.isError || !['write', 'edit', 'apply_patch'].includes(root.name)) continue;
        const owner = node.location?.turn?.turn;
        if (turn !== null && owner !== turn) break;
        const args = root.args?.object ?? root.args;
        const path = root.meta?.path ?? args?.path ?? args?.file_path;
        if (typeof path !== 'string' || path === '') continue;
        turn = owner;
        if (!paths.includes(path)) paths.push(path);
      }
      return paths.length > 0 ? JSON.stringify({ turn, paths }) : '';
    };

    const selectPlan = (chat) => findLast(chat, 'tool-call', (node) => toolOf(node, 'exit_plan_mode')?.callId) ?? '';

    function useSummary(sessionId, marker) {
      const [state, setState] = React.useState({ marker: '', data: null, failed: false });
      React.useEffect(() => {
        if (!marker) return undefined;
        const seq = marker.split(':')[0];
        const controller = new AbortController();
        const query = new URLSearchParams({ sessionId, seq });
        fetch(`api/changes.summary?${query}`, { signal: controller.signal })
          .then((response) => {
            if (!response.ok) throw new Error(String(response.status));
            return response.json();
          })
          .then((data) => setState({ marker, data, failed: false }))
          .catch((error) => {
            if (error?.name !== 'AbortError') setState({ marker, data: null, failed: true });
          });
        return () => controller.abort();
      }, [sessionId, marker]);
      return state.marker === marker ? state : { marker, data: null, failed: false };
    }

    const CSS = `
.wb-page {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 8px 16px 24px;
  overflow: auto;
  color: var(--dsw-alias-label-primary);
  font-size: 13px;
  line-height: 20px;
}
.wb-dot, .wb-mark { corner-shape: round; }
.wb-section { display: flex; flex-direction: column; padding: 12px 0; }
.wb-section + .wb-section { border-top: .5px solid var(--dsw-alias-border-l2); }
.wb-state {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: var(--dsw-alias-label-primary);
  font-size: 13px;
  font-weight: 500;
}
.wb-dot { width: 7px; height: 7px; border-radius: 50%; background: var(--dsw-alias-label-caption); }
.wb-state[data-running='true'] .wb-dot { background: var(--dsw-alias-state-success-primary); }
.wb-heading {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 8px;
  padding-bottom: 6px;
  font-size: 13px;
  font-weight: 500;
}
.wb-heading small { color: var(--dsw-alias-label-secondary); font-size: 12px; font-weight: 400; }
.wb-group { display: flex; flex-direction: column; margin-inline: -6px; }
.wb-row {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  min-height: 30px;
  box-sizing: border-box;
  padding: 5px 6px;
  border: 0;
  border-radius: var(--dsw-radius-sm, 10px);
  background: transparent;
  color: inherit;
  font: inherit;
  text-align: left;
}
button.wb-row { cursor: pointer; transition: background-color .15s ease; }
button.wb-row:hover { background: var(--dsw-alias-interactive-bg-hover); }
button.wb-row:active { background: var(--dsw-alias-interactive-bg-active); }
.wb-row svg { flex: none; }
.wb-label { flex: 1 1 auto; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.wb-meta { flex: none; color: var(--dsw-alias-label-secondary); font-size: 12px; font-variant-numeric: tabular-nums; }
.wb-added { color: var(--dsw-alias-state-success-primary); }
.wb-deleted { color: var(--dsw-alias-state-error-primary); }
.wb-action { color: var(--dsw-alias-link); }
.wb-muted { color: var(--dsw-alias-label-caption); font-size: 12px; line-height: 18px; }
.wb-mark {
  flex: none;
  box-sizing: border-box;
  width: 14px;
  height: 14px;
  border: 1.5px solid var(--dsw-alias-border-l4);
  border-radius: 50%;
}
.wb-mark[data-status='in_progress'] { border-color: var(--dsw-alias-state-business-primary); }
.wb-mark[data-status='completed'] { border-color: var(--dsw-alias-state-success-primary); background: var(--dsw-alias-state-success-primary); }
.wb-row[data-status='completed'] .wb-label { color: var(--dsw-alias-label-secondary); }
.wb-bar {
  display: flex;
  gap: 1px;
  height: 6px;
  margin: 2px 0 8px;
  overflow: hidden;
  border-radius: 3px;
  background: var(--dsw-alias-interactive-bg-active);
}
.wb-bar span { min-width: 2px; background: var(--wb-color); }
.wb-legend { display: flex; align-items: center; gap: 10px; min-height: 24px; }
.wb-swatch { flex: none; width: 10px; height: 10px; border-radius: 3px; background: var(--wb-color); }
.wb-legend .wb-label { color: var(--dsw-alias-label-secondary); }
.wb-legend .wb-value { flex: none; width: 3.2em; text-align: right; }
/* The context reading under the composer is built into the shell rather than a slot
   entry, so it cannot be shadowed like its neighbours. This page shows the same data. */
[data-composer-dock] > span:has(> [aria-haspopup='dialog']),
[data-composer-dock] > span:has(> * > [aria-haspopup='dialog']) {
  display: none;
}
/* The strip also held the composer off the card edge; keep the same 16px as the sides.
   DSH 0.2.2 reserves 22px for the strip, which would leave a gap with nothing in it. */
[data-composer-dock] {
  min-height: 0 !important;
  padding-top: 12px;
}
@media (prefers-reduced-motion: reduce) {
  button.wb-row { transition: none; }
}
`;

    function apply(ctx) {
      const t = translator(ctx);

      ctx.effect(() => {
        const element = document.createElement('style');
        element.setAttribute('data-workbench', '');
        element.textContent = CSS;
        (document.head ?? document.documentElement).append(element);
        return () => element.remove();
      }, 'workbench: stylesheet');

      const right = () => ctx.get('sidebarRight');
      const reviewAddress = (sessionId, seq, turn) =>
        `dsh-resource://changes-review/session/${encodeURIComponent(sessionId)}/${seq}/${turn}`;
      const planAddress = (sessionId, callId) =>
        `dsh-resource://plan/${[sessionId, callId].map(encodeURIComponent).join('/')}`;

      const duration = (ms) => {
        const seconds = ms / 1000;
        return seconds < 60
          ? fill(t('seconds'), { value: seconds.toFixed(1) })
          : fill(t('minutes'), { value: (seconds / 60).toFixed(1) });
      };

      /** State, then the numbers from the strip that used to sit under the composer. */
      function Status({ useSession, values, hasTurns }) {
        const running = useSession((state) => state.running === true);
        const stats = values?.sessionStats;
        const usage = values?.tokenUsage;
        const prompt = usage ? (usage.uncachedInputTokens ?? 0) + (usage.cacheReadTokens ?? 0) + (usage.cacheWriteTokens ?? 0) : 0;
        const total = usage ? prompt + (usage.outputTokens ?? 0) : 0;
        const rows = [];
        if (stats?.steps > 0) rows.push(['rowProgress', fill(t('stats'), { turns: stats.turns ?? 0, steps: stats.steps })]);
        if (stats?.decodeMs > 0 && stats.decodeTokens > 0) {
          const tps = stats.decodeTokens / (stats.decodeMs / 1000);
          rows.push(['rowSpeed', fill(t('speed'), { tps: tps >= 10 ? Math.round(tps) : Math.round(tps * 10) / 10 })]);
        }
        if (total > 0) rows.push(['rowUsage', fill(t('tokens'), { tokens: compact(total) })]);
        if (prompt > 0) rows.push(['rowCache', `${Math.round((usage.cacheReadTokens / prompt) * 100)}%`]);
        if (stats?.llmMs > 0) rows.push(['rowModel', duration(stats.llmMs)]);
        if (stats?.toolMs >= 50) rows.push(['rowTools', duration(stats.toolMs)]);
        return h('section', { className: 'wb-section' },
          h('div', { className: 'wb-heading' },
            h('span', { className: 'wb-state', 'data-running': String(running) },
              h('span', { className: 'wb-dot', 'aria-hidden': 'true' }),
              running ? t('running') : hasTurns ? t('idle') : t('fresh'))),
          rows.map(([key, value]) => h('div', { key, className: 'wb-legend' },
            h('span', { className: 'wb-label' }, t(key)),
            h('span', { className: 'wb-meta' }, value))));
      }

      function Context({ values }) {
        const pressure = values?.contextPressure;
        const size = pressure?.contextWindow;
        if (!size) return null;
        const used = pressure.pressureTokens ?? 0;
        const part = values?.contextBreakdown ?? {};
        const known = [
          { key: 'ctxMessages', tokens: part.messageTokens ?? 0, color: 'var(--dsw-alias-state-business-primary)' },
          { key: 'ctxTools', tokens: part.toolsTokens ?? 0, color: 'var(--dsw-alias-state-warn-primary)' },
          { key: 'ctxSystem', tokens: part.systemTokens ?? 0, color: 'var(--dsw-alias-state-success-primary)' },
        ].filter((item) => item.tokens > 0);
        const other = Math.max(0, used - known.reduce((sum, item) => sum + item.tokens, 0));
        const rows = other > 0 ? [...known, { key: 'ctxOther', tokens: other, color: 'var(--dsw-alias-label-caption)' }] : known;
        const share = (tokens) => `${((tokens / size) * 100).toFixed(1)}%`;
        return h('section', { className: 'wb-section' },
          h('div', { className: 'wb-heading' }, t('context')),
          h('div', { className: 'wb-heading' }, fill(t('contextUsed'), { percent: Math.round((used / size) * 100) }),
            h('small', null, fill(t('contextOf'), { used: compact(used), window: compact(size) }))),
          h('div', { className: 'wb-bar', role: 'img', 'aria-label': fill(t('contextUsed'), { percent: Math.round((used / size) * 100) }) },
            rows.map((row) => h('span', { key: row.key, style: { '--wb-color': row.color, width: share(row.tokens) } }))),
          rows.map((row) => h('div', { key: row.key, className: 'wb-legend' },
            h('span', { className: 'wb-swatch', style: { '--wb-color': row.color }, 'aria-hidden': 'true' }),
            h('span', { className: 'wb-label' }, t(row.key)),
            h('span', { className: 'wb-meta' }, compact(row.tokens)),
            h('span', { className: 'wb-meta wb-value' }, share(row.tokens)))),
          h('div', { className: 'wb-legend' },
            h('span', { className: 'wb-swatch', style: { '--wb-color': 'var(--dsw-alias-interactive-bg-active)' }, 'aria-hidden': 'true' }),
            h('span', { className: 'wb-label' }, t('ctxFree')),
            h('span', { className: 'wb-meta' }, compact(Math.max(0, size - used))),
            h('span', { className: 'wb-meta wb-value' }, share(Math.max(0, size - used)))));
      }

      function Changes({ sessionId, useChat }) {
        const marker = useChat(selectChanges);
        const rawTouched = useChat(selectTouched);
        const { data, failed } = useSummary(sessionId, marker);
        const touched = rawTouched ? JSON.parse(rawTouched) : null;
        if ((!marker || failed) && touched) {
          return h('section', { className: 'wb-section' },
            h('div', { className: 'wb-heading' }, t('changes'), h('small', null, fill(t('changesOf'), { turn: touched.turn }))),
            h('div', { className: 'wb-group' },
              touched.paths.slice(0, 5).map((path) => h('div', { key: path, className: 'wb-row', title: path },
                h('span', { className: 'wb-label' }, path.split(/[\\/]/).pop())))),
            failed ? h('div', { className: 'wb-muted' }, t('changesExpired')) : null);
        }
        if (!marker || failed) {
          return h('section', { className: 'wb-section' },
            h('div', { className: 'wb-heading' }, t('changes')),
            h('div', { className: 'wb-muted' }, t('noChanges')));
        }
        const [seq, turn] = marker.split(':');
        const open = (index) => right().openResource(reviewAddress(sessionId, seq, turn), { params: { index } });
        const files = Array.isArray(data?.files) ? data.files : [];
        return h('section', { className: 'wb-section' },
          h('div', { className: 'wb-heading' }, t('changes'), h('small', null, fill(t('changesOf'), { turn }))),
          files.length > 0
            ? h('div', { className: 'wb-group' },
                files.slice(0, 4).map((file, index) => h('button', {
                  key: file.display ?? index,
                  type: 'button',
                  className: 'wb-row',
                  title: file.display,
                  onClick: () => open(index),
                },
                h('span', { className: 'wb-label' }, String(file.display ?? '').split(/[\\/]/).pop()),
                file.binary ? h('span', { className: 'wb-meta' }, t('binary'))
                  : file.oversized ? h('span', { className: 'wb-meta' }, t('oversized'))
                  : h('span', { className: 'wb-meta' },
                      h('span', { className: 'wb-added' }, `+${file.added ?? 0}`), ' ',
                      h('span', { className: 'wb-deleted' }, `−${file.deleted ?? 0}`)))),
                h('button', { type: 'button', className: 'wb-row', onClick: () => open(0) },
                  h('span', { className: 'wb-label wb-action' }, t('reviewAll')),
                  h('span', { className: 'wb-meta' }, fill(t('changed'), { count: data.total ?? files.length }))))
            : null);
      }

      function Plan({ sessionId, useChat, values }) {
        const callId = useChat(selectPlan);
        const tasks = (Array.isArray(values?.todos) ? values.todos : []).map((item) => ({
          text: String(item?.content ?? item?.title ?? item?.text ?? ''),
          status: String(item?.status ?? ''),
        }));
        if (!callId && tasks.length === 0) return null;
        const done = tasks.filter((task) => task.status === 'completed').length;
        return h('section', { className: 'wb-section' },
          h('div', { className: 'wb-heading' }, tasks.length > 0 ? t('tasks') : t('plan'),
            tasks.length > 0 ? h('small', null, fill(t('tasksDone'), { done, total: tasks.length })) : null),
          h('div', { className: 'wb-group' },
            tasks.slice(0, 6).map((task, index) => h('div', { key: index, className: 'wb-row', 'data-status': task.status },
              h('span', { className: 'wb-mark', 'data-status': task.status, 'aria-hidden': 'true' }),
              h('span', { className: 'wb-label', title: task.text }, task.text))),
            callId
              ? h('button', { type: 'button', className: 'wb-row', onClick: () => right().openResource(planAddress(sessionId, callId)) },
                  h('span', { className: 'wb-label wb-action' }, t('openPlan')))
              : null));
      }

      function Subagents({ sessionId, useSessions }) {
        const raw = useSessions((state) => JSON.stringify(
          Object.values(state.byId ?? {})
            .filter((item) => item.origin === 'subagent' && item.parentId === sessionId)
            .map((item) => ({ id: item.id, title: item.displayTitle ?? item.title ?? '', running: item.running === true })),
        ));
        const children = JSON.parse(raw);
        if (children.length === 0) return null;
        const open = (id) => {
          const address = ctx.get('sessions').subagentAddress(id);
          if (address) ctx.get('uiWorkspace').openSession(address);
        };
        return h('section', { className: 'wb-section' },
          h('div', { className: 'wb-heading' }, t('subagents')),
          h('div', { className: 'wb-group' },
            children.slice(0, 5).map((child) => h('button', { key: child.id, type: 'button', className: 'wb-row', onClick: () => open(child.id) },
              h('span', { className: 'wb-label', title: child.title }, child.title || child.id),
              h('span', { className: 'wb-meta' }, child.running ? t('subagentRunning') : t('subagentDone'))))));
      }

      function Tools({ openTab }) {
        const registry = ctx.get('sidebarRightTabs');
        const entries = registry?.guideEntries ?? [];
        return h('section', { className: 'wb-section' },
          h('div', { className: 'wb-heading' }, t('tools')),
          h('div', { className: 'wb-group' },
            entries.map((entry) => {
              const Icon = entry.icon;
              return h('button', {
                key: `${entry.kind}:${entry.id}`,
                type: 'button',
                className: 'wb-row',
                'data-sidebar-right-guide-entry': entry.kind,
                onClick: () => openTab(entry.kind),
              }, Icon ? h(Icon, { size: 16 }) : null, h('span', { className: 'wb-label' }, entry.title()));
            }),
            // The stock page's "more tools" menu holds these two actions.
            h('button', { type: 'button', className: 'wb-row', onClick: () => ctx.get('pluginNavigation')?.openList() },
              h(primitives.IconPluginPinwheelOutlineRegular, { size: 16 }), h('span', { className: 'wb-label' }, t('browsePlugins'))),
            h('button', {
              type: 'button',
              className: 'wb-row',
              onClick: () => ctx.get('uiWorkspace')?.startSession(undefined, { agentPreset: 'cordis', prompt: t('createPrompt'), whenDraftExists: 'append' }),
            }, h(primitives.IconPlusOutlineRegular, { size: 16 }), h('span', { className: 'wb-label' }, t('createPlugin')))));
      }

      function Workbench(props) {
        const { sessionId, useSession, useChat, useSessions, useTabInfo } = props;
        const values = useSessions((state) => state.projectionsBySession?.[sessionId]?.values);
        const hasTurns = useChat((chat) => (chat.order?.length ?? 0) > 0);
        const info = useTabInfo();
        const openTab = (kind) => info.tab?.actions?.openTab(kind, {});
        return h('div', { className: 'wb-page', 'data-workbench-page': '' },
          h(Status, { useSession, values, hasTurns }),
          hasTurns ? h(Context, { values }) : null,
          hasTurns ? h(Changes, { sessionId, useChat }) : null,
          hasTurns ? h(Plan, { sessionId, useChat, values }) : null,
          hasTurns ? h(Subagents, { sessionId, useSessions }) : null,
          h(Tools, { openTab }));
      }

      // The shell keeps the right panel's width in memory and starts every launch at 45%
      // of the window. This restores the last dragged width through the same action
      // the resize handle uses, and saves it when a drag ends.
      ctx.effect(() => {
        const panels = ctx.layout?.panels;
        if (typeof panels?.setRightbar !== 'function') return undefined;
        const read = () => {
          try {
            const value = Number(localStorage.getItem(WIDTH_KEY));
            return Number.isFinite(value) && value > 0 ? value : null;
          } catch {
            return null;
          }
        };
        panels.setRightbar(read() ?? DEFAULT_WIDTH);
        let dragging = false;
        const onDown = (event) => {
          const handle = event.target instanceof Element ? event.target.closest('[data-side]') : null;
          dragging = handle?.dataset.side === 'rightbar';
        };
        const onUp = () => {
          if (!dragging) return;
          dragging = false;
          requestAnimationFrame(() => {
            const width = document.querySelector('[data-rightbar-col]')?.getBoundingClientRect().width ?? 0;
            if (width < 200) return;
            try {
              localStorage.setItem(WIDTH_KEY, String(Math.round(width)));
            } catch {
              /* storage is unavailable; the width simply lasts for this run */
            }
          });
        };
        window.addEventListener('pointerdown', onDown, true);
        window.addEventListener('pointerup', onUp, true);
        window.addEventListener('pointercancel', onUp, true);
        return () => {
          window.removeEventListener('pointerdown', onDown, true);
          window.removeEventListener('pointerup', onUp, true);
          window.removeEventListener('pointercancel', onUp, true);
        };
      }, 'workbench: right panel width');

      // The status strip under the composer moves to this page. Its two entries are
      // replaced the shell's way: a lower priority shadows an entry with the same id,
      // and disabling this bundle brings them back.
      const Nothing = () => null;
      ctx.slots.inject('conversation.composer.dock', function* () {
        yield ctx.slots.register({ name: 'conversation.composer.dock', id: 'activity', priority: -1 }, Nothing);
        yield ctx.slots.register({ name: 'conversation.composer.dock', id: 'usage', priority: -1 }, Nothing);
      });

      // The task bar above the composer repeats this page's task list.
      ctx.slots.inject('conversation.input.dock', () =>
        ctx.slots.register({ name: 'conversation.input.dock', id: 'todo', priority: -1 }, Nothing),
      );

      // The tab's title, shadowed the same way as the strip entries above.
      const Title = () => h(React.Fragment, null,
        h('svg', { width: 15, height: 15, viewBox: '0 0 16 16', fill: 'none', stroke: 'currentColor', strokeWidth: 1.4, 'aria-hidden': 'true', style: { marginRight: 6, flex: 'none' } },
          h('rect', { x: 2, y: 2.5, width: 12, height: 11, rx: 3 }),
          h('path', { d: 'M5 6h6M5 9.5h3.5', strokeLinecap: 'round' })),
        t('title'));
      ctx.slots.inject('sidebar.right.pane.tab.title', () =>
        ctx.slots.register({ name: 'sidebar.right.pane.tab.title', key: '@deepseek-ai/dsh-client-ui-sidebar-right/guide', priority: -1 }, Title),
      );

      ctx.slots.inject('sidebar.right.tab.guide', () =>
        ctx.slots.register({ name: 'sidebar.right.tab.guide', select: () => true }, Workbench),
      );
    }

    return { inject: ['slots', 'layout'], apply };
  },
});
