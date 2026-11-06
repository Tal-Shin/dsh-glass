# Liquid Glass

Apple-inspired liquid glass over the `glass-theme` shell. It works with or without
the `koi-pond` bundle behind it:

| Surface | Before | After |
|---|---|---|
| Menus | heavy frosting | readable 76% / 80% tint, 18px blur, bright upper rim and layered elevation |
| Sidebar / files | mismatched sheets | matching 22px corners, 52% / 58% tint, directional highlights and soft shadows |
| Conversation | stacked paper and per-message blur | a floating card matching the side panels: 56% / 60% tint, 18px blur; it fades away on the empty start page |
| Composer | filters and competing shadows | one 64% / 68% lens below the content, 18px blur, visible focus ring and pointer glint |

Values are light / dark. Existing grid widths, panel insets, collapse behavior
and native window controls are preserved. Stable slot hooks select shell
columns; small code/bubble blur overrides retain the theme's existing suffix
selectors. Filters live on pseudo-elements to preserve fixed-position children.

## Knobs

All in `client.js`:

- `--lg-sheet`, `--lg-panel`, `--lg-composer`: material tint and opacity.
- `--lg-refraction`: floating panel and input blur / saturation.
- `--lg-rim`, `--lg-edge`, `--lg-glint`: optical edge and highlight strengths.
- The menu token pairs control menu tint and blur.

## Refraction

Real edge refraction through `backdrop-filter: url(#svg)` was tried on menus and left
out: it barely shows over a calm background, so it is not worth the extra GPU work.

## Cost

Large backdrop filters over an animated canvas still use GPU time. Per-message
filters have been removed. Pointer updates run only over the input card, are
coalesced into one animation frame, and clear on exit, blur or preference change.
Reduced motion disables the glint and transitions. Reduced transparency and
unsupported backdrop filters restore solid surfaces. Disabling the bundle removes
styles, token overrides, listeners and scheduled highlight frames.

## Remove

Disable the `liquid-glass` row; the tokens, stylesheet and pointer listener go
with it.
