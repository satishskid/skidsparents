/**
 * Type-safe accessor for Cloudflare bindings from Astro locals.
 * Returns the Env object from locals.runtime.env.
 * Falls back to a cast empty object if runtime is absent (e.g. local dev without wrangler).
 */
export function getEnv(locals: App.Locals): Env {
  return (locals as App.Locals & { runtime?: { env?: Env } }).runtime?.env ?? ({} as Env)
}
