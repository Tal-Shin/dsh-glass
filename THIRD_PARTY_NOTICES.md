# Third-party notices

`glass-theme` and `koi-pond` contain code derived from
[dsh-cngtn-pond](https://github.com/cngtn/dsh-cngtn-pond) 1.5.1 by cngtn.

- `koi-pond/client.js`: the `world`, `shape` and `renderer` modules are
  unchanged, but now also run in a worker; the `engine` loop was changed to cap
  its paint rate.
- `glass-theme/client.js`: the shell layer (transparent frame, floating panels,
  trajectory cards) was adapted; the palette was replaced.

That project declares `"license": "MIT"` in its `package.json`. Its repository
does not include a licence file, so no licence text from it is reproduced here.
