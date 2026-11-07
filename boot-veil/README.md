# Boot Veil

A boot screen that takes over from the shell's own loading card: the glass-theme
background rising behind it, the whale in place of the wordmark, and the shell's own
spinner carrying on above it all.

- It contributes rows to `webserver/index-inject`. Both the web profile and the
  desktop app read that table; `tapIndex` does not run on desktop, because Electron
  serves index.html itself.
- There is no script and no fake percentage: the arc is the shell's own progress.
- It fades out with a slight zoom once `[data-dsh-boot-spinner]` is gone. The spinner
  disappears on mount and on a plugin failure, so the veil never hides an error.
- Light or dark follows the preference saved in the profile, read by the Host, and
  `system` falls back to the OS setting.
- `prefers-reduced-motion` gets a static mark and a short fade.

After 15 s a small hint appears, admitting the wait is long and suggesting a restart.

## Limits

Rows reach the page only after the Host is ready, so the wait before that shows the
shell's built-in card. Replacing it would mean patching the app package, which every
update overwrites.

## Remove

Disable or remove the `boot-veil` row; the next page load is served plain again.
