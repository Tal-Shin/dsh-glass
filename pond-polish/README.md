# Pond Polish

Press feedback and entrance motion live here too. Small controls shrink under the
pointer by how small they are, rows answer with a fill, and menus and dialogs grow
out of the press that opened them. All of it is off under reduced motion.

A small Client-only bundle that sits on top of the active DSH Web theme (currently
`@cngtn/dsh-cngtn-pond`) and corrects four things without editing the theme package.

| # | What | Why |
|---|---|---|
| 1 | Muted text re-stepped to 6.1 / 5.0 / 4.6:1 | The third and fourth steps were 3.3:1 and 2.2:1 on paper; status strip, timestamps and hints were barely readable |
| 2 | Half-pixel button press | Independent `translate` preserves native transforms; reduced motion disables it |
| 3 | Keyboard focus outlines | Focus remains visible against glass |

Also: warm `::selection`. Composer materials and focus belong to liquid-glass.
Transcript row measurements and scroll anchoring stay with DSH's virtualizer;
this bundle no longer applies `content-visibility` or synthetic row heights.

## Tuning

- Reading and composer materials: the liquid-glass bundle's `--lg-*` variables.
- Token values: `TOKENS` in `client.js`; each entry needs a `{ light, dark }` pair.

## Install / remove

Installed with `plugin_manager` `install_bundle` from this directory. Removing the
bundle (or disabling the `pond-polish` row) removes the token layer and the
stylesheet with no residue in the theme package.
