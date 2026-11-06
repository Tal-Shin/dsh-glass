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
 * The veil leaves when the shell's boot spinner is gone (one `:has()` rule, no
 * script, no fake progress). The spinner goes on mount and on a plugin failure,
 * so the veil can never hide the failure message.
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
    --boot-bg: #f5f5f7; --boot-ink: #1d1d1f; --boot-track: rgba(0, 0, 0, .10); --boot-hint: #6e6e73;
    --boot-wash-1: rgba(0, 122, 255, .10); --boot-wash-2: rgba(175, 82, 222, .08); --boot-wash-3: rgba(90, 200, 250, .12);
    position: fixed; inset: 0; z-index: 2147483000;
    display: grid; place-items: center;
    background-color: var(--boot-bg);
    background-image:
      radial-gradient(900px 640px at 10% 6%, var(--boot-wash-1), transparent 70%),
      radial-gradient(1100px 760px at 94% 14%, var(--boot-wash-2), transparent 72%),
      radial-gradient(1000px 800px at 62% 108%, var(--boot-wash-3), transparent 70%);
    color: var(--boot-ink);
    font: 400 12px/18px -glass-system, BlinkMacSystemFont, "Inter", "Segoe UI Variable Text", "Segoe UI", "PingFang SC", "Noto Sans SC", "Microsoft YaHei UI", sans-serif;
    animation: dsh-boot-in 220ms ease backwards;
    transition: opacity 320ms ease, visibility 0s linear 320ms;
  }
  #dsh-boot[data-theme="dark"] {
    --boot-bg: #1c1c1e; --boot-ink: #f5f5f7; --boot-track: rgba(255, 255, 255, .14); --boot-hint: #98989d;
    --boot-wash-1: rgba(10, 132, 255, .16); --boot-wash-2: rgba(191, 90, 242, .12); --boot-wash-3: rgba(100, 210, 255, .10);
  }
  @media (prefers-color-scheme: dark) {
    #dsh-boot[data-theme="system"] {
      --boot-bg: #1c1c1e; --boot-ink: #f5f5f7; --boot-track: rgba(255, 255, 255, .14); --boot-hint: #98989d;
      --boot-wash-1: rgba(10, 132, 255, .16); --boot-wash-2: rgba(191, 90, 242, .12); --boot-wash-3: rgba(100, 210, 255, .10);
    }
  }
  #dsh-boot .dsh-boot-stack {
    display: flex; flex-direction: column; align-items: center; gap: 44px;
    transition: transform 320ms cubic-bezier(.22, 1, .36, 1);
  }
  #dsh-boot .dsh-boot-dark { display: none; }
  #dsh-boot[data-theme="dark"] .dsh-boot-light { display: none; }
  #dsh-boot[data-theme="dark"] .dsh-boot-dark { display: block; }
  @media (prefers-color-scheme: dark) {
    #dsh-boot[data-theme="system"] .dsh-boot-light { display: none; }
    #dsh-boot[data-theme="system"] .dsh-boot-dark { display: block; }
  }
  #dsh-boot .dsh-boot-mark {
    width: 76px; height: auto; display: block;
    opacity: 0; transform: scale(.92);
    animation: dsh-boot-rise 640ms cubic-bezier(.22, 1, .36, 1) 60ms forwards;
  }
  #dsh-boot .dsh-boot-track {
    position: relative; width: 148px; height: 4px; border-radius: 2px; overflow: hidden;
    background: var(--boot-track);
    opacity: 0; animation: dsh-boot-fade 360ms ease 280ms forwards;
  }
  #dsh-boot .dsh-boot-track i {
    position: absolute; inset: 0 auto 0 0; width: 56px; border-radius: 2px;
    background: var(--boot-ink);
    animation: dsh-boot-glide 1.4s cubic-bezier(.65, 0, .35, 1) infinite;
  }
  #dsh-boot .dsh-boot-hint {
    position: absolute; left: 24px; right: 24px; bottom: 32px; text-align: center;
    color: var(--boot-hint);
    opacity: 0; animation: dsh-boot-fade 400ms ease 15s forwards;
  }
  @keyframes dsh-boot-in { from { opacity: 0; } }
  @keyframes dsh-boot-rise { to { opacity: 1; transform: scale(1); } }
  @keyframes dsh-boot-fade { to { opacity: 1; } }
  @keyframes dsh-boot-glide {
    0% { transform: translateX(-56px); }
    100% { transform: translateX(148px); }
  }
  @media (prefers-reduced-motion: reduce) {
    #dsh-boot { animation: none; transition: none; }
    #dsh-boot .dsh-boot-mark { animation: none; opacity: 1; transform: none; }
    #dsh-boot .dsh-boot-track { animation: none; opacity: 1; }
    #dsh-boot .dsh-boot-track i { animation: none; inset: 0; width: 100%; opacity: .4; }
  }
  /* The shell's spinner is gone: it mounted, or it has a failure to show. */
  body:not(:has([data-dsh-boot-spinner])) #dsh-boot { opacity: 0; visibility: hidden; pointer-events: none; }
  body:not(:has([data-dsh-boot-spinner])) #dsh-boot .dsh-boot-stack { transform: scale(1.04); }
`

const markup = (theme) => `<div id="dsh-boot" data-theme="${theme}" role="status" aria-live="polite" aria-label="DeepSeek Harness is starting">
  <div class="dsh-boot-stack">
    ${MARK}
    <div class="dsh-boot-track"><i></i></div>
  </div>
  <div class="dsh-boot-hint">启动较慢？超过一分钟仍停在这里，请重启应用 · Still here after a minute? Restart the app.</div>
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
