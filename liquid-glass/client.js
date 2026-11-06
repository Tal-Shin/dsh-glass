/** Liquid glass for the installed DSH shell. Disable the bundle to remove it. */
window.__ModuleLoader__.load({
  id: '@tal-shin/dsh-liquid-glass',
  factory() {
    const TOKENS = {
      '--dsw-menu-surface-fill': { light: 'rgba(250, 250, 252, .76)', dark: 'rgba(36, 36, 38, .80)' },
      '--dsw-specific-menu': { light: 'rgba(250, 250, 252, .76)', dark: 'rgba(36, 36, 38, .80)' },
      '--dsw-menu-backdrop-filter': { light: 'blur(18px) saturate(145%)', dark: 'blur(18px) saturate(130%)' },
      '--dsw-elevation-panel': {
        light: 'var(--dsw-elevation-stroke), inset 0 1px 0 #ffffffd1, 0 8px 24px -12px #25262826, 0 24px 52px -30px #25262838',
        dark: 'var(--dsw-elevation-stroke), inset 0 1px 0 #ffffff21, 0 8px 24px -12px #00000080, 0 24px 52px -30px #00000099',
      },
      '--dsw-elevation-prominent': {
        light: 'var(--dsw-elevation-stroke), inset 0 1px 0 #ffffffe6, 0 12px 32px -14px #2526282e, 0 32px 64px -32px #25262840',
        dark: 'var(--dsw-elevation-stroke), inset 0 1px 0 #ffffff26, 0 12px 32px -14px #00000099, 0 32px 64px -32px #000000b3',
      },
    };

    const CSS = `
/* html:root outranks the shell layer in glass-theme, so the material wins whichever
   bundle happens to load last. */
body {
  --lg-sheet: rgba(250, 250, 252, .56);
  --lg-panel: rgba(250, 250, 252, .52);
  --lg-composer: rgba(255, 255, 255, .64);
  --lg-rim: rgba(255, 255, 255, .88);
  --lg-edge: rgba(0, 0, 0, .10);
  --lg-glint: rgba(255, 255, 255, .40);
  --lg-glint-idle: rgba(255, 255, 255, .12);
  --lg-shadow: 0 2px 4px -2px rgba(0, 0, 0, .08), 0 8px 20px -12px rgba(0, 0, 0, .15), 0 26px 50px -28px rgba(0, 0, 0, .24);
  --lg-refraction: blur(18px) saturate(140%);
}
body[data-ds-dark-theme] {
  --lg-sheet: rgba(28, 28, 30, .60);
  --lg-panel: rgba(34, 34, 36, .58);
  --lg-composer: rgba(44, 44, 46, .68);
  --lg-rim: rgba(255, 255, 255, .20);
  --lg-edge: rgba(255, 255, 255, .11);
  --lg-glint: rgba(255, 255, 255, .10);
  --lg-glint-idle: rgba(255, 255, 255, .025);
  --lg-shadow: 0 2px 4px -2px rgba(0, 0, 0, .25), 0 8px 20px -12px rgba(0, 0, 0, .45), 0 26px 50px -28px rgba(0, 0, 0, .65);
  --lg-refraction: blur(18px) saturate(125%);
}

/* The centre column is a floating card that matches the side panels, except on the
   empty start page, where it clears so the water shows. Filters stay on a
   pseudo-element so fixed-position shell controls keep their viewport anchor. */
html:root body div:has(> [data-slot="main"]) {
  position: relative;
  isolation: isolate;
  background: transparent !important;
}
html:root body div:has(> [data-slot="main"])::before {
  content: '';
  position: absolute;
  inset: 10px 0 12px;
  z-index: -1;
  pointer-events: none;
  box-sizing: border-box;
  border: 1px solid var(--lg-edge);
  border-radius: var(--dsw-radius-panel, 22px);
  background: linear-gradient(145deg, var(--lg-glint-idle), transparent 42%), var(--lg-sheet);
  -webkit-backdrop-filter: var(--lg-refraction);
  backdrop-filter: var(--lg-refraction);
  box-shadow: inset 0 1px 0 var(--lg-rim), inset 1px 0 0 var(--lg-glint-idle), inset 0 -1px 0 var(--lg-edge), var(--lg-shadow);
  transition: opacity .32s ease, visibility 0s;
}
html:root body [data-slot="root"] > div:is([data-rightbar-collapsed="true"], :not(:has([data-sidebar-right-open]))) > div:has(> [data-slot="main"])::before {
  right: 18px;
}
html:root body div:has(> [data-slot="main"]):has([data-slot^="conversation.hero"])::before {
  opacity: 0;
  visibility: hidden;
  transition: opacity .32s ease, visibility 0s linear .32s;
}

/* Published hooks replace version-specific CSS hashes. Clear the extra base
   surface and the small frosted rectangles behind individual messages. */
html:root body [data-slot="main"],
html:root body [data-slot="main.conversation"],
html:root body [data-slot="main.conversation"] > div,
html:root body [data-conversation-content],
html:root body [data-conversation-scroll],
html:root body [data-conversation-region="chat"],
html:root body [data-chat-turn] {
  background: transparent !important;
}
html:root body [data-chat-turn],
html:root body .md-code-block,
html:root body [class*="_ioCard"],
html:root body [class*="_bubble"] {
  -webkit-backdrop-filter: none !important;
  backdrop-filter: none !important;
}

/* Preserve the existing card insets, resize tracks and collapsed rail. */
html:root body [data-slot="root"] > div > div:has(> [data-slot="sidebar"]) {
  position: relative;
  isolation: isolate;
  background: transparent !important;
  border-right: 0 !important;
}
html:root body [data-rightbar-col] { isolation: isolate; }
html:root body [data-slot="root"] > div[data-sidebar-collapsed] > div:has(> [data-slot="sidebar"])::before {
  -webkit-backdrop-filter: none;
  backdrop-filter: none;
}
html:root body [data-slot="root"] > div:not([data-sidebar-collapsed]) > div:has(> [data-slot="sidebar"])::before,
html:root body [data-rightbar-col]:has([data-sidebar-right-open])::before,
html:root body [data-rightbar-col] [data-sidebar-right-panel="fullscreen"][data-sidebar-right-open]::before {
  background: linear-gradient(145deg, var(--lg-glint-idle), transparent 42%), var(--lg-panel);
  -webkit-backdrop-filter: var(--lg-refraction);
  backdrop-filter: var(--lg-refraction);
  border: 1px solid var(--lg-edge);
  border-radius: var(--dsw-radius-panel, 22px);
  box-shadow: inset 0 1px 0 var(--lg-rim), inset 1px 0 0 var(--lg-glint-idle), inset 0 -1px 0 var(--lg-edge), var(--lg-shadow);
}
html:root body [data-slot="root"] > div:not([data-sidebar-collapsed]) [data-slot="sidebar"] > div,
html:root body [data-rightbar-col] [data-sidebar-right-panel][data-sidebar-right-open] {
  border-radius: var(--dsw-radius-panel, 22px);
}

/* The input card is one lens. Paint the blur underneath instead of making
   the card itself a new containing block for its fixed-position children. */
html:root body [data-composer-card] {
  isolation: isolate;
  background: transparent !important;
  -webkit-backdrop-filter: none !important;
  backdrop-filter: none !important;
  border: 1px solid var(--lg-edge);
  border-radius: var(--dsw-radius-panel, 22px);
  box-shadow: inset 0 1px 0 var(--lg-rim), 0 4px 12px -6px rgba(0, 0, 0, .10), var(--lg-shadow) !important;
  transition: border-color .18s ease, box-shadow .18s ease;
}
html:root body [data-composer-card]::before {
  background:
    radial-gradient(320px circle at var(--lg-x, 50%) var(--lg-y, 0px), var(--lg-glint), transparent 70%),
    linear-gradient(155deg, var(--lg-glint-idle), transparent 48%),
    var(--lg-composer);
  -webkit-backdrop-filter: var(--lg-refraction);
  backdrop-filter: var(--lg-refraction);
  box-shadow: inset 0 1px 0 var(--lg-rim), inset 0 -1px 0 var(--lg-edge);
}
html:root body [data-composer-card]:focus-within {
  border-color: color-mix(in srgb, var(--dsw-alias-state-business-primary) 46%, var(--lg-edge));
  box-shadow:
    inset 0 1px 0 var(--lg-rim),
    0 0 0 3px color-mix(in srgb, var(--dsw-alias-state-business-primary) 10%, transparent),
    var(--lg-shadow) !important;
}
html:root body [data-menu-material] {
  border: 1px solid var(--lg-edge);
  border-radius: var(--dsw-radius-lg, 14px);
  box-shadow: inset 0 1px 0 var(--lg-rim), var(--dsw-elevation-panel) !important;
}

/* The sidebar-fill token is transparent for native titlebar buttons, so
   accessibility fallbacks must use the actual base token instead. */
@supports not ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px))) {
  body, body[data-ds-dark-theme] { --lg-sheet: var(--dsw-alias-bg-base); --lg-panel: var(--dsw-alias-bg-base); --lg-composer: var(--dsw-alias-bg-base); }
  html:root body [data-menu-material] { background: var(--dsw-alias-bg-base) !important; }
}
@media (prefers-reduced-transparency: reduce) {
  body, body[data-ds-dark-theme] {
    --lg-sheet: var(--dsw-alias-bg-base);
    --lg-panel: var(--dsw-alias-bg-base);
    --lg-composer: var(--dsw-alias-bg-base);
    --lg-refraction: none;
    --lg-glint: transparent;
    --lg-glint-idle: transparent;
  }
  html:root body [data-menu-material] { background: var(--dsw-alias-bg-base) !important; -webkit-backdrop-filter: none !important; backdrop-filter: none !important; }
}
@media (prefers-reduced-motion: reduce) {
  html:root body [data-composer-card],
  html:root body div:has(> [data-slot="main"])::before { transition: none; }
  html:root body [data-composer-card]::before { background: var(--lg-composer); }
}
@media (forced-colors: active) {
  html:root body [data-composer-card], html:root body [data-menu-material] { border: 1px solid CanvasText; }
  html:root body [data-composer-card]:focus-within { outline: 2px solid Highlight; outline-offset: 2px; }
}
`;

    function apply(ctx) {
      ctx.effect(() => ctx.theme.overrideTokens('@tal-shin/dsh-liquid-glass', TOKENS), 'liquid-glass: token layer');
      ctx.effect(() => {
        const element = document.createElement('style');
        element.setAttribute('data-liquid-glass', '');
        element.textContent = CSS;
        (document.head ?? document.documentElement).append(element);
        return () => element.remove();
      }, 'liquid-glass: stylesheet');

      ctx.effect(() => {
        const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
        const reducedTransparency = window.matchMedia('(prefers-reduced-transparency: reduce)');
        const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
        let frame = 0;
        let current = null;
        let x = 0;
        let y = 0;
        const reset = () => {
          if (frame) cancelAnimationFrame(frame);
          frame = 0;
          if (!current) return;
          current.style.removeProperty('--lg-x');
          current.style.removeProperty('--lg-y');
          current = null;
        };
        const paint = () => {
          frame = 0;
          if (!current?.isConnected) return reset();
          // One layout read per frame, followed by the two style writes.
          const rect = current.getBoundingClientRect();
          current.style.setProperty('--lg-x', `${Math.round(x - rect.left)}px`);
          current.style.setProperty('--lg-y', `${Math.round(y - rect.top)}px`);
        };
        const onMove = (event) => {
          if (reducedMotion.matches || reducedTransparency.matches || !finePointer.matches || event.pointerType !== 'mouse') return;
          const target = event.target instanceof Element ? event.target.closest('[data-composer-card]') : null;
          if (!target) return reset();
          if (target !== current) { reset(); current = target; }
          x = event.clientX;
          y = event.clientY;
          if (!frame) frame = requestAnimationFrame(paint);
        };
        const onOut = (event) => {
          if (current && (!(event.relatedTarget instanceof Node) || !current.contains(event.relatedTarget))) reset();
        };
        document.addEventListener('pointermove', onMove, { passive: true });
        document.addEventListener('pointerout', onOut, { passive: true });
        window.addEventListener('blur', reset);
        reducedMotion.addEventListener('change', reset);
        reducedTransparency.addEventListener('change', reset);
        finePointer.addEventListener('change', reset);
        return () => {
          document.removeEventListener('pointermove', onMove);
          document.removeEventListener('pointerout', onOut);
          window.removeEventListener('blur', reset);
          reducedMotion.removeEventListener('change', reset);
          reducedTransparency.removeEventListener('change', reset);
          finePointer.removeEventListener('change', reset);
          reset();
        };
      }, 'liquid-glass: pointer highlight');
    }
    return { inject: ['theme'], apply };
  },
});
