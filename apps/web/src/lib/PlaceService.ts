import { getCollection, getEntry, type CollectionEntry } from "astro:content";
import { Context, Effect, Layer } from "effect";

type Place = CollectionEntry<"places">;
export type PlaceGuideId = CollectionEntry<"placeGuides">["id"];

interface PlaceServiceShape {
  readonly getGuide: (
    id: PlaceGuideId,
  ) => Effect.Effect<CollectionEntry<"placeGuides"> | undefined>;
  readonly list: () => Effect.Effect<readonly Place[]>;
}

export class PlaceService extends Context.Service<PlaceService, PlaceServiceShape>()(
  "@mackie/PlaceService",
) {}

export const layer = Layer.sync(PlaceService, () => {
  const getGuide = Effect.fn("PlaceService.getGuide")(function* (id: PlaceGuideId) {
    return yield* Effect.tryPromise(() => Promise.resolve(getEntry("placeGuides", id))).pipe(
      Effect.orDie,
    );
  });

  const list = Effect.fn("PlaceService.list")(function* () {
    return yield* Effect.tryPromise(() => getCollection("places")).pipe(Effect.orDie);
  });

  return PlaceService.of({ getGuide, list });
});
