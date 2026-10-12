import type { APIRoute, GetStaticPaths } from "astro";
import { Effect } from "effect";

import * as EntryService from "~/lib/EntryService";
import { cheatsheets } from "~/lib/Cheatsheets";
import { renderOpenGraphImageResponse } from "~/lib/OpenGraph";
import { entryImage } from "~/og";

type OpenGraphEntry = {
  readonly title: string;
  readonly description: string;
  readonly label?: string;
};

type OpenGraphProps = {
  readonly entry: OpenGraphEntry;
};

export const getStaticPaths: GetStaticPaths = () =>
  Effect.runPromise(
    Effect.gen(function* () {
      const entryService = yield* EntryService.EntryService;
      const routes = yield* entryService.listContentRoutes();

      return [
        ...routes.map(({ kind, entry }) => ({
          params: { kind, slug: entry.id },
          props: { entry: entry.data },
        })),
        ...Object.entries(cheatsheets).map(([slug, sheet]) => ({
          params: { kind: "cheatsheets", slug },
          props: { entry: { ...sheet, label: "Cheat sheet" } },
        })),
      ];
    }).pipe(Effect.provide(EntryService.layer)),
  );

export const GET: APIRoute<OpenGraphProps, Record<string, string | undefined>> = ({ props }) =>
  Effect.runPromise(renderOpenGraphImageResponse(entryImage(props.entry)));
