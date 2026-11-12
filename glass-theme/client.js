/**
 * glass-theme — Client half: the one appearance bundle.
 *
 * Each concern has exactly one owner here, and four of them can be switched on and
 * off from the Plugins page:
 *
 *   base    where the floating cards sit; always on. It reads its materials from
 *           --lg-* variables, so the same geometry paints solid without the glass group.
 *   color   system palette, text contrast, selection, background wash.
 *   glass   every translucent surface: panels, composer, menus, dialogs, thin cards.
 *   shape   the corner ladder, every shadow, the type stack.
 *   motion  press feedback, surfaces settling in, switches, keyboard focus.
 *
 * Derived from the shell layer of @cngtn/dsh-cngtn-pond 1.5.1 (MIT); the pond itself is
 * the separate, optional koi-pond bundle. The frame stays at z-index 1 and its panels
 * stay translucent, so an optional canvas at z-index 0 shows through without either
 * bundle knowing the other.
 *
 * Hashed class names are matched by substring. When DSH renames one, that surface goes
 * back to the shell's own opaque fill and nothing else changes.
 *
 * Everything lives in `ctx.effect`, so disabling the bundle removes all of it.
 */
window.__ModuleLoader__.load({
  id: '@tal-shin/dsh-glass-theme',
  factory(require) {
    const ID = '@tal-shin/dsh-glass-theme';

    const LIGHT = {
      bg: '#f5f5f7', layer1: '#fbfbfd', layer2: '#f2f2f7', layer3: '#e5e5ea', overlay: '#ffffff',
      composer: '#ffffff', control: '#ffffff', controlHover: '#f2f2f7',
      subtle: 'rgba(118, 118, 128, 0.08)', subtleHover: 'rgba(118, 118, 128, 0.12)', subtleActive: 'rgba(118, 118, 128, 0.18)',
      text: '#1d1d1f', textSecondary: '#5e5e63', textTertiary: '#68686d', textCaption: '#6e6e73', textDisabled: '#aeaeb2',
      accent: '#007aff', accentHover: '#0a6fe0', accentPressed: '#0058cc', accentText: '#0066cc',
      accentSoft: '#dcebff', accentSofter: '#eef5ff', onAccent: '#ffffff',
      success: '#248a3d', successSoft: '#dff5e3', caution: '#b25000', cautionSoft: '#fff1dc', critical: '#d70015', criticalSoft: '#ffe3e1',
      smoke: 'rgba(0, 0, 0, 0.28)', smokeStrong: 'rgba(0, 0, 0, 0.48)',
      scroll: 'rgba(0, 0, 0, 0.22)', scrollHover: 'rgba(0, 0, 0, 0.38)',
      shadowSoft: 'rgba(0, 0, 0, 0.06)', shadowHard: 'rgba(0, 0, 0, 0.04)', shadowDeep: 'rgba(0, 0, 0, 0.12)',
      stroke: '0, 0, 0',
    };
    const DARK = {
      bg: '#1c1c1e', layer1: '#232325', layer2: '#2c2c2e', layer3: '#3a3a3c', overlay: '#2c2c2e',
      composer: '#2c2c2e', control: '#3a3a3c', controlHover: '#48484a',
      subtle: 'rgba(120, 120, 128, 0.16)', subtleHover: 'rgba(120, 120, 128, 0.24)', subtleActive: 'rgba(120, 120, 128, 0.32)',
      text: '#f5f5f7', textSecondary: '#c7c7cc', textTertiary: '#aeaeb2', textCaption: '#98989d', textDisabled: '#636366',
      accent: '#0a84ff', accentHover: '#409cff', accentPressed: '#0071e3', accentText: '#64b0ff',
      accentSoft: '#0f2f55', accentSofter: '#0b2140', onAccent: '#ffffff',
      success: '#30d158', successSoft: '#12331c', caution: '#ff9f0a', cautionSoft: '#3a2a0c', critical: '#ff453a', criticalSoft: '#3b1513',
      smoke: 'rgba(0, 0, 0, 0.50)', smokeStrong: 'rgba(0, 0, 0, 0.70)',
      scroll: 'rgba(255, 255, 255, 0.24)', scrollHover: 'rgba(255, 255, 255, 0.40)',
      shadowSoft: 'rgba(0, 0, 0, 0.30)', shadowHard: 'rgba(0, 0, 0, 0.22)', shadowDeep: 'rgba(0, 0, 0, 0.45)',
      stroke: '255, 255, 255',
    };

    const colorTokens = {};
    const shapeTokens = {};
    const set = (name, light, dark = light) => { colorTokens[name] = { light, dark }; };
    const shape = (name, light, dark = light) => { shapeTokens[name] = { light, dark }; };
    const pair = (name, key) => set(name, LIGHT[key], DARK[key]);
    const line = (name, a, b) => set(name, `rgba(${LIGHT.stroke}, ${a})`, `rgba(${DARK.stroke}, ${b})`);
    const mix = (light, a, dark, b) => [`color-mix(in srgb, ${light} ${a}%, transparent)`, `color-mix(in srgb, ${dark} ${b}%, transparent)`];

    // Apple's continuous corner. Pills and circles keep the shell's explicit round.
    shape('--dsw-corner-shape', 'superellipse(2)');

    // Type ramp: the same metrics the layout already settled on.
    const ramp = (name, size, height, weight = 400) => shape(name, `${weight} ${size}px/${height}px var(--dsw-font-family)`);
    ramp('--dsw-font-xxxs-11', 11, 15); ramp('--dsw-font-xxxs-strong-11', 11, 15, 500);
    ramp('--dsw-font-xxs-12', 12, 18); ramp('--dsw-font-xxs-strong-12', 12, 18, 500);
    ramp('--dsw-font-xs-13', 13, 20); ramp('--dsw-font-xs-strong-13', 13, 20, 500);
    ramp('--dsw-font-s-14', 14, 22); ramp('--dsw-font-s-strong-14', 14, 22, 500);
    ramp('--dsw-font-base-16', 15, 24); ramp('--dsw-font-base-strong-16', 15, 24, 500);
    ramp('--dsw-font-m-18', 16, 26, 500); ramp('--dsw-font-l-20', 18, 26, 500); ramp('--dsw-font-xl-24', 21, 28, 500);

    // Surfaces and masks.
    pair('--dsw-alias-bg-base', 'bg'); pair('--dsw-alias-bg-layer-1', 'layer1'); pair('--dsw-alias-bg-layer-2', 'layer2');
    pair('--dsw-alias-bg-layer-3', 'layer3'); pair('--dsw-alias-bg-overlay', 'overlay');
    pair('--dsw-alias-bg-module-platform', 'layer2'); pair('--dsw-alias-bg-multi-select', 'layer3');
    pair('--dsw-alias-bg-document-preview', 'layer1');
    set('--dsw-alias-bg-skeleton', 'rgba(118, 118, 128, 0.10)', 'rgba(120, 120, 128, 0.20)');
    set('--dsw-alias-bg-document-selection', ...mix(LIGHT.accent, 24, DARK.accent, 32));
    pair('--dsw-alias-bg-mask-1', 'smoke'); pair('--dsw-alias-bg-mask-2', 'smoke'); pair('--dsw-alias-bg-mask-3', 'smokeStrong');
    set('--dsw-alias-bg-mask-drop', 'rgba(245, 245, 247, 0.78)', 'rgba(28, 28, 30, 0.78)');
    set('--dsw-alias-bg-mask-photo', 'rgba(0, 0, 0, 0.88)', 'rgba(0, 0, 0, 0.90)');

    // Hairlines.
    line('--dsw-alias-border-l1', 0.08, 0.08); line('--dsw-alias-border-l2', 0.12, 0.12);
    line('--dsw-alias-border-l2-darkmode-thin', 0.12, 0.08); line('--dsw-alias-border-l3', 0.18, 0.16); line('--dsw-alias-border-l4', 0.26, 0.22);
    set('--dsw-alias-border-inverted', 'transparent', 'rgba(255, 255, 255, 0.06)');
    set('--dsw-alias-border-inverted2', 'transparent', 'rgba(255, 255, 255, 0.08)');

    // Accent. Fills use the system blue; text uses the darker link blue, which
    // keeps 4.5:1 on the light surfaces.
    pair('--dsw-alias-brand-primary', 'accent'); pair('--dsw-alias-brand-primary-invert', 'onAccent');
    pair('--dsw-alias-brand-text', 'text'); pair('--dsw-alias-brand-primary-new-colorprimary-new-color', 'accent');
    pair('--dsw-alias-link', 'accentText'); pair('--dsw-alias-state-business-primary', 'accent');
    pair('--dsw-alias-state-business-tertiary', 'accentSoft');

    // Buttons.
    pair('--dsw-alias-button-primary-fill', 'accent'); pair('--dsw-alias-button-primary-hover', 'accentHover');
    set('--dsw-alias-button-primary-dimmed', 'rgba(118, 118, 128, 0.20)', 'rgba(120, 120, 128, 0.32)');
    pair('--dsw-alias-button-info-fill', 'accent'); pair('--dsw-alias-button-info-hover', 'accentHover');
    pair('--dsw-alias-button-contrast-fill', 'text');
    pair('--dsw-alias-button-elevated-fill', 'control'); pair('--dsw-alias-button-floating-fill', 'control');
    pair('--dsw-alias-button-floating-hover', 'controlHover');
    pair('--dsw-alias-button-ghost-active-fill', 'subtle'); pair('--dsw-alias-button-ghost-active-hover', 'subtleHover');
    pair('--dsw-alias-button-ghost-active-border', 'textTertiary');
    set('--dsw-alias-button-tool-bar-fill', 'rgba(29, 29, 31, 0.55)', 'rgba(0, 0, 0, 0.60)');
    set('--dsw-alias-button-tool-bar-fill-invisible', 'rgba(29, 29, 31, 0.40)', 'rgba(0, 0, 0, 0.46)');
    set('--dsw-alias-button-tool-bar-hover', 'rgba(29, 29, 31, 0.70)', 'rgba(0, 0, 0, 0.75)');

    // Rows and controls.
    pair('--dsw-alias-interactive-bg-hover', 'subtleHover'); pair('--dsw-alias-interactive-bg-active', 'subtleActive');
    set('--dsw-alias-interactive-bg-hover-accent', 'rgba(0, 122, 255, 0.08)', 'rgba(10, 132, 255, 0.14)');
    set('--dsw-alias-interactive-bg-hover-danger', 'rgba(215, 0, 21, 0.08)', 'rgba(255, 69, 58, 0.14)');
    pair('--dsw-alias-interactive-bg-hover-solid', 'controlHover'); set('--dsw-alias-switch-thumb', '#ffffff');

    // Labels.
    pair('--dsw-alias-label-primary', 'text'); set('--dsw-alias-label-primary-dimmed', 'rgba(29, 29, 31, 0.78)', 'rgba(245, 245, 247, 0.88)');
    pair('--dsw-alias-label-primary-inverted', 'bg'); set('--dsw-alias-label-primary-foreground', '#ffffff', '#1c1c1e');
    pair('--dsw-alias-label-primary-bluish', 'accentText'); pair('--dsw-alias-label-secondary', 'textSecondary');
    pair('--dsw-alias-label-tertiary', 'textTertiary'); pair('--dsw-alias-label-caption', 'textCaption');
    pair('--dsw-alias-label-dimmed', 'textDisabled'); pair('--dsw-alias-label-document-preview', 'textSecondary');
    pair('--dsw-alias-label-deep-diving', 'accentText'); set('--dsw-alias-label-deep-diving-shimmer', '#5ac8fa', '#9ad7ff');
    set('--dsw-alias-label-shimmer', 'rgba(29, 29, 31, 0.28)', 'rgba(245, 245, 247, 0.40)');

    // States.
    pair('--dsw-alias-state-success-primary', 'success'); pair('--dsw-alias-state-success-secondary', 'success');
    pair('--dsw-alias-state-success-tertiary', 'successSoft'); pair('--dsw-alias-state-warn-primary', 'caution');
    pair('--dsw-alias-state-warn-secondary', 'caution'); pair('--dsw-alias-state-warn-label', 'caution');
    pair('--dsw-alias-state-warn-tertiary', 'cautionSoft'); pair('--dsw-alias-state-error-primary', 'critical');
    pair('--dsw-alias-state-error-secondary', 'critical'); pair('--dsw-alias-state-idle-primary', 'textTertiary');

    // Code and diffs.
    set('--dsw-alias-code-diff-added', 'rgba(36, 138, 61, 0.10)', 'rgba(48, 209, 88, 0.14)');
    set('--dsw-alias-code-diff-deleted', 'rgba(215, 0, 21, 0.09)', 'rgba(255, 69, 58, 0.14)');
    set('--dsw-alias-file-diff-added-bg', '#e6f6ea', '#16301e'); set('--dsw-alias-file-diff-added-gutter', '#f0faf2', '#112417');
    pair('--dsw-alias-file-diff-added-marker', 'success');
    set('--dsw-alias-file-diff-deleted-bg', '#ffe9e8', '#3a1a18'); set('--dsw-alias-file-diff-deleted-gutter', '#fff3f2', '#2b1412');
    pair('--dsw-alias-file-diff-deleted-marker', 'critical');
    set('--dsw-alias-markdown-code-block', ...mix(LIGHT.layer1, 46, DARK.layer1, 46));
    set('--dsw-alias-markdown-code-block-banner', ...mix(LIGHT.layer2, 50, DARK.layer2, 46));
    pair('--dsw-alias-markdown-inline-code', 'subtleHover'); pair('--dsw-alias-markdown-code-segment-selected', 'control');
    pair('--dsw-alias-markdown-code-segment-unselected', 'layer1'); pair('--dsw-alias-markdown-citation', 'layer2');
    pair('--dsw-alias-markdown-tag', 'layer3'); pair('--dsw-alias-markdown-placeholder', 'subtle');
    set('--dsw-alias-turn-trigger-bg', 'var(--dsw-alias-markdown-code-block)', 'var(--dsw-alias-interactive-bg-hover)');
    set('--dsw-alias-turn-trigger-bg-hover', 'var(--dsw-alias-interactive-bg-hover)', 'var(--dsw-alias-interactive-bg-active)');

    // Syntax colours in the spirit of Xcode's default themes.
    set('--shiki-token-keyword', '#9b2393', '#fc5fa3'); set('--shiki-token-string', '#c41a16', '#fc6a5d');
    set('--shiki-token-string-expression', '#c41a16', '#fc6a5d'); set('--shiki-token-comment', '#5d6c79', '#7f8c98');
    set('--shiki-token-constant', '#272ad8', '#d9c97c'); set('--shiki-token-function', '#326d74', '#67b7a4');
    set('--shiki-token-parameter', '#643820', '#fd8f3f'); set('--shiki-token-punctuation', '#3a3a3c', '#c7c7cc');
    set('--shiki-token-link', LIGHT.accentText, DARK.accentText);

    // Menus, tooltips, scrollbars.
    set('--dsw-alias-menu-group-header-fill', ...mix(LIGHT.layer2, 78, DARK.layer2, 82));
    pair('--dsw-alias-menu-icon', 'textSecondary');
    set('--dsw-alias-tooltip-bg', '#1d1d1f', '#3a3a3c'); set('--dsw-alias-tooltip-key-bg', 'rgba(255, 255, 255, 0.14)', 'rgba(255, 255, 255, 0.12)');
    set('--dsw-alias-toast-bg', '#1d1d1f', '#3a3a3c'); set('--dsw-alias-toast-label', '#ffffff', '#f5f5f7');
    pair('--dsw-alias-scrollbar-bg-l1', 'scroll'); set('--dsw-alias-scrollbar-bg-l2', 'rgba(0, 0, 0, 0.30)', 'rgba(255, 255, 255, 0.30)');
    pair('--dsw-alias-scrollbar-hover-l1', 'scrollHover'); set('--dsw-alias-scrollbar-hover-l2', 'rgba(0, 0, 0, 0.46)', 'rgba(255, 255, 255, 0.46)');

    // Elevation. The ramp itself is in SHAPE_CSS; these are the shell's named levels.
    const both = (fn) => [fn(LIGHT), fn(DARK)];
    shape('--dsw-shadow-lv1-blur', ...both((c) => `0 2px 6px ${c.shadowSoft}`));
    shape('--dsw-elevation-stroke', '0 0 0 .5px var(--dsw-elevation-stroke-color)');
    shape('--dsw-elevation-stroke-color', 'var(--dsw-alias-border-l2)');
    shape('--dsw-elevation-soft', ...both((c) => `var(--dsw-elevation-stroke), 0 1px 2px ${c.shadowSoft}`));
    shape('--dsw-elevation-panel',
      'var(--dsw-elevation-stroke), inset 0 1px 0 #ffffffd1, 0 8px 24px -12px #25262826, 0 24px 52px -30px #25262838',
      'var(--dsw-elevation-stroke), inset 0 1px 0 #ffffff21, 0 8px 24px -12px #00000080, 0 24px 52px -30px #00000099');
    shape('--dsw-elevation-prominent',
      'var(--dsw-elevation-stroke), inset 0 1px 0 #ffffffe6, 0 12px 32px -14px #2526282e, 0 32px 64px -32px #25262840',
      'var(--dsw-elevation-stroke), inset 0 1px 0 #ffffff26, 0 12px 32px -14px #00000099, 0 32px 64px -32px #000000b3');

    // Focus and shell. The sidebar fill stays transparent because the preload
    // forwards it to the native caption buttons.
    pair('--dsw-focus-ring-color', 'accent'); set('--dsw-focus-ring-width', '2px');
    set('--dsw-specific-sidebar-fill', 'transparent');
    pair('--dsw-specific-sidebar-nav-item-active', 'subtleActive'); pair('--dsw-specific-sidebar-nav-item-active-accent', 'accentSoft');
    pair('--dsw-specific-sidebar-nav-item-hover', 'subtleHover'); pair('--dsw-specific-input-major', 'composer');
    pair('--dsw-specific-login-input', 'layer1'); set('--dsw-specific-selector', LIGHT.layer2, DARK.layer3);
    set('--dsw-specific-tip', LIGHT.layer1, DARK.layer2);
    set('--dsw-specific-bubble', ...mix('#e9e9ee', 62, '#3a3a3c', 58));
    set('--dsw-specific-bubble-highlight', ...mix('#dedee3', 68, '#48484a', 62));
    pair('--dsw-alias-settings-card-fill', 'layer1'); line('--dsw-alias-settings-card-stroke', 0.08, 0.10);
    pair('--dsw-alias-onboarding-accent', 'accent'); pair('--dsw-alias-onboarding-card-fill', 'layer1');
    line('--dsw-alias-onboarding-checkbox-border', 0.24, 0.20);
    set('--dsw-alias-onboarding-secondary-fill', LIGHT.control, DARK.layer3);

    // Static ramps: anything an alias list misses lands on the system palette.
    const GREYS = {
      '00': '#ffffff', 50: '#fbfbfd', 60: '#f8f8fa', 75: '#f5f5f7', 100: '#f2f2f7', 150: '#e5e5ea', 200: '#d1d1d6',
      250: '#c7c7cc', 300: '#c7c7cc', 400: '#aeaeb2', 500: '#98989d', 550: '#8e8e93', 600: '#6e6e73', 700: '#636366',
      750: '#515154', 800: '#3a3a3c', 850: '#2c2c2e', 875: '#2c2c2e', 900: '#232325', 950: '#1c1c1e', 1000: '#000000',
    };
    for (const [step, value] of Object.entries(GREYS)) {
      if (!['250', '550'].includes(step)) set(`--dsw-static-neutral-bluish-${step}`, value);
      if (!['60', '75', '750', '875', '950'].includes(step)) set(`--dsw-static-neutral-${step}`, value);
    }
    const BLUE = { 50: LIGHT.accentSofter, 100: LIGHT.accentSoft, 300: '#7ab8ff', 400: '#4da3ff', 450: '#2b90ff', 500: LIGHT.accent, 600: LIGHT.accentHover, 800: LIGHT.accentPressed, 900: '#00408f' };
    const BLUE_DARK = { 50: DARK.accentSofter, 100: DARK.accentSoft, 300: '#7ab8ff', 400: '#64b0ff', 450: DARK.accentHover, 500: DARK.accent, 600: DARK.accentHover, 800: '#0f2f55', 900: '#0b2140' };
    for (const step of Object.keys(BLUE)) {
      set(`--dsw-static-deepseek-${step}`, BLUE[step], BLUE_DARK[step]);
      set(`--dsw-static-blue-${step}`, BLUE[step], BLUE_DARK[step]);
    }
    set('--dsw-static-deepseek-200', '#b3d4ff', '#123b6b');
    set('--dsw-static-deepseek-700-delete', LIGHT.accentPressed, '#0f2f55');
    set('--dsw-static-blue-50p', LIGHT.accentSofter, DARK.accentSofter); set('--dsw-static-blue-75', LIGHT.accentSoft, DARK.accentSoft);
    set('--dsw-static-blue-950', '#002a60', '#081a33');
    set('--dsw-static-green-100', LIGHT.successSoft, DARK.successSoft); set('--dsw-static-green-400', '#34c759');
    set('--dsw-static-green-500', LIGHT.success, DARK.success); set('--dsw-static-green-900', '#12331c');
    set('--dsw-static-green-500-a08', 'rgba(36, 138, 61, 0.08)', 'rgba(48, 209, 88, 0.08)');
    set('--dsw-static-green-500-a12', 'rgba(36, 138, 61, 0.12)', 'rgba(48, 209, 88, 0.12)');
    set('--dsw-static-amber-100', LIGHT.cautionSoft, DARK.cautionSoft); set('--dsw-static-amber-400', '#ff9f0a');
    set('--dsw-static-amber-500', LIGHT.caution, DARK.caution); set('--dsw-static-amber-600', LIGHT.caution, DARK.caution);
    set('--dsw-static-amber-900', '#3a2a0c');
    set('--dsw-static-red-50', LIGHT.criticalSoft, DARK.criticalSoft); set('--dsw-static-red-100', LIGHT.criticalSoft, DARK.criticalSoft);
    set('--dsw-static-red-400', '#ff6961'); set('--dsw-static-red-400-a12', 'rgba(255, 105, 97, 0.12)');
    set('--dsw-static-red-500', '#ff3b30'); set('--dsw-static-red-600', LIGHT.critical, DARK.critical);
    set('--dsw-static-red-600-a08', 'rgba(215, 0, 21, 0.08)', 'rgba(255, 69, 58, 0.08)'); set('--dsw-static-red-900', '#3b1513');

    /* ── base: layout only ─────────────────────────────────────────────────────
       Three floating cards share one gutter. Fills, edges and filters come from --lg-*
       variables with solid fallbacks, so this layer never needs overriding. Filters stay
       on pseudo-elements so fixed-position shell controls keep their viewport anchor. */
    const BASE_CSS = String.raw`
/* Values more than one group reads. The gap is laid out here and subtracted from the corner in
   the shape group, so spacing and radius cannot drift apart. */
body {
  --glass-seat-gap: 16px;
  --glass-instant: .1s;
  --glass-control: .2s;
}

body [data-slot="root"] > div {
  position: relative;
  z-index: 1;
  background-color: transparent !important;
}
html[data-windows-titlebar] body [data-slot="root"] > div::before {
  background-color: transparent;
  -webkit-backdrop-filter: none;
  backdrop-filter: none;
}
html body {
  background-color: var(--dsw-alias-bg-base) !important;
}

/* Every layer between the window and the cards is clear. */
body [data-slot="main"],
body [data-slot="main.conversation"],
body [data-slot="main.conversation"] > div,
body [data-conversation-content],
body [data-conversation-scroll],
body [data-conversation-region="chat"],
body [data-chat-turn],
html body [data-slot="main"] > * {
  background: transparent !important;
}
body [class*='_mainPanel'],
body [data-slot="root"] > div > div:has([data-slot="main"]) {
  background-color: transparent !important;
}
html body [data-slot="root"] > div > div:nth-child(1),
html body [data-slot="sidebar"],
html body [data-slot="sidebar"] > *,
html body [data-rightbar-col],
html body [data-rightbar-col] > *,
html body [data-rightbar-col] section {
  background-color: transparent !important;
  background-image: none !important;
}
/* Nothing inside the transcript blurs: it already sits on one sheet of glass. */
html body [data-chat-turn],
html body .md-code-block,
html body [class*="_ioCard"],
html body [class*="_bubble"]:not([class*="_bubble_44yfq"]) {
  -webkit-backdrop-filter: none !important;
  backdrop-filter: none !important;
}

/* The three cards. */
html body [data-slot="root"] > div > div:nth-child(1),
html body [data-rightbar-col],
html body [data-slot="root"] > div > div:has([data-slot="main"]) {
  position: relative;
  isolation: isolate;
}
html body [data-slot="root"] > div > div:nth-child(1)::before,
html body [data-rightbar-col]::before,
html body [data-rightbar-col] [data-sidebar-right-panel="fullscreen"][data-sidebar-right-open]::before,
html body [data-slot="root"] > div > div:has([data-slot="main"])::before {
  content: "";
  position: absolute;
  z-index: -1;
  pointer-events: none;
  box-sizing: border-box;
  border: 1px solid var(--lg-edge, var(--dsw-alias-border-l1));
  border-radius: var(--dsw-radius-panel, 22px);
  background: var(--lg-panel-fill, var(--dsw-alias-bg-layer-1));
  -webkit-backdrop-filter: var(--lg-refraction, none);
  backdrop-filter: var(--lg-refraction, none);
  box-shadow: var(--lg-panel-shadow, var(--glass-shadow-rest, 0 1px 3px rgb(0 0 0 / .08)));
}

/* Sidebar. */
html body [data-slot="root"] > div > div:nth-child(1) {
  padding: 10px 12px 12px 18px;
  overflow: visible;
  border-right: 0 !important;
}
html body [data-slot="root"] > div > div:nth-child(1)::before {
  inset: 10px 12px 12px 18px;
}
html body [data-slot="root"] > div[data-sidebar-collapsed] > div:nth-child(1) {
  padding: 0;
  overflow: visible;
}
html body [data-slot="root"] > div[data-sidebar-collapsed] [data-slot="sidebar"] > div {
  border-radius: 0;
  overflow: visible;
}
html body [data-slot="root"] > div[data-sidebar-collapsed] > div:nth-child(1)::before {
  inset: 0;
  border: 0;
  border-radius: 0;
  box-shadow: none;
  background: transparent;
  -webkit-backdrop-filter: none;
  backdrop-filter: none;
}
html body [data-slot="sidebar"] > div {
  width: 100% !important;
  max-width: 100%;
  box-sizing: border-box;
  border-radius: var(--dsw-radius-panel, 22px);
  overflow: hidden;
}

/* Centre: clears on the empty start page, so the water shows. */
html body [data-slot="root"] > div > div:has([data-slot="main"]) {
  box-sizing: border-box;
  padding: 10px 0 12px;
  overflow: visible;
  border-radius: 0;
}
html body [data-slot="root"] > div:is([data-rightbar-collapsed="true"], :not(:has([data-sidebar-right-open]))) > div:has([data-slot="main"]) {
  padding-right: 18px;
}
html body [data-slot="root"] > div > div:has([data-slot="main"])::before {
  inset: 10px 0 12px;
  background: var(--lg-sheet-fill, var(--dsw-alias-bg-layer-1));
  box-shadow: var(--lg-sheet-shadow, var(--glass-shadow-rest, 0 1px 3px rgb(0 0 0 / .08)));
  transition: opacity var(--glass-spring-duration, .36s) ease, visibility 0s;
}
html body [data-slot="root"] > div:is([data-rightbar-collapsed="true"], :not(:has([data-sidebar-right-open]))) > div:has([data-slot="main"])::before {
  right: 18px;
}
html body [data-slot="root"] > div > div:has([data-slot="main"]):has([data-slot^="conversation.hero"])::before {
  opacity: 0;
  visibility: hidden;
  transition: opacity var(--glass-spring-duration, .36s) ease, visibility 0s linear var(--glass-spring-duration, .36s);
}
html body [data-slot="main"] > *,
html body [data-slot="main.conversation"] > * {
  border-radius: var(--dsw-radius-panel, 22px);
}
html body [data-slot="main.conversation"] > * {
  overflow: clip;
}

/* Right panel. */
html body [data-rightbar-col]::before {
  inset: 10px 18px 12px 12px;
}
html body [data-slot="root"] > div[data-rightbar-collapsed] [data-rightbar-col]::before,
html body [data-rightbar-col]:not(:has([data-sidebar-right-open]))::before,
html body [data-slot="root"] > div[data-rightbar-fullscreen] > [data-rightbar-col]::before {
  display: none;
}
html body [data-rightbar-col] [data-sidebar-right-panel="push"][data-sidebar-right-open] {
  top: 10px;
  right: 18px;
  bottom: 12px;
  left: 12px;
  width: auto !important;
  max-width: none;
  box-sizing: border-box;
  border-radius: var(--dsw-radius-panel, 22px);
  overflow: clip;
}
html body [data-rightbar-col] [data-dockkit-pane],
html body [data-rightbar-col] [data-dockkit-content]:not([data-dockkit-float]),
html body [data-rightbar-col] [data-dockkit-empty] {
  border: 0 !important;
  border-radius: inherit !important;
  background-color: transparent !important;
}
html body [data-slot="root"] > div[data-rightbar-fullscreen] > [data-rightbar-col]:has([data-sidebar-right-open]) {
  z-index: 15;
}
html body [data-rightbar-col] [data-sidebar-right-panel="fullscreen"][data-sidebar-right-open] {
  top: 10px;
  right: 18px;
  bottom: 12px;
  left: auto;
  width: calc(100vw - var(--dsh-windows-sidebar-width, 280px) - 30px) !important;
  max-width: none !important;
  box-sizing: border-box;
  border-radius: var(--dsw-radius-panel, 22px);
  box-shadow: var(--glass-shadow-rest, 0 1px 3px rgb(0 0 0 / .08));
  overflow: clip;
  isolation: isolate;
}
html body [data-rightbar-col] [data-sidebar-right-panel="fullscreen"][data-sidebar-right-open] > * {
  width: 100%;
}
html body [data-rightbar-col] [data-sidebar-right-panel="fullscreen"][data-sidebar-right-open]::before {
  inset: 0;
}

html body ._5Qcc8a_trigger {
  line-height: 20px;
}

/* The composer is one lens: the fill sits underneath, so the card itself never becomes
   a containing block for its fixed-position children. */
html body [data-composer-card] {
  position: relative;
  isolation: isolate;
  background-color: transparent !important;
  background-image: none !important;
  -webkit-backdrop-filter: none !important;
  backdrop-filter: none !important;
  border: 1px solid var(--lg-edge, var(--dsw-alias-border-l2));
  border-radius: var(--dsw-radius-panel, 22px);
  box-shadow: var(--lg-composer-shadow, var(--dsw-shadow-lv2)) !important;
  transition: border-color var(--glass-control) ease, box-shadow var(--glass-control) ease;
}
html body [data-composer-card]::before {
  content: "";
  position: absolute;
  inset: 0;
  z-index: -1;
  pointer-events: none;
  border-radius: inherit;
  background: var(--lg-composer-fill, var(--dsw-alias-bg-layer-1));
  -webkit-backdrop-filter: var(--lg-composer-filter, none);
  backdrop-filter: var(--lg-composer-filter, none);
  box-shadow: var(--lg-rim-shadow, none);
}
html body [data-composer-card]:focus-within {
  border-color: color-mix(in srgb, var(--dsw-alias-state-business-primary) 46%, var(--lg-edge, var(--dsw-alias-border-l2)));
  box-shadow:
    var(--lg-rim-shadow, 0 0 #0000),
    0 0 0 3px color-mix(in srgb, var(--dsw-alias-state-business-primary) 10%, transparent),
    var(--glass-shadow-raised, var(--dsw-shadow-lv2)) !important;
}
html body [data-composer-card] button[class*="_primary"]:disabled {
  background-color: var(--dsw-alias-button-primary-dimmed) !important;
  color: #fff;
  opacity: 1;
}
html body[data-ds-dark-theme] [data-composer-card] button[class*="_primary"]:disabled {
  color: rgb(255 255 255 / .38);
}
html body [data-composer-seat] {
  background-image: none !important;
}
/* The same gap on both sides of the card: the scrollbar already takes its width on the right. */
html body [class*='an3WzG_root'][data-phase='active'] [class*='GRgSLq_root'] {
  padding-inline: var(--glass-seat-gap) calc(var(--glass-seat-gap) - var(--dsh-scrollbar-width, 6px));
}
html body [data-conversation-composer-overlay] {
  background-color: transparent !important;
  background-image: none !important;
}
/* The trajectory toolbar sits on the sheet, with the header's side margins. Nothing scrolls
   under it, so a fill of its own would only show as a band. */
html body [data-conversation-composer-overlay] > div:first-child {
  background-color: transparent !important;
  -webkit-backdrop-filter: none;
  backdrop-filter: none;
}
html body .Wd4N7W_inner {
  padding-inline: 20px;
}
/* The shell leaves 2px beside the scrollbar, which stops every row short of the card. */
html body [class*='an3WzG_scrollBody'] {
  margin-right: 0;
}
html body [data-shell-bottom] {
  background-color: var(--dsw-alias-bg-base);
  border-top: 1px solid var(--dsw-alias-border-l1);
}
html body [class*='_bannerWrap'] {
  background-color: transparent;
}

/* Bars that stick while content scrolls beneath them. The shell paints them with the
   page's base colour, which shows as a square block on a rounded card. The page bar appears
   with the first pixels of scroll, because at rest nothing passes under it and any fill
   would be a band. It stays inside the card's border, so its blur leaves that edge alone, and
   the page scrolls below the border too, or content would show through the gap above the bar. */
@keyframes glass-bar-in { to { opacity: 1; } }
html body .V7pFBG_pageBody {
  border-top: 1px solid transparent;
}
html body [class*='V7pFBG_pageBar'][data-natural]::before {
  inset: 0 1px auto;
  background: var(--lg-thick, var(--dsw-alias-bg-layer-1));
  -webkit-backdrop-filter: var(--lg-refraction, none);
  backdrop-filter: var(--lg-refraction, none);
  border-radius: calc(var(--dsw-radius-panel, 22px) - 1px) calc(var(--dsw-radius-panel, 22px) - 1px) 0 0;
  opacity: 0;
  animation: glass-bar-in linear both;
  animation-timeline: scroll(nearest block);
  animation-range: 0 14px;
}
html body [class*='VJlF5q_root'][data-expanded] [data-open] [data-disclosure-header],
html body [class*='LOmM4q_compactionRow']:has([class*='LOmM4q_compactionBody']) [class*='LOmM4q_compactionButton'] {
  background: var(--lg-thick, var(--dsw-alias-bg-layer-1));
  -webkit-backdrop-filter: var(--lg-refraction, none);
  backdrop-filter: var(--lg-refraction, none);
}

/* The trajectory ledger is the one list that runs edge to edge on the card. Rows are
   thin cards on the sheet; blurring each one would stack glass and cost a layer per row. */
html body .xeixwq_split {
  background-color: transparent !important;
  background-image: none !important;
}
html body [data-trajectory-scroll] {
  box-sizing: border-box;
  /* The scrollbar takes its width from the right side, so both margins come out at 10px. */
  padding-inline: 10px calc(10px - var(--dsh-scrollbar-width, 6px));
  background-color: transparent !important;
}
html body [data-trajectory-scroll] > table {
  background-color: transparent !important;
  background-image: none !important;
  border-collapse: separate !important;
  border-spacing: 0 6px !important;
}
html body [data-trajectory-scroll] tr[data-trajectory-row-key] > td {
  background-color: var(--lg-thin, var(--dsw-alias-bg-layer-1)) !important;
  border-top: .5px solid var(--dsw-alias-border-l1);
  border-bottom: .5px solid var(--dsw-alias-border-l1);
}
html body [data-trajectory-scroll] tr[data-trajectory-row-key] > td:first-child {
  border-left: .5px solid var(--dsw-alias-border-l1);
  border-top-left-radius: var(--dsw-radius-sm, 10px);
  border-bottom-left-radius: var(--dsw-radius-sm, 10px);
}
html body [data-trajectory-scroll] tr[data-trajectory-row-key] > td:last-child {
  border-right: .5px solid var(--dsw-alias-border-l1);
  border-top-right-radius: var(--dsw-radius-sm, 10px);
  border-bottom-right-radius: var(--dsw-radius-sm, 10px);
}
html body [data-trajectory-scroll] tr[data-trajectory-row-key]:hover > td {
  background-color: var(--dsw-alias-interactive-bg-hover) !important;
}
html body [data-trajectory-scroll] tr[data-trajectory-row-key][data-selected="true"] > td {
  background-color: var(--dsw-alias-interactive-bg-active) !important;
}

/* The conversation header is one row: title, view tabs, then actions. The title row
   dissolves so its children can share the header's grid. */
html body header:has([data-conversation-tabs]) {
  container: glass-header / inline-size;
  position: relative;
  z-index: 2;
  grid-template-columns: auto minmax(0, 1fr) auto auto auto;
  align-items: center;
  min-height: 0;
  padding: 8px 16px 6px max(20px, var(--dsh-frame-leading-clearance, 0px));
  border-bottom: 0;
}
html body header:has([data-conversation-tabs]) :has(> [data-conversation-header-corner]) {
  display: contents;
}
html body header:has([data-conversation-tabs]) :has(> [data-conversation-header-corner]) > :nth-child(1) {
  grid-column: 2;
  grid-row: 1;
  min-width: 0;
}
html body header:has([data-conversation-tabs]) :has(> [data-conversation-header-corner]) > :nth-child(2) {
  grid-column: 4;
  grid-row: 1;
  margin-left: 8px;
}
html body header [data-conversation-header-corner] {
  grid-column: 5;
  grid-row: 1;
  margin: 0;
}
html body header :has(> [data-conversation-tabs]) {
  grid-column: 3;
  grid-row: 1;
  flex-wrap: nowrap;
  align-items: center;
  justify-content: flex-end;
  gap: 4px;
  /* The shell shows floor((width - 48) / 120) tabs, assuming 120px per tab, so two
     tabs need a 288px box even though the segmented control is 142px. The box keeps
     that width and its empty part slides under the title, passing clicks through. */
  width: 288px;
  min-width: 288px;
  margin: 0 0 0 -138px;
  padding-left: 0;
  pointer-events: none;
}
html body header :has(> [data-conversation-tabs]) > * {
  flex: none;
  pointer-events: auto;
}
@container glass-header (max-width: 560px) {
  html body header :has(> [data-conversation-header-corner]) > :nth-child(1) > :nth-child(2) {
    display: none;
  }
}
html body header [data-conversation-tabs] + * {
  height: auto;
}
html body header [data-conversation-tabs] + * > button {
  margin-top: 0;
}
/* Messages are cut at the header's edge, with no fade. A strip under the header, painted
   or blurred, reads as a band on glass and lands on the trajectory toolbar; a mask on the
   scroller would cut the transcript off from the menus floating over it. */

/* The view tabs become a segmented control. This is layout, not decoration: the header
   grid above is sized for it. The shell marks them with real ARIA roles. */
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
  border-radius: var(--dsw-radius-md, 12px);
  background: color-mix(in srgb, var(--dsw-alias-label-primary) 5%, transparent);
  box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--dsw-alias-label-primary) 6%, transparent);
}
[data-conversation-tabs] > [role='tab'] {
  flex-shrink: 0;
  box-sizing: border-box;
  /* DSH 0.2.2 widens each tab's hit area with negative margins; inside the segment
     the padding is the hit area, so the margins would only push tabs out of it. */
  margin: 0 !important;
  min-height: 28px !important;
  padding: 3px 14px !important;
  border-radius: calc(var(--dsw-radius-md, 12px) - 3px);
  color: var(--dsw-alias-label-secondary) !important;
}
[data-conversation-tabs] > [role='tab']::after { display: none !important; }
[data-conversation-tabs] > [role='tab'][aria-selected='false']:hover,
[class*='_tabs_1lga9'] > :not([class*='_indicator']):not([aria-selected='true']):not([data-active='true']):hover {
  color: var(--dsw-alias-label-primary) !important;
}
[data-conversation-tabs] > [role='tab'][aria-selected='false']:active,
[class*='_tabs_1lga9'] > :not([class*='_indicator']):not([aria-selected='true']):not([data-active='true']):active {
  background: var(--dsw-alias-interactive-bg-hover) !important;
}
[data-conversation-tabs] > [role='tab'][aria-selected='true'] {
  color: var(--dsw-alias-label-primary) !important;
}
body[data-ds-dark-theme] [data-conversation-tabs] {
  background: rgba(255,255,255,.07);
  box-shadow: inset 0 0 0 .5px rgba(255,255,255,.08);
}
/* Without anchor positioning the selected tab itself carries the thumb. Only then: with it, a
   dark rule here outranked the reset below and drew a second shape behind the thumb. */
@supports not (anchor-name: --a) {
  [data-conversation-tabs] > [role='tab'][aria-selected='true'] {
    background: #fff !important;
    box-shadow: 0 1px 2px rgb(0 0 0 / .12), 0 2px 8px -2px rgb(0 0 0 / .14), 0 0 0 .5px rgb(0 0 0 / .06) !important;
  }
  body[data-ds-dark-theme] [data-conversation-tabs] > [role='tab'][aria-selected='true'] {
    background: rgb(255 255 255 / .22) !important;
    box-shadow: 0 1px 3px rgb(0 0 0 / .5), inset 0 .5px 0 rgb(255 255 255 / .14) !important;
  }
}
/* One thumb slides between the tabs: it is anchored to whichever tab is selected, so a
   changed anchor animates its position. */
@supports (anchor-name: --a) {
  [data-conversation-tabs] > [role='tab'][aria-selected='true'] {
    anchor-name: --glass-segment;
  }
  /* Above the capsule's glass, which also sits at -1 and comes later: under it the thumb was
     blurred and tinted white until nothing showed which tab was chosen. At 0 it is still under
     the tabs, which are positioned and come after it. Raised and solid, like the system's:
     a white thumb with a shadow on a grey track. A capsule inside the capsule, so the two
     curves stay concentric. */
  [data-conversation-tabs]::before {
    content: '';
    position: absolute;
    z-index: 0;
    position-anchor: --glass-segment;
    left: anchor(left);
    top: anchor(top);
    width: anchor-size(width);
    height: anchor-size(height);
    border-radius: 999px;
    corner-shape: round;
    background: #fff;
    box-shadow: 0 1px 2px rgb(0 0 0 / .12), 0 2px 8px -2px rgb(0 0 0 / .14), 0 0 0 .5px rgb(0 0 0 / .06);
    /* mountDroplet stretches it from its start edge. */
    transform-origin: 0 50%;
  }
  body[data-ds-dark-theme] [data-conversation-tabs]::before {
    background: rgb(255 255 255 / .22);
    box-shadow: 0 1px 3px rgb(0 0 0 / .5), inset 0 .5px 0 rgb(255 255 255 / .14);
  }
}
/* Increase Contrast and forced colours: the chosen tab gets an outline, not only a fill. */
@media (prefers-contrast: more) {
  [data-conversation-tabs]::before { box-shadow: 0 0 0 1.5px var(--dsw-alias-label-primary); }
}
@media (forced-colors: active) {
  [data-conversation-tabs] > [role='tab'][aria-selected='true'] { outline: 2px solid Highlight; outline-offset: -2px; }
}

/* The model name truncates first, so the badge is never cut in half. */
[data-slot="conversation.input.model"] [data-model-id] {
  display: block;
  min-width: 0;
}
[data-slot="conversation.input.model.label"] > span {
  display: flex;
  min-width: 0;
  max-width: 100%;
}
[data-slot="conversation.input.model.label"] > span > :first-child {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
[data-slot="conversation.input.model.label"] > span > [data-tone] {
  flex: none;
}

/* Modal scrims stop at the caption strip in the shell, which leaves a bright band
   across the top of the window. Paint it full height; the drag region is separate. */
html body [class*="_overlay"] > [class*="_mask"] {
  top: 0;
}

/* Scrollbars stay out of sight until the pointer is over the scroller. */
body {
  --dsh-scrollbar-width: 6px;
  --dsh-scrollbar-thumb-border: 1px;
}
::-webkit-scrollbar-thumb {
  background-color: transparent !important;
}
:hover::-webkit-scrollbar-thumb {
  background-color: var(--dsh-scrollbar-thumb) !important;
}
::-webkit-scrollbar-thumb:hover {
  background-color: var(--dsh-scrollbar-thumb-hover) !important;
}

@media (prefers-reduced-motion: reduce) {
  html body [data-composer-card],
  html body [data-slot="root"] > div > div:has([data-slot="main"])::before { transition: none; }
}
@media (forced-colors: active) {
  html body [data-composer-card], html body [data-menu-material] { border: 1px solid CanvasText; }
  html body [data-composer-card]:focus-within { outline: 2px solid Highlight; outline-offset: 2px; }
}
@media print {
  html body [data-slot="root"] > div > div:nth-child(1)::before,
  html body [data-rightbar-col]::before,
  html body [data-composer-card]::before {
    display: none;
  }
}

/* Keyboard focus stays visible over glass, with every group off too: it is how the app is
   used without a mouse, not an effect. */
body :is(button, a, [role='tab'], [role='menuitem']):focus-visible {
  outline: 2px solid var(--dsw-focus-ring-color, var(--dsw-alias-state-business-primary));
  outline-offset: 3px;
}
body [role='treeitem']:focus-visible {
  outline: 2px solid var(--dsw-focus-ring-color, var(--dsw-alias-state-business-primary));
  outline-offset: -2px;
}

/* Settings form on the Plugins page. */
.glass-form { display: flex; flex-direction: column; gap: 22px; }
.glass-group { display: flex; flex-direction: column; gap: 12px; }
.glass-group + .glass-group { padding-top: 20px; border-top: .5px solid var(--dsw-alias-border-l2); }
.glass-group-head { display: grid; grid-template-columns: 1fr auto; align-items: center; column-gap: 12px; }
.glass-group-title { color: var(--dsw-alias-label-primary); font-size: 14px; font-weight: 600; }
.glass-group-note { grid-column: 1; color: var(--dsw-alias-label-caption); font-size: 12px; line-height: 18px; }
.glass-group-head > [role='switch'] { grid-column: 2; grid-row: 1 / span 2; }
.glass-group[data-off='true'] .glass-field { opacity: .45; }
.glass-field { display: grid; grid-template-columns: 7em 1fr 3.4em; align-items: center; gap: 12px; font-size: 13px; transition: opacity var(--glass-instant) ease; }
.glass-field > label, .glass-field > span { color: var(--dsw-alias-label-primary); }
.glass-field output { color: var(--dsw-alias-label-secondary); font-variant-numeric: tabular-nums; text-align: right; }
.glass-field input[type='range'] { width: 100%; accent-color: var(--dsw-alias-state-business-primary); }
.glass-choices { grid-column: 2 / 4; display: inline-flex; flex-wrap: wrap; gap: 2px; justify-self: start; padding: 2px; border-radius: 999px; corner-shape: round; background: var(--dsw-alias-interactive-bg-active); }
.glass-choices button {
  padding: 3px 12px; border: 0; border-radius: 999px; background: transparent;
  color: var(--dsw-alias-label-secondary); font: inherit; font-size: 12px; cursor: pointer;
}
.glass-choices button[aria-checked='true'] { background: var(--glass-base-solid, var(--dsw-alias-bg-base)); color: var(--dsw-alias-label-primary); box-shadow: 0 1px 2px rgb(0 0 0 / .12); }
.glass-hint { grid-column: 2 / 4; color: var(--dsw-alias-label-caption); font-size: 12px; line-height: 18px; }
.glass-advanced { display: flex; flex-direction: column; gap: 12px; }
.glass-advanced > summary {
  width: fit-content; padding: 2px 0; color: var(--dsw-alias-label-secondary); font-size: 12px; cursor: pointer;
  list-style: none; border-radius: 6px;
}
.glass-advanced > summary::-webkit-details-marker { display: none; }
.glass-advanced > summary::before { content: '›'; display: inline-block; width: 1em; transition: rotate var(--glass-instant) ease; }
.glass-advanced[open] > summary::before { rotate: 90deg; }
.glass-advanced > summary:focus-visible { outline: 2px solid var(--dsw-focus-ring-color, var(--dsw-alias-state-business-primary)); outline-offset: 2px; }
.glass-advanced > summary > span { margin-left: 8px; color: var(--dsw-alias-label-caption); }
.glass-group > .glass-hint, .glass-group > .glass-warn { grid-column: auto; }
.glass-warn { color: var(--dsw-alias-state-warn-primary); font-size: 12px; line-height: 18px; }
`;

    /* ── color ─────────────────────────────────────────────────────────────── */
    const COLOR_CSS = String.raw`
html body {
  --glass-wash-1: rgba(0, 122, 255, .05);
  --glass-wash-2: rgba(175, 82, 222, .04);
  --glass-wash-3: rgba(90, 200, 250, .06);
  background-image:
    radial-gradient(900px 640px at 10% 6%, var(--glass-wash-1), transparent 70%),
    radial-gradient(1100px 760px at 94% 14%, var(--glass-wash-2), transparent 72%),
    radial-gradient(1000px 800px at 62% 108%, var(--glass-wash-3), transparent 70%) !important;
  background-attachment: fixed;
}
html body[data-ds-dark-theme] {
  --glass-wash-1: rgba(10, 132, 255, .09);
  --glass-wash-2: rgba(191, 90, 242, .07);
  --glass-wash-3: rgba(100, 210, 255, .06);
}
html[data-lg-backdrop="vivid"] body {
  --glass-wash-1: rgba(0, 122, 255, .20);
  --glass-wash-2: rgba(175, 82, 222, .16);
  --glass-wash-3: rgba(90, 200, 250, .22);
}
html[data-lg-backdrop="vivid"] body[data-ds-dark-theme] {
  --glass-wash-1: rgba(10, 132, 255, .28);
  --glass-wash-2: rgba(191, 90, 242, .22);
  --glass-wash-3: rgba(100, 210, 255, .18);
}
html[data-lg-backdrop="plain"] body { background-image: none !important; }
body ::selection {
  background-color: color-mix(in srgb, var(--dsw-alias-brand-primary) 26%, transparent);
}
body [data-chat-flow] a {
  color: var(--dsw-alias-link);
  text-decoration: none;
}
body [data-chat-flow] a:hover,
body [data-chat-flow] a:focus-visible {
  text-decoration: underline;
  text-underline-offset: 3px;
}
/* Blue is for actions, links and selection. Labels and notices stay neutral. */
html body [class*='_tag'][data-tone='info'],
html body [class*='_previewBadge'] {
  background: var(--dsw-alias-interactive-bg-hover);
  color: var(--dsw-alias-label-secondary);
}
html body [data-slot='sidebar.settings'] button[class*='_indicator'] {
  border-color: var(--dsw-alias-border-l2);
  background: transparent;
  color: var(--dsw-alias-label-secondary);
}
@media (prefers-reduced-transparency: reduce) {
  html body { background-image: none !important; }
}
`;

    /* ── glass ─────────────────────────────────────────────────────────────────
       Three weights of one material, so nothing stacks glass on glass:
         sheet / panel  the resting cards, real blur;
         thick          surfaces that float over everything, real blur, a floor on opacity
                        so text stays readable whatever is behind them;
         thin           cards inside those, a translucent fill and no blur of their own;
         composer       a light fill with a directional rim and refraction, and a blur
                        kept high enough to dissolve the text passing behind it: less
                        only smudges black text into smears under what you type. Its blur is
                        the card's own, so the blurred area is always exactly the card; a
                        separate layer behind it smeared the sheet's edge and cut text. */
    const GLASS_CSS = String.raw`
body {
  --lg-sheet: rgb(250 250 252 / var(--lg-alpha, .56));
  --lg-panel: rgb(250 250 252 / calc(var(--lg-alpha, .56) - .04));
  --lg-composer: rgb(255 255 255 / calc(var(--lg-alpha, .56) * .4 + .06));
  --lg-thick: rgb(250 250 252 / max(.6, calc(var(--lg-alpha, .56) + .2)));
  --lg-thin: rgb(255 255 255 / calc(var(--lg-alpha, .56) * .62));
  --lg-wash: rgb(255 255 255 / calc(var(--lg-alpha, .56) * .3));
  --glass-base-solid: var(--dsw-alias-bg-base);
  --lg-rim: rgb(255 255 255 / calc(.88 * var(--lg-k, 1)));
  --lg-edge: rgb(0 0 0 / calc(.04 + .06 * var(--lg-k, 1)));
  --lg-glint: rgb(255 255 255 / calc(.22 * var(--lg-k, 1)));
  --lg-glint-idle: rgb(255 255 255 / calc(.12 * var(--lg-k, 1)));
  --lg-refraction: blur(var(--lg-blur, 18px)) saturate(calc(1 + .4 * var(--lg-k, 1)));
  --lg-composer-tone: saturate(calc(1 + .4 * var(--lg-k, 1))) brightness(1.05);
  --lg-composer-filter: blur(clamp(14px, var(--lg-blur, 18px), 22px)) var(--lg-composer-tone);
  --lg-sheen-gain: calc(.9 * var(--lg-k, 1));
  --lg-sheen-back: .3;
  /* Light gathering where a finger presses the glass. White does not show on white glass, so on
     light it takes the accent's tint, the same light that marks focus on the rim. */
  --lg-bloom: color-mix(in srgb, var(--dsw-alias-state-business-primary) 16%, rgb(255 255 255 / .9));
  --lg-control-fill: rgb(255 255 255 / calc(var(--lg-alpha, .56) * .35 + .08));
  --lg-menu-fill: rgb(250 250 252 / max(.5, calc(var(--lg-alpha, .56) * .5 + .2)));
  --lg-rim-dim: rgb(255 255 255 / calc(.34 * var(--lg-k, 1)));
  --lg-rim-glow: rgb(255 255 255 / calc(.16 * var(--lg-k, 1)));
  --lg-rim-shade: rgb(0 0 0 / calc(.07 * var(--lg-k, 1)));
  /* White light does not show on a white page, so the far side also falls into shade. */
  --lg-rim-shadow:
    inset 1.5px 1.5px 0 -.5px var(--lg-rim),
    inset -1.5px -1.5px 0 -.5px var(--lg-rim-dim),
    inset -5px -5px 6px -5px var(--lg-rim-shade),
    inset 0 0 14px var(--lg-rim-glow);
  --lg-panel-fill: linear-gradient(145deg, var(--lg-glint-idle), transparent 42%), var(--lg-panel);
  --lg-panel-shadow: var(--lg-rim-shadow), var(--glass-shadow-rest, 0 0 #0000);
  /* The sheet holds the reading, so it is the steadiest surface: no sheen. */
  --lg-sheet-fill: var(--lg-sheet);
  --lg-sheet-shadow: var(--lg-rim-shadow), var(--glass-shadow-rest, 0 0 #0000);
  --lg-composer-shadow: 0 4px 12px -6px rgb(0 0 0 / calc(.10 * var(--lg-k, 1))), var(--glass-shadow-raised, 0 0 #0000);
  --lg-float-shadow: var(--lg-rim-shadow), var(--dsw-elevation-prominent, 0 12px 32px -14px rgb(0 0 0 / .2));

  --dsw-menu-surface-fill: var(--lg-thick) !important;
  --dsw-specific-menu: var(--lg-thick) !important;
  --dsw-menu-backdrop-filter: var(--lg-refraction) !important;
  --dsw-alias-settings-card-fill: var(--lg-thin) !important;
  --dsw-alias-onboarding-card-fill: var(--lg-thin) !important;
  --dsw-alias-bg-module-platform: rgb(118 118 128 / .10) !important;
  --dsw-alias-markdown-tag: rgb(118 118 128 / .14) !important;
  --dsw-alias-interactive-bg-hover-solid: rgb(118 118 128 / .14) !important;
  --dsw-alias-button-elevated-fill: rgb(255 255 255 / calc(var(--lg-alpha, .56) * .9)) !important;
  --dsw-alias-button-floating-fill: rgb(255 255 255 / max(.72, calc(var(--lg-alpha, .56) + .16))) !important;
  --dsw-alias-tooltip-bg: rgb(29 29 31 / .82) !important;
  --dsw-alias-toast-bg: rgb(29 29 31 / .82) !important;
}
body[data-ds-dark-theme] {
  --lg-sheet: rgb(28 28 30 / calc(var(--lg-alpha, .56) + .04));
  --lg-panel: rgb(34 34 36 / calc(var(--lg-alpha, .56) + .02));
  --lg-composer: rgb(44 44 46 / calc(var(--lg-alpha, .56) * .4 + .26));
  --lg-thick: rgb(36 36 38 / max(.66, calc(var(--lg-alpha, .56) + .2)));
  --lg-thin: rgb(255 255 255 / calc(.02 + var(--lg-alpha, .56) * .07));
  --lg-wash: rgb(255 255 255 / .03);
  --lg-rim: rgb(255 255 255 / calc(.20 * var(--lg-k, 1)));
  --lg-edge: rgb(255 255 255 / calc(.05 + .06 * var(--lg-k, 1)));
  --lg-glint: rgb(255 255 255 / calc(.10 * var(--lg-k, 1)));
  --lg-glint-idle: rgb(255 255 255 / calc(.025 * var(--lg-k, 1)));
  --lg-rim-dim: rgb(255 255 255 / calc(.09 * var(--lg-k, 1)));
  --lg-rim-glow: rgb(255 255 255 / calc(.04 * var(--lg-k, 1)));
  --lg-rim-shade: rgb(0 0 0 / calc(.20 * var(--lg-k, 1)));
  --lg-refraction: blur(var(--lg-blur, 18px)) saturate(calc(1 + .25 * var(--lg-k, 1)));
  --lg-composer-tone: saturate(calc(1 + .25 * var(--lg-k, 1))) brightness(1.1);
  --lg-composer-filter: blur(clamp(20px, var(--lg-blur, 18px), 28px)) var(--lg-composer-tone);
  --lg-sheen-gain: calc(.5 * var(--lg-k, 1));
  --lg-sheen-back: .25;
  --lg-bloom: rgb(255 255 255 / .34);
  --lg-control-fill: rgb(58 58 60 / calc(var(--lg-alpha, .56) * .35 + .14));
  --lg-menu-fill: rgb(36 36 38 / max(.55, calc(var(--lg-alpha, .56) * .5 + .24)));
  --dsw-alias-bg-module-platform: rgb(120 120 128 / .16) !important;
  --dsw-alias-markdown-tag: rgb(120 120 128 / .24) !important;
  --dsw-alias-interactive-bg-hover-solid: rgb(120 120 128 / .24) !important;
  --dsw-alias-button-elevated-fill: rgb(255 255 255 / calc(.04 + var(--lg-alpha, .56) * .1)) !important;
  --dsw-alias-button-floating-fill: rgb(58 58 60 / max(.76, calc(var(--lg-alpha, .56) + .2))) !important;
  --dsw-alias-tooltip-bg: rgb(58 58 60 / .84) !important;
  --dsw-alias-toast-bg: rgb(58 58 60 / .84) !important;
}

/* Inside the panels the shell's solid surfaces clear, so every page sits on the glass
   without each one being listed: file tree, file viewer, trajectory, timeline. Scoped to
   the panels because dialogs and menus portal to the body and must keep their fill. These
   surfaces nest, hence the lighter wash. Base goes fully clear: containers fill with it. */
html body :is([data-slot="main"], [data-rightbar-col]) {
  --dsw-alias-bg-base: transparent;
  --dsw-alias-bg-layer-1: var(--lg-wash);
  --dsw-alias-bg-layer-2: var(--lg-wash);
  --dsw-specific-input-major: var(--lg-thick);
}
/* Things that sit on the panels but paint with the base colour themselves. */
html body .dtr-chip {
  --dsw-alias-bg-base: var(--glass-base-solid);
}
/* The one place the shell uses the base colour as a foreground. */
html body [class*='_7rgC5q_item']::after {
  color: var(--glass-base-solid);
}
/* Full-page overlays replace the panels rather than sit on them, so they stay solid. */
html body :is(.MKE-pW_overlay, .kBGKfW_onboardingOverlay) {
  background: var(--glass-base-solid);
}
/* Nothing covers the gap below the card: text passing through it stays sharp, as content does
   under the system's own floating bars. A blurred strip there read as a second layer of glass
   outside the first. */

/* Declared here, not on body: the highlight follows --lg-x set on this element. */
html body [data-composer-card] {
  --lg-composer-fill:
    radial-gradient(320px circle at var(--lg-x, 50%) var(--lg-y, 0px), var(--lg-glint), transparent 70%),
    linear-gradient(155deg, var(--lg-glint-idle), transparent 48%),
    var(--lg-composer);
}
/* Liquid glass on the control layer: the composer, the view tabs, the toolbar capsule and
   menus (SURFACES). The lens filter does its own blur: heavy in the middle so text behind still
   dissolves, easing off smoothly towards the rim so what the rim bends can be seen, without a
   seam between a clear rim and a frosted middle. Where it can, the rim pulls in
   what lies just past the edge, so the glass is its own layer reaching past the edge by
   --lg-lens-reach, and the filter trims its output to the outline; outside it the output is
   clear and the page shows through untouched. Clipping the layer would not do: clip-path cuts a
   backdrop filter to the clip's bounding box, leaving square corners, and a rounded clip around
   the layer cut it off from its backdrop in testing, so it rendered nothing.
   Refraction and sheen are drawn from one shape (mountLens), so the uniform white rims and the
   flat diagonal sheen give way to light that depends on which way each part of the rim faces. */
/* No even glow inside the rim: a ring of light all the way round reads as the edge of a second,
   smaller pane. The sheen lights the rim where it faces the light. */
/* One piece of glass. The filter reads everything painted before it, and a surface paints its own
   border and shadow before its children: blurred and bent, they came back inside the rim as a
   grey band, a second pane under the first (2026-11-08, along the composer's foot: 231-236
   against 255, and 255 to the edge once they were gone). So a lens surface keeps only the room
   its border takes, and its glass layer's tint, painted after the filter, draws the edge
   (--lg-surface-edge, --lg-surface-edge-width) and the shadow (--lg-surface-shadow). A rim shade
   of even width did the same on its own, so there is none: the sheen shades the rim by the way
   each part of it faces. The shell's tokens (--lg-float-shadow, --lg-composer-shadow) were
   resolved on body with the old rim in them, which is why each surface names its shadow here. */
html[data-lg-refraction="lens"] body [data-lg-lens] {
  --lg-rim-shadow: 0 0 #0000;
  --lg-surface-fill: var(--lg-control-fill);
}
@media not (forced-colors: active) {
  html[data-lg-refraction="lens"] body [data-lg-lens][data-lg-surface] {
    border-color: transparent !important;
    box-shadow: none !important;
  }
}
html[data-lg-refraction="lens"] body [data-lg-lens][data-lg-surface='composer'] {
  --lg-composer-fill:
    radial-gradient(320px circle at var(--lg-x, 50%) var(--lg-y, 0px), var(--lg-glint), transparent 70%),
    var(--lg-composer);
  --lg-surface-fill: var(--lg-composer-fill);
  --lg-surface-edge: var(--lg-edge, var(--dsw-alias-border-l2));
  --lg-surface-edge-width: 1px;
  --lg-surface-shadow: var(--lg-composer-shadow, var(--dsw-shadow-lv2));
}
/* With the lens the pointer's glint is its own composited element in the sheen (below), moved by
   a transform. Painted into this fill, every pointer move repainted the tint with its shadow:
   143 fps on the 240 Hz display, against 228 for the moved glint (2026-11-08). */
html[data-lg-refraction="lens"] body [data-lg-surface='composer'] > [data-lg-glass] {
  --lg-surface-fill: var(--lg-composer);
}
html body [data-lg-sheen] > s { display: none; }
html[data-lg-refraction="lens"] body [data-lg-surface='composer'] > [data-lg-sheen] > s {
  display: block;
  position: absolute;
  left: 50%;
  top: 0;
  width: 640px;
  height: 640px;
  translate: -50% -50%;
  background: radial-gradient(closest-side, var(--lg-glint), transparent 70%);
  will-change: transform;
  pointer-events: none;
}
/* The composer's glass reaches 9px past the card into a 10px gap, and a press widens the card
   a little: past the seat's edge that would count as overflow, the conversation would grow a
   horizontal scrollbar and everything would lift 6px. What lies past the seat is the clear part
   of the glass, so clipping it sideways changes nothing visible. clip, not hidden: only the
   horizontal axis is cut, and the seat does not become a scroll container. */
html[data-lg-refraction="lens"] body [data-composer-seat] {
  overflow-x: clip;
}
html[data-lg-refraction="lens"] body [data-composer-card][data-lg-lens]::before {
  background: none;
  -webkit-backdrop-filter: none;
  backdrop-filter: none;
  box-shadow: none;
}
html[data-lg-refraction="lens"] body [data-lg-lens][data-lg-surface='tabs'] {
  background: transparent !important;
  /* A grey track, so the white thumb on it reads at a glance. */
  --lg-surface-fill: linear-gradient(color-mix(in srgb, var(--dsw-alias-label-primary) 7%, transparent), color-mix(in srgb, var(--dsw-alias-label-primary) 7%, transparent)), var(--lg-control-fill);
  --lg-surface-shadow: inset 0 0 0 1px color-mix(in srgb, var(--dsw-alias-label-primary) 6%, transparent);
}
/* The toolbar's buttons share one capsule, as on the system's own toolbars. */
html[data-lg-refraction="lens"] body [data-lg-lens][data-lg-surface='toolbar'] {
  position: relative;
  border-radius: 999px;
  corner-shape: round;
  padding-inline: 3px;
  --lg-surface-edge: var(--lg-edge);
  --lg-surface-edge-width: .5px;
  --lg-surface-shadow: 0 1px 3px rgb(0 0 0 / calc(.05 * var(--lg-k, 1)));
}
/* Menus: the shell's own material layer gives way to the glass, thicker so items stay legible. */
html[data-lg-refraction="lens"] body [data-lg-lens][data-lg-surface='menu'] {
  --lg-surface-fill: var(--lg-menu-fill);
  --lg-surface-edge: var(--lg-edge);
  --lg-surface-edge-width: 1px;
  --lg-surface-shadow: var(--dsw-elevation-prominent, 0 12px 32px -14px rgb(0 0 0 / .2));
}
html[data-lg-refraction="lens"] body [data-lg-lens][data-lg-surface='menu'] > [class*='_material_1w4el'] {
  visibility: hidden;
}
html body :is([data-lg-glass], [data-lg-sheen]) { display: none; }
html[data-lg-refraction="lens"] body [data-lg-lens] > :is([data-lg-glass], [data-lg-sheen]) {
  display: block;
  position: absolute;
  inset: 0;
  z-index: -1;
  pointer-events: none;
  border-radius: var(--lg-surface-radius, 0px);
  corner-shape: var(--lg-surface-corner, round);
}
html[data-lg-refraction="lens"] body [data-lg-glass] > b {
  position: absolute;
  inset: calc(-1 * var(--lg-lens-reach, 0px));
  pointer-events: none;
  -webkit-backdrop-filter: var(--lg-lens) var(--lg-composer-tone);
  backdrop-filter: var(--lg-lens) var(--lg-composer-tone);
}
/* The tint, the edge and the shadow lie on the glass, not under it, so the filter never sees them. */
/* It reaches out over the surface's border, now transparent, and draws the edge as a real border,
   so the shadow starts outside the edge as it did on the surface; a ring in the shadow list sat on
   the shadow and darkened the foot's hairline from 213 to 147. Its corners follow the surface's
   own shape: a page-wide squircle rule gave the tint other corners than the glass under it. */
html[data-lg-refraction="lens"] body [data-lg-glass]::after {
  content: '';
  position: absolute;
  inset: calc(-1 * var(--lg-surface-edge-width, 0px));
  border: var(--lg-surface-edge-width, 0px) solid var(--lg-surface-edge, transparent);
  border-radius: calc(var(--lg-surface-radius, 0px) + var(--lg-surface-edge-width, 0px));
  corner-shape: var(--lg-surface-corner, round);
  background: var(--lg-surface-fill, var(--lg-composer));
  background-clip: padding-box;
  box-shadow: var(--lg-surface-shadow, 0 0 #0000);
  /* No transition: repainting this layer with its shadow costs about 7 ms, so a 200 ms fade of
     the edge on focus ran at 139 fps. The edge changes in one frame. */
}
@media (forced-colors: active) {
  html body :is([data-lg-glass], [data-lg-sheen]) { display: none !important; }
}
/* Four layers, one per direction the rim can face. Each is as bright as the light falling on
   that side, with a weaker share on the far side, where light leaves the glass again. */
html[data-lg-refraction="lens"] body [data-lg-lens] > [data-lg-sheen] {
  overflow: hidden;
  opacity: min(var(--lg-sheen-gain, .9), 1);
}
/* The light a press gathers: mountLens places it under the finger and plays it on the compositor.
   Inside the sheen layer, so the glass's own outline clips it. */
html[data-lg-refraction="lens"] body [data-lg-sheen] > u {
  position: absolute;
  translate: -50% -50%;
  border-radius: 50%;
  background: radial-gradient(closest-side, var(--lg-bloom), transparent);
  opacity: 0;
  pointer-events: none;
}
html[data-lg-refraction="lens"] body [data-lg-sheen] > i {
  position: absolute;
  inset: 0;
  background: var(--lg-sheen-map, none) no-repeat 0 var(--lg-row, 0) / 100% 400%;
  --lg-lx: var(--lg-light-x, -.38);
  --lg-ly: var(--lg-light-y, -.92);
}
html[data-lg-refraction="lens"] body [data-lg-sheen] > i:nth-child(1) {
  --lg-row: 0%;
  opacity: calc(var(--lg-sheen-boost, 1) * (max(var(--lg-lx), 0) + var(--lg-sheen-back) * max(-1 * var(--lg-lx), 0)));
}
html[data-lg-refraction="lens"] body [data-lg-sheen] > i:nth-child(2) {
  --lg-row: 33.3333%;
  opacity: calc(var(--lg-sheen-boost, 1) * (max(-1 * var(--lg-lx), 0) + var(--lg-sheen-back) * max(var(--lg-lx), 0)));
}
html[data-lg-refraction="lens"] body [data-lg-sheen] > i:nth-child(3) {
  --lg-row: 66.6667%;
  opacity: calc(var(--lg-sheen-boost, 1) * (max(var(--lg-ly), 0) + var(--lg-sheen-back) * max(-1 * var(--lg-ly), 0)));
}
html[data-lg-refraction="lens"] body [data-lg-sheen] > i:nth-child(4) {
  --lg-row: 100%;
  opacity: calc(var(--lg-sheen-boost, 1) * (max(-1 * var(--lg-ly), 0) + var(--lg-sheen-back) * max(var(--lg-ly), 0)));
}
/* Focus is not a ring around the glass but the light on its rim taking the accent colour: one thin
   line where the light falls, weaker on the far side, moving with the pointer as the sheen does.
   The same map as the sheen, so it can never sit somewhere the light is not. Without the lens,
   and so under Increase Contrast, the plain ring stays: it is what shows the focus there. */
html[data-lg-refraction="lens"] body [data-lg-surface='composer'] > [data-lg-sheen] > i::after {
  content: '';
  position: absolute;
  inset: 0;
  background: var(--dsw-alias-state-business-primary);
  -webkit-mask: var(--lg-sheen-map, none) no-repeat 0 var(--lg-row, 0) / 100% 400%;
  mask: var(--lg-sheen-map, none) no-repeat 0 var(--lg-row, 0) / 100% 400%;
  opacity: 0;
  transition: opacity var(--glass-control) ease;
}
html[data-lg-refraction="lens"] body [data-lg-surface='composer']:focus-within > [data-lg-sheen] > i::after {
  opacity: 1;
}
html[data-lg-refraction="lens"] body [data-composer-card][data-lg-lens]:focus-within {
  --lg-surface-edge: color-mix(in srgb, var(--dsw-alias-state-business-primary) 20%, var(--lg-edge, var(--dsw-alias-border-l2)));
}
/* With text passing behind it the composer thickens and lifts; over empty sheet it stays clear.
   A layer of its own, so only its opacity changes, and inside the filter's element, so that
   fading it cannot cut the filter off from the page. The solid token: inside the main panel
   --dsw-alias-bg-base is transparent. */
html body [data-composer-card][data-lg-over] {
  --lg-composer-shadow: 0 8px 22px -8px rgb(0 0 0 / calc(.2 * var(--lg-k, 1))), var(--glass-shadow-raised, 0 0 #0000);
}
html[data-lg-refraction="lens"] body [data-lg-surface='composer'] > [data-lg-glass] > b::after {
  content: '';
  position: absolute;
  inset: var(--lg-lens-reach, 0px);
  border-radius: var(--lg-surface-radius, 0px);
  corner-shape: var(--lg-surface-corner, round);
  background: color-mix(in srgb, var(--glass-base-solid) 52%, transparent);
  opacity: 0;
  transition: opacity var(--glass-control) ease;
}
html[data-lg-refraction="lens"] body [data-lg-surface='composer'][data-lg-over] > [data-lg-glass] > b::after {
  opacity: 1;
}

/* Floating surfaces. Menus get their blur from the shell's own tokens above. */
html body [data-menu-material] {
  border: 1px solid var(--lg-edge);
  border-radius: var(--dsw-radius-lg, 14px);
  box-shadow: var(--lg-float-shadow) !important;
}
html body :is([data-shortcut-modal], [role='dialog'][class*='_dialog'], [class*='_float_3oazc'], [class*='_panel_denjv'], [class*='_preview_bgejw'],
  .V7pFBG_registry, .eze_pW_panel, .SNx2jG_preview, .tzG23a_earlierHistory, .bZwPEG_addressChanged, ._4EiRdG_overlay, .xeixwq_kindSlot [role='tooltip']) {
  border: 1px solid var(--lg-edge);
  background: linear-gradient(150deg, var(--lg-glint-idle), transparent 38%), var(--lg-thick) !important;
  -webkit-backdrop-filter: var(--lg-refraction);
  backdrop-filter: var(--lg-refraction);
  box-shadow: var(--lg-float-shadow) !important;
}
/* The hover card and the small notices keep their dark fill: the shell sets their text
   white in both themes. */
html body [class*='_card_bgejw'] {
  --dsw-hovercard-bg: rgb(44 44 46 / max(.68, var(--lg-alpha, .56)));
  -webkit-backdrop-filter: var(--lg-refraction);
  backdrop-filter: var(--lg-refraction);
}
html body :is([class*='_bubble_44yfq'], [class*='_toast_hr9yd']) {
  -webkit-backdrop-filter: blur(14px) saturate(160%);
  backdrop-filter: blur(14px) saturate(160%);
}
/* --dsw-alias-bg-layer-3 stays solid: the shell also uses it as a text colour, on the
   Save button and on solid tags. The two surfaces that fill with it are set here. */
html body :is([class*='_indicator_1lga9'], [class*='_indicator_1ocp1'], .Wd4N7W_controlThumb) {
  background: rgb(255 255 255 / .72);
  box-shadow: 0 1px 2px rgb(0 0 0 / .10), 0 0 0 .5px rgb(0 0 0 / .08);
}
html body[data-ds-dark-theme] :is([class*='_indicator_1lga9'], [class*='_indicator_1ocp1'], .Wd4N7W_controlThumb) {
  background: rgb(255 255 255 / .14);
  box-shadow: 0 1px 2px rgb(0 0 0 / .45), 0 0 0 .5px rgb(255 255 255 / .10);
}
html body [class*='_input_181ew'] {
  background: rgb(118 118 128 / .12);
}
/* Scroll-to-bottom floats over the transcript, so what passes under it has to blur. */
html body .V4vHZW_toBottom {
  -webkit-backdrop-filter: blur(14px) saturate(150%);
  backdrop-filter: blur(14px) saturate(150%);
}

@media (prefers-reduced-transparency: reduce) {
  body, body[data-ds-dark-theme] {
    --lg-sheet: var(--dsw-alias-bg-base);
    --lg-panel: var(--dsw-alias-bg-base);
    --lg-composer: var(--dsw-alias-bg-base);
    --lg-thick: var(--dsw-alias-bg-base);
    --lg-thin: var(--dsw-alias-bg-layer-1);
    --lg-refraction: none;
    --lg-composer-filter: none;
    --lg-glint: transparent;
    --lg-glint-idle: transparent;
    --dsw-menu-backdrop-filter: none !important;
  }
}
/* Increase Contrast keeps the sheets but makes them read: nearly solid, with an edge you can see. */
@media (prefers-contrast: more) {
  body, body[data-ds-dark-theme] {
    --lg-sheet: color-mix(in srgb, var(--dsw-alias-bg-base) 94%, transparent);
    --lg-panel: color-mix(in srgb, var(--dsw-alias-bg-base) 94%, transparent);
    --lg-composer: var(--dsw-alias-bg-base);
    --lg-composer-fill: var(--dsw-alias-bg-base);
    --lg-thick: var(--dsw-alias-bg-base);
    --lg-thin: var(--dsw-alias-bg-layer-1);
    --lg-edge: color-mix(in srgb, var(--dsw-alias-label-primary) 60%, transparent);
    --lg-glint: transparent;
    --lg-glint-idle: transparent;
  }
}
@media (prefers-reduced-motion: reduce) {
  html body [data-composer-card] { --lg-composer-fill: var(--lg-composer); }
}
@media print {
  body, body[data-ds-dark-theme] { --lg-refraction: none; --lg-composer-filter: none; }
}
`;

    /* ── shape: corners, every shadow, type ────────────────────────────────────
       The ladder hangs off one radius, so the slider moves all of it. !important on a
       custom property wins whichever order the shell's token layer loads in. */
    const SHAPE_CSS = String.raw`
html, body {
  --dsw-radius-xs: round(calc(var(--lg-radius, 22px) * .27), 1px) !important;
  --dsw-radius-sm: round(calc(var(--lg-radius, 22px) * .45), 1px) !important;
  --dsw-radius-md: round(calc(var(--lg-radius, 22px) * .55), 1px) !important;
  --dsw-radius-lg: round(calc(var(--lg-radius, 22px) * .64), 1px) !important;
  --dsw-radius-xl: round(calc(var(--lg-radius, 22px) * .82), 1px) !important;
  --dsw-radius-panel: var(--lg-radius, 22px) !important;
}

/* Concentric corners: anything sitting in a corner takes that corner's radius minus the gap
   between them, so the two curves run parallel. Written as formulas, so the slider moves
   them together; the floors stop small panel radii from squaring things off. The seat gap is
   ours. The other two are the shell's own padding, named here so each appears once. */
html body {
  --glass-panel-inset: 10px;
  --glass-menu-inset: 5px;
  /* Concentric with the circular buttons inside it: their radius, 17px, plus their inset, 9px.
     Smaller panel radii bring it down with them. It no longer follows the sheet exactly, but
     the corners only meet at the narrowest widths, and there the gap is 20px against 16px. */
  --glass-composer-radius: clamp(12px, calc(var(--dsw-radius-panel, 22px) - 6px), 26px);
}
html body [data-composer-card] {
  border-radius: var(--glass-composer-radius);
}
html body [data-composer-card]::before {
  border-radius: calc(var(--glass-composer-radius) - 1px);
}
/* Large surfaces keep the continuous corner; controls take true round ends. At half the height a
   superellipse reads as a soft square, so a capsule or a circle has to be round. On a small
   rounded control the difference cannot be seen, which is why this can go by role. Exact class
   names only for the few that are not buttons: this runs on every element of the trajectory. */
html body :is(button:not([role='menuitem'], [role='treeitem'], .wb-row), [role='button'], [role='tab'], [role='tablist'], [role='switch'],
  .Wd4N7W_search, .xeixwq_kindTag, .xeixwq_event, .mOxcpG_split, ._indicator_1lga9_11, ._tabs_1lga9_1, ._6qcDqa_linkButton) {
  corner-shape: round;
}
html body .wtg9ga_newSession {
  border-radius: 999px;
}
/* Capsules, Apple's shape for standout actions: at equal width and height, a circle. Both are the
   same size, so they sit on one line and share the card's corner centre. */
html body [data-composer-card] :is(button[class*='_primary'], [class*='GRgSLq_add']) {
  width: 34px;
  min-width: 34px;
  height: 34px;
  border-radius: 50%;
  corner-shape: round;
}
/* The shell lifts the send button 2px off the row; the add button has to sit on the same line. */
html body [data-composer-card] [class*='GRgSLq_add'] {
  transform: translateY(-2px);
}
html body :is(._5Qcc8a_trigger, [data-rightbar-col] [class*='_tab_3oazc']) {
  border-radius: calc(var(--dsw-radius-panel, 22px) - var(--glass-panel-inset));
}
html body [data-menu-material] [class*='_item_1p5el'] {
  border-radius: calc(var(--dsw-radius-lg, 14px) - var(--glass-menu-inset));
}

/* Light comes from above: a hairline edge, then a wide falloff that never reads as a
   drop shadow on its own. Panels that are always there sit close to the water. */
body {
  --dsw-shadow-lv1: 0 0 0 .5px rgba(0,0,0,.05), 0 1px 2px rgba(0,0,0,.05) !important;
  --dsw-shadow-lv2: 0 0 0 .5px rgba(0,0,0,.06), 0 4px 12px -6px rgba(0,0,0,.16), 0 16px 32px -24px rgba(0,0,0,.28) !important;
  --dsw-shadow-lv3: 0 0 0 .5px rgba(0,0,0,.07), 0 8px 20px -10px rgba(0,0,0,.18), 0 32px 64px -32px rgba(0,0,0,.32) !important;
  --glass-shadow-rest:
    0 1px 2px rgb(0 0 0 / calc(.04 * var(--lg-k, 1))),
    0 10px 24px -18px rgb(0 0 0 / calc(.14 * var(--lg-k, 1)));
  --glass-shadow-raised:
    0 2px 4px -2px rgb(0 0 0 / calc(.08 * var(--lg-k, 1))),
    0 8px 20px -12px rgb(0 0 0 / calc(.15 * var(--lg-k, 1))),
    0 26px 50px -28px rgb(0 0 0 / calc(.24 * var(--lg-k, 1)));
}
body[data-ds-dark-theme] {
  --dsw-shadow-lv1: 0 0 0 .5px rgba(0,0,0,.45), 0 1px 2px rgba(0,0,0,.50) !important;
  --dsw-shadow-lv2: 0 0 0 .5px rgba(0,0,0,.50), 0 4px 12px -6px rgba(0,0,0,.55), 0 16px 32px -24px rgba(0,0,0,.60) !important;
  --dsw-shadow-lv3: 0 0 0 .5px rgba(0,0,0,.55), 0 8px 20px -10px rgba(0,0,0,.60), 0 32px 64px -32px rgba(0,0,0,.70) !important;
  --glass-shadow-rest:
    0 1px 2px rgb(0 0 0 / calc(.18 * var(--lg-k, 1))),
    0 10px 24px -18px rgb(0 0 0 / calc(.40 * var(--lg-k, 1)));
  --glass-shadow-raised:
    0 2px 4px -2px rgb(0 0 0 / calc(.25 * var(--lg-k, 1))),
    0 8px 20px -12px rgb(0 0 0 / calc(.45 * var(--lg-k, 1))),
    0 26px 50px -28px rgb(0 0 0 / calc(.65 * var(--lg-k, 1)));
}

/* Inter is the closest free match to SF Pro when installed; Noto Sans SC is the closest
   match to PingFang on Windows. A font chosen in Settings still wins. */
body {
  --dsw-font-family: var(--dsh-font-family-text, -glass-system), BlinkMacSystemFont, "Inter", "Segoe UI Variable Text", "Segoe UI", "PingFang SC", "Noto Sans SC", "Hiragino Sans GB", "Microsoft YaHei UI", "Microsoft YaHei", "Helvetica Neue", Arial, sans-serif !important;
}
/* Headings drop to semibold. Sizes stay with Settings > Appearance, so the text, code
   and terminal size controls keep working. */
html body [data-chat-turn] :is(h1, h2, h3, h4) {
  font-weight: 600;
}
`;

    /* ── motion ────────────────────────────────────────────────────────────────
       A damped spring (response .3s, damping ratio .8) sampled for linear(): it settles
       with a barely visible overshoot, so controls feel quick rather than bouncy.
       --lg-motion scales every distance: 0 off, 1 standard, 1.6 lively. Presses scale less
       than that: a button that shrinks visibly reads as broken, however lively the setting.
       Three speeds: instant for hover and press, control for a control changing state, and
       the spring for surfaces and thumbs moving. */
    const MOTION_CSS = String.raw`
body {
  --glass-press: min(var(--lg-motion, 1), 1.25);
  --glass-spring: linear(0, 0.07, 0.223, 0.399, 0.565, 0.705, 0.813, 0.893, 0.947, 0.981, 1.001, 1.011, 1.015, 1.015, 1.013, 1.01, 1.008, 1.005, 1);
}

/* The boot veil waits for the start page, then lets mountEntry's whale take over from its own.
   Warm: a hair see-through, so what lies under it is really drawn before anything moves. Fully
   opaque it would be skipped, and the first frame of the fade would pay for all of it at once. */
html:is([data-lg-entry='hold'], [data-lg-entry='warm']) #dsh-boot { visibility: visible !important; display: block !important; }
html[data-lg-entry='hold'] #dsh-boot .dsh-boot-sheet { opacity: 1 !important; }
html[data-lg-entry='warm'] #dsh-boot .dsh-boot-sheet { opacity: .99 !important; transition: none; }
html[data-lg-entry='warm'] #dsh-boot { pointer-events: none; }
html[data-lg-entry='run'] #dsh-boot .dsh-boot-mark { visibility: hidden; }
html[data-lg-entry='run'] #dsh-boot .dsh-boot-ring { opacity: 0; transition: opacity 120ms ease; }
html[data-lg-entry='run'] #dsh-boot .dsh-boot-stack { transform: none; }

/* Rows answer with a fill, because scaling a wide row makes its far edge jump. */
[data-slot='sidebar'] [role='treeitem']:active,
[data-rightbar-col] button:not(:has(> svg:only-child), [aria-label]:not(:has(> span)), .wb-row, [role='tab']):active:not(:disabled) {
  background-color: var(--dsw-alias-interactive-bg-active);
}

@media (prefers-reduced-motion: no-preference) {
  /* Switches: the thumb springs across, and stretches while it is held. */
  [role='switch'] {
    transition: background-color var(--glass-control) ease;
  }
  [role='switch'] > span:only-child {
    box-shadow: 0 1px 2px rgba(0,0,0,.22), 0 0 0 .5px rgba(0,0,0,.05);
    transition: transform var(--glass-spring-duration, .36s) var(--glass-spring), width var(--glass-control) ease;
  }
  [role='switch']:active:not(:disabled) > span:only-child {
    width: 20px;
  }
  [role='switch'][aria-checked='true']:active:not(:disabled) > span:only-child {
    transform: translate(12px);
  }

  [data-conversation-tabs] > [role='tab'] {
    transition: background-color var(--glass-control) ease, color var(--glass-control) ease, box-shadow var(--glass-control) ease;
  }
  /* The thumb itself has no transition: mountDroplet moves it as a drop, on the compositor. */

  /* Small controls shrink under the pointer and spring back, harder the smaller they
     are; independent scale leaves native transforms alone. */
  [data-composer-card] button,
  [data-slot='root'] header button,
  [data-rightbar-col] button {
    transition:
      background-color var(--glass-instant) ease, color var(--glass-instant) ease, border-color var(--glass-instant) ease,
      box-shadow var(--glass-instant) ease, opacity var(--glass-instant) ease, transform var(--glass-instant) ease,
      scale .16s var(--glass-spring);
  }
  [data-composer-card] button:active:not(:disabled) {
    scale: calc(1 - .015 * var(--glass-press));
    transition-duration: var(--glass-instant);
  }
  :is([data-composer-card], [data-slot='root'] header) button[class*='_primary']:active:not(:disabled) {
    scale: calc(1 - .02 * var(--glass-press));
    transition-duration: var(--glass-instant);
  }
  /* Only small controls in the right panel shrink: icon buttons and chips. */
  [data-slot='root'] header button:not([role='tab'], [class*='_primary']):active:not(:disabled),
  [data-rightbar-col] button:is(:has(> svg:only-child), [aria-label]:not(:has(> span))):not(.wb-row, [role='tab'], [role='menuitem'], [role='treeitem']):active:not(:disabled) {
    scale: calc(1 - .03 * var(--glass-press));
    transition-duration: var(--glass-instant);
  }

  /* Surfaces arrive from slightly small and settle; scale and translate are independent
     properties, so anchored positions stay untouched. Menus must not fade here: opacity
     below 1 on the surface cuts its material off from the page until the fade ends, so
     the menu would open clear and turn white. */
  @keyframes glass-pop { from { scale: calc(1 - .015 * var(--lg-motion, 1)); } }
  @keyframes glass-sheet { from { scale: calc(1 - .015 * var(--lg-motion, 1)); translate: 0 calc(4px * var(--lg-motion, 1)); } }
  @keyframes glass-fade { from { opacity: 0; } }
  [data-menu-material]:not([data-lg-origin]) {
    animation: glass-pop var(--glass-spring-duration, .2s) var(--glass-spring);
  }
  [role='dialog']:not([data-menu-material], [data-lg-origin]) {
    animation: glass-sheet var(--glass-spring-duration, .36s) var(--glass-spring);
  }
  [class*='_overlay'] > [class*='_mask'] {
    animation: glass-fade var(--glass-control) ease;
  }
}
/* Reduced motion keeps DSH's native visibility lifecycle, without another layer of fades. */
html[data-lg-motion="off"] body :is([data-menu-material], [role='dialog'], [class*='_overlay'] > [class*='_mask']),
html[data-lg-motion="off"] body [data-menu-material] > *,
html[data-lg-motion="off"] body [data-menu-material] > [data-lg-glass] > b,
html[data-lg-motion="off"] body [data-menu-material] > [data-lg-glass]::after {
  animation: none !important;
}
`;

    /* ── Settings ──────────────────────────────────────────────────────────── */
    const DEFAULTS = {
      color: true, backdrop: 'wash',
      glass: true, strength: 50, transparency: 50, blur: 18, refraction: 'off',
      shape: true, radius: 22,
      interaction: true, motion: 'standard',
    };
    const SWITCHES = ['color', 'glass', 'shape', 'interaction'];
    const RANGES = { strength: [0, 100], transparency: [0, 100], blur: [0, 40], radius: [8, 32] };
    /** Must match .step() in index.js: the Host rejects anything else when saving. */
    const STEPS = { strength: 5, transparency: 5 };
    const snap = (key, value) => { const step = STEPS[key] ?? 1; return Math.round(value / step) * step; };
    const CHOICES = { motion: ['off', 'subtle', 'standard', 'lively'], backdrop: ['wash', 'vivid', 'plain'], refraction: ['off', 'lens'] };
    const MOTION = { off: [0, '.16s'], subtle: [0.5, '.16s'], standard: [1, '.2s'], lively: [1.6, '.24s'] };

    function normalize(raw) {
      const next = { ...DEFAULTS };
      for (const key of SWITCHES) {
        if (raw?.[key] === false || raw?.[key] === 'false') next[key] = false;
      }
      for (const [key, [min, max]] of Object.entries(RANGES)) {
        // An unsaved field arrives as '' or null, which Number() would read as 0.
        const text = raw?.[key];
        if (text === undefined || text === null || String(text).trim() === '') continue;
        const value = Number(text);
        if (Number.isFinite(value)) next[key] = Math.min(max, Math.max(min, snap(key, value)));
      }
      for (const [key, options] of Object.entries(CHOICES)) {
        if (options.includes(raw?.[key])) next[key] = raw[key];
      }
      return next;
    }

    const INLINE = ['--lg-alpha', '--lg-k', '--lg-blur', '--lg-radius', '--lg-motion', '--glass-spring-duration'];
    function paint(settings) {
      const root = document.documentElement;
      const put = (name, on, value) => (on ? root.style.setProperty(name, value) : root.style.removeProperty(name));
      const [motion, spring] = MOTION[settings.motion];
      // Transparency 0 is nearly solid paper, 100 is clear glass; 50 is the original .56.
      put('--lg-alpha', settings.glass, (0.92 - settings.transparency * 0.0072).toFixed(3));
      put('--lg-k', settings.glass, (settings.strength / 50).toFixed(2));
      put('--lg-blur', settings.glass, `${settings.blur}px`);
      put('--lg-radius', settings.shape, `${settings.radius}px`);
      put('--lg-motion', settings.interaction, String(motion));
      put('--glass-spring-duration', settings.interaction, spring);
      root.dataset.lgMotion = settings.interaction ? settings.motion : 'off';
      root.dataset.lgBackdrop = settings.backdrop;
      root.dataset.lgRefraction = settings.glass ? settings.refraction : 'off';
    }
    function unpaint() {
      const root = document.documentElement;
      for (const name of INLINE) root.style.removeProperty(name);
      delete root.dataset.lgMotion;
      delete root.dataset.lgBackdrop;
      delete root.dataset.lgRefraction;
    }

    const TEXT = {
      zh: {
        title: '外观', description: '配色、玻璃、圆角字体和交互动效各自独立，关掉一组不影响其他几组。拖动时即时预览，保存后生效。',
        color: '配色', colorNote: '系统配色、文字对比度、选区和背景渐变。',
        glass: '玻璃', glassNote: '面板、输入框、菜单、弹窗和卡片的材质。关闭后同样的布局改用实色。',
        shape: '圆角字体', shapeNote: '圆角阶梯、全部阴影和字体。',
        interaction: '交互动效', interactionNote: '按压反馈、弹入动效、开关和键盘焦点。',
        strength: '玻璃强度', transparency: '透明度', blur: '模糊度', radius: '圆角', motion: '动效强度', backdrop: '背景样式', refraction: '高级渲染',
        off: '关', subtle: '轻', standard: '标准', lively: '活泼', wash: '柔和渐变', vivid: '鲜明渐变', plain: '纯色', lens: '折射透镜',
        blurHint: '用于面板、弹窗和顶栏控件。输入框和菜单另有下限，让背后的文字化开、菜单项看得清。',
        compatibility: '兼容性', checkTested: '已在 DSH {version} 上测试。',
        checkUntested: '当前是 DSH {version}，本主题在 {tested} 上测试；如有显示异常，多半是 DSH 改了界面结构。',
        checkLegacy: '检测到旧插件 {names}：它们已并入本插件，请到插件页删除，否则两份样式会互相覆盖。',
        checkMissing: '这些地方的界面结构和主题预期的不一样，相关样式已退回 DSH 自带的样子：{parts}。多半是 DSH 更新了，需要更新本主题。',
        checkOk: '已核对 {found} / {total} 处界面结构，没有发现不匹配。', checkUnseen: '尚未打开过：{parts}。',
        checkComposer: '输入框', checkSession: '会话页', checkSidebar: '侧栏', checkMenu: '菜单',
        preset: '质感', presetClear: '清透', presetStandard: '标准', presetCalm: '沉稳', advanced: '细调', customNote: '当前是自定义数值',
        presetHint: '一键设好强度、透明度和模糊度；想单独调，展开下面的细调。',
        refractionHint: '输入框、顶栏控件和菜单做成液态玻璃：中间磨砂，边缘把外侧的画面压进来弯折，高光跟着指针走，按下时压扁或鼓起再回弹，菜单从按钮里长出来。',
        refractionUnsupported: '当前环境不支持折射，已自动关闭。',
        save: '保存', saving: '正在保存…', saveFailed: '保存失败，请重试。', unavailable: '设置暂时不可用。', readOnly: '此配置为只读。',
        discard: '放弃', reset: '重置', overridden: '已覆盖',
      },
      en: {
        title: 'Appearance', description: 'Colour, glass, corners and type, and motion are independent: turning one off leaves the others alone. Drag to preview; save to keep.',
        color: 'Colour', colorNote: 'System palette, text contrast, selection and background wash.',
        glass: 'Glass', glassNote: 'The material of panels, composer, menus, dialogs and cards. Off paints the same layout solid.',
        shape: 'Corners and type', shapeNote: 'The corner ladder, every shadow and the type stack.',
        interaction: 'Motion', interactionNote: 'Press feedback, surfaces settling in, switches and keyboard focus.',
        strength: 'Strength', transparency: 'Transparency', blur: 'Blur', radius: 'Corners', motion: 'Intensity', backdrop: 'Background', refraction: 'Rendering',
        off: 'Off', subtle: 'Subtle', standard: 'Standard', lively: 'Lively', wash: 'Soft wash', vivid: 'Vivid wash', plain: 'Plain', lens: 'Refraction',
        blurHint: 'For panels, dialogs and the header controls. The composer and menus keep a floor of their own, so text behind them dissolves and menu items stay legible.',
        compatibility: 'Compatibility', checkTested: 'Tested on DSH {version}.',
        checkUntested: 'This is DSH {version}; the theme was tested on {tested}. Anything that looks off most likely comes from a change in the shell.',
        checkLegacy: 'Found the old plugins {names}. They are part of this one now; remove them on the Plugins page, or the two sets of styles will fight.',
        checkMissing: 'The shell no longer looks the way the theme expects in: {parts}. Those rules fall back to the shell\'s own look; DSH most likely changed, and the theme needs an update.',
        checkOk: 'Checked {found} of {total} places in the shell; nothing out of step.', checkUnseen: ' Not opened yet: {parts}.',
        checkComposer: 'composer', checkSession: 'session page', checkSidebar: 'sidebar', checkMenu: 'menus',
        preset: 'Look', presetClear: 'Clear', presetStandard: 'Standard', presetCalm: 'Calm', advanced: 'Fine-tune', customNote: 'Custom values',
        presetHint: 'Sets strength, transparency and blur in one go; open Fine-tune below to adjust them one by one.',
        refractionHint: 'Turns the composer, the header controls and menus into liquid glass: frosted in the middle, the rim draws in and bends what lies just outside, the highlight follows the pointer, a press squashes or swells them and springs back, and menus grow out of their button.',
        refractionUnsupported: 'Refraction is not supported here, so it stays off.',
        save: 'Save', saving: 'Saving…', saveFailed: 'Could not save. Try again.', unavailable: 'Settings are unavailable right now.', readOnly: 'This profile is read-only.',
        discard: 'Discard', reset: 'Reset', overridden: 'Overridden',
      },
    };
    const t = (key) => (String(navigator.language || '').toLowerCase().startsWith('zh') ? TEXT.zh : TEXT.en)[key] ?? key;
    const fill = (template, values) => Object.entries(values).reduce((text, [key, value]) => text.split(`{${key}}`).join(String(value)), String(template));

    /* ── Refraction lens ───────────────────────────────────────────────────────
       A page cannot hand WebGL the pixels behind an element, so the bending itself
       happens in the compositor: an SVG displacement filter used as a backdrop filter.
       What has to be computed are the maps: how far each pixel bends, and how brightly
       each part of the rim catches the light. They are pure functions of the card's size and
       corner, built once per size on a canvas (a few milliseconds) and kept for reuse. */
    const SVG_NS = 'http://www.w3.org/2000/svg';
    const lensSupported = () => {
      try {
        return CSS.supports('backdrop-filter', 'url(#x)') || CSS.supports('-webkit-backdrop-filter', 'url(#x)');
      } catch {
        return false;
      }
    };

    /**
     * The glass surface. The lens and the sheen are both drawn from it, so light bends and
     * shines off one shape. Across the rim, from the outer edge (t = 0) to where the glass goes
     * flat (t = 1), the height is a convex squircle: steep at the edge, level towards the middle.
     */
    const surface = (t) => (1 - (1 - t) ** 4) ** 0.25;
    const slope = (t) => {
      const a = Math.max(t - 0.001, 0);
      const b = Math.min(t + 0.001, 1);
      return (surface(b) - surface(a)) / (b - a);
    };
    /* How far the picture shifts across the rim. A pixel at t (0 at the edge, 1 where the glass
       goes flat) shows what lies at t - a(1 - t)^3, in rim widths: the edge reaches a rim widths
       out past the card and squeezes that strip in, (1 + 3a) times at the very edge, easing to
       none where it meets the flat middle. It can never fold or mirror, whatever a is. A surface
       whose glass cannot reach past its edge uses t + a(1 - t)^3 instead, which magnifies and
       stays in order for a below 1/3. (A ray traced through the surface bends so hard at the
       steep edge that the rim folds onto itself and reads as a flat band.) The direction is the
       surface's own. */
    const BEND_LIMIT = 0.6;
    /** How far the surface leans away from the viewer across the rim: 1 is a vertical wall. */
    const TILT_PROFILE = Float32Array.from({ length: 128 }, (_, i) => {
      const lean = slope(Math.max(i / 127, 0.002));
      return lean / Math.hypot(1, lean);
    });
    const profile = (table, t) => table[Math.round(Math.min(Math.max(t, 0), 1) * 127)];
    const smoothstep = (a, b, x) => {
      const u = Math.min(Math.max((x - a) / (b - a), 0), 1);
      return u * u * (3 - 2 * u);
    };
    /** corner-shape: superellipse(k) is |x|^n + |y|^n = 1 with n = 2^k; round is n = 2. */
    const cornerExponent = (value) => {
      const match = /superellipse\(\s*(-?[\d.]+)/.exec(String(value ?? ''));
      if (match) {
        const n = 2 ** parseFloat(match[1]);
        if (Number.isFinite(n)) return Math.min(Math.max(n, 1.2), 12);
      }
      return value === 'squircle' ? 4 : 2;
    };

    /** Two box passes each way: close to a Gaussian, linear in the radius. */
    function smoothField(source, width, height, radius) {
      let a = Float32Array.from(source);
      let b = new Float32Array(source.length);
      const span = 2 * radius + 1;
      for (let pass = 0; pass < 2; pass++) {
        for (let y = 0; y < height; y++) {
          const row = y * width;
          let sum = 0;
          for (let x = -radius; x <= radius; x++) sum += a[row + Math.min(width - 1, Math.max(0, x))];
          for (let x = 0; x < width; x++) {
            b[row + x] = sum / span;
            sum += a[row + Math.min(width - 1, x + radius + 1)] - a[row + Math.max(0, x - radius)];
          }
        }
        for (let x = 0; x < width; x++) {
          let sum = 0;
          for (let y = -radius; y <= radius; y++) sum += b[Math.min(height - 1, Math.max(0, y)) * width + x];
          for (let y = 0; y < height; y++) {
            a[y * width + x] = sum / span;
            sum += b[Math.min(height - 1, y + radius + 1) * width + x] - b[Math.max(0, y - radius) * width + x];
          }
        }
      }
      return a;
    }

    /**
     * For each pixel, at scale pixels per CSS pixel, over the card and a margin of pad around
     * it: its distance in from the card's edge and the direction the edge faces there. The corner is the card's real corner shape, so the
     * light bends and shines along the outline the eye sees. Deep in a corner the distance has a
     * crease on the diagonal; the direction comes from a smoothed copy so light does not break
     * there, while the distance stays exact.
     */
    function glassField(width, height, radius, exponent, scale, pad = 0) {
      const w = Math.max(1, Math.round((width + 2 * pad) * scale));
      const h = Math.max(1, Math.round((height + 2 * pad) * scale));
      const hx = width / 2;
      const hy = height / 2;
      const r = Math.max(0.5, Math.min(radius, hx, hy));
      const n = exponent;
      const depth = new Float32Array(w * h);
      for (let y = 0; y < h; y++) {
        const qy = Math.abs((y + 0.5) / scale - pad - hy) - (hy - r);
        for (let x = 0; x < w; x++) {
          const qx = Math.abs((x + 0.5) / scale - pad - hx) - (hx - r);
          let d;
          if (qx > 0 && qy > 0) {
            // First-order distance to |x|^n + |y|^n = r^n: the level value over its slope.
            const ax = qx / r;
            const ay = qy / r;
            const f = (ax ** n + ay ** n) ** (1 / n);
            const g = Math.sqrt(ax ** (2 * n - 2) + ay ** (2 * n - 2)) / f ** (n - 1);
            d = ((1 - f) * r) / g;
          } else {
            d = r - Math.max(qx, qy);
          }
          depth[y * w + x] = d;
        }
      }
      const soft = smoothField(depth, w, h, Math.max(1, Math.round(2 * scale)));
      const nx = new Float32Array(w * h);
      const ny = new Float32Array(w * h);
      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          const i = y * w + x;
          const gx = soft[y * w + Math.min(w - 1, x + 1)] - soft[y * w + Math.max(0, x - 1)];
          const gy = soft[Math.min(h - 1, y + 1) * w + x] - soft[Math.max(0, y - 1) * w + x];
          const len = Math.hypot(gx, gy) || 1;
          // Distance grows inward, so the outward facing is against its slope.
          nx[i] = -gx / len;
          ny[i] = -gy / len;
        }
      }
      return { w, h, depth, nx, ny };
    }

    /**
     * Displacement map over the card and its margin. Red and green carry the x and y shift (128
     * is none): inside the rim each pixel samples from further out, or, where the glass cannot
     * reach past its edge, from further in, which magnifies. Blue is how near the edge the
     * pixel is, which sets how much its blur eases off. Alpha is how much of the pixel the card
     * covers, which the filter's output is trimmed to.
     */
    function lensMap({ w, h, depth, nx, ny }, bezel, outward, ramp = bezel, scale = 1) {
      const sign = outward ? 1 : -1;
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const g = canvas.getContext('2d');
      const image = g.createImageData(w, h);
      const data = image.data;
      for (let i = 0; i < w * h; i++) {
        const t = depth[i] / bezel;
        // Past the edge nothing shows, except the pixel the edge cuts through.
        const shift = t >= 1 ? 0 : t >= 0 ? (1 - t) ** 3 : depth[i] > -1.5 ? 1 : 0;
        const o = i * 4;
        data[o] = Math.round(128 + sign * nx[i] * shift * 127);
        data[o + 1] = Math.round(128 + sign * ny[i] * shift * 127);
        // How near the edge, falling in a straight line from 1 at the edge to 0 at `ramp` in:
        // the filter turns this into how far its blur eases off.
        data[o + 2] = Math.round(Math.min(Math.max(1 - depth[i] / ramp, 0), 1) * 255);
        // Coverage falls over one map pixel. When the map is drawn smaller than the card, the
        // filter steepens this back to one CSS pixel (see LENS_MAP_PIXELS), so the outline stays
        // where it was and as crisp.
        data[o + 3] = Math.round(Math.min(Math.max(depth[i] * scale + 0.5, 0), 1) * 255);
      }
      g.putImageData(image, 0, 0);
      return canvas.toDataURL('image/png');
    }

    /**
     * Sheen: four rows of white, one per direction the rim can face (right, left, down, up).
     * A pixel's brightness comes from how far the surface leans there, to the tenth power, and
     * how squarely it faces that direction. The high power keeps the light to the steep outer
     * pixel or two: a band that fades over ten pixels read as the bevel of a second, larger pane
     * around the glass. It still narrows where the rim turns away and follows each corner.
     */
    function sheenMap({ w, h, depth, nx, ny }, bezel) {
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h * 4;
      const g = canvas.getContext('2d');
      const image = g.createImageData(w, h * 4);
      const data = image.data;
      data.fill(255);
      const faces = [[1, 0], [-1, 0], [0, 1], [0, -1]];
      for (let i = 0; i < w * h; i++) {
        const t = depth[i] / bezel;
        const tilt = t < 1 ? profile(TILT_PROFILE, t) : 0;
        for (let k = 0; k < 4; k++) {
          const facing = nx[i] * faces[k][0] + ny[i] * faces[k][1];
          const value = facing > 0 ? tilt ** 10 * facing ** 1.5 : 0;
          data[(k * w * h + i) * 4 + 3] = Math.round(value * 255);
        }
      }
      g.putImageData(image, 0, 0);
      return canvas.toDataURL('image/png');
    }

    /**
     * Where liquid glass goes: the control layer that floats over the content. The reading
     * surfaces, the three cards, stay calm frosted sheets.
     *   reach    how far past the edge the glass reads, so the rim can draw in and squeeze what
     *            lies just outside. 0 where the surface scrolls its own content, which would
     *            clip a reaching layer and scroll with it; there the rim magnifies what lies
     *            under it instead.
     *   press    'squash' flattens like a pad under a finger, 'swell' grows like a drop, null
     *            for none.
     *   pressOn  'surface' counts presses on the surface but not on its buttons, which have
     *            their own press; 'any' counts presses anywhere in it.
     */
    const SURFACES = [
      // 9px: the seat leaves 10px on the scrollbar side, and anything past the seat scrolls it
      // sideways, which lifts the composer.
      { name: 'composer', selector: '[data-composer-card]', reach: 9, press: 'squash', pressOn: 'surface' },
      { name: 'tabs', selector: 'header [data-conversation-tabs]', reach: 0, press: 'swell', pressOn: 'any' },
      { name: 'toolbar', selector: "header [class*='an3WzG_headerUtilities']", reach: 6, press: null },
      { name: 'menu', selector: '[data-menu-material]', reach: 9, press: null },
    ];
    const SURFACE_SELECTOR = SURFACES.map((surface) => surface.selector).join(', ');

    /**
     * Most map pixels a lens filter may carry. The browser copies the map into every frame once
     * for each primitive that reads it, nine times in the five-level ramp, and the copies, not
     * the blurs, were what held the whole page to 80 fps on a 240 Hz display behind a 855 x 116
     * map (2026-11-08: 97 KB of map 237 fps, 152 KB 161, 387 KB 70-81). The maps are smooth
     * fields, so a card larger than this gets a smaller map the filter stretches back over it;
     * side by side only the outline's antialiasing differed, which the filter steepens back.
     */
    const LENS_MAP_PIXELS = 10000;
    const lensMapScale = (width, height) => Math.min(1, Math.max(0.25, Math.sqrt(LENS_MAP_PIXELS / Math.max(1, width * height))));

    /**
     * Liquid glass on each surface in SURFACES. Per surface: a backdrop filter that frosts the
     * middle and bends a sharper picture at the rim, and a sheen lit from one direction. The
     * light leans towards the pointer over a surface; a press squashes or swells it and springs
     * back, with the sheen brightening and the rim bending harder in step.
     *   options.strength()    glass strength, 1 at the default
     *   options.blur(name)    frosting in the middle of that kind of surface, in px
     *   options.motion()      0 for no press motion, 1 at the standard setting
     */
    function mountLens(options) {
      const svg = document.createElementNS(SVG_NS, 'svg');
      svg.setAttribute('aria-hidden', 'true');
      svg.setAttribute('width', '0');
      svg.setAttribute('height', '0');
      svg.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden;pointer-events:none';
      document.body.append(svg);
      const lenses = new Map();
      const maps = new Map();
      let serial = 0;
      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
      const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');

      const primitive = (tag, attributes) => {
        const element = document.createElementNS(SVG_NS, tag);
        for (const [name, value] of Object.entries(attributes)) element.setAttribute(name, String(value));
        return element;
      };
      // The size, corner and density decide the maps. Recent ones are kept: a menu opens at the
      // same size every time, and a card that remounts on navigation comes back at its size.
      const mapsFor = (width, height, radius, exponent, bezel, dpr, reach, ramp) => {
        const key = [width, height, radius, exponent, bezel, dpr, reach, ramp].join('/');
        let entry = maps.get(key);
        // A menu settles a pixel or two after it opens, so an exact key missed every time and the
        // maps were drawn again on the main thread (about 22 ms) as it appeared. Within 2px the
        // filter stretches a cached map to fit, as it does while a card is being resized.
        if (!entry) {
          for (const [cachedKey, cached] of maps) {
            const [w, h, r, e, b, d, rc, rp] = cachedKey.split('/').map(Number);
            if (r === radius && e === exponent && b === bezel && d === dpr && rc === reach
              && Math.abs(w - width) <= 2 && Math.abs(h - height) <= 2 && Math.abs(rp - ramp) <= 1) { entry = cached; break; }
          }
        }
        if (!entry) {
          const scale = lensMapScale(width + 2 * reach, height + 2 * reach);
          entry = {
            lens: lensMap(glassField(width, height, radius, exponent, scale, reach), bezel, reach > 0, ramp, scale),
            scale,
            sheen: blobUrl(sheenMap(glassField(width, height, radius, exponent, dpr), bezel)),
          };
          maps.set(key, entry);
          if (maps.size > 12) {
            const [oldKey, old] = maps.entries().next().value;
            maps.delete(oldKey);
            if (![...lenses.values()].some((lens) => lens.sheenUrl === old.sheen)) URL.revokeObjectURL(old.sheen);
          }
        }
        return entry;
      };
      // The sheen map reaches CSS through --lg-sheen-map. As a data: URL it was 35 KB of text that
      // every restyle of the sheen rows substituted and parsed again: 4.2 ms each time the light
      // moved, under a pointer over the composer (2026-11-08). As a blob: URL it is a few dozen
      // characters, and the same restyle takes 0.6 ms.
      const blobUrl = (dataUrl) => {
        const bytes = Uint8Array.from(atob(dataUrl.slice(dataUrl.indexOf(',') + 1)), (ch) => ch.charCodeAt(0));
        return URL.createObjectURL(new Blob([bytes], { type: 'image/png' }));
      };

      // Glass first, sheen over it; both after the surface's own content in the tree, under it
      // in paint order (z-index -1).
      const ensureLayers = (surface) => {
        for (const [name, child, count] of [['data-lg-glass', 'b', 1], ['data-lg-sheen', 'i', 4]]) {
          if (surface.querySelector(`:scope > [${name}]`)) continue;
          const layer = document.createElement('span');
          layer.setAttribute(name, '');
          layer.setAttribute('aria-hidden', 'true');
          for (let i = 0; i < count; i++) layer.append(document.createElement(child));
          surface.append(layer);
        }
        const glass = surface.querySelector(':scope > [data-lg-glass]');
        const sheen = surface.querySelector(':scope > [data-lg-sheen]');
        if (glass.compareDocumentPosition(sheen) & Node.DOCUMENT_POSITION_PRECEDING) surface.append(sheen);
        // The composer's pointer glint, after the four light rows so their nth-child rules hold.
        if (surface.matches('[data-composer-card]') && !sheen.querySelector(':scope > s')) sheen.append(document.createElement('s'));
      };

      const build = (surface, entry) => {
        // The layers sit inside the border, so the maps match that box.
        const width = surface.clientWidth;
        const height = surface.clientHeight;
        if (width < 8 || height < 8) return;
        const style = getComputedStyle(surface);
        const radius = Math.max(0, (parseFloat(style.borderTopLeftRadius) || 0) - (parseFloat(style.borderTopWidth) || 0));
        const corner = style.getPropertyValue('corner-shape') || 'round';
        const exponent = cornerExponent(corner);
        const k = Math.min(options.strength(), 1.5);
        const frost = Math.round(options.blur(entry.kind.name));
        const dpr = Math.min(Math.max(window.devicePixelRatio || 1, 1), 3);
        const key = [width, height, radius, exponent, k, frost, dpr].join('/');
        ensureLayers(surface);
        if (entry.key === key) return;
        entry.key = key;
        // Wider than the corner: the curve is steepest in the outer few pixels, and a rim the
        // width of a small corner bends too little of the picture to be seen.
        const bezel = Math.max(4, Math.round(Math.min(Math.max(radius * 1.4, 16), 28, height / 3)));
        const reach = entry.kind.reach;
        // The blur eases off over the whole way from the middle to the edge, so no flat middle
        // is left with an outline of its own.
        const ramp = Math.max(bezel, Math.floor(Math.min(width, height) / 2));
        const { lens, sheen, scale: mapScale } = mapsFor(width, height, radius, exponent, bezel, dpr, reach, ramp);
        entry.bezel = bezel;
        entry.reach = reach;
        const W = width + 2 * reach;
        const H = height + 2 * reach;
        const filter = entry.filter;
        filter.replaceChildren();
        for (const [name, value] of Object.entries({ x: 0, y: 0, width: W, height: H, filterUnits: 'userSpaceOnUse', primitiveUnits: 'userSpaceOnUse', 'color-interpolation-filters': 'sRGB' })) {
          filter.setAttribute(name, String(value));
        }
        const map = primitive('feImage', { x: 0, y: 0, width: W, height: H, preserveAspectRatio: 'none', result: 'lens' });
        map.setAttribute('href', lens);
        // A blur reads transparent past the filter's edge and would darken it; putting alpha back
        // to 1 keeps the average of what lies inside.
        const frostedFrom = (input, name) => {
          const transfer = primitive('feComponentTransfer', { in: input, result: name });
          transfer.append(primitive('feFuncA', { type: 'linear', slope: 0, intercept: 1 }));
          return [transfer];
        };
        // One pass for all colours. A pass per colour gives a faint fringe on the rim but costs
        // about 20 fps of scrolling behind the composer (209-218 against 234 on the bench). The
        // map stores .5 at full strength, so the scale is twice the largest shift in pixels.
        // Reaching out, the shift is held inside the reach; magnifying, under the fold at 1/3.
        entry.limit = reach > 0 ? 2 * Math.min(BEND_LIMIT * bezel, reach - 1) : 2 * bezel * 0.32;
        entry.scale = reach > 0 ? 2 * Math.min(bezel * Math.min(0.32 * k, BEND_LIMIT * 0.8), reach - 2) : 2 * bezel * Math.min(0.22 * k, 0.28);
        entry.passes = [];
        const bend = primitive('feDisplacementMap', { in: 'graded', in2: 'lens', scale: entry.scale.toFixed(1), xChannelSelector: 'R', yChannelSelector: 'G', result: 'edge' });
        entry.passes.push([bend, 1]);
        // The blur falls in a straight line from the middle, at full frost, to the edge, at a
        // quarter of it. A filter has no blur that varies across the picture, so it is built from
        // LEVELS blurs evenly spaced along that line, each pair of neighbours mixed in proportion:
        // neighbours this close cannot be told apart, so the line has no visible steps, and no
        // clear rim meets a frosted middle, which read as two panes laid on each other. The whole
        // graded picture is then bent once, so the rim bends the same glass the middle is made of.
        const LEVELS = 5;
        // The levels are mixed as they come out of the blur and the mix is evened out once at the
        // end, rather than each level on its own: one pass instead of one per level.
        const levels = Array.from({ length: LEVELS }, (_, k) =>
          primitive('feGaussianBlur', { in: 'SourceGraphic', stdDeviation: Math.max(frost * (1 - 0.75 * (k / (LEVELS - 1))), 0.5).toFixed(2), result: `level${k}` }));
        const grading = [];
        for (let k = 1; k < LEVELS; k++) {
          // Level k takes over from level k-1 as nearness goes from (k-1)/(LEVELS-1) to k/(LEVELS-1).
          const weight = primitive('feComponentTransfer', { in: 'nearness', result: `weight${k}` });
          weight.append(primitive('feFuncA', { type: 'linear', slope: LEVELS - 1, intercept: -(k - 1) }));
          grading.push(
            weight,
            primitive('feComposite', { in: `level${k}`, in2: `weight${k}`, operator: 'in', result: `part${k}` }),
            primitive('feComposite', { in: `part${k}`, in2: k === 1 ? 'level0' : `graded${k - 1}`, operator: 'over', result: k === LEVELS - 1 ? 'gradedRaw' : `graded${k}` }),
          );
        }
        grading.push(...frostedFrom('gradedRaw', 'graded'));
        // A smaller map's coverage falls over 1/mapScale CSS pixels once stretched; steepen it
        // around its midpoint, which sits on the edge, back to one.
        const trim = [];
        if (mapScale < 1) {
          const sharpen = primitive('feComponentTransfer', { in: 'lens', result: 'outline' });
          const slope = 1 / mapScale;
          sharpen.append(primitive('feFuncA', { type: 'linear', slope: slope.toFixed(3), intercept: (0.5 - 0.5 * slope).toFixed(3) }));
          trim.push(sharpen);
        }
        filter.append(
          map,
          ...levels,
          primitive('feColorMatrix', { in: 'lens', type: 'matrix', values: '0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 1 0 0', result: 'nearness' }),
          ...grading,
          bend,
          ...trim,
          primitive('feComposite', { in: 'edge', in2: mapScale < 1 ? 'outline' : 'lens', operator: 'in' }),
        );
        surface.style.setProperty('--lg-lens', `url(#${filter.id})`);
        surface.style.setProperty('--lg-lens-reach', `${reach}px`);
        surface.style.setProperty('--lg-sheen-map', `url("${sheen}")`);
        entry.sheenUrl = sheen;
        surface.style.setProperty('--lg-surface-radius', `${radius}px`);
        surface.style.setProperty('--lg-surface-corner', corner);
        surface.setAttribute('data-lg-lens', '');
        entry.bent = -1;
        render(entry);
      };

      // Redrawing the maps costs several milliseconds, too much for every frame of a panel
      // drag. The current ones stretch to fit until the size settles.
      const resize = new ResizeObserver((entries) => {
        for (const item of entries) {
          const entry = lenses.get(item.target);
          if (!entry) continue;
          grow(entry);
          const { clientWidth: width, clientHeight: height } = item.target;
          const reach = entry.reach ?? 0;
          for (const element of [entry.filter, entry.filter.querySelector('feImage')]) {
            element?.setAttribute('width', String(width + 2 * reach));
            element?.setAttribute('height', String(height + 2 * reach));
          }
          clearTimeout(entry.timer);
          // Drawing new maps holds the main thread for 30-40 ms. While the glass is following a
          // new line it waits until the glass has arrived, so the motion has no stall in it.
          const settle = Math.max(60, (entry.growUntil ?? 0) - performance.now() + 20);
          entry.timer = setTimeout(() => build(item.target, entry), settle);
        }
      });
      const INLINE = ['--lg-lens', '--lg-lens-reach', '--lg-sheen-map', '--lg-surface-radius', '--lg-surface-corner', '--lg-light-x', '--lg-light-y', '--lg-sheen-boost', 'scale'];
      const attach = (surface) => {
        if (lenses.has(surface)) return ensureLayers(surface);
        const kind = SURFACES.find((candidate) => surface.matches(candidate.selector));
        if (!kind) return;
        const filter = document.createElementNS(SVG_NS, 'filter');
        filter.id = `lg-lens-${++serial}`;
        svg.append(filter);
        const entry = { surface, kind, filter, key: '', timer: 0, scale: 0, limit: 0, passes: [], bent: -1, light: [...REST], aim: [...REST], written: '' };
        lenses.set(surface, entry);
        surface.setAttribute('data-lg-surface', kind.name);
        resize.observe(surface);
        build(surface, entry);
        if (kind.name === 'menu') bud(entry);
      };
      const detach = (surface) => {
        const entry = lenses.get(surface);
        if (!entry) return;
        resize.unobserve(surface);
        clearTimeout(entry.timer);
        entry.squash?.cancel();
        entry.glow?.cancel();
        cancelAll(entry.grow);
        cancelAll(entry.bud);
        surface.querySelector(':scope > [data-lg-sheen] > u')?.remove();
        entry.filter.remove();
        lenses.delete(surface);
        for (const layer of surface.querySelectorAll(':scope > :is([data-lg-glass], [data-lg-sheen])')) layer.remove();
        for (const name of INLINE) surface.style.removeProperty(name);
        surface.removeAttribute('data-lg-lens');
        surface.removeAttribute('data-lg-surface');
        if (pressed === surface) pressed = null;
        if (pointer?.surface === surface) pointer = null;
      };
      const scan = () => {
        const found = new Set(document.querySelectorAll(SURFACE_SELECTOR));
        for (const surface of found) attach(surface);
        for (const surface of [...lenses.keys()]) if (!found.has(surface) || !surface.isConnected) detach(surface);
      };
      let pending = 0;
      const added = new Set();
      const repair = new Set();
      let removed = false;
      const LAYERS = '[data-lg-glass], [data-lg-sheen]';
      const owned = (node) => node === svg || svg.contains(node) || !!node.closest(LAYERS);
      const flush = () => {
        pending = 0;
        // Only a few surfaces are tracked, regardless of the transcript's length.
        if (removed) for (const surface of [...lenses.keys()]) {
          if (!surface.isConnected || !surface.matches(SURFACE_SELECTOR)) detach(surface);
        }
        removed = false;
        for (const root of added) {
          if (!root.isConnected || owned(root)) continue;
          // A parent and its children can arrive in different records in one frame.
          let parent = root.parentElement;
          while (parent && !added.has(parent)) parent = parent.parentElement;
          if (parent) continue;
          if (root.matches(SURFACE_SELECTOR)) attach(root);
          for (const surface of root.querySelectorAll(SURFACE_SELECTOR)) attach(surface);
        }
        added.clear();
        for (const surface of repair) if (surface.isConnected && lenses.has(surface)) ensureLayers(surface);
        repair.clear();
      };
      const observer = new MutationObserver((records) => {
        for (const record of records) {
          const target = record.target;
          // Filter/map writes and our glass layers never introduce shell surfaces.
          if (!(target instanceof Element) || owned(target)) continue;
          for (const node of record.addedNodes) if (node instanceof Element && !owned(node)) added.add(node);
          for (const node of record.removedNodes) {
            if (!(node instanceof Element)) continue;
            if (lenses.has(target) && node.matches(LAYERS)) repair.add(target);
            else if (!node.matches(LAYERS) && node !== svg) removed = true;
          }
        }
        // A menu gets its glass before its first frame, not one or more frames later: until then
        // the shell's own flat material showed, and the change to glass read as a second pane.
        // The shell adds each menu straight to body as the material itself, so no subtree is
        // searched for it, and streaming text pays nothing for this.
        if ([...added].some((node) => node.isConnected && node.matches('[data-menu-material]'))) {
          cancelAnimationFrame(pending);
          flush();
          return;
        }
        if (!pending && (added.size || repair.size || removed)) pending = requestAnimationFrame(flush);
      });
      observer.observe(document.body, { childList: true, subtree: true });
      // The middle's frosting differs between light and dark.
      const theme = new MutationObserver(() => { for (const [surface, entry] of lenses) build(surface, entry); });
      theme.observe(document.body, { attributes: true, attributeFilter: ['data-ds-dark-theme'] });

      /* Light and press. One light, above and a little to the left, for every surface; the one
         under the pointer leans it towards the pointer. A press is a damped spring: the surface
         squashes or swells, the sheen brightens, the rim bends harder and the light gathers at
         the press; on release it overshoots a touch and settles. */
      const REST = [-0.38, -0.92];
      const spring = { value: 0, velocity: 0, target: 0, surface: null };
      let pressed = null;
      let pointer = null;
      let frame = 0;
      let last = 0;
      const still = () => reducedMotion.matches || !finePointer.matches;
      const aimFor = (entry) => {
        const focus = pressed ?? pointer?.surface;
        if (entry.surface !== focus || !pointer || still()) return REST;
        const box = entry.surface.getBoundingClientRect();
        const pull = 1 + (spring.surface === entry.surface ? spring.value : 0);
        const vx = Math.max(-1, Math.min(1, (pointer.x - (box.left + box.width / 2)) / (box.width / 2))) * pull;
        const vy = Math.max(-1, Math.min(1, (pointer.y - (box.top + box.height / 2)) / (box.height / 2))) * pull;
        const x = REST[0] * 0.55 + vx;
        const y = REST[1] * 0.55 + vy;
        const len = Math.hypot(x, y) || 1;
        return [x / len, y / len];
      };
      const render = (entry) => {
        const { surface } = entry;
        // The light and the press boost go on the sheen layer, the only thing that reads them.
        // Written on the surface they were inherited by everything inside it, and the composer's
        // whole subtree was restyled every frame: 8 ms of a 240 Hz display's 4.2 ms frame.
        let sheen = entry.sheen;
        if (!sheen?.isConnected || sheen.parentElement !== surface) {
          sheen = entry.sheen = surface.querySelector(':scope > [data-lg-sheen]');
          entry.written = '';
        }
        const lightKey = `${entry.light[0].toFixed(3)},${entry.light[1].toFixed(3)}`;
        if (sheen && entry.written !== lightKey) {
          entry.written = lightKey;
          sheen.style.setProperty('--lg-light-x', entry.light[0].toFixed(3));
          sheen.style.setProperty('--lg-light-y', entry.light[1].toFixed(3));
        }
        // The squash itself is played on the compositor by squash(); the spring here only
        // brightens the sheen and bends the rim harder in step with it.
        const p = spring.surface === surface ? spring.value : 0;
        if (Math.abs(p) > 0.001 && entry.kind.press) {
          sheen?.style.setProperty('--lg-sheen-boost', (1 + 0.35 * p).toFixed(3));
          entry.pressing = true;
        } else if (entry.pressing) {
          entry.pressing = false;
          sheen?.style.removeProperty('--lg-sheen-boost');
        }
        const bent = Math.min(1 + 0.25 * p, entry.limit / Math.max(entry.scale, 0.001));
        if (entry.bent !== bent) {
          entry.bent = bent;
          for (const [element, strength] of entry.passes) element.setAttribute('scale', (entry.scale * strength * bent).toFixed(1));
        }
      };
      const tick = (now) => {
        frame = 0;
        const dt = Math.min(Math.max((now - last) / 1000, 0), 1 / 30);
        last = now;
        const ease = 1 - Math.exp(-dt / 0.09);
        // Same damping as the CSS spring; the analytic step also behaves consistently at
        // 60/120/165 Hz, without Euler integration changing the feel with the refresh rate.
        stepSpring(spring, dt);
        const settled = Math.abs(spring.value - spring.target) < 0.002 && Math.abs(spring.velocity) < 0.01;
        if (settled) { spring.value = spring.target; spring.velocity = 0; }
        let resting = settled;
        // Every layout read before any write: a read after a write makes the browser restyle
        // there and then, once per surface, instead of once for the frame.
        const aims = [];
        for (const entry of lenses.values()) aims.push(aimFor(entry));
        let index = 0;
        for (const entry of lenses.values()) {
          const aim = aims[index++];
          entry.light[0] += (aim[0] - entry.light[0]) * ease;
          entry.light[1] += (aim[1] - entry.light[1]) * ease;
          if (Math.hypot(aim[0] - entry.light[0], aim[1] - entry.light[1]) >= 0.002) resting = false;
          render(entry);
        }
        if (settled && spring.target === 0) spring.surface = null;
        if (!resting) frame = requestAnimationFrame(tick);
        else last = 0;
      };
      const wake = () => {
        if (frame) return;
        last = performance.now();
        frame = requestAnimationFrame(tick);
      };
      const surfaceAt = (event) => {
        const found = event.target instanceof Element ? event.target.closest(SURFACE_SELECTOR) : null;
        return found && lenses.has(found) ? found : null;
      };

      /* Liquid behaviour, all on the compositor, so it keeps the display's rate while the shell
         works. calm() is reduced motion or the motion setting at off. */
      const calm = () => reducedMotion.matches || options.motion() <= 0;
      const layersOf = (surface) => [...surface.querySelectorAll(':scope > :is([data-lg-glass], [data-lg-sheen])')];
      const cancelAll = (list) => { for (const animation of list ?? []) animation.cancel(); };

      // Surface tension: in quickly and without a rebound, like a finger meeting a liquid's skin;
      // out on a looser spring that runs past rest once and gathers itself.
      const PRESS_IN = springCurve(0.16, 0.9);
      const PRESS_OUT = springCurve(0.42, 0.5);
      const squash = (entry, on) => {
        const { surface } = entry;
        if (typeof surface.animate !== 'function') return;
        const now = getComputedStyle(surface).scale;
        entry.squash?.cancel();
        entry.squash = null;
        const m = Math.min(Math.max(0, options.motion()), 1.6);
        const to = !on ? '1' : entry.kind.press === 'swell'
          ? `${(1 + 0.03 * Math.min(m, 1.2)).toFixed(4)}`
          : `${(1 + 0.005 * m).toFixed(4)} ${(1 - 0.012 * m).toFixed(4)}`;
        const from = now === 'none' ? '1' : now;
        if (from === to) return;
        const curve = on ? PRESS_IN : PRESS_OUT;
        entry.squash = surface.animate([{ scale: from }, { scale: to }], { duration: curve.duration * 1000, easing: curve.easing, fill: on ? 'forwards' : 'none' });
        entry.squash.finished.catch(() => {});
      };

      // Light gathering under the finger, inside the glass, then spreading out and fading on
      // release, as a press on a water-filled skin would. Reduced motion keeps the light, not the
      // spread.
      const BLOOM_IN = springCurve(0.3, 0.9);
      const bloom = (entry, at) => {
        const sheen = entry.surface.querySelector(':scope > [data-lg-sheen]');
        if (!sheen || typeof sheen.animate !== 'function') return;
        let glow = sheen.querySelector(':scope > u');
        if (!glow) { glow = document.createElement('u'); sheen.append(glow); }
        const spread = !reducedMotion.matches;
        if (at) {
          entry.glow?.cancel();
          const box = entry.surface.getBoundingClientRect();
          const size = Math.min(320, Math.max(80, box.height * 2.4));
          glow.style.left = `${at.x - box.left}px`;
          glow.style.top = `${at.y - box.top}px`;
          glow.style.width = `${size}px`;
          glow.style.height = `${size}px`;
          entry.glow = glow.animate(spread ? [{ opacity: 0, transform: 'scale(.35)' }, { opacity: 1, transform: 'scale(1)' }] : [{ opacity: 0 }, { opacity: 1 }],
            { duration: BLOOM_IN.duration * 1000, easing: BLOOM_IN.easing, fill: 'forwards' });
        } else {
          if (!entry.glow) return;
          const look = getComputedStyle(glow);
          const from = { opacity: look.opacity, transform: look.transform === 'none' ? 'scale(1)' : look.transform };
          entry.glow.cancel();
          entry.glow = glow.animate([from, spread ? { opacity: 0, transform: 'scale(1.3)' } : { opacity: 0, transform: from.transform }],
            { duration: 420, easing: 'cubic-bezier(.2, .7, .3, 1)' });
          const fading = entry.glow;
          fading.finished.then(() => { if (entry.glow === fading) entry.glow = null; }, () => {});
        }
      };

      // A drop filling up: when the composer gains or loses a line its glass follows on the
      // liquid spring from the edge that stayed put, instead of jumping to the new height.
      const GROW = springCurve(0.34, 0.72);
      const grow = (entry) => {
        const { surface } = entry;
        const box = { width: surface.offsetWidth, height: surface.offsetHeight, top: surface.offsetTop };
        const was = entry.box;
        entry.box = box;
        if (!was || entry.kind.name !== 'composer' || calm() || !box.height || Math.abs(was.width - box.width) > 0.5) return;
        if (Math.abs(box.height - was.height) < 2) return;
        const layers = layersOf(surface);
        if (!layers.length || typeof layers[0].animate !== 'function') return;
        // From where the glass is drawn now, should it still be catching up with the last line.
        let drawn = was.height;
        if (entry.grow?.[0]?.playState === 'running') drawn = was.height * new DOMMatrixReadOnly(getComputedStyle(layers[0]).transform).d;
        cancelAll(entry.grow);
        // Growing keeps something where it was: the foot in a conversation, the middle on the
        // centred start page, or the head. When none of them stays, the card is travelling (the
        // first message carries it from the start page to its seat), and that has its own motion.
        const footMoved = Math.abs(box.top + box.height - was.top - was.height);
        const headMoved = Math.abs(box.top - was.top);
        const middleMoved = Math.abs(box.top + box.height / 2 - was.top - was.height / 2);
        const steady = Math.min(footMoved, headMoved, middleMoved);
        if (steady > 1) return;
        const origin = steady === footMoved ? '50% 100%' : steady === headMoved ? '50% 0%' : '50% 50%';
        // The origin as a style, not a keyframe, so the compositor can run it.
        for (const layer of layers) layer.style.transformOrigin = origin;
        const frames = [{ transform: `scaleY(${(drawn / box.height).toFixed(4)})` }, { transform: 'none' }];
        entry.grow = layers.map((layer) => layer.animate(frames, { duration: GROW.duration * 1000, easing: GROW.easing }));
        entry.growUntil = performance.now() + GROW.duration * 1000;
      };

      // A menu pours out of the control that opened it: its glass, and the shadow the glass now
      // carries, start as that control's shape and fill out to the menu, the axis it pours along
      // leading. Only the glass moves; the items stay put and sharp, as they always have.
      let trigger = null;
      const noteTrigger = (event) => {
        const control = event.button === 0 && event.target instanceof Element ? event.target.closest('button, [role="button"], [role="combobox"]') : null;
        trigger = control ? { at: performance.now(), box: control.getBoundingClientRect() } : null;
      };
      const BUD_LEAD = springCurve(0.24, 0.74);
      const BUD_TRAIL = springCurve(0.36, 0.8);
      const bud = (entry) => {
        if (calm() || !trigger || performance.now() - trigger.at > 600) return;
        const menu = entry.surface.getBoundingClientRect();
        const t = trigger.box;
        const gap = Math.hypot(Math.max(menu.left - t.right, t.left - menu.right, 0), Math.max(menu.top - t.bottom, t.top - menu.bottom, 0));
        const layers = layersOf(entry.surface);
        if (gap > 24 || !menu.width || !menu.height || !layers.length || typeof layers[0].animate !== 'function') return;
        trigger = null;
        // The first frame is the control's own box: from the menu's corner, shifted onto the
        // control and scaled to its size; each axis then opens on its spring.
        const sx = Math.min(1, Math.max(0.06, t.width / menu.width));
        const sy = Math.min(1, Math.max(0.06, t.height / menu.height));
        const dx = t.left - menu.left;
        const dy = t.top - menu.top;
        const vertical = menu.top >= t.bottom - 1 || menu.bottom <= t.top + 1;
        const duration = Math.max(BUD_LEAD.duration, BUD_TRAIL.duration);
        const steps = 40;
        const frames = [];
        for (let i = 0; i <= steps; i++) {
          const time = (duration * i) / steps;
          const lead = BUD_LEAD.at(time);
          const follow = BUD_TRAIL.at(time);
          const px = vertical ? follow : lead;
          const py = vertical ? lead : follow;
          frames.push({
            offset: i / steps,
            transform: i === steps ? 'none'
              : `translate(${(dx * (1 - px)).toFixed(2)}px, ${(dy * (1 - py)).toFixed(2)}px) scale(${(sx + (1 - sx) * px).toFixed(4)}, ${(sy + (1 - sy) * py).toFixed(4)})`,
          });
        }
        cancelAll(entry.bud);
        // The origin as a style, not a keyframe, so the compositor can run it.
        for (const layer of layers) layer.style.transformOrigin = '0 0';
        entry.bud = layers.map((layer) => layer.animate(frames, { duration: duration * 1000, easing: 'linear' }));
      };
      const onMove = (event) => {
        if (event.pointerType !== 'mouse') return;
        const surface = surfaceAt(event);
        if (surface) pointer = { surface, x: event.clientX, y: event.clientY };
        else if (pressed) pointer = { surface: pressed, x: event.clientX, y: event.clientY };
        else if (pointer) pointer = null;
        else return;
        wake();
      };
      const onDown = (event) => {
        if (event.button !== 0) return;
        const surface = surfaceAt(event);
        if (!surface) return;
        const { kind } = lenses.get(surface);
        if (!kind.press) return;
        if (kind.pressOn === 'surface' && event.target.closest('button, a, [role="button"], [role="menuitem"]')) return;
        pressed = surface;
        spring.surface = surface;
        pointer = { surface, x: event.clientX, y: event.clientY };
        if (!still() && options.motion() > 0) {
          spring.target = 1;
          const entry = lenses.get(surface);
          squash(entry, true);
          bloom(entry, { x: event.clientX, y: event.clientY });
        }
        wake();
      };
      const onUp = () => {
        if (!pressed) return;
        const entry = lenses.get(pressed);
        pressed = null;
        spring.target = 0;
        if (entry) { squash(entry, false); bloom(entry, null); }
        wake();
      };
      const onLeave = (event) => { if (!event.relatedTarget && !pressed) { pointer = null; wake(); } };
      document.addEventListener('pointermove', onMove, { passive: true });
      document.addEventListener('pointerdown', noteTrigger, { capture: true, passive: true });
      document.addEventListener('pointerdown', onDown, { passive: true });
      document.addEventListener('pointerup', onUp, { passive: true });
      document.addEventListener('pointercancel', onUp, { passive: true });
      document.addEventListener('pointerout', onLeave, { passive: true });
      window.addEventListener('blur', onUp);
      scan();
      return {
        refresh() {
          for (const [surface, entry] of lenses) build(surface, entry);
        },
        dispose() {
          observer.disconnect();
          theme.disconnect();
          cancelAnimationFrame(pending);
          added.clear();
          repair.clear();
          cancelAnimationFrame(frame);
          resize.disconnect();
          document.removeEventListener('pointermove', onMove);
          document.removeEventListener('pointerdown', noteTrigger, { capture: true });
          document.removeEventListener('pointerdown', onDown);
          document.removeEventListener('pointerup', onUp);
          document.removeEventListener('pointercancel', onUp);
          document.removeEventListener('pointerout', onLeave);
          window.removeEventListener('blur', onUp);
          for (const surface of [...lenses.keys()]) detach(surface);
          svg.remove();
          for (const cached of maps.values()) URL.revokeObjectURL(cached.sheen);
          maps.clear();
        },
      };
    }

    /** The composer's highlight follows the pointer. */
    function mountHighlight() {
      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
      const reducedTransparency = window.matchMedia('(prefers-reduced-transparency: reduce)');
      const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
      let frame = 0;
      let current = null;
      let painted = null;
      let x = 0;
      let y = 0;
      const clean = (element) => {
        element?.style.removeProperty('--lg-x');
        element?.style.removeProperty('--lg-y');
        element?.style.removeProperty('transform');
      };
      const reset = () => {
        if (frame) cancelAnimationFrame(frame);
        frame = 0;
        clean(painted);
        painted = null;
        current = null;
      };
      const paintHighlight = () => {
        frame = 0;
        if (!current?.isConnected) return reset();
        // With the lens on, the glint is its own composited element in the sheen, moved by a
        // transform: nothing is restyled or repainted but it. Without the lens the card's own
        // ::before paints it from --lg-x and --lg-y on the card.
        const glint = current.querySelector(':scope[data-lg-lens] > [data-lg-sheen] > s');
        const target = glint ?? current;
        if (painted && painted !== target) clean(painted);
        painted = target;
        // One layout read per frame, followed by the style writes.
        const rect = current.getBoundingClientRect();
        if (glint) {
          glint.style.transform = `translate(${(x - rect.left - rect.width / 2).toFixed(1)}px, ${(y - rect.top).toFixed(1)}px)`;
          return;
        }
        target.style.setProperty('--lg-x', `${Math.round(x - rect.left)}px`);
        target.style.setProperty('--lg-y', `${Math.round(y - rect.top)}px`);
      };
      const onMove = (event) => {
        if (reducedMotion.matches || reducedTransparency.matches || !finePointer.matches || event.pointerType !== 'mouse') return;
        const target = event.target instanceof Element ? event.target.closest('[data-composer-card]') : null;
        if (!target) return reset();
        if (target !== current) { reset(); current = target; }
        x = event.clientX;
        y = event.clientY;
        if (!frame) frame = requestAnimationFrame(paintHighlight);
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
    }

    /**
     * DSH 0.2.2-rc.1 positions the workspace picker with getAnchorRect, but passes
     * no anchor element to Menu. Its document pointerdown handler therefore closes
     * the picker on its own button; the button's later click toggles it open again.
     * Keep that one press inside the trigger, leaving its click and keyboard toggle
     * to DSH. Attach on the trigger during capture so other document capture listeners
     * (including animation origins) still run normally. No observers or polling.
     */
    function mountWorkspaceToggle() {
      const TRIGGER = "[class*='_heroWorkspaceRow'] > button[aria-haspopup='menu']";
      let pending = null;
      const keepInside = (event) => { pending = null; event.stopPropagation(); };
      const onDown = (event) => {
        pending?.removeEventListener('pointerdown', keepInside);
        pending = null;
        if (event.button !== 0 || !(event.target instanceof Element)) return;
        const trigger = event.target.closest(TRIGGER);
        if (trigger?.getAttribute('aria-expanded') !== 'true') return;
        pending = trigger;
        trigger.addEventListener('pointerdown', keepInside, { once: true });
      };
      document.addEventListener('pointerdown', onDown, { capture: true, passive: true });
      return () => {
        document.removeEventListener('pointerdown', onDown, { capture: true });
        pending?.removeEventListener('pointerdown', keepInside);
        pending = null;
      };
    }

    /** Surfaces grow slightly once; DSH owns their dismiss/replace lifecycle. Never resurrect
        removed React nodes: a native fade has already finished by the time they unmount. */
    function mountOrigin() {
      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
      const SURFACES = "[data-menu-material], [role='dialog']";
      const surfaces = new Map();
      const pending = new Set();
      let frame = 0;
      let press = null;
      const still = () => reducedMotion.matches || document.documentElement.dataset.lgMotion === 'off';
      const onDown = (event) => {
        if (event.button !== 0) return;
        const trigger = event.target instanceof Element ? event.target.closest('button, [role="button"], [role="combobox"]') : null;
        press = { at: performance.now(), box: trigger?.getBoundingClientRect() ?? null };
      };
      const onKey = () => { press = null; };
      const restore = (surface, entry) => {
        entry.animation?.cancel();
        surface.style.transformOrigin = entry.origin;
        surface.removeAttribute('data-lg-origin');
        pending.delete(surface);
        surfaces.delete(surface);
      };
      const place = (surface, entry) => {
        if (entry.placed || !surface.isConnected) return;
        if (/^(dismiss|replace)$/.test(surface.getAttribute('data-menu-phase') ?? '')) {
          pending.delete(surface);
          return;
        }
        const box = surface.getBoundingClientRect();
        // Hidden/zero-sized portals are retried; being observed is not being placed.
        if (!surface.offsetWidth || !surface.offsetHeight || !box.width || !box.height) return;
        entry.placed = true;
        pending.delete(surface);
        const from = entry.press?.box;
        const fresh = entry.press && performance.now() - entry.press.at < 600;
        const gap = from ? Math.hypot(Math.max(box.left - from.right, from.left - box.right, 0), Math.max(box.top - from.bottom, from.top - box.bottom, 0)) : Infinity;
        surface.style.transformOrigin = fresh && gap <= 24
          ? `${Math.round(Math.max(0, Math.min(box.width, from.left + from.width / 2 - box.left)))}px ${Math.round(Math.max(0, Math.min(box.height, from.top + from.height / 2 - box.top)))}px`
          : '50% 50%';
        if (still() || typeof surface.animate !== 'function') return;
        const { easing, ms } = appleSpring();
        const amount = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--lg-motion')) || 1;
        // A small uniform scale keeps text readable even when the trigger is tiny.
        // Native menu phases fade their own content; no second opacity track or hidden hold.
        entry.animation = surface.animate([{ scale: String(1 - .015 * amount) }, { scale: '1' }], { duration: Math.min(ms, 200), easing });
        entry.animation.finished.catch(() => {});
      };
      const retry = () => {
        frame = 0;
        for (const surface of pending) {
          const entry = surfaces.get(surface);
          if (!surface.isConnected) { restore(surface, entry); continue; }
          place(surface, entry);
          if (performance.now() >= entry.until) pending.delete(surface);
        }
        if (pending.size) frame = requestAnimationFrame(retry);
      };
      const add = (surface) => {
        let entry = surfaces.get(surface);
        if (!entry) {
          entry = { origin: surface.style.transformOrigin, animation: null, placed: false, press, until: performance.now() + 300 };
          surfaces.set(surface, entry);
          // Suppress the CSS fallback before the first paint, not at animationstart a frame later.
          surface.setAttribute('data-lg-origin', '');
        }
        place(surface, entry);
        if (!entry.placed && !/^(dismiss|replace)$/.test(surface.getAttribute('data-menu-phase') ?? '')) pending.add(surface);
        if (pending.size && !frame) frame = requestAnimationFrame(retry);
      };
      const visit = (node, fn) => {
        if (!(node instanceof HTMLElement)) return;
        if (node.matches(SURFACES)) fn(node);
        for (const surface of node.querySelectorAll(SURFACES)) fn(surface);
      };
      const observer = new MutationObserver((records) => {
        for (const record of records) {
          if (record.type === 'attributes') { add(record.target); continue; }
          for (const node of record.addedNodes) visit(node, add);
        }
        // A remove+add in one batch is a DOM move, not a dismiss.
        for (const [surface, entry] of surfaces) if (!surface.isConnected) restore(surface, entry);
      });
      observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['data-menu-phase'] });
      document.addEventListener('pointerdown', onDown, { capture: true, passive: true });
      document.addEventListener('keydown', onKey, true);
      return () => {
        observer.disconnect();
        cancelAnimationFrame(frame);
        document.removeEventListener('pointerdown', onDown, { capture: true });
        document.removeEventListener('keydown', onKey, true);
        for (const [surface, entry] of surfaces) restore(surface, entry);
      };
    }

    /**
     * The view tabs' thumb is a drop of glass, not a sliding block. Anchor positioning puts it on
     * the new tab at once; this plays the journey on its ::before as a transform sampled from
     * dropletFrames, so it runs on the compositor at the display's rate while the shell renders
     * the new view (a left/width transition ran on the main thread, behind that work). A change
     * mid-way starts from where the thumb is drawn, not from where it was going.
     */
    function mountDroplet() {
      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
      const TABS = '[data-conversation-tabs]';
      const off = () => reducedMotion.matches || document.documentElement.dataset.lgMotion === 'off';
      const amount = () => MOTION[document.documentElement.dataset.lgMotion]?.[0] ?? 1;
      const placed = new WeakMap();
      const running = new WeakMap();
      const measure = (tabs) => {
        const tab = tabs.querySelector(":scope > [role='tab'][aria-selected='true']");
        if (!tab) return null;
        const outer = tabs.getBoundingClientRect();
        const box = tab.getBoundingClientRect();
        return box.width ? { start: box.left - outer.left, size: box.width } : null;
      };
      // Where the thumb is drawn now: its final box under whatever transform is playing.
      const drawn = (tabs) => {
        const run = running.get(tabs);
        if (!run || run.animation.playState !== 'running') return placed.get(tabs) ?? null;
        const m = new DOMMatrixReadOnly(getComputedStyle(tabs, '::before').transform);
        return { start: run.to.start + m.e, size: run.to.size * m.a };
      };
      const remember = (tabs) => { if (!placed.has(tabs) && !running.has(tabs)) { const box = measure(tabs); if (box) placed.set(tabs, box); } };
      const move = (tabs) => {
        const to = measure(tabs);
        if (!to) return;
        const from = drawn(tabs);
        running.get(tabs)?.animation.cancel();
        running.delete(tabs);
        placed.set(tabs, to);
        if (!from || off() || typeof tabs.animate !== 'function') return;
        if (Math.abs(from.start - to.start) < 0.5 && Math.abs(from.size - to.size) < 0.5) return;
        // The bar scrolls sideways when narrow, so the drop must stay inside its padding box: a
        // rebound past the end showed a scrollbar for a moment and cut the thumb off.
        const { frames, duration } = dropletFrames(from, to, amount(), 60, { min: 0, max: tabs.clientWidth });
        // Transform only: the origin is static in the sheet, because transform-origin in a keyframe
        // cannot run on the compositor and takes the whole animation to the main thread with it.
        const animation = tabs.animate(frames.map((f) => ({
          offset: f.offset,
          transform: `translateX(${f.shift.toFixed(2)}px) scale(${f.along.toFixed(4)}, ${f.across.toFixed(4)})`,
        })), { pseudoElement: '::before', duration: duration * 1000, easing: 'linear' });
        running.set(tabs, { animation, to });
        animation.finished.then(() => { if (running.get(tabs)?.animation === animation) running.delete(tabs); }, () => {});
      };
      // The thumb's box before a change: a tab bar seen for the first time has none yet.
      const before = (event) => {
        const tabs = event.target instanceof Element ? event.target.closest(TABS) : null;
        if (tabs) remember(tabs);
      };
      for (const tabs of document.querySelectorAll(TABS)) remember(tabs);
      const observer = new MutationObserver((records) => {
        const moved = new Set();
        for (const record of records) {
          const tabs = record.target.parentElement;
          if (tabs?.matches(TABS) && record.target.getAttribute('aria-selected') === 'true') moved.add(tabs);
        }
        for (const tabs of moved) move(tabs);
      });
      observer.observe(document.body, { subtree: true, attributes: true, attributeFilter: ['aria-selected'] });
      document.addEventListener('pointerdown', before, { capture: true, passive: true });
      document.addEventListener('keydown', before, true);
      return () => {
        observer.disconnect();
        document.removeEventListener('pointerdown', before, { capture: true });
        document.removeEventListener('keydown', before, true);
        for (const tabs of document.querySelectorAll(TABS)) running.get(tabs)?.animation.cancel();
      };
    }

    /**
     * The first message of a session. The shell swaps the start page for the conversation in a
     * single frame: the composer jumps to the bottom, the title is gone, the messages are there.
     * It keeps the same elements through the swap, so this plays it as one movement instead. The
     * glass falls from where it was to its seat on the spring, the title and the row above it
     * fade away, the messages rise in behind it, and the water feels it: koi-pond listens for
     * dsh-glass:splash, and without that bundle the event simply goes unheard.
     *
     * A send is only known once the phase changes, and by then the old position and the title
     * are gone, so the position is noted and the title copied when a send is asked for. A press
     * that sends nothing, an empty composer, leaves them to expire.
     */
    /**
     * The composer floats over the conversation, and its glass answers what is behind it. A scroll
     * position says so without reading any pixels: at the bottom the last turn ends above the card,
     * and any further up there is text under it. Only the composer: the header's controls sit over
     * the top of the sheet, where nothing passes behind them.
     */
    function mountDepth() {
      const PANES = "[class*='an3WzG_scrollBody'], [class*='xeixwq_tablePane']";
      /** A little short of the bottom still counts as the bottom. */
      const EDGE = 24;
      /** Changing session and a growing reply move the content without any scroll. */
      const LOOK_MS = 500;
      let frame = 0;
      const check = () => {
        frame = 0;
        const card = document.querySelector('[data-composer-card]');
        if (!card) return;
        const over = [...document.querySelectorAll(PANES)].some((pane) => pane.scrollHeight - pane.scrollTop - pane.clientHeight > EDGE);
        card.toggleAttribute('data-lg-over', over);
      };
      const onScroll = () => {
        if (!frame) frame = requestAnimationFrame(check);
      };
      const timer = setInterval(() => {
        if (!document.hidden) check();
      }, LOOK_MS);
      document.addEventListener('scroll', onScroll, { capture: true, passive: true });
      return () => {
        clearInterval(timer);
        cancelAnimationFrame(frame);
        document.removeEventListener('scroll', onScroll, { capture: true });
        document.querySelector('[data-composer-card]')?.removeAttribute('data-lg-over');
      };
    }

    /**
     * Koi swim out from under what is being written. Only with words in the composer, not on
     * focus: DSH focuses it by itself, and koi reading through an idle sheet of glass are the point
     * of the glass.
     */
    function mountWriting() {
      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
      const NUDGE_MS = 900;
      let marked = null;
      let timer = 0;
      let lastNudge = -Infinity;
      let queued = 0;
      const still = () => reducedMotion.matches || document.documentElement.dataset.lgMotion === 'off';
      const written = (card) => {
        const editor = card.querySelector("[contenteditable='true'], textarea");
        return !!editor && (editor.value ?? editor.textContent).trim() !== '';
      };
      const mark = (card) => {
        if (marked === card) return;
        marked?.removeAttribute('data-koi-steer');
        card?.setAttribute('data-koi-steer', '');
        marked = card;
      };
      // Sending empties the editor without an input event, so keep looking while it holds words.
      const watch = () => {
        if (!marked?.isConnected || !written(marked) || still()) mark(null);
        if (!marked) {
          clearInterval(timer);
          timer = 0;
        }
      };
      const felt = (card) => {
        queued = 0;
        if (still()) return;
        mark(written(card) ? card : null);
        if (marked) timer ||= setInterval(watch, 400);
        const now = performance.now();
        if (!marked || now - lastNudge < NUDGE_MS) return;
        lastNudge = now;
        const { left, top, width, height } = card.getBoundingClientRect();
        window.dispatchEvent(new CustomEvent('dsh-glass:writing', { detail: { left, top, width, height } }));
      };
      // The editor takes a first character in beforeinput and never sends input for it, and the
      // text is only there a moment later, so look on the next frame.
      const onInput = (event) => {
        const card = event.target instanceof Element ? event.target.closest('[data-composer-card]') : null;
        if (card && !queued) queued = requestAnimationFrame(() => felt(card));
      };
      document.addEventListener('beforeinput', onInput, true);
      document.addEventListener('input', onInput, true);
      return () => {
        document.removeEventListener('beforeinput', onInput, true);
        document.removeEventListener('input', onInput, true);
        cancelAnimationFrame(queued);
        clearInterval(timer);
        mark(null);
      };
    }

    /* Motion has four tiers, and everything moves on one of them.
         instant  --glass-instant, .1s: hover and colour, no spring.
         control  --glass-control, .2s: a state changing in place.
         spring   --glass-spring-duration on --glass-spring: switches and surfaces. The one
                  tier the motion setting changes.
         page     at most PAGE_MS: the page itself changing, so never stretched by that setting.
                  Parts of a page ride along on RISE for PART_MS, without a delayed start.
       DSH owns menu dismissal; the theme never reattaches removed surfaces for a second exit.
       Frequent actions get the short version or none. Typing gets none. */
    const PAGE_MS = 260;
    const PART_MS = 160;
    const RISE = 'cubic-bezier(.22, 1, .36, 1)';

    /** The theme's spring as an easing, and its length in ms under the motion setting. */
    function appleSpring() {
      const style = getComputedStyle(document.documentElement);
      const easing = (style.getPropertyValue('--glass-spring') || getComputedStyle(document.body).getPropertyValue('--glass-spring')).trim() || 'ease-out';
      return { easing, ms: (parseFloat(style.getPropertyValue('--glass-spring-duration')) || 0.2) * 1000 };
    }

    /**
     * Liquid motion. Glass that moves like a liquid has surface tension: it gives a little, runs
     * past where it is going and gathers itself in one soft rebound, never a bounce. Each spring is
     * sampled once into a linear() easing or into keyframes, so the compositor plays it at the
     * display's full rate with no script per frame, whatever the shell is doing.
     *   response   period in seconds
     *   damping    ratio; .7 runs about 4.6% past and comes back once
     */
    const liquidCurves = new Map();
    function springCurve(response, damping, steps = 48) {
      const key = `${response}/${damping}/${steps}`;
      let curve = liquidCurves.get(key);
      if (curve) return curve;
      const omega = (2 * Math.PI) / response;
      const decay = damping * omega;
      const turn = omega * Math.sqrt(Math.max(1e-6, 1 - damping * damping));
      const at = (t) => (t <= 0 ? 0 : 1 - Math.exp(-decay * t) * (Math.cos(turn * t) + (decay / turn) * Math.sin(turn * t)));
      // Over once what is left is under a thousandth of the way.
      const duration = Math.log(1000) / decay;
      const values = Array.from({ length: steps + 1 }, (_, i) => (i === steps ? 1 : at((duration * i) / steps)));
      curve = { at, duration, easing: `linear(${values.map((v) => +v.toFixed(4)).join(', ')})` };
      liquidCurves.set(key, curve);
      return curve;
    }

    /**
     * A drop moving from one box to another along one axis: the leading edge rides a quick spring
     * and the trailing edge a slower one, so on the way it stretches and, keeping its volume,
     * thins; on arrival the leading edge runs a touch past and both settle. Boxes are { start,
     * size } on the moving axis. Returns keyframes against the final box with the transform origin
     * at its start: translate, scale along, scale across. amount 0 keeps it rigid. bounds { min,
     * max } is the wall it meets: the edge running past stops there and the drop flattens against
     * it, since a transform past a scrolling bar's edge would scroll it.
     */
    function dropletFrames(from, to, amount = 1, steps = 60, bounds = null) {
      const lead = springCurve(0.26, 0.72);
      const trail = springCurve(0.4, 0.8);
      const duration = Math.max(lead.duration, trail.duration);
      const forward = to.start + to.size / 2 >= from.start + from.size / 2;
      const frames = [];
      for (let i = 0; i <= steps; i++) {
        const t = (duration * i) / steps;
        const b = trail.at(t);
        const a = b + (lead.at(t) - b) * amount;
        const head = forward ? a : b;
        const tail = forward ? b : a;
        let start = from.start + (to.start - from.start) * tail;
        let end = from.start + from.size + (to.start + to.size - from.start - from.size) * head;
        if (bounds) {
          start = Math.max(start, bounds.min);
          end = Math.min(end, bounds.max);
        }
        const size = Math.max(1, end - start);
        // How much longer than it would be with both edges together, which it pays for in girth.
        const rest = from.size + (to.size - from.size) * b;
        const across = Math.min(1.06, Math.max(0.82, 1 - 0.35 * (size / Math.max(1, rest) - 1)));
        frames.push(i === steps
          ? { offset: 1, shift: 0, along: 1, across: 1 }
          : { offset: i / steps, shift: start - to.start, along: size / to.size, across });
      }
      return { frames, duration };
    }

    /** Analytic damped spring, matching the CSS curve's .8 damping ratio. */
    function stepSpring(spring, dt) {
      const omega = 30;
      const damping = .8;
      const frequency = omega * Math.sqrt(1 - damping * damping);
      const offset = spring.value - spring.target;
      const decay = Math.exp(-damping * omega * dt);
      const cosine = Math.cos(frequency * dt);
      const sine = Math.sin(frequency * dt);
      const tail = (spring.velocity + damping * omega * offset) / frequency;
      spring.value = spring.target + decay * (offset * cosine + tail * sine);
      spring.velocity = decay * (spring.velocity * cosine - (damping * omega * tail + frequency * offset) * sine);
    }

    /** One owner per page transition, including its snapshots and cancellation cleanup. */
    function createMotionPlayer() {
      let current = null;
      const cancel = () => {
        const running = current;
        if (!running) return;
        current = null;
        for (const animation of running.animations) animation.cancel();
        running.finish();
      };
      const play = (animations, tidy) => {
        cancel();
        let done = false;
        const running = {
          animations: animations.filter(Boolean),
          finish: () => {
            if (done) return;
            done = true;
            if (current === running) current = null;
            tidy?.();
          },
        };
        current = running;
        Promise.allSettled(running.animations.map((animation) => animation.finished)).then(running.finish);
      };
      return { play, cancel };
    }

    /** Cold start, first send, return home, sessions and settings share one motion owner.
        Input never changes playback speed. Navigation replaces the old transition immediately. */
    function mountEntry() {
      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
      const html = document.documentElement;
      const player = createMotionPlayer();
      const FRESH_MS = 1500;
      const NAV = "[data-slot='sidebar'], [data-slot^='sidebar.'], [data-conversation-tabs], a[href]";
      let intent = null;
      let timer = 0;
      let warmFrame = 0;
      let goneAt = 0;
      let disposed = false;
      const off = () => reducedMotion.matches || html.dataset.lgMotion === 'off';
      const lift = () => { delete html.dataset.lgEntry; };
      // Initial shell hydration is not navigation. Keep ownership until the whale has
      // handed over, unless the user actually navigates or the destination changes.
      const boot = document.querySelector('#dsh-boot');
      const bootStyle = boot ? getComputedStyle(boot) : null;
      const bootVisible = boot && (document.querySelector('[data-dsh-boot-spinner]')
        || bootStyle.display !== 'none' && bootStyle.visibility !== 'hidden');
      let booting = performance.getEntriesByType('navigation')[0]?.type === 'navigate'
        && !!bootVisible && !boot.dataset.lgBootClaimed && !off();
      if (booting) boot.dataset.lgBootClaimed = 'true';
      let bootRoot = null;
      const releaseBoot = () => { booting = false; bootRoot = null; lift(); };
      const read = () => {
        const main = document.querySelector('[data-slot="main"]');
        const root = main?.querySelector("[class*='an3WzG_root']") ?? null;
        const content = main?.firstElementChild;
        const selected = document.querySelector("[data-slot='sidebar'] [aria-selected='true'], [data-slot^='sidebar.'] [aria-current='page']");
        return {
          main, root, content, phase: root?.dataset.phase,
          card: root?.querySelector('[data-composer-card]'),
          view: root?.querySelector("[class*='an3WzG_viewArea']") ?? content,
          selection: `${selected?.getAttribute('data-session-id') ?? selected?.textContent ?? ''}|${root?.querySelector("[data-conversation-tabs] [aria-selected='true']")?.textContent ?? ''}`,
          title: document.title,
          heading: main?.querySelector('h1, h2')?.textContent,
        };
      };
      let previous = read();
      const incoming = (element, reach = 4) => {
        if (!element) return null;
        // Fading an ancestor of a glass layer disconnects its filter from the backdrop.
        const glass = element.matches('[data-composer-card], [data-lg-lens]') || element.querySelector('[data-composer-card], [data-lg-glass]');
        const start = { translate: `0 ${reach}px`, ...(glass ? {} : { opacity: .94 }) };
        const end = { translate: '0 0', ...(glass ? {} : { opacity: 1 }) };
        return element.animate([start, end], { duration: PART_MS, easing: RISE });
      };
      const snapshotParts = (root) => [...(root?.querySelectorAll("[class*='WOwLGG_root'], [class*='an3WzG_heroWorkspaceRow']") ?? [])]
        .map((part) => ({ copy: part.cloneNode(true), box: part.getBoundingClientRect() }))
        .filter(({ box }) => box.width && box.height);
      const arm = (kind) => {
        const before = read();
        if (!before.main) return;
        intent = { before, kind, at: performance.now(), box: before.card?.getBoundingClientRect(), parts: kind === 'send' ? snapshotParts(before.root) : [] };
      };
      const onDown = (event) => {
        if (event.button !== 0 || !(event.target instanceof Element)) return;
        if (event.target.closest("[data-composer-card] button[class*='_primary']")) arm('send');
        else if (event.target.closest(NAV)) arm('navigate');
      };
      const onKey = (event) => {
        if (event.isComposing) return;
        if (event.key === 'Enter' && !event.shiftKey && event.target instanceof Element && event.target.closest('[data-composer-card]')) arm('send');
        else if ((event.ctrlKey || event.metaKey) && ['n', ',', 'Tab', 'PageUp', 'PageDown'].includes(event.key) || event.altKey && ['ArrowLeft', 'ArrowRight'].includes(event.key)
          || ['Enter', ' '].includes(event.key) && event.target instanceof Element && event.target.closest(NAV)) arm('navigate');
      };
      const transition = (before, next, action) => {
        // Sample the previous visual position at input time, then remove its old transform
        // before measuring the new layout. This carries a rapid reversal from the visible box.
        player.cancel();
        clearTimeout(timer);
        cancelAnimationFrame(warmFrame);
        releaseBoot();
        if (off()) return;
        const animations = [];
        const copies = [];
        const heroBoundary = before.phase === 'hero' && next.phase === 'active' || before.phase === 'active' && next.phase === 'hero';
        const from = action?.box;
        if (heroBoundary && from && next.card) {
          const to = next.card.getBoundingClientRect();
          const { easing, ms } = appleSpring();
          if (to.width && to.height) animations.push(next.card.animate([
            { translate: `${(from.left + from.width / 2 - to.left - to.width / 2).toFixed(1)}px ${(from.top + from.height / 2 - to.top - to.height / 2).toFixed(1)}px` },
            { translate: '0 0' },
          ], { duration: Math.min(ms * 1.1, PAGE_MS), easing }));
        }
        if (next.phase === 'hero') {
          animations.push(incoming(next.root?.querySelector("[class*='WOwLGG_root']")), incoming(next.root?.querySelector("[class*='an3WzG_heroWorkspaceRow']")));
        } else animations.push(incoming(next.view));
        if (before.phase === 'hero' && next.phase === 'active' && action?.kind === 'send') {
          for (const { copy, box } of action.parts) {
            copy.style.cssText += `;position:fixed;left:${box.left}px;top:${box.top}px;width:${box.width}px;height:${box.height}px;margin:0;z-index:20;pointer-events:none`;
            copy.setAttribute('aria-hidden', 'true');
            copy.inert = true;
            copy.removeAttribute('id');
            for (const child of copy.querySelectorAll('[id]')) child.removeAttribute('id');
            document.body.append(copy);
            copies.push(copy);
            animations.push(copy.animate([{ opacity: 1, translate: '0 0' }, { opacity: 0, translate: '0 -4px' }], { duration: PART_MS, easing: 'ease-out', fill: 'forwards' }));
          }
          if (from) window.dispatchEvent(new CustomEvent('dsh-glass:splash', { detail: { left: from.left, top: from.top, width: from.width, height: from.height } }));
        }
        player.play(animations, () => copies.forEach((copy) => copy.remove()));
      };
      const onChange = (records) => {
        const action = intent && performance.now() - intent.at < FRESH_MS ? intent : null;
        if (!action) intent = null;
        // Streamed message children do not schedule page transitions or document scans.
        const relevant = action || !previous.content?.isConnected || previous.root && !previous.root.isConnected
          || records.some((record) => record.type === 'attributes' && record.attributeName === 'data-phase'
            || record.type === 'childList' && (record.target === previous.main || record.target instanceof Element && record.target.matches('[data-slot="main"]')));
        if (!relevant) return;
        const next = read();
        if (!next.main || next.phase === 'settling') return;
        if (booting && !action) {
          previous = next;
          // A restored conversation has no home whale to land on. A replaced home
          // must not leave an animation running against detached elements either.
          if (next.phase === 'active' || bootRoot && next.root !== bootRoot) {
            clearTimeout(timer);
            cancelAnimationFrame(warmFrame);
            player.cancel();
            releaseBoot();
          }
          return;
        }
        const before = action?.before ?? previous;
        const changed = next.content !== previous.content || next.root !== previous.root || next.phase !== previous.phase || next.view !== previous.view
          || action && (next.selection !== before.selection || next.title !== before.title || next.heading !== before.heading);
        previous = next;
        if (!changed) return;
        intent = null;
        transition(before, next, action);
      };

      /* Cold launch has its own choreography; menu/control timings must not compress it. */
      const enter = (root, fish, mark) => {
        player.cancel();
        bootRoot = root;
        const at = mark.getBoundingClientRect();
        const to = fish.getBoundingClientRect();
        const from = { left: at.left + at.width * .02, top: at.top + at.height * .14, width: at.width * .967, height: at.height * .726 };
        if (!from.width || !to.width) return releaseBoot();
        // Match the page's paper before fading the veil, avoiding a colour jump at handoff.
        const veil = document.querySelector('#dsh-boot .dsh-boot-sheet');
        const paper = getComputedStyle(document.body);
        if (veil) {
          veil.style.backgroundColor = paper.backgroundColor;
          veil.style.backgroundImage = paper.backgroundImage;
        }
        // Fast launches may catch the boot mark during its own arrival fade. Preserve its
        // visible opacity when replacing it with a flight copy above the veil.
        let opacity = 1;
        for (let node = mark; node instanceof Element; node = node.parentElement) {
          const alpha = Number.parseFloat(getComputedStyle(node).opacity);
          if (Number.isFinite(alpha)) opacity *= alpha;
          if (node.id === 'dsh-boot') break;
        }
        const copy = document.createElement('div');
        copy.setAttribute('data-lg-whale', '');
        copy.setAttribute('aria-hidden', 'true');
        copy.style.cssText = `position:fixed;left:${from.left}px;top:${from.top}px;width:${from.width}px;height:${from.height}px;z-index:2147483001;pointer-events:none;transform-origin:0 0;will-change:transform;color:${getComputedStyle(fish).color}`;
        const drawing = fish.cloneNode(true);
        drawing.removeAttribute('class');
        drawing.style.cssText = 'display:block;width:100%;height:100%';
        copy.append(drawing);
        document.body.append(copy);
        html.dataset.lgEntry = 'run';
        const flight = 420, handoff = 80, duration = flight + handoff;
        const land = flight / duration;
        const arrive = (element, delay, reach) => element?.animate(
          [{ opacity: 0, translate: `0 ${reach}px` }, { opacity: 1, translate: '0 0' }],
          { duration: 260, delay, easing: RISE, fill: 'backwards' },
        );
        const card = root.querySelector('[data-composer-card]');
        const animations = [];
        try {
          animations.push(copy.animate([{ transform: 'translate(0, 0) scale(1)' }, { transform: `translate(${to.left - from.left}px, ${to.top - from.top}px) scale(${to.width / from.width})` }], { duration: flight, easing: RISE, fill: 'forwards' }));
          animations.push(copy.animate([{ opacity }, { opacity: 1, offset: .2 }, { opacity: 1, offset: land }, { opacity: 0 }], { duration, fill: 'forwards' }));
          // Crossfade only after landing. The real fish and copy share exactly one position.
          animations.push(fish.animate([{ opacity: 0 }, { opacity: 0, offset: land }, { opacity: 1 }], { duration }));
          animations.push(arrive(root.querySelector("[class*='WOwLGG_titleGroup']"), 60, 8));
          animations.push(arrive(root.querySelector("[class*='an3WzG_heroWorkspaceRow']"), 100, 8));
          // Do not fade the glass card or any ancestor of its backdrop filter.
          animations.push(card?.animate([{ translate: '0 12px' }, { translate: '0 0' }], { duration: 320, delay: 80, easing: RISE, fill: 'backwards' }));
          for (const part of card?.children ?? []) {
            if (!part.matches('[data-lg-glass], [data-lg-sheen]')) animations.push(arrive(part, 120, 0));
          }
          player.play(animations, () => { copy.remove(); releaseBoot(); });
        } catch (error) {
          for (const animation of animations) if (animation) { animation.finished.catch(() => {}); animation.cancel(); }
          copy.remove();
          releaseBoot();
          throw error;
        }
      };
      const warm = (next, fish, mark) => {
        html.dataset.lgEntry = 'warm';
        let frames = 0;
        let stable = 0;
        let last = '';
        const begin = () => {
          clearTimeout(timer);
          timer = 0;
          cancelAnimationFrame(warmFrame);
          warmFrame = 0;
          if (disposed || !booting || !next.root.isConnected || next.root.dataset.phase !== 'hero' || off()) return releaseBoot();
          try { enter(next.root, fish, mark); }
          catch (error) { player.cancel(); releaseBoot(); console.error('[glass-theme] entry failed', error); }
        };
        const count = () => {
          warmFrame = 0;
          const parts = [fish, next.card].filter(Boolean);
          const boxes = parts.map((part) => part.getBoundingClientRect());
          const ready = boxes.every((box) => box.width > 0 && box.height > 0) && mark.complete !== false;
          const key = boxes.flatMap((box) => [box.left, box.top, box.width, box.height].map((n) => n.toFixed(1))).join(',');
          stable = ready && key === last ? stable + 1 : 0;
          last = key;
          frames++;
          if (frames >= 3 && stable >= 2) begin();
          else warmFrame = requestAnimationFrame(count);
        };
        // Draw the real homepage under the veil before revealing it. Never keep a working
        // app covered indefinitely if fonts or plugin slots continue changing its layout.
        timer = setTimeout(begin, 160);
        warmFrame = requestAnimationFrame(count);
      };
      const waitForHome = () => {
        timer = 0;
        if (disposed) return;
        if (!document.querySelector('[data-dsh-boot-spinner]')) {
          goneAt ||= performance.now();
          const next = read();
          const fish = next.root?.querySelector("svg[class*='WOwLGG_fish']");
          const mark = [...document.querySelectorAll('#dsh-boot .dsh-boot-mark')].find((image) => image.getBoundingClientRect().width > 0);
          if (next.phase === 'hero' && fish && mark) return warm(next, fish, mark);
          if (next.phase === 'active' || performance.now() - goneAt >= 500) return releaseBoot();
        }
        timer = setTimeout(waitForHome, 16);
      };
      if (booting) {
        html.dataset.lgEntry = 'hold';
        waitForHome();
      }
      const settle = () => { clearTimeout(timer); cancelAnimationFrame(warmFrame); player.cancel(); releaseBoot(); };
      document.addEventListener('pointerdown', onDown, { capture: true, passive: true });
      document.addEventListener('keydown', onKey, true);
      window.addEventListener('resize', settle);
      reducedMotion.addEventListener('change', settle);
      const observer = new MutationObserver(onChange);
      observer.observe(document.body, { childList: true, attributes: true, attributeFilter: ['data-phase', 'aria-selected', 'aria-current'], subtree: true });
      return () => {
        disposed = true;
        clearTimeout(timer);
        cancelAnimationFrame(warmFrame);
        document.removeEventListener('pointerdown', onDown, { capture: true });
        document.removeEventListener('keydown', onKey, true);
        window.removeEventListener('resize', settle);
        reducedMotion.removeEventListener('change', settle);
        observer.disconnect();
        player.cancel();
        releaseBoot();
      };
    }

    /* ── Self-check ────────────────────────────────────────────────────────────
       Much of the look leans on the shell's internal class names, which change when DSH
       does. Each check pairs a stable sign that a part of the shell is on screen (a data
       attribute the shell keeps for its own use) with the internal names the theme relies on
       there. A name that stays missing while its part is on screen means that part changed,
       and those rules fall back to the shell's own look; the settings page says which.
       Plugins merged into this one are reported too: their styles would fight these. */
    const TESTED_DSH = '0.2.2-rc.1';
    const CHECKS = [
      { key: 'checkComposer', when: '[data-composer-card]', need: ["[class*='an3WzG_root']", "[class*='GRgSLq_root']", "[class*='GRgSLq_add']"] },
      { key: 'checkSession', when: '[data-conversation-tabs]', need: ["[class*='an3WzG_scrollBody']", "header [class*='an3WzG_headerUtilities']"] },
      { key: 'checkSidebar', when: "[data-slot='sidebar']", need: ['._5Qcc8a_trigger'] },
      { key: 'checkMenu', when: '[data-menu-material]', need: ["[data-menu-material] > [class*='_material_1w4el']"] },
    ];
    const LEGACY = [['liquid-glass', 'style[data-liquid-glass]'], ['cupertino', 'style[data-cupertino]'], ['pond-polish', 'style[data-pond-polish]']];
    const dshVersion = () => /dsh-desktop\/([\w.+-]+)/.exec(navigator.userAgent)?.[1] ?? null;
    /** What the checks found this run, for the settings page. */
    const selfCheck = (() => {
      const state = { found: new Set(), missing: new Map(), seen: new Set(), legacy: [] };
      const listeners = new Set();
      let snapshot = null;
      const publish = () => { snapshot = null; for (const listener of listeners) listener(); };
      return {
        state,
        publish,
        subscribe: (listener) => { listeners.add(listener); return () => listeners.delete(listener); },
        read: () => (snapshot ??= JSON.stringify({
          version: dshVersion(),
          legacy: state.legacy,
          seen: [...state.seen],
          // Missing on two checks in a row: one miss can be a render in progress.
          missing: CHECKS.filter((check) => check.need.some((selector) => (state.missing.get(selector) ?? 0) >= 2)).map((check) => check.key),
          total: CHECKS.reduce((sum, check) => sum + check.need.length, 0),
          found: state.found.size,
        })),
      };
    })();
    function mountSelfCheck() {
      const { state } = selfCheck;
      const warned = new Set();
      let timer = 0;
      const run = () => {
        timer = 0;
        let changed = false;
        for (const check of CHECKS) {
          if (!document.querySelector(check.when)) continue;
          if (!state.seen.has(check.key)) { state.seen.add(check.key); changed = true; }
          for (const selector of check.need) {
            if (state.found.has(selector)) continue;
            if (document.querySelector(selector)) {
              state.found.add(selector);
              state.missing.delete(selector);
              changed = true;
            } else {
              const misses = (state.missing.get(selector) ?? 0) + 1;
              state.missing.set(selector, misses);
              if (misses === 2) {
                changed = true;
                if (!warned.has(selector)) { warned.add(selector); console.warn(`[glass-theme] the shell no longer matches ${selector}; rules that rely on it fall back to the shell's look (tested on DSH ${TESTED_DSH}, running ${dshVersion() ?? 'unknown'})`); }
              }
            }
          }
        }
        const legacy = LEGACY.filter(([, selector]) => document.querySelector(selector)).map(([name]) => name);
        if (legacy.join() !== state.legacy.join()) { state.legacy = legacy; changed = true; }
        if (changed) selfCheck.publish();
      };
      // Checked at most every two seconds while the page changes, and never on a busy frame.
      const observer = new MutationObserver(() => { if (!timer) timer = setTimeout(() => requestIdleCallback?.(run, { timeout: 1000 }) ?? run(), 2000); });
      observer.observe(document.body, { childList: true, subtree: true });
      const first = setTimeout(run, 1500);
      return () => { observer.disconnect(); clearTimeout(timer); clearTimeout(first); };
    }

    /* ── Settings form ─────────────────────────────────────────────────────── */
    /** Three looks for the glass, as most people would pick it: by how it looks, not by three
        numbers. Values off every preset show as custom. */
    const PRESETS = {
      presetClear: { strength: 70, transparency: 80, blur: 8 },
      presetStandard: { strength: 50, transparency: 50, blur: 18 },
      presetCalm: { strength: 35, transparency: 25, blur: 26 },
    };
    const presetOf = (values) => Object.keys(PRESETS).find((name) => Object.entries(PRESETS[name]).every(([key, value]) => values[key] === value)) ?? null;
    const FORM = [
      { key: 'color', rows: [['choice', 'backdrop']] },
      { key: 'glass', rows: [['presets'], ['advanced', ['strength', 'transparency', 'blur']], ['choice', 'refraction']] },
      { key: 'shape', rows: [['slider', 'radius']] },
      { key: 'interaction', rows: [['choice', 'motion']] },
    ];
    const switchField = (field) => ({
      field,
      format: (value) => (typeof value === 'boolean' ? String(value) : ''),
      parse: (text) => {
        const value = String(text).trim();
        if (value === '') return { kind: 'clear' };
        return value === 'true' || value === 'false' ? { kind: 'set', value: value === 'true' } : undefined;
      },
    });

    function registerSettings(ctx, scope, preview) {
      let React;
      let primitives;
      let slots;
      try {
        React = require('react');
        primitives = require('@deepseek-ai/dsh-client-ui-primitives');
        slots = ctx.get('slots');
      } catch (error) {
        console.warn('[glass-theme] settings form unavailable:', error && error.message);
        return;
      }
      const { SettingsForm, SettingsFormModel, Switch, settingsTextField, settingsNumberField } = primitives;
      if (!slots || !SettingsForm || !SettingsFormModel || !Switch || !settingsTextField || !settingsNumberField) return;
      const h = React.createElement;
      const KEYS = Object.keys(DEFAULTS);
      // Number fields format numbers (the text field would show them as ''); an emptied
      // field clears back to the bundle default.
      const model = new SettingsFormModel(scope, KEYS.map((key) => {
        if (SWITCHES.includes(key)) return switchField(key);
        return {
          ...(RANGES[key] ? settingsNumberField(key) : settingsTextField(key)),
          parse: (text) => {
            const value = String(text).trim();
            if (value === '') return { kind: 'clear' };
            if (RANGES[key]) {
              const number = Number(value);
              const [min, max] = RANGES[key];
              return Number.isFinite(number) && number >= min && number <= max ? { kind: 'set', value: snap(key, number) } : undefined;
            }
            return CHOICES[key].includes(value) ? { kind: 'set', value } : undefined;
          },
        };
      }));
      const state = model.bind(() => ({ ...model.shell(), ...Object.fromEntries(KEYS.map((key) => [key, model.field(key)])) }));
      ctx.effect(() => () => model.dispose(), 'glass-theme: settings model');
      const LABELS = Object.fromEntries(['title', 'description', 'save', 'saving', 'saveFailed', 'unavailable', 'readOnly', 'discard', 'reset', 'overridden'].map((key) => [key, t(key)]));
      const UNITS = { blur: 'px', radius: 'px' };

      function AppearanceConfig(props) {
        const snapshot = props.useAppearanceForm((value) => value);
        const draft = normalize(Object.fromEntries(KEYS.map((key) => [key, snapshot[key]?.text])));
        const draftKey = JSON.stringify(draft);
        // Live preview of the draft; leaving the page shows the saved values again.
        React.useEffect(() => { preview(draft); }, [draftKey]);
        React.useEffect(() => () => preview(null), []);
        if (props.view === 'summary') {
          const on = SWITCHES.filter((key) => draft[key]).map((key) => t(key));
          return h('span', null, on.join(' · ') || t('off'));
        }
        const disabled = !snapshot.writable || snapshot.saving;
        const slider = (key, off) => {
          const [min, max] = RANGES[key];
          return h('div', { key, className: 'glass-field' },
            h('label', { htmlFor: `apple-${key}` }, t(key)),
            h('input', {
              id: `apple-${key}`, type: 'range', min, max, step: STEPS[key] ?? 1, value: draft[key], disabled: disabled || off,
              onChange: (event) => props.edit(key, event.target.value),
            }),
            h('output', { htmlFor: `apple-${key}` }, `${draft[key]}${UNITS[key] ?? ''}`),
            key === 'blur' ? h('div', { className: 'glass-hint' }, t('blurHint')) : null);
        };
        const choice = (key, off) => h('div', { key, className: 'glass-field' },
          h('span', { id: `apple-${key}` }, t(key)),
          h('div', { className: 'glass-choices', role: 'radiogroup', 'aria-labelledby': `apple-${key}` },
            CHOICES[key].map((option) => h('button', {
              key: option, type: 'button', role: 'radio', 'aria-checked': String(draft[key] === option), disabled: disabled || off,
              onClick: () => props.edit(key, option),
            }, t(option)))),
          key === 'refraction' ? h('div', { className: 'glass-hint' }, lensSupported() ? t('refractionHint') : t('refractionUnsupported')) : null);
        const current = presetOf(draft);
        const presets = (off) => h('div', { key: 'presets', className: 'glass-field' },
          h('span', { id: 'glass-preset' }, t('preset')),
          h('div', { className: 'glass-choices', role: 'radiogroup', 'aria-labelledby': 'glass-preset' },
            Object.keys(PRESETS).map((name) => h('button', {
              key: name, type: 'button', role: 'radio', 'aria-checked': String(current === name), disabled: disabled || off,
              onClick: () => { for (const [key, value] of Object.entries(PRESETS[name])) props.edit(key, String(value)); },
            }, t(name)))),
          h('div', { className: 'glass-hint' }, t('presetHint')));
        const advanced = (keys, off) => h(Advanced, { key: 'advanced', custom: current === null }, keys.map((key) => slider(key, off)));
        const row = ([kind, key]) => {
          if (kind === 'presets') return presets(!draft.glass);
          if (kind === 'advanced') return advanced(key, !draft.glass);
          return null;
        };
        return h(SettingsForm, { labels: LABELS, state: snapshot, onSave: props.save, onDiscard: props.discard },
          h('div', { className: 'glass-form' },
            FORM.map((group) => h('section', { key: group.key, className: 'glass-group', 'data-off': String(!draft[group.key]) },
              h('div', { className: 'glass-group-head' },
                h('span', { className: 'glass-group-title' }, t(group.key)),
                h('span', { className: 'glass-group-note' }, t(`${group.key}Note`)),
                h(Switch, { checked: draft[group.key], label: t(group.key), disabled, onChange: (next) => props.edit(group.key, String(next)) })),
              group.rows.map(([kind, key]) => (kind === 'slider' ? slider(key, !draft[group.key]) : kind === 'choice' ? choice(key, !draft[group.key]) : row([kind, key]))))),
            h(Compatibility)));
      }
      /** The self-check's findings: version, leftover plugins, structure that no longer matches. */
      function Compatibility() {
        const raw = React.useSyncExternalStore(selfCheck.subscribe, selfCheck.read);
        const report = JSON.parse(raw);
        const lines = [];
        lines.push(h('div', { key: 'version', className: 'glass-hint' },
          report.version === TESTED_DSH || report.version === null
            ? fill(t('checkTested'), { version: TESTED_DSH })
            : fill(t('checkUntested'), { version: report.version, tested: TESTED_DSH })));
        if (report.legacy.length > 0) lines.push(h('div', { key: 'legacy', className: 'glass-warn', role: 'status' }, fill(t('checkLegacy'), { names: report.legacy.join('、') })));
        if (report.missing.length > 0) {
          lines.push(h('div', { key: 'missing', className: 'glass-warn', role: 'status' }, fill(t('checkMissing'), { parts: report.missing.map((key) => t(key)).join('、') })));
        } else {
          const unseen = CHECKS.filter((check) => !report.seen.includes(check.key)).map((check) => t(check.key));
          lines.push(h('div', { key: 'ok', className: 'glass-hint' },
            fill(t('checkOk'), { found: report.found, total: report.total }) + (unseen.length > 0 ? fill(t('checkUnseen'), { parts: unseen.join('、') }) : '')));
        }
        return h('section', { className: 'glass-group' },
          h('div', { className: 'glass-group-head' },
            h('span', { className: 'glass-group-title' }, t('compatibility'))),
          lines);
      }
      /** Fine-tune: closed while a preset fits, open when the values are custom. */
      function Advanced(props) {
        const [open, setOpen] = React.useState(props.custom);
        React.useEffect(() => { if (props.custom) setOpen(true); }, [props.custom]);
        return h('details', { className: 'glass-advanced', open, onToggle: (event) => setOpen(event.currentTarget.open) },
          h('summary', null, t('advanced'), props.custom ? h('span', null, t('customNote')) : null),
          open ? props.children : null);
      }

      slots.inject('plugins.bundle.config', () => slots.register(
        { name: 'plugins.bundle.config', key: ID, inject: () => ({ hooks: { appearanceForm: state }, ...model.actions() }) },
        AppearanceConfig,
      ));
    }

    function apply(ctx) {
      ctx.effect(() => mountWorkspaceToggle(), 'glass-theme: workspace menu toggle');
      let scope = null;
      try {
        const forms = ctx.get('configForms');
        scope = forms && typeof forms.get === 'function' ? forms.get('glass-theme') : null;
      } catch {
        scope = null;
      }
      let preview = null;
      if (scope) registerSettings(ctx, scope, (next) => preview?.(next));

      ctx.effect(() => {
        // One element per group, in a fixed order, so switching a group off never
        // reorders the cascade.
        // Increase Contrast joins in here: its sheets are nearly solid, so a lens would have nothing to bend.
        const lessTransparency = window.matchMedia('(prefers-reduced-transparency: reduce), (prefers-contrast: more)');
        const sheets = {};
        const sources = { base: BASE_CSS, color: COLOR_CSS, glass: GLASS_CSS, shape: SHAPE_CSS, motion: MOTION_CSS };
        for (const [name, text] of Object.entries(sources)) {
          const element = document.createElement('style');
          element.dataset.plugin = ID;
          element.dataset.pluginCss = `${ID}/${name}`;
          element.textContent = text;
          (document.head ?? document.documentElement).append(element);
          sheets[name] = element;
        }

        let saved = normalize(null);
        let draft = null;
        let tokenKey = '';
        let dropTokens = null;
        let lens = null;
        let dropHighlight = null;
        let dropOrigin = null;
        let dropWriting = null;
        let dropEntry = null;
        let dropDroplet = null;
        let dropDepth = null;
        const dropCheck = mountSelfCheck();
        // Read-only, for tools/smoke.mjs: the self-check report as JSON.
        globalThis.__dshGlassCheck = () => selfCheck.read();

        const sync = () => {
          const current = draft ?? saved;
          sheets.color.media = current.color ? 'all' : 'not all';
          sheets.glass.media = current.glass ? 'all' : 'not all';
          sheets.shape.media = current.shape ? 'all' : 'not all';
          sheets.motion.media = current.interaction ? 'all' : 'not all';
          paint(current);

          const key = `${current.color}/${current.shape}`;
          if (key !== tokenKey) {
            tokenKey = key;
            dropTokens?.();
            dropTokens = ctx.theme.overrideTokens(ID, { ...(current.color ? colorTokens : {}), ...(current.shape ? shapeTokens : {}) });
          }

          if (current.glass && !dropHighlight) dropHighlight = mountHighlight();
          else if (!current.glass && dropHighlight) { dropHighlight(); dropHighlight = null; }
          if (current.glass && !dropDepth) dropDepth = mountDepth();
          else if (!current.glass && dropDepth) { dropDepth(); dropDepth = null; }
          if (current.interaction && !dropOrigin) dropOrigin = mountOrigin();
          else if (!current.interaction && dropOrigin) { dropOrigin(); dropOrigin = null; }
          if (current.interaction && !dropWriting) dropWriting = mountWriting();
          else if (!current.interaction && dropWriting) { dropWriting(); dropWriting = null; }
          if (current.interaction && !dropEntry) dropEntry = mountEntry();
          else if (!current.interaction && dropEntry) { dropEntry(); dropEntry = null; }
          if (current.interaction && !dropDroplet) dropDroplet = mountDroplet();
          else if (!current.interaction && dropDroplet) { dropDroplet(); dropDroplet = null; }

          // Not just hidden: with no glass to bend, the map and its observers do not run.
          const wanted = current.glass && current.refraction === 'lens' && lensSupported() && !lessTransparency.matches;
          if (wanted && !lens) {
            lens = mountLens({
              strength: () => (draft ?? saved).strength / 50,
              // The composer keeps its own frosting, as GLASS_CSS clamps it for each theme, so
              // text behind it dissolves; menus keep enough to read their items over anything;
              // the header's controls sit over the quiet top of the sheet and need little.
              blur: (name) => {
                const b = (draft ?? saved).blur;
                const dark = document.body.hasAttribute('data-ds-dark-theme');
                const clamp = (low, high) => Math.min(Math.max(b, low), high);
                if (name === 'composer') return dark ? clamp(20, 28) : clamp(14, 22);
                if (name === 'menu') return dark ? clamp(18, 30) : clamp(14, 30);
                return clamp(4, 12);
              },
              motion: () => {
                const c = draft ?? saved;
                return c.interaction ? MOTION[c.motion][0] : 0;
              },
            });
          }
          else if (!wanted && lens) { lens.dispose(); lens = null; }
          else if (lens) lens.refresh();
        };
        const fold = () => {
          try {
            const snapshot = scope?.getSnapshot?.();
            if (snapshot?.status === 'ready' && snapshot.value) saved = normalize(snapshot.value);
          } catch {
            /* keep the last good values */
          }
          sync();
        };
        const unsubscribe = scope?.subscribe ? scope.subscribe(fold) : null;
        lessTransparency.addEventListener('change', sync);
        // A mount that throws must still hand back the cleanup below, or whatever mounted before
        // it stays attached for the life of the page.
        try { fold(); } catch (error) { console.error('[glass-theme] apply failed', error); }
        preview = (next) => {
          draft = next;
          sync();
        };
        // Each step on its own: one that throws must not leave the rest attached. On 2026-11-08 an
        // older copy of this bundle stayed live after hot reloads, twice over, with its pointer,
        // key and resize listeners; its highlight still repainted the glass on every pointer move
        // and held hovering over the composer to about 160 fps.
        return () => {
          preview = null;
          const steps = [
            () => { if (typeof unsubscribe === 'function') unsubscribe(); },
            () => lessTransparency.removeEventListener('change', sync),
            () => lens?.dispose(),
            () => dropCheck(),
            () => { delete globalThis.__dshGlassCheck; },
            () => dropHighlight?.(),
            () => dropOrigin?.(),
            () => dropWriting?.(),
            () => dropEntry?.(),
            () => dropDroplet?.(),
            () => dropDepth?.(),
            () => dropTokens?.(),
            () => unpaint(),
            () => { for (const element of Object.values(sheets)) element.remove(); },
          ];
          for (const step of steps) {
            try { step(); } catch (error) { console.error('[glass-theme] cleanup step failed', error); }
          }
        };
      }, 'glass-theme: appearance');
    }

    return { inject: ['theme'], apply };
  },
});
