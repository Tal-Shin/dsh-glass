# Koi Pond

ASCII koi behind the shell, as a stand-alone plugin. Disable the row on the
Plugins page to remove the canvas and stop the engine; enable it to bring the
fish back. The theme does not depend on this bundle.

Settings live on the plugin's page or in the "Pond" button in Settings. Console:
`koiPond.open()`, `koiPond.set({ fish: 9, palette: 'cool' })`, `koiPond.get()`.

Compared with the source package:

- no token layer and no shell stylesheet;
- the top of the canvas fades out so glyphs stay clear of the window caption;
- on the empty start page the fish stay crisp and fade to 14% under the heading, set
  by `TEXT_FLOOR` and `TEXT_SELECTORS` in `client.js`; in a conversation they sit
  behind the glass card.

## Credit

The pond engine comes from [dsh-cngtn-pond](https://github.com/cngtn/dsh-cngtn-pond)
1.5.1 by cngtn, MIT licensed. The `world`, `shape` and `renderer` modules in
`client.js` are unchanged; the `engine` loop caps painting at 60 fps, or 24 fps while
the page scrolls, because every paint makes the glass above re-blur.
