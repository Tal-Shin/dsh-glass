# Third-party notices

`glass-theme` and `koi-pond` contain code derived from
[dsh-cngtn-pond](https://github.com/cngtn/dsh-cngtn-pond) 1.5.1 by cngtn.

- `koi-pond/client.js` reuses the original `world`, `shape` and `renderer` modules.
  The `shape` module is unchanged. The world and renderer were adapted, the
  pond can run in a worker, and the engine adjusts its paint rate to motion and
  scrolling.
- `glass-theme/client.js`: the shell layer (transparent frame, floating panels,
  trajectory cards) was adapted; the palette was replaced.

That project declares `"license": "MIT"` in its `package.json`. Its repository
does not include a licence file, so no licence text from it is reproduced here.
