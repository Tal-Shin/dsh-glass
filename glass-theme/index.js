/**
 * Host half of glass-theme.
 *
 * Declares the appearance settings so the Plugins page can save them; the Client module
 * owns the look and reads the saved values through its config scope. A linked copy lives
 * outside the profile, so the schema library falls back to whichever profile can resolve it.
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
  throw new Error('glass-theme: @deepseek-ai/schemastery is not resolvable from this bundle or any profile');
}

const z = loadSchema();

export default class AppleTheme {
  static inject = ['settings'];

  static Config = z.object({
    color: z.boolean().default(true).volatile(),
    backdrop: z.union(['wash', 'vivid', 'plain']).default('wash').volatile(),
    glass: z.boolean().default(true).volatile(),
    strength: z.number().min(0).max(100).step(5).default(50).volatile(),
    transparency: z.number().min(0).max(100).step(5).default(50).volatile(),
    blur: z.number().min(0).max(40).step(1).default(18).volatile(),
    refraction: z.union(['off', 'lens']).default('off').volatile(),
    shape: z.boolean().default(true).volatile(),
    radius: z.number().min(8).max(32).step(1).default(22).volatile(),
    interaction: z.boolean().default(true).volatile(),
    motion: z.union(['off', 'subtle', 'standard', 'lively']).default('standard').volatile(),
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
