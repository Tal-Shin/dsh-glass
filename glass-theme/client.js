/**
 * glass-theme — Client half.
 *
 * The shell's material system with Apple's system colours: neutral greys, one
 * blue accent, and a calm wash behind translucent panels. Derived from the shell
 * layer of @cngtn/dsh-cngtn-pond 1.5.1 (MIT); the pond itself is the separate,
 * optional koi-pond bundle.
 *
 * The frame stays at z-index 1 and its panels stay translucent, so an optional
 * canvas at z-index 0 shows through without either bundle knowing the other.
 * Corners use superellipse(2): the shell's default of 1.5 still reads as a plain arc.
 *
 * Everything lives in `ctx.effect`, so disabling the bundle removes both layers.
 */
window.__ModuleLoader__.load({
  id: '@tal-shin/dsh-glass-theme',
  factory() {
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

    const tokens = {};
    const set = (name, light, dark = light) => { tokens[name] = { light, dark }; };
    const pair = (name, key) => set(name, LIGHT[key], DARK[key]);
    const line = (name, a, b) => set(name, `rgba(${LIGHT.stroke}, ${a})`, `rgba(${DARK.stroke}, ${b})`);
    const mix = (light, a, dark, b) => [`color-mix(in srgb, ${light} ${a}%, transparent)`, `color-mix(in srgb, ${dark} ${b}%, transparent)`];

    // Apple's continuous corner. Pills and circles keep the shell's explicit round.
    set('--dsw-corner-shape', 'superellipse(2)');

    // Type ramp: the same metrics the layout already settled on.
    const ramp = (name, size, height, weight = 400) => set(name, `${weight} ${size}px/${height}px var(--dsw-font-family)`);
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

    // Elevation. lv1..3 stay with cupertino; panel and prominent with liquid-glass.
    const both = (fn) => [fn(LIGHT), fn(DARK)];
    set('--dsw-shadow-lv1-blur', ...both((c) => `0 2px 6px ${c.shadowSoft}`));
    set('--dsw-elevation-stroke', '0 0 0 .5px var(--dsw-elevation-stroke-color)');
    set('--dsw-elevation-stroke-color', 'var(--dsw-alias-border-l2)');
    set('--dsw-elevation-soft', ...both((c) => `var(--dsw-elevation-stroke), 0 1px 2px ${c.shadowSoft}`));
    const cardShadow = (soft, deep) => [
      `0 0 0 .5px ${soft}`, `0 1px 2px ${soft}`, `0 3px 6px ${soft}`, `0 6px 12px ${deep}`,
      `0 12px 22px ${deep}`, `0 20px 34px ${soft}`, `0 32px 52px ${soft}`,
    ].join(', ');
    set('--glass-shadow-card', cardShadow('rgba(0, 0, 0, 0.04)', 'rgba(0, 0, 0, 0.05)'), cardShadow('rgba(0, 0, 0, 0.22)', 'rgba(0, 0, 0, 0.30)'));

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

    const CSS = String.raw`
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
body [data-slot="main"],
body [data-slot="main.conversation"],
body [data-slot="main.conversation"] > div,
body [data-conversation-content],
body [data-conversation-scroll],
body [data-conversation-region="chat"] {
  background-color: transparent;
}
body div:has(> [data-slot="main"]),
body [data-slot="root"] > div > div:has([data-slot="main"]) {
  background-color: transparent !important;
}
html body [data-slot="root"] > div > div:nth-child(1),
html body [data-slot="sidebar"],
html body [data-slot="sidebar"] > *,
html body [data-rightbar-col],
html body [data-rightbar-col] > *,
html body [data-rightbar-col] section,
html body [data-composer-card] {
  background-color: transparent !important;
  background-image: none !important;
}
html body [data-slot="root"] > div > div:nth-child(1),
html body [data-rightbar-col],
html body [data-composer-card] {
  position: relative;
}
html body [data-slot="root"] > div > div:nth-child(1)::before,
html body [data-rightbar-col]::before,
html body [data-composer-card]::before {
  content: "";
  position: absolute;
  inset: 0;
  z-index: -1;
  pointer-events: none;
  -webkit-backdrop-filter: blur(24px) saturate(150%);
  backdrop-filter: blur(24px) saturate(150%);
}
html body [data-slot="root"] > div > div:nth-child(1)::before {
  background-color: color-mix(in srgb, var(--dsw-alias-bg-base) 40%, transparent);
}
html body [data-rightbar-col]::before {
  background-color: color-mix(in srgb, var(--dsw-alias-bg-base) 40%, transparent);
}
html body [data-composer-card]::before {
  border-radius: inherit;
  background-color: color-mix(in srgb, var(--dsw-alias-bg-base) 34%, transparent);
}
html body [data-slot="root"] > div > div:nth-child(1) {
  padding: 10px 12px 12px 18px;
  overflow: visible;
}
html body [data-slot="root"] > div > div:nth-child(1)::before {
  inset: 10px 12px 12px 18px;
  border-radius: var(--dsw-radius-panel, 22px);
  border: 0.5px solid var(--dsw-alias-border-l1);
  box-shadow: var(--glass-shadow-card);
  background-color: color-mix(in srgb, var(--dsw-alias-bg-base) 55%, transparent);
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
  background-color: transparent;
}
html body [data-slot="sidebar"] > div {
  width: 100% !important;
  max-width: 100%;
  box-sizing: border-box;
  border-radius: var(--dsw-radius-panel, 22px);
  overflow: hidden;
}
html body [data-rightbar-col]::before {
  inset: 10px 18px 12px 12px;
  border-radius: var(--dsw-radius-panel, 22px);
  border: 0.5px solid var(--dsw-alias-border-l1);
  box-shadow: var(--glass-shadow-card);
  background-color: color-mix(in srgb, var(--dsw-alias-bg-base) 55%, transparent);
}
html body [data-slot="root"] > div[data-rightbar-collapsed] [data-rightbar-col]::before {
  display: none;
}
html body [data-rightbar-col]:not(:has([data-sidebar-right-open]))::before {
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
  border: 0.5px solid var(--dsw-alias-border-l1);
  box-shadow: var(--glass-shadow-card);
  overflow: clip;
  isolation: isolate;
}
html body [data-rightbar-col] [data-sidebar-right-panel="fullscreen"][data-sidebar-right-open] > * {
  width: 100%;
}
html body [data-rightbar-col] [data-sidebar-right-panel="fullscreen"][data-sidebar-right-open]::before {
  content: "";
  position: absolute;
  inset: 0;
  z-index: -1;
  pointer-events: none;
  border-radius: inherit;
  background-color: color-mix(in srgb, var(--dsw-alias-bg-base) 58%, transparent);
  -webkit-backdrop-filter: blur(26px) saturate(150%);
  backdrop-filter: blur(26px) saturate(150%);
}
html body [data-slot="root"] > div[data-rightbar-fullscreen] > [data-rightbar-col]::before {
  display: none;
}
html body [data-shell-bottom] {
  background-color: var(--dsw-alias-bg-base);
  border-top: 1px solid var(--dsw-alias-border-l1);
}
html body [data-composer-card] {
  border: 1px solid var(--dsw-alias-border-l2);
  box-shadow: var(--dsw-shadow-lv2);
}
html body [data-composer-card]:focus-within {
  border-color: var(--dsw-alias-border-l3);
}
html body [data-composer-seat] {
  background-image: none !important;
}
html body div:has(> [data-code-block-banner]) {
  background-color: transparent;
}
html body [data-conversation-composer-overlay] {
  background-color: transparent !important;
  background-image: none !important;
}
html body [data-conversation-composer-overlay] > div:first-child {
  background-color: color-mix(in srgb, var(--dsw-alias-bg-base) 58%, transparent) !important;
  -webkit-backdrop-filter: blur(16px) saturate(150%);
  backdrop-filter: blur(16px) saturate(150%);
}
html body div:has(> [data-trajectory-scroll]) {
  background-color: transparent !important;
  background-image: none !important;
}
html body [data-trajectory-scroll] {
  background-color: color-mix(in srgb, var(--dsw-alias-bg-base) 18%, transparent) !important;
  -webkit-backdrop-filter: blur(14px) saturate(150%);
  backdrop-filter: blur(14px) saturate(150%);
}
html body [data-trajectory-scroll] > table {
  background-color: transparent !important;
  background-image: none !important;
  border-collapse: separate !important;
  border-spacing: 0 6px !important;
}
html body [data-trajectory-scroll] tr[data-trajectory-row-key] > td {
  background-color: color-mix(in srgb, var(--dsw-alias-bg-base) 30%, transparent) !important;
  border-top: 0.5px solid var(--dsw-alias-border-l1);
  border-bottom: 0.5px solid var(--dsw-alias-border-l1);
  -webkit-backdrop-filter: blur(14px) saturate(150%);
  backdrop-filter: blur(14px) saturate(150%);
}
html body [data-trajectory-scroll] tr[data-trajectory-row-key] > td:first-child {
  border-left: 0.5px solid var(--dsw-alias-border-l1);
  border-top-left-radius: 10px;
  border-bottom-left-radius: 10px;
}
html body [data-trajectory-scroll] tr[data-trajectory-row-key] > td:last-child {
  border-right: 0.5px solid var(--dsw-alias-border-l1);
  border-top-right-radius: 10px;
  border-bottom-right-radius: 10px;
}
html body [data-trajectory-scroll] tr[data-trajectory-row-key]:hover > td {
  background-color: color-mix(in srgb, var(--dsw-alias-bg-base) 46%, transparent) !important;
}
body ::selection {
  background-color: color-mix(in srgb, var(--dsw-alias-brand-primary) 26%, transparent);
}
body :focus-visible {
  outline-offset: 1px;
}
@media (prefers-reduced-transparency: reduce) {
  body [data-slot="root"] > div {
    background-color: var(--dsw-alias-bg-base) !important;
  }
  body div:has(> [data-slot="main"]),
body [data-slot="root"] > div > div:has([data-slot="main"]) {
    background-color: var(--dsw-alias-bg-base) !important;
  }
  html body [data-slot="root"] > div > div:nth-child(1),
  html body [data-rightbar-col],
  html body [data-composer-card] {
    background-color: var(--dsw-alias-bg-base) !important;
  }
  html body [data-slot="root"] > div > div:nth-child(1)::before,
  html body [data-rightbar-col]::before,
  html body [data-composer-card]::before {
    display: none;
  }
  html body [class*="_bubble"],
  html body .md-code-block,
  html body [class*="_ioCard"] {
    -webkit-backdrop-filter: none;
    backdrop-filter: none;
  }
  html[data-windows-titlebar] body [data-slot="root"] > div::before {
    background-color: var(--dsw-alias-bg-base);
    -webkit-backdrop-filter: none;
    backdrop-filter: none;
  }
  html body [data-conversation-composer-overlay] {
    background-color: var(--dsw-alias-bg-base) !important;
  }
  html body [data-conversation-composer-overlay] > div:first-child,
  html body [data-trajectory-scroll],
  html body [data-trajectory-scroll] tr[data-trajectory-row-key] > td {
    background-color: var(--dsw-alias-bg-base) !important;
    -webkit-backdrop-filter: none;
    backdrop-filter: none;
  }
}
@media print {
  html body [data-slot="root"] > div > div:nth-child(1)::before,
  html body [data-rightbar-col]::before,
  html body [data-composer-card]::before {
    display: none;
  }
  html body [class*="_bubble"],
  html body .md-code-block,
  html body [class*="_ioCard"],
  html body [data-trajectory-scroll],
  html body [data-trajectory-scroll] tr[data-trajectory-row-key] > td {
    -webkit-backdrop-filter: none;
    backdrop-filter: none;
  }
}
/* Three floating cards share one gutter: sidebar, centre, right panel. */
html body [data-slot="root"] > div > div:has([data-slot="main"]) {
  box-sizing: border-box;
  padding: 10px 0 12px;
  overflow: visible;
  border-radius: 0;
}
html body [data-slot="root"] > div:is([data-rightbar-collapsed="true"], :not(:has([data-sidebar-right-open]))) > div:has([data-slot="main"]) {
  padding-right: 18px;
}
html body [data-slot="main"] > *,
html body [data-slot="main.conversation"] > * {
  border-radius: var(--dsw-radius-panel, 22px);
}
/* Any page in the main column sits on the card; one painting its own base would
   hide the glass, as the automation page did. */
html body [data-slot="main"] > * {
  background-color: transparent !important;
}
html body [data-slot="main.conversation"] > * {
  overflow: clip;
}

/* The conversation header is one row: title, view tabs, then actions. The title
   row dissolves so its children can share the header's grid. */
html body header:has([data-conversation-tabs]) {
  container: glass-header / inline-size;
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

/* Headings drop to semibold. Sizes stay with Settings > Appearance, so the text, code
   and terminal size controls keep working. */
html body [data-chat-turn] :is(h1, h2, h3, h4) {
  font-weight: 600;
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

/* With no rule under the header, messages fade out as they scroll beneath it. This
   is a painted gradient on purpose: a mask on the scroller moves the transcript to
   its own layer, and menus floating over it can no longer blur it. */
html body header:has([data-conversation-tabs]) {
  position: relative;
  z-index: 2;
}
html body header:has([data-conversation-tabs])::after {
  content: "";
  position: absolute;
  inset: 100% 0 auto;
  height: 16px;
  pointer-events: none;
  background: linear-gradient(to bottom, color-mix(in srgb, var(--dsw-alias-bg-base) 88%, transparent), transparent);
}

/* Modal scrims stop at the caption strip in the shell, which leaves a bright band
   across the top of the window. Paint it full height; the drag region is separate. */
html body [class*="_overlay"] > [class*="_mask"] {
  top: 0;
}

/* The trajectory ledger is the one list that runs edge to edge on the card. */
html body [data-trajectory-scroll] {
  box-sizing: border-box;
  padding-inline: 10px;
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

html body {
  --glass-wash-1: rgba(0, 122, 255, .10);
  --glass-wash-2: rgba(175, 82, 222, .08);
  --glass-wash-3: rgba(90, 200, 250, .12);
  background-color: var(--dsw-alias-bg-base) !important;
  background-image:
    radial-gradient(900px 640px at 10% 6%, var(--glass-wash-1), transparent 70%),
    radial-gradient(1100px 760px at 94% 14%, var(--glass-wash-2), transparent 72%),
    radial-gradient(1000px 800px at 62% 108%, var(--glass-wash-3), transparent 70%) !important;
  background-attachment: fixed;
}
html body[data-ds-dark-theme] {
  --glass-wash-1: rgba(10, 132, 255, .16);
  --glass-wash-2: rgba(191, 90, 242, .12);
  --glass-wash-3: rgba(100, 210, 255, .10);
}
html body [data-composer-card] button[class*="_primary"]:disabled {
  background-color: var(--dsw-alias-button-primary-dimmed) !important;
  color: #fff;
  opacity: 1;
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
@media (prefers-reduced-transparency: reduce) {
  html body { background-image: none !important; }
}
`;

    function apply(ctx) {
      ctx.effect(() => ctx.theme.overrideTokens(ID, tokens), 'glass-theme: token layer');
      ctx.effect(() => {
        const element = document.createElement('style');
        element.dataset.plugin = ID;
        element.dataset.pluginCss = `${ID}/styles`;
        element.textContent = CSS;
        document.head.appendChild(element);
        return () => element.remove();
      }, 'glass-theme: stylesheet');
    }

    return { inject: ['theme'], apply };
  },
});
