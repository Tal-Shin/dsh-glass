# Glass Theme

The whole look of the shell in one bundle. Four groups can each be switched off on this
page without touching the others.

| Group | Owns | Settings |
|---|---|---|
| Colour | System palette, text contrast, selection, background wash | Background style |
| Glass | The material of panels, composer, menus, dialogs and cards | Look (Clear, Standard, Calm), fine-tune strength, transparency and blur, refraction |
| Corners and type | The corner ladder, every shadow, the type stack | Corner radius |
| Motion | Press feedback, surfaces settling in, switches, keyboard focus | Intensity |

**Liquid glass.** With refraction set to *Refraction*, the control layer becomes liquid
glass: the composer, the conversation tabs, the header's toolbar (its buttons share one
capsule) and menus. One shape per surface drives both the bending and the highlight: the
middle stays frosted, the rim draws in what lies just past the edge, and the highlight runs
along the rim, brightest where it faces the light, which leans towards the pointer. A press
squashes the composer and swells the tabs, and both spring back; a menu grows out of the
button that opened it. The reading surfaces stay calm frosted sheets.

**Compatibility.** The settings page checks the parts of the shell the theme leans on and
names any that no longer match (most likely after a DSH update), the DSH version against the
one it was tested on, and leftover 0.1 plugins merged into this one.

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
