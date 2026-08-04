import { getCollection } from "astro:content";
import { Context, Effect, Layer, Schema } from "effect";

export const Project = Schema.Struct({
  name: Schema.String,
  href: Schema.String,
  description: Schema.String,
});
export type Project = typeof Project.Type;

export class Service extends Context.Service<
  Service,
  {
    list: () => Effect.Effect<readonly Project[]>;
  }
>()("@mackie/web/lib/Project/Service") {
  static readonly layerAstro = Layer.succeed(
    Service,
    Service.of({
      list: () =>
        Effect.tryPromise(() => getCollection("projects")).pipe(
          Effect.map((projects) =>
            projects.map(
              (project): Project => ({
                name: project.data.title,
                href: project.data.href,
                description: project.data.description,
              }),
            ),
          ),
          Effect.orDie,
        ),
    }),
  );
}
