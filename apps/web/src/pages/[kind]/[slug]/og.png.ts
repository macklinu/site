import { getCollection } from "astro:content";
import type { APIRoute, GetStaticPaths } from "astro";
import { Effect } from "effect";

import type { EntryKind } from "~/lib/Entry";
import { Runtime } from "~/lib/Runtime";
import { renderOpenGraphImage } from "~/lib/OpenGraph";
import { entryImage } from "~/og";

type OpenGraphEntry = {
  readonly title: string;
  readonly description: string;
  readonly kind: EntryKind;
};

type OpenGraphProps = {
  readonly entry: OpenGraphEntry;
};

const generateOpenGraphImageResponse = (entry: OpenGraphEntry) =>
  renderOpenGraphImage(entryImage(entry)).pipe(
    Effect.map(
      (image) =>
        new Response(image, {
          headers: {
            "Content-Type": "image/png",
          },
        }),
    ),
    Effect.withSpan("generateContentOpenGraphImage"),
  );

export const getStaticPaths: GetStaticPaths = () =>
  Runtime.runPromise(
    Effect.tryPromise(() =>
      Promise.all([getCollection("notes"), getCollection("demos"), getCollection("guides")]),
    ).pipe(
      Effect.map(([notes, demos, guides]) => [
        ...notes.map((entry) => ({
          params: { kind: "notes", slug: entry.id },
          props: { entry: entry.data },
        })),
        ...demos.map((entry) => ({
          params: { kind: "demos", slug: entry.id },
          props: { entry: entry.data },
        })),
        ...guides.map((entry) => ({
          params: { kind: "guides", slug: entry.id },
          props: { entry: entry.data },
        })),
      ]),
      Effect.orDie,
      Effect.withSpan("listContentOpenGraphStaticPaths"),
    ),
  );

export const GET: APIRoute<OpenGraphProps, Record<string, string | undefined>> = ({ props }) =>
  Runtime.runPromise(generateOpenGraphImageResponse(props.entry));
