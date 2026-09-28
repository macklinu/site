import { getCollection, type CollectionEntry } from "astro:content";
import { Context, Effect, Layer } from "effect";

type Project = CollectionEntry<"projects">;

interface ProjectServiceShape {
  readonly list: () => Effect.Effect<readonly Project[]>;
}

export class ProjectService extends Context.Service<ProjectService, ProjectServiceShape>()(
  "@mackie/ProjectService",
) {}

export const layer = Layer.sync(ProjectService, () => {
  const list = Effect.fn("ProjectService.list")(function* () {
    return yield* Effect.tryPromise(() => getCollection("projects")).pipe(Effect.orDie);
  });

  return ProjectService.of({ list });
});
