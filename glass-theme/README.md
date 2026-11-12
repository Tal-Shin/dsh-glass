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
along the rim, brightest where it faces the light, which leans towards the pointer. Each surface is one piece of glass. Its border and drop shadow are drawn by the tint
layer above the filter, so the blur and the rim never pull them back in as a grey band (a
second pane). Its corners follow the surface's own shape.

**Liquid motion.** The glass moves like a liquid with surface tension. It gives a little,
runs past where it is going and gathers itself in one soft rebound. Every one of these plays
on the compositor, from springs sampled once into `linear()` easings or keyframes, so it keeps
the display's full rate while the shell is busy:
- the view tabs' thumb travels as a drop: the leading edge first, stretching and thinning on
  the way;
- a press squashes the composer or swells the tabs and releases on a looser spring, while
  light gathers under the finger inside the glass and spreads out as it fades;
- the composer's glass follows a new or removed line from the edge that stayed put;
- a menu's glass and shadow pour out of the control that opened it, and its items stay put
  and sharp.

The shell removes a closing menu in the same frame, so menus have no exit to animate; the
theme never re-inserts one. Reduced motion, or Motion set to off, keeps the press light
without its spread and drops the rest. The reading surfaces stay calm frosted sheets.

**Motion lifecycle.** DSH owns menu dismissal; the theme never reinserts a removed menu for
a second exit or resets its text opacity on reopening. Hidden portals retry their geometry,
and moving a connected portal does not count as closing it. Controls use short press feedback,
surface presets run for 160–240 ms (menus at most 200 ms), and ordinary page travel is capped at 260 ms.
Cold start, first send, return home, sessions and settings share one cancellable animation
owner. Incoming content starts immediately; typing, scrolling and clicking do not change
playback speed. Navigation cleanup cancels every old animation and removes only theme-owned
copies. The lens uses the same .8 spring damping across refresh rates and advances on its
first animation frame. Glass and koi settings are unchanged.

**Startup.** The former standalone Boot Veil is part of this bundle. `boot.js` contributes
the first-paint markup through `webserver/index-inject`; `client.js` warms the real homepage,
flies the whale into its final position and crossfades it into the real icon. Startup uses
its own 420 ms flight and 80 ms handoff, independent of menu/control presets. Initial page
hydration cannot cancel it; real navigation and resizing can. The veil matches the page's
background before fading. A claim on the boot node prevents replay during hot reload.
The Host reads the profile's light/dark preference, and reduced motion keeps a static mark
and a short fade. Until the Host is ready, DSH shows its own loading card.
Changes to `boot.js`, `index.js` or the bundle manifest require a full app restart.

**Compatibility.** The settings page checks the parts of the shell the theme leans on and
names any that no longer match (most likely after a DSH update), the DSH version against the
one it was tested on, and leftover 0.1 plugins merged into this one.
The bundle also keeps the workspace picker's trigger press from being treated as
an outside click on DSH 0.2.2-rc.1, so clicking its button again closes the menu.

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
