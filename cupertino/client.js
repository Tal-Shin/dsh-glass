/**
 * cupertino — Client half.
 *
 * A stylesheet only: custom properties and three structural rules. It never uses
 * the theme service, so it cannot lose a stacking race with the theme's token
 * layer — `!important` on a custom property wins the cascade regardless of the
 * order the two stylesheets were appended in.
 *
 * What it changes, in Apple's terms:
 *  - the corner ladder: the bigger the surface, the bigger the radius;
 *  - the shadow ramp: a 0.5px edge plus a wide, very low-alpha falloff;
 *  - the type stack: system faces first, then the closest free faces on Windows;
 *  - columns are separated by material, not by a rule.
 */
window.__ModuleLoader__.load({
  id: '@tal-shin/dsh-cupertino',
  factory() {
    const CSS = `
html, body {
  --dsw-radius-xs: 6px !important;
  --dsw-radius-sm: 10px !important;
  --dsw-radius-md: 12px !important;
  --dsw-radius-lg: 14px !important;
  --dsw-radius-xl: 18px !important;
  --dsw-radius-panel: 22px !important;
}

/* Light comes from above: a hairline edge, then a wide falloff that never reads
   as a drop shadow on its own. */
body {
  --dsw-shadow-lv1: 0 0 0 .5px rgba(0,0,0,.05), 0 1px 2px rgba(0,0,0,.05) !important;
  --dsw-shadow-lv2: 0 0 0 .5px rgba(0,0,0,.06), 0 4px 12px -6px rgba(0,0,0,.16), 0 16px 32px -24px rgba(0,0,0,.28) !important;
  --dsw-shadow-lv3: 0 0 0 .5px rgba(0,0,0,.07), 0 8px 20px -10px rgba(0,0,0,.18), 0 32px 64px -32px rgba(0,0,0,.32) !important;
}
body[data-ds-dark-theme] {
  --dsw-shadow-lv1: 0 0 0 .5px rgba(0,0,0,.45), 0 1px 2px rgba(0,0,0,.50) !important;
  --dsw-shadow-lv2: 0 0 0 .5px rgba(0,0,0,.50), 0 4px 12px -6px rgba(0,0,0,.55), 0 16px 32px -24px rgba(0,0,0,.60) !important;
  --dsw-shadow-lv3: 0 0 0 .5px rgba(0,0,0,.55), 0 8px 20px -10px rgba(0,0,0,.60), 0 32px 64px -32px rgba(0,0,0,.70) !important;
}

/* Inter is the closest free match to SF Pro when installed; Noto Sans SC is the
   closest match to PingFang on Windows. A font chosen in Settings still wins. */
body {
  --dsw-font-family: var(--dsh-font-family-text, -glass-system), BlinkMacSystemFont, "Inter", "Segoe UI Variable Text", "Segoe UI", "PingFang SC", "Noto Sans SC", "Hiragino Sans GB", "Microsoft YaHei UI", "Microsoft YaHei", "Helvetica Neue", Arial, sans-serif !important;
}

/* Material separates the columns; the 0.5px rule was doing the same job twice. */

/* A damped spring (response .3s, damping ratio .8) sampled for linear(): it settles
   in .36s with a barely visible overshoot, so controls feel quick rather than bouncy. */
body {
  --glass-spring: linear(0, 0.07, 0.223, 0.399, 0.565, 0.705, 0.813, 0.893, 0.947, 0.981, 1.001, 1.011, 1.015, 1.015, 1.013, 1.01, 1.008, 1.005, 1);
  --glass-spring-duration: .36s;
}

/* The view tabs become a segmented control: the shell marks them with real ARIA
   roles, so this is a structure-level restyle, not a hash-class guess. */
[data-conversation-tabs] {
  display: inline-flex !important;
  flex-wrap: nowrap !important;
  gap: 2px !important;
  max-width: 100%;
  min-height: 0 !important;
  padding: 3px !important;
  box-sizing: border-box;
  overflow-x: auto;
  scrollbar-width: thin;
  position: relative;
  isolation: isolate;
  anchor-scope: --glass-segment;
  border-radius: 12px;
  background: color-mix(in srgb, var(--dsw-alias-label-primary) 5%, transparent);
  box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--dsw-alias-label-primary) 6%, transparent);
}
[data-conversation-tabs] > [role='tab'] {
  flex-shrink: 0;
  min-height: 28px !important;
  padding: 3px 14px !important;
  border-radius: 9px;
  color: var(--dsw-alias-label-secondary) !important;
  transition: background-color .16s ease, color .16s ease, box-shadow .16s ease;
}
[data-conversation-tabs] > [role='tab']::after { display: none !important; }
[data-conversation-tabs] > [role='tab'][aria-selected='true'] {
  background: color-mix(in srgb, var(--dsw-alias-bg-base) 88%, white) !important;
  color: var(--dsw-alias-label-primary) !important;
  box-shadow: 0 1px 2px rgba(0,0,0,.10), 0 0 0 .5px rgba(0,0,0,.10) !important;
}
body[data-ds-dark-theme] [data-conversation-tabs] {
  background: rgba(255,255,255,.07);
  box-shadow: inset 0 0 0 .5px rgba(255,255,255,.08);
}
body[data-ds-dark-theme] [data-conversation-tabs] > [role='tab'][aria-selected='true'] {
  background: rgba(255,255,255,.12) !important;
  box-shadow: 0 1px 2px rgba(0,0,0,.45), 0 0 0 .5px rgba(255,255,255,.10) !important;
}

/* One thumb slides between the tabs: it is anchored to whichever tab is selected,
   so a changed anchor animates its position. Without anchor positioning the
   selected tab keeps the static fill above. */
@supports (anchor-name: --a) {
  [data-conversation-tabs] > [role='tab'][aria-selected='true'] {
    anchor-name: --glass-segment;
    background: transparent !important;
    box-shadow: none !important;
  }
  [data-conversation-tabs]::before {
    content: '';
    position: absolute;
    z-index: -1;
    position-anchor: --glass-segment;
    left: anchor(left);
    top: anchor(top);
    width: anchor-size(width);
    height: anchor-size(height);
    border-radius: 9px;
    background: color-mix(in srgb, var(--dsw-alias-bg-base) 88%, white);
    box-shadow: 0 1px 2px rgba(0,0,0,.10), 0 0 0 .5px rgba(0,0,0,.10);
    transition: left var(--glass-spring-duration) var(--glass-spring), width var(--glass-spring-duration) var(--glass-spring);
  }
  body[data-ds-dark-theme] [data-conversation-tabs]::before {
    background: rgba(255,255,255,.12);
    box-shadow: 0 1px 2px rgba(0,0,0,.45), 0 0 0 .5px rgba(255,255,255,.10);
  }
}

/* Switches: the thumb springs across, and stretches while it is held. */
[role='switch'] {
  transition: background-color .2s ease;
}
[role='switch'] > span:only-child {
  box-shadow: 0 1px 2px rgba(0,0,0,.22), 0 0 0 .5px rgba(0,0,0,.05);
  transition: transform var(--glass-spring-duration) var(--glass-spring), width .18s ease;
}
[role='switch']:active:not(:disabled) > span:only-child {
  width: 20px;
}
[role='switch'][aria-checked='true']:active:not(:disabled) > span:only-child {
  transform: translate(12px);
}

@media (prefers-reduced-motion: reduce) {
  [data-conversation-tabs] > [role='tab'],
  [data-conversation-tabs]::before,
  [role='switch'],
  [role='switch'] > span:only-child { transition: none; }
}
`;

    function apply(ctx) {
      ctx.effect(() => {
        const element = document.createElement('style');
        element.setAttribute('data-cupertino', '');
        element.textContent = CSS;
        (document.head ?? document.documentElement).append(element);
        return () => element.remove();
      }, 'cupertino: stylesheet');
    }

    return { apply };
  },
});
