import type { AstroGlobal, AstroSharedContext } from 'astro'
import { Context, Effect } from 'effect'

export class Params extends Context.Tag('@mackie/web/lib/AstroContext/Params')<
  Params,
  Record<string, string | undefined>
>() {
  static readonly provide = (Astro: AstroGlobal | AstroSharedContext) =>
    Effect.provideService(Params, Astro.params)
}
