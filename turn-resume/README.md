# Turn Resume

The working replacement for the failed `recovery-card`.

A keyed Chat renderer (`conversation.chat.node` → `turn-error`) cannot be taken
over from a late-loading plugin: the shipped renderer registers first and the
first live entry wins the cell. So this bundle does not try. It watches the Chat
snapshot instead and, when the transcript ends in an interrupted turn, adds one
small chip under the composer:

```
        ● 继续被中断的一轮  ×
```

- The chip names the step when the node carries one, and asks the agent to check
  the workspace before continuing.
- Clicking drafts the prompt through the composer's own insertion API
  (`captureInsertion` / `insertText`, falling back to `setDraft`); it never sends.
- It disappears as soon as the transcript's tail is something else — a new user
  message, a streaming step, a steering message — and `×` dismisses the current
  one without touching the session.

## Why the dock

`conversation.composer.dock` is additive and receives the standard props
(`useChat`, `inputActions`), which is exactly the data the chip needs. Nothing is
replaced.
