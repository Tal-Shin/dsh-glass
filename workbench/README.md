# Workbench

Turns the right panel's start page into a live view of the session, as one vertical
list: state and totals, context use, changes, tasks and plan, subagents, then the
tool doors. It registers into `sidebar.right.tab.guide`, the chain the shell
publishes for replacing that page. Disable the bundle to get the stock page back.

| Section | Source |
|---|---|
| State, progress, speed, usage, cache hit, time | `useSession`, `projectionsBySession[…].values` |
| Context | `contextPressure`, `contextBreakdown` |
| Changes | `/api/changes.summary` for the newest `workspace/changes` event |
| Tasks, plan | `todo_write` and `exit_plan_mode` tool calls |
| Subagents | `useSessions`, sessions with `origin: 'subagent'` under this one |
| Tools | `sidebarRightTabs.guideEntries` |

Summaries live in the Host's memory, so they end with the run. Past that point the
Changes section lists the files the newest writing turn touched, read from its tool
calls, without line counts. Rows open the shell's own pages.

The status strip under the composer moves here. Its `activity` and `usage` entries
are shadowed by empty entries at priority -1, the shell's own override rule, and the
built-in context reading is hidden by CSS. The task bar above the composer is shadowed
the same way, since the tasks are listed here. Disabling this bundle restores all of it.

The right panel also remembers its width: it opens at the last dragged size, or 360px
before any drag, where the shell would start each launch at 45% of the window.

Sections with nothing real to show stay hidden. The two actions from the stock page's
"more tools" menu sit at the end of the tools list, and the tab is titled Workbench.
