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
html[data-lg-refraction="lens"] body [data-lg-lens] {
  --lg-rim-shadow: inset -5px -5px 6px -5px var(--lg-rim-shade);
  --lg-surface-fill: var(--lg-control-fill);
}
html[data-lg-refraction="lens"] body [data-lg-lens][data-lg-surface='composer'] {
  --lg-composer-fill:
    radial-gradient(320px circle at var(--lg-x, 50%) var(--lg-y, 0px), var(--lg-glint), transparent 70%),
    var(--lg-composer);
  --lg-surface-fill: var(--lg-composer-fill);
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
}
/* The toolbar's buttons share one capsule, as on the system's own toolbars. */
html[data-lg-refraction="lens"] body [data-lg-lens][data-lg-surface='toolbar'] {
  position: relative;
  border-radius: 999px;
  padding-inline: 3px;
  box-shadow: 0 0 0 .5px var(--lg-edge), 0 1px 3px rgb(0 0 0 / calc(.05 * var(--lg-k, 1)));
}
/* Menus: the shell's own material layer gives way to the glass, thicker so items stay legible. */
html[data-lg-refraction="lens"] body [data-lg-lens][data-lg-surface='menu'] {
  --lg-surface-fill: var(--lg-menu-fill);
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
/* The tint and the rim's shade lie on the glass, not under it. */
html[data-lg-refraction="lens"] body [data-lg-glass]::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: var(--lg-surface-fill, var(--lg-composer));
  box-shadow: var(--lg-rim-shadow, none);
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
html[data-lg-refraction="lens"] body [data-lg-sheen] > i {
  position: absolute;
  inset: 0;
  background: var(--lg-sheen-map, none) no-repeat 0 0 / 100% 400%;
  --lg-lx: var(--lg-light-x, -.38);
  --lg-ly: var(--lg-light-y, -.92);
}
html[data-lg-refraction="lens"] body [data-lg-sheen] > i:nth-child(1) {
  background-position: 0 0;
  opacity: calc(var(--lg-sheen-boost, 1) * (max(var(--lg-lx), 0) + var(--lg-sheen-back) * max(-1 * var(--lg-lx), 0)));
}
html[data-lg-refraction="lens"] body [data-lg-sheen] > i:nth-child(2) {
  background-position: 0 33.3333%;
  opacity: calc(var(--lg-sheen-boost, 1) * (max(-1 * var(--lg-lx), 0) + var(--lg-sheen-back) * max(var(--lg-lx), 0)));
}
html[data-lg-refraction="lens"] body [data-lg-sheen] > i:nth-child(3) {
  background-position: 0 66.6667%;
  opacity: calc(var(--lg-sheen-boost, 1) * (max(var(--lg-ly), 0) + var(--lg-sheen-back) * max(-1 * var(--lg-ly), 0)));
}
html[data-lg-refraction="lens"] body [data-lg-sheen] > i:nth-child(4) {
  background-position: 0 100%;
  opacity: calc(var(--lg-sheen-boost, 1) * (max(-1 * var(--lg-ly), 0) + var(--lg-sheen-back) * max(var(--lg-ly), 0)));
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
    function lensMap({ w, h, depth, nx, ny }, bezel, outward, ramp = bezel) {
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
        data[o + 3] = Math.round(Math.min(Math.max(depth[i] + 0.5, 0), 1) * 255);
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
        if (!entry) {
          entry = {
            lens: lensMap(glassField(width, height, radius, exponent, 1, reach), bezel, reach > 0, ramp),
            sheen: sheenMap(glassField(width, height, radius, exponent, dpr), bezel),
          };
          maps.set(key, entry);
          if (maps.size > 12) maps.delete(maps.keys().next().value);
        }
        return entry;
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
        const { lens, sheen } = mapsFor(width, height, radius, exponent, bezel, dpr, reach, ramp);
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
        filter.append(
          map,
          ...levels,
          primitive('feColorMatrix', { in: 'lens', type: 'matrix', values: '0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 1 0 0', result: 'nearness' }),
          ...grading,
          bend,
          primitive('feComposite', { in: 'edge', in2: 'lens', operator: 'in' }),
        );
        surface.style.setProperty('--lg-lens', `url(#${filter.id})`);
        surface.style.setProperty('--lg-lens-reach', `${reach}px`);
        surface.style.setProperty('--lg-sheen-map', `url("${sheen}")`);
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
          const { clientWidth: width, clientHeight: height } = item.target;
          const reach = entry.reach ?? 0;
          for (const element of [entry.filter, entry.filter.querySelector('feImage')]) {
            element?.setAttribute('width', String(width + 2 * reach));
            element?.setAttribute('height', String(height + 2 * reach));
          }
          clearTimeout(entry.timer);
          entry.timer = setTimeout(() => build(item.target, entry), 160);
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
      };
      const detach = (surface) => {
        const entry = lenses.get(surface);
        if (!entry) return;
        resize.unobserve(surface);
        clearTimeout(entry.timer);
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
      const observer = new MutationObserver(() => {
        if (!pending) pending = requestAnimationFrame(() => { pending = 0; scan(); });
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
        const lightKey = `${entry.light[0].toFixed(3)},${entry.light[1].toFixed(3)}`;
        if (entry.written !== lightKey) {
          entry.written = lightKey;
          surface.style.setProperty('--lg-light-x', entry.light[0].toFixed(3));
          surface.style.setProperty('--lg-light-y', entry.light[1].toFixed(3));
        }
        const p = spring.surface === surface ? spring.value : 0;
        if (Math.abs(p) > 0.001 && entry.kind.press) {
          const m = Math.min(still() ? 0 : Math.max(0, options.motion()), 1.6);
          surface.style.setProperty('--lg-sheen-boost', (1 + 0.35 * p).toFixed(3));
          surface.style.setProperty('scale', entry.kind.press === 'swell'
            ? `${(1 + 0.03 * Math.min(m, 1.2) * p).toFixed(4)}`
            : `${(1 + 0.005 * m * p).toFixed(4)} ${(1 - 0.012 * m * p).toFixed(4)}`);
          entry.pressing = true;
        } else if (entry.pressing) {
          entry.pressing = false;
          surface.style.removeProperty('--lg-sheen-boost');
          surface.style.removeProperty('scale');
        }
        const bent = Math.min(1 + 0.25 * p, entry.limit / Math.max(entry.scale, 0.001));
        if (entry.bent !== bent) {
          entry.bent = bent;
          for (const [element, strength] of entry.passes) element.setAttribute('scale', (entry.scale * strength * bent).toFixed(1));
        }
      };
      const tick = (now) => {
        frame = 0;
        const dt = Math.min((now - (last || now)) / 1000, 1 / 30);
        last = now;
        const ease = 1 - Math.exp(-dt / 0.09);
        // Stiffness 380, damping ratio .5: a short squash and one small overshoot.
        const stiffness = 380;
        const damping = 2 * Math.sqrt(stiffness) * 0.5;
        spring.velocity += (-stiffness * (spring.value - spring.target) - damping * spring.velocity) * dt;
        spring.value += spring.velocity * dt;
        const settled = Math.abs(spring.value - spring.target) < 0.002 && Math.abs(spring.velocity) < 0.01;
        if (settled) { spring.value = spring.target; spring.velocity = 0; }
        let resting = settled;
        for (const entry of lenses.values()) {
          const aim = aimFor(entry);
          entry.light[0] += (aim[0] - entry.light[0]) * ease;
          entry.light[1] += (aim[1] - entry.light[1]) * ease;
          if (Math.hypot(aim[0] - entry.light[0], aim[1] - entry.light[1]) >= 0.002) resting = false;
          render(entry);
        }
        if (settled && spring.target === 0) spring.surface = null;
        if (!resting) frame = requestAnimationFrame(tick);
        else last = 0;
      };
      const wake = () => { if (!frame) frame = requestAnimationFrame(tick); };
      const surfaceAt = (event) => {
        const found = event.target instanceof Element ? event.target.closest(SURFACE_SELECTOR) : null;
        return found && lenses.has(found) ? found : null;
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
        if (!still() && options.motion() > 0) spring.target = 1;
        wake();
      };
      const onUp = () => {
        if (!pressed) return;
        pressed = null;
        spring.target = 0;
        wake();
      };
      const onLeave = (event) => { if (!event.relatedTarget && !pressed) { pointer = null; wake(); } };
      document.addEventListener('pointermove', onMove, { passive: true });
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
          cancelAnimationFrame(frame);
          resize.disconnect();
          document.removeEventListener('pointermove', onMove);
          document.removeEventListener('pointerdown', onDown);
          document.removeEventListener('pointerup', onUp);
          document.removeEventListener('pointercancel', onUp);
          document.removeEventListener('pointerout', onLeave);
          window.removeEventListener('blur', onUp);
          for (const surface of [...lenses.keys()]) detach(surface);
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

    /** Surfaces grow out of what opened them: the latest press sets the origin. A menu that
        opens against the button that was pressed grows out of that button's own box, so the
        glass that opens reads as the button's glass drawn out, and its content fades in as it
        settles. A keyboard-opened surface has no recent press and scales from its centre. */
    function mountOrigin() {
      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
      let press = null;
      const onDown = (event) => {
        const trigger = event.target instanceof Element ? event.target.closest('button, [role="button"], [role="combobox"]') : null;
        press = { x: event.clientX, y: event.clientY, at: performance.now(), box: trigger?.getBoundingClientRect() ?? null };
      };
      const grow = (surface, from) => {
        if (reducedMotion.matches || document.documentElement.dataset.lgMotion === 'off' || typeof surface.animate !== 'function') return false;
        const width = surface.offsetWidth;
        const height = surface.offsetHeight;
        if (!width || !height) return false;
        // The box without the running scale, which keeps the centre where it is.
        const box = surface.getBoundingClientRect();
        const left = box.left + box.width / 2 - width / 2;
        const top = box.top + box.height / 2 - height / 2;
        // Only a menu that opens against its button; one further away was opened by something else.
        const gapX = Math.max(left - from.right, from.left - (left + width), 0);
        const gapY = Math.max(top - from.bottom, from.top - (top + height), 0);
        if (Math.hypot(gapX, gapY) > 24) return false;
        const sx = Math.min(Math.max(from.width / width, 0.2), 1);
        const sy = Math.min(Math.max(from.height / height, 0.2), 1);
        surface.style.transformOrigin = `${Math.round(from.left + from.width / 2 - left)}px ${Math.round(from.top + from.height / 2 - top)}px`;
        const root = getComputedStyle(document.documentElement);
        const duration = (parseFloat(root.getPropertyValue('--glass-spring-duration')) || 0.36) * 1000;
        const easing = (root.getPropertyValue('--glass-spring') || getComputedStyle(document.body).getPropertyValue('--glass-spring')).trim() || 'ease-out';
        // The menu unmounts when it closes, so the stylesheet's pop stays off for its lifetime.
        surface.style.animation = 'none';
        surface.animate([{ scale: `${sx.toFixed(3)} ${sy.toFixed(3)}` }, { scale: '1 1' }], { duration, easing });
        for (const child of surface.children) {
          if (child.matches('[data-lg-glass], [data-lg-sheen], [class*="_material_"]')) continue;
          child.animate([{ opacity: 0 }, { opacity: 0, offset: 0.25 }, { opacity: 1 }], { duration: duration * 0.7, easing: 'ease-out' });
        }
        return true;
      };
      const onStart = (event) => {
        if (event.animationName !== 'glass-pop' && event.animationName !== 'glass-sheet') return;
        const surface = event.target;
        if (!(surface instanceof HTMLElement)) return;
        if (press === null || performance.now() - press.at > 600) return;
        if (event.animationName === 'glass-pop' && press.box && grow(surface, press.box)) return;
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
          if (current.interaction && !dropOrigin) dropOrigin = mountOrigin();
          else if (!current.interaction && dropOrigin) { dropOrigin(); dropOrigin = null; }

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
          dropCheck();
          delete globalThis.__dshGlassCheck;
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
