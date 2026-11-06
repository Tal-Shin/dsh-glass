# Cupertino

Apple's geometry and type. Colours belong to the `glass-theme` bundle.

| Token | Stock | Now |
|---|---|---|
| `--dsw-radius-xs/sm/md/lg/xl/panel` | 4/6/8/10/12/16-ish, flat ladder | 6 / 10 / 12 / 14 / 18 / 22 — bigger surface, bigger radius |
| `--dsw-shadow-lv1..3` | tight, dark-ish | 0.5px edge + wide low-alpha falloff |
| `--dsw-font-family` | user font, system sans | System faces, Inter, Segoe UI Variable, PingFang / Noto Sans SC / YaHei |

View tabs become a segmented control with 28px minimum targets, horizontal overflow
when necessary, and one thumb that springs between tabs through CSS anchor
positioning. Switches spring too, and stretch while held. `--glass-spring` is a
damped spring sampled into `linear()`. Reduced-motion preferences disable all of it. The
font stack keeps the user's `--dsh-font-family-text` preference first.

## Why custom properties with `!important`

The theme sets the same variables from its own token layer, and a plugin cannot
know which stylesheet was appended first. An important custom-property
declaration wins the cascade regardless of order, so these overrides are stable —
at the cost that the theme can no longer override them while this bundle is on.

## Scope

Uses the published `data-conversation-tabs` hook and native ARIA roles. It does
not change the shell's grid tracks, native window controls or sidebar resizing.
Glass materials and sidebar separators are owned by the liquid-glass bundle.
