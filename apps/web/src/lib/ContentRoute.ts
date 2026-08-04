import { getCollection } from "astro:content";
import { Effect } from "effect";

export const listContentRoutes = () =>
  Effect.tryPromise(() =>
    Promise.all([
      getCollection("articles"),
      getCollection("notes"),
      getCollection("demos"),
      getCollection("guides"),
    ]),
  ).pipe(
    Effect.map(([articles, notes, demos, guides]) => [
      ...articles.map((entry) => ({ kind: "posts" as const, entry })),
      ...notes.map((entry) => ({ kind: "notes" as const, entry })),
      ...demos.map((entry) => ({ kind: "demos" as const, entry })),
      ...guides.map((entry) => ({ kind: "guides" as const, entry })),
    ]),
    Effect.orDie,
    Effect.withSpan("listContentRoutes"),
  );
