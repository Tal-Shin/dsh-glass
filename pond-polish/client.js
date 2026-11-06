/**
 * pond-polish — Client half.
 *
 * A token layer plus one stylesheet, both stacked over whatever theme is active
 * (nothing here depends on a particular theme; the stock theme benefits too).
 * Everything is registered inside `ctx.effect`, so disabling the bundle removes
 * the tokens and the stylesheet and the GUI returns to its previous look.
 *
 * Readability and control feedback:
 *
 *  1. Muted text. The third and fourth text steps sit at 3.3:1 and 2.2:1 on
 *     the base surface, so timestamps, the status strip and hints were close to unreadable.
 *     They are re-stepped to about 5.9 / 5.1 / 4.7:1 on the neutral base.
 *  2. Buttons shrink under the pointer and spring back; menus and dialogs settle in.
 *  3. Keyboard focus has a visible outline over glass.
 *
 * Materials and composer focus belong to liquid-glass; row measurement and
 * scroll anchoring belong to DSH's native virtualizer.
 */
window.__ModuleLoader__.load({
  id: '@tal-shin/dsh-pond-polish',
  factory() {
    /** Alias-layer overrides; every entry is a required { light, dark } pair. */
    const TOKENS = {
      '--dsw-alias-label-secondary': { light: '#5e5e63', dark: '#c7c7cc' },
      '--dsw-alias-label-tertiary': { light: '#68686d', dark: '#aeaeb2' },
      '--dsw-alias-label-caption': { light: '#6e6e73', dark: '#98989d' },
    };

    const STYLE = `
/* 1. Selection follows the accent. */
::selection {
  background: color-mix(in srgb, var(--dsw-alias-state-business-primary) 20%, transparent);
}

/* Feedback is chosen per control. Small controls shrink under the pointer and spring
   back, harder the smaller they are; independent scale leaves native transforms
   alone. Rows answer with a fill instead, because scaling a wide row makes its far
   edge jump. */
@media (prefers-reduced-motion: no-preference) {
  [data-composer-card] button,
  [data-slot='root'] header button,
  [data-rightbar-col] button {
    transition:
      background-color .15s ease, color .15s ease, border-color .15s ease,
      box-shadow .15s ease, opacity .15s ease, transform .15s ease,
      scale var(--glass-spring-duration, .3s) var(--glass-spring, cubic-bezier(.22, 1, .36, 1));
  }
  [data-composer-card] button:active:not(:disabled) {
    scale: .96;
    transition-duration: .08s;
  }
  [data-composer-card] button[class*='_primary']:active:not(:disabled) {
    scale: .9;
  }
  [data-slot='root'] header button:not([role='tab']):active:not(:disabled),
  [data-rightbar-col] button:active:not(:disabled) {
    scale: .93;
    transition-duration: .08s;
  }

  /* Surfaces arrive from slightly small and settle; scale and translate are
     independent properties, so anchored positions stay untouched. */
  @keyframes glass-pop { from { opacity: 0; scale: .95; } }
  @keyframes glass-sheet { from { opacity: 0; scale: .97; translate: 0 8px; } }
  @keyframes glass-fade { from { opacity: 0; } }
  [data-menu-material] {
    animation: glass-pop var(--glass-spring-duration, .3s) var(--glass-spring, cubic-bezier(.22, 1, .36, 1));
  }
  [role='dialog'] {
    animation: glass-sheet var(--glass-spring-duration, .3s) var(--glass-spring, cubic-bezier(.22, 1, .36, 1));
  }
  [class*='_overlay'] > [class*='_mask'] {
    animation: glass-fade .2s ease;
  }
}

[data-slot='sidebar'] [role='treeitem']:active {
  background-color: var(--dsw-alias-interactive-bg-active);
}

/* Focus and reading materials are owned by liquid-glass. */
body :is(button, a, [role='tab'], [role='menuitem']):focus-visible {
  outline: 2px solid var(--dsw-focus-ring-color, var(--dsw-alias-state-business-primary));
  outline-offset: 3px;
}

/* Leave row measurement and scroll anchoring to DSH's native virtualizer. */
`;

    function apply(ctx) {
      ctx.effect(() => {
        const element = document.createElement('style');
        element.setAttribute('data-pond-polish', '');
        element.textContent = STYLE;
        (document.head ?? document.documentElement).append(element);
        return () => element.remove();
      }, 'pond-polish: stylesheet');

      // Surfaces grow out of what opened them: the latest press sets the origin. A
      // keyboard-opened surface has no recent press and scales from its centre.
      ctx.effect(() => {
        let press = null;
        const onDown = (event) => {
          press = { x: event.clientX, y: event.clientY, at: performance.now() };
        };
        const onStart = (event) => {
          if (event.animationName !== 'glass-pop' && event.animationName !== 'glass-sheet') return;
          const surface = event.target;
          if (!(surface instanceof HTMLElement)) return;
          if (press === null || performance.now() - press.at > 600) return;
          const box = surface.getBoundingClientRect();
          const x = Math.min(Math.max(press.x - box.left, 0), box.width);
          const y = Math.min(Math.max(press.y - box.top, 0), box.height);
          surface.style.transformOrigin = `${Math.round(x)}px ${Math.round(y)}px`;
        };
        document.addEventListener('pointerdown', onDown, { capture: true, passive: true });
        document.addEventListener('animationstart', onStart, true);
        return () => {
          document.removeEventListener('pointerdown', onDown, { capture: true });
          document.removeEventListener('animationstart', onStart, true);
        };
      }, 'pond-polish: surface origin');

      ctx.effect(
        () => ctx.theme.overrideTokens('@tal-shin/dsh-pond-polish', TOKENS),
        'pond-polish: token layer',
      );
    }

    return { inject: ['theme'], apply };
  },
});
