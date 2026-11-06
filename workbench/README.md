# Workbench

Turns the right panel's start page into a live view of the session, as one vertical
list: state and totals, context use, changes, tasks and plan, subagents, then the
tool doors. It registers into `sidebar.right.tab.guide`, the chain the shell
publishes for replacing that page. Disable the bundle to get the stock page back.

| Section | Source |
|---|---|
| State, progress, speed, usage, cache hit, time | `useSession`, `projectionsBySession[…].values` |
| Context | `contextPressure`, `contextBreakdown` |
| Changes | This bundle's Host half (`/api/workbench.*`), else `/api/changes.summary` |
| Tasks, plan | `todo_write` and `exit_plan_mode` tool calls |
| Subagents | `useSessions`, sessions with `origin: 'subagent'` under this one |
| Tools | `sidebarRightTabs.guideEntries` |

## Change history and revert

The shell's own change summaries live in the Host's memory and end with the run. The
Host half (`index.js`) keeps a record that lasts: before a file tool first changes a path
in a turn it copies the file, and when the turn ends it copies it again, the way the
shell itself captures files. Copies are stored once each by SHA-1 under
`~/.dsh/storages/workbench`, with a small history per session.

- **Every turn that changed files** is listed, newest first, with line counts. A file's
  diff opens in place. While the shell still holds the newest summary, its review page
  is one click away too.
- **Revert to before this turn** puts every file changed in that turn and later ones back
  to how it was. It lists what it will restore first, and names any file that changed
  after the agent last wrote it, by your own edit or a shell command, so overwriting it
  is a choice. It refuses while a turn is running.
- **Undo** puts back what the revert overwrote; it too names files that changed since.
- The agent is not told about a revert. Tell it when you continue.

Limits: only file-tool edits are recorded (`write`, `edit`, `apply_patch`,
`str_replace_editor`); changes made with shell commands are not shown or reverted.
Files over 2 MB are listed without a copy and cannot be reverted. Subagent sessions are
not recorded. The newest 60 turns per session are kept; histories untouched for 60 days
and copies nothing refers to are cleared a minute after the Host starts.

Without the Host half (an older install) the section falls back to the shell's summary,
and past the run's end to the files the newest writing turn touched, read from its tool
calls, without line counts.

The status strip under the composer moves here. Its `activity` and `usage` entries
are shadowed by empty entries at priority -1, the shell's own override rule, and the
built-in context reading is hidden by CSS. The task bar above the composer is shadowed
the same way, since the tasks are listed here. Disabling this bundle restores all of it.

The right panel also remembers its width: it opens at the last dragged size, or 360px
before any drag, where the shell would start each launch at 45% of the window.

Sections with nothing real to show stay hidden. The two actions from the stock page's
"more tools" menu sit at the end of the tools list, and the tab is titled Workbench.
