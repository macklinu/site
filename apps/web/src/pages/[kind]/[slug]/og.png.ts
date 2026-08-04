import type { APIRoute, GetStaticPaths } from "astro";
import { Effect } from "effect";

import type { EntryKind } from "~/lib/Entry";
import { listContentRoutes } from "~/lib/ContentRoute";
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
  );

export const getStaticPaths: GetStaticPaths = () =>
  Effect.runPromise(
    listContentRoutes().pipe(
      Effect.map((routes) =>
        routes.map(({ kind, entry }) => ({
          params: { kind, slug: entry.id },
          props: { entry: entry.data },
        })),
      ),
    ),
  );

export const GET: APIRoute<OpenGraphProps, Record<string, string | undefined>> = ({ props }) =>
  Effect.runPromise(generateOpenGraphImageResponse(props.entry));
