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
  background: color-mix(in srgb, var(--glass-base-solid, var(--dsw-alias-bg-base)) 88%, white) !important;
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
/* One thumb slides between the tabs: it is anchored to whichever tab is selected, so a
   changed anchor animates its position. Without anchor positioning the selected tab
   keeps the static fill above. */
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
    border-radius: calc(var(--dsw-radius-md, 12px) - 3px);
    background: color-mix(in srgb, var(--glass-base-solid, var(--dsw-alias-bg-base)) 88%, white);
    box-shadow: 0 1px 2px rgba(0,0,0,.10), 0 0 0 .5px rgba(0,0,0,.10);
  }
  body[data-ds-dark-theme] [data-conversation-tabs]::before {
    background: rgba(255,255,255,.12);
    box-shadow: 0 1px 2px rgba(0,0,0,.45), 0 0 0 .5px rgba(255,255,255,.10);
  }
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
.glass-choices { grid-column: 2 / 4; display: inline-flex; flex-wrap: wrap; gap: 2px; justify-self: start; padding: 2px; border-radius: 9px; background: var(--dsw-alias-interactive-bg-active); }
.glass-choices button {
  padding: 3px 12px; border: 0; border-radius: 7px; background: transparent;
  color: var(--dsw-alias-label-secondary); font: inherit; font-size: 12px; cursor: pointer;
}
.glass-choices button[aria-checked='true'] { background: var(--glass-base-solid, var(--dsw-alias-bg-base)); color: var(--dsw-alias-label-primary); box-shadow: 0 1px 2px rgb(0 0 0 / .12); }
.glass-hint { grid-column: 2 / 4; color: var(--dsw-alias-label-caption); font-size: 12px; line-height: 18px; }
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
  --lg-composer-filter: blur(clamp(14px, var(--lg-blur, 18px), 22px)) saturate(calc(1 + .4 * var(--lg-k, 1))) brightness(1.05);
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
  --lg-composer-filter: blur(clamp(20px, var(--lg-blur, 18px), 28px)) saturate(calc(1 + .25 * var(--lg-k, 1))) brightness(1.1);
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
/* Below the card, text would turn sharp again in the gap. This strip dissolves it. It must not
   repeat what went wrong with a full layer here: its top edge is behind the card, its sides are
   the card's sides so nothing runs through the gutters, and it stays 1px inside the sheet so the
   sheet's border is not smeared. Its corners are the sheet's, moved in by the gap, so they stay
   inside the sheet. */
html body [class*='an3WzG_root'][data-phase='active'] [data-composer-seat]::before {
  content: '';
  position: absolute;
  left: var(--glass-seat-gap);
  right: calc(var(--glass-seat-gap) - var(--dsh-scrollbar-width, 6px));
  bottom: 1px;
  height: var(--dsw-radius-panel, 22px);
  z-index: -1;
  pointer-events: none;
  border-radius: 0 0 calc(var(--dsw-radius-panel, 22px) - 1px) calc(var(--dsw-radius-panel, 22px) - 1px);
  /* Brightness or saturation would tint the empty gutters into a band. The sheet's own colour
     does not: it only thins the smear that blurred text leaves. */
  background: color-mix(in srgb, var(--glass-base-solid, transparent) 55%, transparent);
  -webkit-backdrop-filter: blur(26px);
  backdrop-filter: blur(26px);
}

/* Declared here, not on body: the highlight follows --lg-x set on this element. */
html body [data-composer-card] {
  --lg-composer-fill:
    radial-gradient(320px circle at var(--lg-x, 50%) var(--lg-y, 0px), var(--lg-glint), transparent 70%),
    linear-gradient(155deg, var(--lg-glint-idle), transparent 48%),
    var(--lg-composer);
}
/* Refraction: the lens filter bends what the blur produced, strongest at the rim. */
html[data-lg-refraction="lens"] body [data-composer-card][data-lg-lens]::before {
  -webkit-backdrop-filter: var(--lg-composer-filter) var(--lg-lens);
  backdrop-filter: var(--lg-composer-filter) var(--lg-lens);
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
@media (prefers-reduced-transparency: reduce) {
  html body [class*='an3WzG_root'][data-phase='active'] [data-composer-seat]::before {
    display: none;
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
   ours. The other three are the shell's own padding, named here so each appears once. */
html body {
  --glass-panel-inset: 10px;
  --glass-composer-inset: 9px;
  --glass-menu-inset: 5px;
  --glass-composer-radius: max(calc(var(--dsw-radius-panel, 22px) - var(--glass-seat-gap, 16px)), 12px);
}
html body [data-composer-card] {
  border-radius: var(--glass-composer-radius);
}
html body [data-composer-card]::before {
  border-radius: calc(var(--glass-composer-radius) - 1px);
}
/* The shell marks these round, for circles. Here they follow the card's curve instead. */
html body [data-composer-card] :is(button[class*='_primary'], [class*='GRgSLq_add']) {
  border-radius: max(calc(var(--glass-composer-radius) - var(--glass-composer-inset)), 8px);
  corner-shape: var(--dsw-corner-shape, round);
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
       in .36s with a barely visible overshoot, so controls feel quick rather than bouncy.
       --lg-motion scales every distance: 0 off, 1 standard, 1.6 lively. Presses scale less
       than that: a button that shrinks visibly reads as broken, however lively the setting.
       Three speeds: instant for hover and press, control for a control changing state, and
       the spring for surfaces and thumbs moving. */
    const MOTION_CSS = String.raw`
body {
  --glass-press: min(var(--lg-motion, 1), 1.25);
  --glass-spring: linear(0, 0.07, 0.223, 0.399, 0.565, 0.705, 0.813, 0.893, 0.947, 0.981, 1.001, 1.011, 1.015, 1.015, 1.013, 1.01, 1.008, 1.005, 1);
}

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
  [data-conversation-tabs]::before {
    transition: left var(--glass-spring-duration, .36s) var(--glass-spring), width var(--glass-spring-duration, .36s) var(--glass-spring);
  }

  /* Small controls shrink under the pointer and spring back, harder the smaller they
     are; independent scale leaves native transforms alone. */
  [data-composer-card] button,
  [data-slot='root'] header button,
  [data-rightbar-col] button {
    transition:
      background-color var(--glass-instant) ease, color var(--glass-instant) ease, border-color var(--glass-instant) ease,
      box-shadow var(--glass-instant) ease, opacity var(--glass-instant) ease, transform var(--glass-instant) ease,
      scale var(--glass-spring-duration, .36s) var(--glass-spring);
  }
  [data-composer-card] button:active:not(:disabled) {
    scale: calc(1 - .03 * var(--glass-press));
    transition-duration: var(--glass-instant);
  }
  :is([data-composer-card], [data-slot='root'] header) button[class*='_primary']:active:not(:disabled) {
    scale: calc(1 - .04 * var(--glass-press));
    transition-duration: var(--glass-instant);
  }
  /* Only small controls in the right panel shrink: icon buttons and chips. */
  [data-slot='root'] header button:not([role='tab'], [class*='_primary']):active:not(:disabled),
  [data-rightbar-col] button:is(:has(> svg:only-child), [aria-label]:not(:has(> span))):not(.wb-row, [role='tab'], [role='menuitem'], [role='treeitem']):active:not(:disabled) {
    scale: calc(1 - .06 * var(--glass-press));
    transition-duration: var(--glass-instant);
  }

  /* Surfaces arrive from slightly small and settle; scale and translate are independent
     properties, so anchored positions stay untouched. Menus must not fade here: opacity
     below 1 on the surface cuts its material off from the page until the fade ends, so
     the menu would open clear and turn white. */
  @keyframes glass-pop { from { scale: calc(1 - .05 * var(--lg-motion, 1)); } }
  @keyframes glass-sheet { from { opacity: 0; scale: calc(1 - .03 * var(--lg-motion, 1)); translate: 0 calc(8px * var(--lg-motion, 1)); } }
  @keyframes glass-fade { from { opacity: 0; } }
  [data-menu-material] {
    animation: glass-pop var(--glass-spring-duration, .36s) var(--glass-spring);
  }
  [role='dialog']:not([data-menu-material]) {
    animation: glass-sheet var(--glass-spring-duration, .36s) var(--glass-spring);
  }
  [class*='_overlay'] > [class*='_mask'] {
    animation: glass-fade var(--glass-control) ease;
  }
}
html[data-lg-motion="off"] body :is([data-menu-material], [role='dialog'], [class*='_overlay'] > [class*='_mask']) {
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
    const MOTION = { off: [0, '.2s'], subtle: [0.5, '.28s'], standard: [1, '.36s'], lively: [1.6, '.5s'] };

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
        blurHint: '用于面板、菜单和弹窗。输入框有自己的模糊强度，让背后的文字化开。',
        refractionHint: '输入框边缘按曲面玻璃弯折背后的画面，带轻微色散。',
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
        blurHint: 'For panels, menus and dialogs. The composer keeps its own blur, so text behind it dissolves.',
        refractionHint: 'Bends the scene at the composer rim like curved glass, with a faint colour fringe.',
        refractionUnsupported: 'Refraction is not supported here, so it stays off.',
        save: 'Save', saving: 'Saving…', saveFailed: 'Could not save. Try again.', unavailable: 'Settings are unavailable right now.', readOnly: 'This profile is read-only.',
        discard: 'Discard', reset: 'Reset', overridden: 'Overridden',
      },
    };
    const t = (key) => (String(navigator.language || '').toLowerCase().startsWith('zh') ? TEXT.zh : TEXT.en)[key] ?? key;

    /* ── Refraction lens ───────────────────────────────────────────────────────
       A page cannot hand WebGL the pixels behind an element, so the bending itself
       happens in the compositor: an SVG displacement filter used as a backdrop filter.
       What has to be computed is the map that says how far each pixel bends. It is a pure
       function of the card's size and corner radius, built once per size on a canvas (a
       few milliseconds), then cached by the browser. */
    const SVG_NS = 'http://www.w3.org/2000/svg';
    const lensSupported = () => {
      try {
        return CSS.supports('backdrop-filter', 'url(#x)') || CSS.supports('-webkit-backdrop-filter', 'url(#x)');
      } catch {
        return false;
      }
    };

    /**
     * How far light bends at each point across the rim, from the outer edge (0) to where the
     * glass goes flat (127), scaled so the strongest point is 1. The surface is a convex
     * squircle; a vertical ray refracts into glass of index 1.5 and travels down to the base.
     */
    const LENS_PROFILE = (() => {
      const surface = (x) => (1 - (1 - x) ** 4) ** 0.25;
      const samples = new Float32Array(128);
      let peak = 0;
      for (let i = 0; i < 128; i++) {
        const x = Math.max(i / 127, 0.002);
        const slope = (surface(Math.min(x + 0.001, 1)) - surface(x - 0.001)) / 0.002;
        const incidence = Math.atan(slope);
        const refracted = Math.asin(Math.sin(incidence) / 1.5);
        samples[i] = (surface(x) + 0.35) * Math.tan(incidence - refracted);
        peak = Math.max(peak, samples[i]);
      }
      return samples.map((value) => value / peak);
    })();

    /**
     * Displacement map for a rounded rectangle of glass with a curved rim. Red and green
     * carry the x and y shift (128 is none). Inside the rim band each pixel samples from
     * further in, which is how a thick pane bends what lies behind its border.
     */
    function lensMap(width, height, radius, bezel) {
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const g = canvas.getContext('2d');
      const image = g.createImageData(width, height);
      const data = image.data;
      const hx = width / 2;
      const hy = height / 2;
      const r = Math.min(radius, hx, hy);
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const px = x + 0.5 - hx;
          const py = y + 0.5 - hy;
          const qx = Math.abs(px) - (hx - r);
          const qy = Math.abs(py) - (hy - r);
          // Signed distance to the rounded edge (negative inside) and its outward normal.
          let nx;
          let ny;
          let sdf;
          if (qx > 0 && qy > 0) {
            const len = Math.hypot(qx, qy) || 1;
            sdf = len - r;
            nx = (qx / len) * Math.sign(px);
            ny = (qy / len) * Math.sign(py);
          } else if (qx > qy) {
            sdf = qx - r;
            nx = Math.sign(px);
            ny = 0;
          } else {
            sdf = qy - r;
            nx = 0;
            ny = Math.sign(py);
          }
          const depth = -sdf;
          const shift = depth > 0 && depth < bezel ? LENS_PROFILE[Math.round((depth / bezel) * 127)] : 0;
          const i = (y * width + x) * 4;
          data[i] = Math.round(128 - nx * shift * 127);
          data[i + 1] = Math.round(128 - ny * shift * 127);
          data[i + 2] = 128;
          data[i + 3] = 255;
        }
      }
      g.putImageData(image, 0, 0);
      return canvas.toDataURL('image/png');
    }

    function mountLens(getStrength) {
      const svg = document.createElementNS(SVG_NS, 'svg');
      svg.setAttribute('aria-hidden', 'true');
      svg.setAttribute('width', '0');
      svg.setAttribute('height', '0');
      svg.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden;pointer-events:none';
      document.body.append(svg);
      const lenses = new Map();
      let serial = 0;

      const build = (card, entry) => {
        // The blur layer sits inside the card's border, so the map matches that box.
        const width = card.clientWidth;
        const height = card.clientHeight;
        if (width < 8 || height < 8) return;
        const radius = Math.max(0, (parseFloat(getComputedStyle(card).borderTopLeftRadius) || 22) - 1);
        const k = getStrength();
        const key = `${width}x${height}r${radius}k${k}`;
        if (entry.key === key) return;
        entry.key = key;
        // Wider than the corner on purpose: the curve is steepest in the outer few pixels, so
        // a rim the width of the corner bends too little of the picture to be seen.
        const bezel = Math.min(30, height / 2);
        const filter = entry.filter;
        filter.replaceChildren();
        for (const [name, value] of Object.entries({ x: 0, y: 0, width, height, filterUnits: 'userSpaceOnUse', primitiveUnits: 'userSpaceOnUse', 'color-interpolation-filters': 'sRGB' })) {
          filter.setAttribute(name, String(value));
        }
        const map = document.createElementNS(SVG_NS, 'feImage');
        for (const [name, value] of Object.entries({ x: 0, y: 0, width, height, preserveAspectRatio: 'none', result: 'lens' })) map.setAttribute(name, String(value));
        map.setAttribute('href', lensMap(width, height, radius, bezel));
        // One pass per colour at slightly different strengths: light of each colour bends by a
        // different amount, which shows as a faint fringe on the rim. The map stores .5 at full
        // strength, so the scale is twice the largest shift in pixels.
        const scale = 2 * 20 * Math.min(k, 1.5);
        const primitive = (tag, attributes) => {
          const element = document.createElementNS(SVG_NS, tag);
          for (const [name, value] of Object.entries(attributes)) element.setAttribute(name, String(value));
          return element;
        };
        const pass = (name, strength, row) => [
          primitive('feDisplacementMap', { in: 'SourceGraphic', in2: 'lens', scale: (scale * strength).toFixed(1), xChannelSelector: 'R', yChannelSelector: 'G', result: `${name}Shift` }),
          primitive('feColorMatrix', { in: `${name}Shift`, type: 'matrix', values: `${row} 0 0 0 1 0`, result: name }),
        ];
        filter.append(
          map,
          ...pass('red', 1, '1 0 0 0 0 0 0 0 0 0 0 0 0 0 0'),
          ...pass('green', 0.96, '0 0 0 0 0 0 1 0 0 0 0 0 0 0 0'),
          ...pass('blue', 0.92, '0 0 0 0 0 0 0 0 0 0 0 0 1 0 0'),
          primitive('feBlend', { in: 'red', in2: 'green', mode: 'screen', result: 'warm' }),
          primitive('feBlend', { in: 'warm', in2: 'blue', mode: 'screen' }),
        );
        card.style.setProperty('--lg-lens', `url(#${filter.id})`);
        card.setAttribute('data-lg-lens', '');
      };

      // Redrawing the map costs several milliseconds, too much for every frame of a panel
      // drag. The current map stretches to fit until the size settles.
      const resize = new ResizeObserver((entries) => {
        for (const item of entries) {
          const entry = lenses.get(item.target);
          if (!entry) continue;
          const { clientWidth: width, clientHeight: height } = item.target;
          for (const element of [entry.filter, entry.filter.querySelector('feImage')]) {
            element?.setAttribute('width', String(width));
            element?.setAttribute('height', String(height));
          }
          clearTimeout(entry.timer);
          entry.timer = setTimeout(() => build(item.target, entry), 160);
        }
      });
      const attach = (card) => {
        if (lenses.has(card)) return;
        const filter = document.createElementNS(SVG_NS, 'filter');
        filter.id = `lg-lens-${++serial}`;
        svg.append(filter);
        const entry = { filter, key: '', timer: 0 };
        lenses.set(card, entry);
        resize.observe(card);
        build(card, entry);
      };
      const detach = (card) => {
        const entry = lenses.get(card);
        if (!entry) return;
        resize.unobserve(card);
        clearTimeout(entry.timer);
        entry.filter.remove();
        lenses.delete(card);
        card.style.removeProperty('--lg-lens');
        card.removeAttribute('data-lg-lens');
      };
      const scan = () => {
        const cards = new Set(document.querySelectorAll('[data-composer-card]'));
        for (const card of cards) attach(card);
        for (const card of [...lenses.keys()]) if (!cards.has(card) || !card.isConnected) detach(card);
      };
      let pending = 0;
      const observer = new MutationObserver(() => {
        if (!pending) pending = requestAnimationFrame(() => { pending = 0; scan(); });
      });
      observer.observe(document.body, { childList: true, subtree: true });
      scan();
      return {
        refresh() {
          for (const [card, entry] of lenses) build(card, entry);
        },
        dispose() {
          observer.disconnect();
          cancelAnimationFrame(pending);
          resize.disconnect();
          for (const card of [...lenses.keys()]) detach(card);
          svg.remove();
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
      const paintHighlight = () => {
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

    /** Surfaces grow out of what opened them: the latest press sets the origin. A
        keyboard-opened surface has no recent press and scales from its centre. */
    function mountOrigin() {
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
    }

    /* ── Settings form ─────────────────────────────────────────────────────── */
    const FORM = [
      { key: 'color', rows: [['choice', 'backdrop']] },
      { key: 'glass', rows: [['slider', 'strength'], ['slider', 'transparency'], ['slider', 'blur'], ['choice', 'refraction']] },
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
        return h(SettingsForm, { labels: LABELS, state: snapshot, onSave: props.save, onDiscard: props.discard },
          h('div', { className: 'glass-form' },
            FORM.map((group) => h('section', { key: group.key, className: 'glass-group', 'data-off': String(!draft[group.key]) },
              h('div', { className: 'glass-group-head' },
                h('span', { className: 'glass-group-title' }, t(group.key)),
                h('span', { className: 'glass-group-note' }, t(`${group.key}Note`)),
                h(Switch, { checked: draft[group.key], label: t(group.key), disabled, onChange: (next) => props.edit(group.key, String(next)) })),
              group.rows.map(([kind, key]) => (kind === 'slider' ? slider : choice)(key, !draft[group.key]))))));
      }

      slots.inject('plugins.bundle.config', () => slots.register(
        { name: 'plugins.bundle.config', key: ID, inject: () => ({ hooks: { appearanceForm: state }, ...model.actions() }) },
        AppearanceConfig,
      ));
    }

    function apply(ctx) {
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
        const lessTransparency = window.matchMedia('(prefers-reduced-transparency: reduce)');
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
          if (current.interaction && !dropOrigin) dropOrigin = mountOrigin();
          else if (!current.interaction && dropOrigin) { dropOrigin(); dropOrigin = null; }

          // Not just hidden: with no glass to bend, the map and its observers do not run.
          const wanted = current.glass && current.refraction === 'lens' && lensSupported() && !lessTransparency.matches;
          if (wanted && !lens) lens = mountLens(() => (draft ?? saved).strength / 50);
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
        fold();
        preview = (next) => {
          draft = next;
          sync();
        };
        return () => {
          preview = null;
          if (typeof unsubscribe === 'function') unsubscribe();
          lessTransparency.removeEventListener('change', sync);
          lens?.dispose();
          dropHighlight?.();
          dropOrigin?.();
          dropTokens?.();
          unpaint();
          for (const element of Object.values(sheets)) element.remove();
        };
      }, 'glass-theme: appearance');
    }

    return { inject: ['theme'], apply };
  },
});
