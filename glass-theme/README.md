# Glass Theme

The shell's look: neutral greys, one blue accent, translucent floating panels and
a soft colour wash behind them. It keeps the shell's continuous corners.

| Role | Light | Dark |
|---|---|---|
| Background | `#f5f5f7` | `#1c1c1e` |
| Text | `#1d1d1f` | `#f5f5f7` |
| Accent fill | `#007aff` | `#0a84ff` |
| Accent text | `#0066cc` | `#64b0ff` |

Colours live in the `LIGHT` and `DARK` objects at the top of `client.js`; the wash
is `--glass-wash-1..3`.

Geometry and fonts come from `cupertino`, the glass from `liquid-glass`. The koi
are the separate `koi-pond` bundle. The shell-layer rules are derived from
[dsh-cngtn-pond](https://github.com/cngtn/dsh-cngtn-pond) 1.5.1 by cngtn (MIT).
