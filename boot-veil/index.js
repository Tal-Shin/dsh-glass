/**
 * boot-veil — Host half.
 *
 * Covers the shell's own loading card with a boot screen matched to glass-theme
 * while the client modules load and mount.
 *
 * It contributes rows to `webserver/index-inject`, the one table both servers
 * read: the web profile renders it into index.html, and the desktop app ships it
 * over its boot IPC, because Electron serves index.html itself and never runs
 * `tapIndex`. Rows arrive once the Host is ready, so the wait before that shows
 * the shell's built-in card.
 *
 * The shell's own card comes first and no plugin can reach it, so the veil takes
 * over from it rather than replacing it: the same layout, the shell's real spinner
 * kept on top of the veil, and the card's wordmark giving way to the whale in its
 * place. The spinner never stops, so there is no moment where one screen ends and
 * another begins, and its arc is the shell's real progress.
 *
 * The veil leaves when that spinner is gone (one `:has()` rule, no script, no fake
 * progress). The spinner goes on mount and on a plugin failure, so the veil can
 * never hide the failure message.
 *
 * The app's light/dark preference only reaches the browser once the shell has
 * loaded, so the Host reads it from the profile and stamps it on the screen.
 */
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'

/** The app serves its own icon next to index.html, in a light and a dark variant. */
const MARK = `<img class="dsh-boot-mark dsh-boot-light" src="./favicon.svg" alt="" aria-hidden="true"><img class="dsh-boot-mark dsh-boot-dark" src="./favicon-dark.svg" alt="" aria-hidden="true">`

const STYLE = `
  #dsh-boot {
    --boot-bg: #f5f5f7; --boot-ink: #0f1115; --boot-track: rgb(0 0 0 / 10%); --boot-hint: #6e6e73;
    --boot-wash-1: rgba(0, 122, 255, .05); --boot-wash-2: rgba(175, 82, 222, .04); --boot-wash-3: rgba(90, 200, 250, .06);
    position: fixed; inset: 0; z-index: 2147483000;
    color: var(--boot-ink);
    font: 400 12px/18px -glass-system, BlinkMacSystemFont, "Inter", "Segoe UI Variable Text", "Segoe UI", "PingFang SC", "Noto Sans SC", "Microsoft YaHei UI", sans-serif;
    /* Lets display wait for the fade, so the hidden veil leaves the tree instead of
       keeping its infinite loader running (and the compositor busy) for the whole session.
       The veil's fade lives on the sheet below and has to run on the compositor, through
       the busiest moment of the launch. A trace showed what keeps it off: any other
       opacity animation on the same element, finished or not. So the arrival fade is here,
       and the sheet carries nothing but the fade out. */
    transition: visibility 0s linear 320ms, display 0s linear 320ms;
    transition-behavior: allow-discrete;
    animation: dsh-boot-in 360ms ease backwards;
  }
  #dsh-boot .dsh-boot-sheet {
    position: absolute; inset: 0;
    display: grid; place-items: center;
    background-color: var(--boot-bg);
    background-image:
      radial-gradient(900px 640px at 10% 6%, var(--boot-wash-1), transparent 70%),
      radial-gradient(1100px 760px at 94% 14%, var(--boot-wash-2), transparent 72%),
      radial-gradient(1000px 800px at 62% 108%, var(--boot-wash-3), transparent 70%);
    transition: opacity 320ms ease;
    will-change: opacity;
  }
  #dsh-boot[data-theme="dark"] {
    --boot-bg: #1c1c1e; --boot-ink: #f9fafb; --boot-track: rgb(255 255 255 / 12%); --boot-hint: #98989d;
    --boot-wash-1: rgba(10, 132, 255, .09); --boot-wash-2: rgba(191, 90, 242, .07); --boot-wash-3: rgba(100, 210, 255, .06);
  }
  @media (prefers-color-scheme: dark) {
    #dsh-boot[data-theme="system"] {
      --boot-bg: #1c1c1e; --boot-ink: #f9fafb; --boot-track: rgb(255 255 255 / 12%); --boot-hint: #98989d;
      --boot-wash-1: rgba(10, 132, 255, .09); --boot-wash-2: rgba(191, 90, 242, .07); --boot-wash-3: rgba(100, 210, 255, .06);
    }
  }
  /* The shell's card to the pixel: 24px wordmark, 16px, spinner, 16px, 18px hint. */
  #dsh-boot .dsh-boot-stack {
    display: flex; flex-direction: column; align-items: center; gap: 16px;
    transition: transform 320ms cubic-bezier(.22, 1, .36, 1);
  }
  #dsh-boot .dsh-boot-slot { position: relative; width: 24px; height: 24px; }
  #dsh-boot .dsh-boot-rest { height: 18px; }
  /* Under the shell's spinner, and the same drawing at the arc it ends on: it only shows in the
     instant the real one leaves, and goes with the veil. */
  #dsh-boot .dsh-boot-ring {
    position: relative; box-sizing: content-box; width: 20px; height: 20px; border-radius: 50%;
    border: 2px solid var(--boot-track);
    animation: dsh-boot-turn .8s linear infinite;
  }
  #dsh-boot .dsh-boot-ring::after {
    content: ""; position: absolute; inset: -2px; border-radius: inherit;
    background: conic-gradient(var(--boot-ink) 288deg, transparent 0);
    -webkit-mask: radial-gradient(farthest-side, transparent calc(100% - 2px), #000 0);
    mask: radial-gradient(farthest-side, transparent calc(100% - 2px), #000 0);
  }
  /* The shell's real spinner stays above the veil from the first frame, and keeps its own colours:
     left to the theme's tokens it would turn blue halfway through. */
  [data-dsh-boot] {
    --dsw-alias-brand-primary: var(--dsh-boot-brand);
    --dsw-alias-border-l2: var(--dsh-boot-border);
  }
  [data-dsh-boot] [data-dsh-boot-spinner] { z-index: 2147483001; }
  #dsh-boot .dsh-boot-mark.dsh-boot-dark { display: none; }
  #dsh-boot[data-theme="dark"] .dsh-boot-mark.dsh-boot-light { display: none; }
  #dsh-boot[data-theme="dark"] .dsh-boot-mark.dsh-boot-dark { display: block; }
  @media (prefers-color-scheme: dark) {
    #dsh-boot[data-theme="system"] .dsh-boot-mark.dsh-boot-light { display: none; }
    #dsh-boot[data-theme="system"] .dsh-boot-mark.dsh-boot-dark { display: block; }
  }
  /* Where the wordmark was, a little higher so it clears the spinner. */
  #dsh-boot .dsh-boot-mark {
    position: absolute; left: 50%; top: 50%; width: 68px; height: auto; margin: -44px 0 0 -34px;
    display: block;
    opacity: 0; transform: scale(.92);
    animation: dsh-boot-rise 640ms cubic-bezier(.22, 1, .36, 1) 60ms forwards;
  }
  #dsh-boot .dsh-boot-hint {
    position: absolute; left: 24px; right: 24px; bottom: 32px; text-align: center;
    color: var(--boot-hint);
    opacity: 0; animation: dsh-boot-fade 400ms ease 15s forwards;
  }
  @keyframes dsh-boot-in { from { opacity: 0; } }
  @keyframes dsh-boot-rise { to { opacity: 1; transform: scale(1); } }
  @keyframes dsh-boot-fade { to { opacity: 1; } }
  @keyframes dsh-boot-turn { to { transform: rotate(360deg); } }
  @media (prefers-reduced-motion: reduce) {
    /* Still a fade, a short one: nothing travels, and the page does not pop in. */
    #dsh-boot { animation: none; transition: visibility 0s linear 200ms, display 0s linear 200ms; transition-behavior: allow-discrete; }
    #dsh-boot .dsh-boot-sheet { transition: opacity 200ms ease; }
    #dsh-boot .dsh-boot-stack { transition: none; }
    #dsh-boot .dsh-boot-mark { animation: none; opacity: 1; transform: none; }
  }
  /* The shell's spinner is gone: it mounted, or it has a failure to show. */
  body:not(:has([data-dsh-boot-spinner])) #dsh-boot { visibility: hidden; pointer-events: none; display: none; }
  body:not(:has([data-dsh-boot-spinner])) #dsh-boot .dsh-boot-sheet { opacity: 0; }
  @media (prefers-reduced-motion: no-preference) {
    body:not(:has([data-dsh-boot-spinner])) #dsh-boot .dsh-boot-stack { transform: scale(1.04); }
  }
`

const markup = (theme) => `<div id="dsh-boot" data-theme="${theme}" role="status" aria-live="polite" aria-label="DeepSeek Harness is starting">
  <div class="dsh-boot-sheet">
    <div class="dsh-boot-stack">
      <div class="dsh-boot-slot">${MARK}</div>
      <div class="dsh-boot-ring"></div>
      <div class="dsh-boot-rest"></div>
    </div>
    <div class="dsh-boot-hint">启动较慢？超过一分钟仍停在这里，请重启应用 · Still here after a minute? Restart the app.</div>
  </div>
</div>
`

/** The package name this bundle was installed under. */
function ownName() {
  try {
    return JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8')).name
  } catch {
    return ''
  }
}

/** The saved preference of the profile that lists this bundle, or `system`. */
function readTheme() {
  try {
    const name = ownName()
    const profiles = join(process.env.DSH_HOME ?? join(homedir(), '.dsh'), 'profiles')
    for (const profile of readdirSync(profiles)) {
      const dir = join(profiles, profile)
      if (!existsSync(join(dir, 'package.json'))) continue
      if (name && !readFileSync(join(dir, 'package.json'), 'utf8').includes(`"${name}"`)) continue
      if (!existsSync(join(dir, 'cordis.patch.yml'))) continue
      const patch = readFileSync(join(dir, 'cordis.patch.yml'), 'utf8')
      const match = /-\s*id:\s*ui-theme\b[\s\S]*?\n\s+preference:\s*["']?(light|dark|system)\b/.exec(patch)
      if (match) return match[1]
    }
  } catch {
    /* fall through */
  }
  return 'system'
}

export const inject = ['webServer']

export function apply(ctx) {
  ctx.on('webserver/index-inject', (table) => {
    table.push(
      { kind: 'style', text: STYLE },
      { kind: 'html', placement: 'body', html: markup(readTheme()) },
    )
  })
}
