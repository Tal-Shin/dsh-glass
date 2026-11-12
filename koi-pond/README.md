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
1.5.1 by cngtn, MIT licensed. The `shape` module in `client.js` is unchanged. The pond
paints only as often as the eye can tell: 60 times a second when calm, rising to at most
120 while koi chase or bolt or splash rings spread, so the fastest thing moves about a
pixel between paints; 24 while the page scrolls. It never paints every frame of a
high-refresh display, because every paint makes the glass above re-blur. The world steps
once per paint, and the wander and the wake are scaled by time, so the fish behave the
same at any paint rate.
