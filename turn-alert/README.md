# Turn Alert

Raises a desktop notification when a turn finishes **while the window is out of
focus**. Nothing is shown when you are looking at the app.

## How it works

Every completed turn mounts a cell in the `conversation.chat.turnTail` slot; the
cell's mount is the completion signal. The listener

- fires only when `document.visibilityState` is hidden **or** the window lacks
  focus (so scrolling old turns back into view never notifies),
- de-duplicates by `sessionId:seq`,
- asks for the Notification permission the first time, and stays quiet if it is
  denied,
- focuses the window when the notification is clicked.

It does not signal failed turns (those do not render a turn tail), and a turn
that finishes while the transcript is scrolled away from the tail may not mount
its row at all — in that case no notification is raised.

## Remove

Disable or remove the `turn-alert` bundle row; the listener goes with it.
