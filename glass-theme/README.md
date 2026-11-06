# Glass Theme

The whole look of the shell in one bundle. Four groups can each be switched off on this
page without touching the others.

| Group | Owns | Settings |
|---|---|---|
| Colour | System palette, text contrast, selection, background wash | Background style |
| Glass | The material of panels, composer, menus, dialogs and cards | Strength, transparency, blur, refraction |
| Corners and type | The corner ladder, every shadow, the type stack | Corner radius |
| Motion | Press feedback, surfaces settling in, switches, keyboard focus | Intensity |

Layout is not a group: the three floating cards and the header stay in place, and with
Glass off the same layout paints solid.

| Role | Light | Dark |
|---|---|---|
| Background | `#f5f5f7` | `#1c1c1e` |
| Text | `#1d1d1f` | `#f5f5f7` |
| Accent fill | `#007aff` | `#0a84ff` |
| Accent text | `#0066cc` | `#64b0ff` |

Colours live in the `LIGHT` and `DARK` objects at the top of `client.js`; the wash is
`--glass-wash-1..3`. The koi are the separate `koi-pond` bundle. The shell-layer rules are
derived from [dsh-cngtn-pond](https://github.com/cngtn/dsh-cngtn-pond) 1.5.1 by cngtn (MIT).
