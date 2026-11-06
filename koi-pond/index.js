/**
 * Host half of koi-pond.
 *
 * Declares the settings schema so the Plugins page can render the form. An
 * installed copy resolves the schema library normally; a linked copy lives
 * outside the profile, so it falls back to whichever profile can resolve it.
 */
import { createRequire } from 'node:module';
import { existsSync, readdirSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

function loadSchema() {
  const tried = [createRequire(import.meta.url)];
  const profiles = join(process.env.DSH_HOME ?? join(homedir(), '.dsh'), 'profiles');
  if (existsSync(profiles)) {
    for (const name of readdirSync(profiles)) {
      const manifest = join(profiles, name, 'package.json');
      if (existsSync(manifest)) tried.push(createRequire(manifest));
    }
  }
  for (const require of tried) {
    try {
      return require('@deepseek-ai/schemastery');
    } catch {
      /* try the next location */
    }
  }
  throw new Error('koi-pond: @deepseek-ai/schemastery is not resolvable from this bundle or any profile');
}

const z = loadSchema();

const PALETTES = ['mixed', 'warm', 'cool', 'mono'];

export default class KoiPond {
  static inject = ['settings'];

  static Config = z.object({
    fish: z.number().min(3).max(12).step(1).default(6).volatile(),
    palette: z.union(PALETTES).default('mixed').volatile(),
    young: z.boolean().default(true).volatile(),
  });

  constructor(ctx, config) {
    this.ctx = ctx;
    this.config = config;
    // The settings page owns every write; the Host never rewrites the document.
    ctx.inject(['settings'], (child) => {
      child.effect(() => child.settings.configure({ auto: false }, ctx.fiber));
    });
  }
}
