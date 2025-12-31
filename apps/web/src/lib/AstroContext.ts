import type { AstroGlobal, AstroSharedContext } from 'astro'
import { Context, Layer } from 'effect'

export class Params extends Context.Tag('@mackie/web/lib/AstroContext/Params')<
  Params,
  Record<string, string | undefined>
>() {
  static readonly layerRequest = (Astro: AstroGlobal | AstroSharedContext) =>
    Layer.sync(Params, () => Params.of(Astro.params))
}

export const layerRequest = (Astro: AstroGlobal | AstroSharedContext) => Params.layerRequest(Astro)
