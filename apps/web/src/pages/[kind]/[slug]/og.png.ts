import { getCollection } from "astro:content";
import type { APIRoute, GetStaticPaths } from "astro";
import { Effect, Exit } from "effect";

import type { EntryKind } from "~/lib/Entry";
import { renderOpenGraphImage } from "~/lib/OpenGraph";
import { entryImage } from "~/og";

type OpenGraphEntry = {
  readonly title: string;
  readonly description: string;
  readonly kind: EntryKind;
};

export const getStaticPaths: GetStaticPaths = async () => {
  const [notes, interactives, guides] = await Promise.all([
    getCollection("notes"),
    getCollection("interactives"),
    getCollection("guides"),
  ]);

  return [
    ...notes.map((entry) => ({
      params: { kind: "notes", slug: entry.id },
      props: { entry: entry.data },
    })),
    ...interactives.map((entry) => ({
      params: { kind: "demos", slug: entry.id },
      props: { entry: entry.data },
    })),
    ...guides.map((entry) => ({
      params: { kind: "guides", slug: entry.id },
      props: { entry: entry.data },
    })),
  ];
};

export const GET: APIRoute = async (context) => {
  const entry = context.props.entry as OpenGraphEntry;
  const result = await Effect.runPromiseExit(renderOpenGraphImage(entryImage(entry)));

  if (Exit.isFailure(result)) {
    throw new Error("Unable to generate content Open Graph image", { cause: result.cause });
  }

  return new Response(result.value, {
    headers: {
      "Content-Type": "image/png",
    },
  });
};
