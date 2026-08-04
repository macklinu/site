import { Context, Effect, Layer, Schema } from "effect";

export const Author = Schema.Struct({
  name: Schema.String,
  bio: Schema.String,
  twitterHandle: Schema.String,
  githubHandle: Schema.String,
  linkedinHandle: Schema.String,
});
export type Author = typeof Author.Type;

const author: Author = {
  name: "Mackie Underdown",
  githubHandle: "@macklinu",
  twitterHandle: "@macklinu",
  linkedinHandle: "@macklinu",
  bio: "Detroit-based software engineer and musician",
};

export class Service extends Context.Service<
  Service,
  {
    me: () => Effect.Effect<Author>;
  }
>()("@mackie/web/lib/Author/Service") {
  static readonly layerStatic = Layer.succeed(
    Service,
    Service.of({
      me: () => Effect.succeed(author),
    }),
  );
}
