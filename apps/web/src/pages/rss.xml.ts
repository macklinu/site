import type { APIRoute } from "astro";
import rss from "@astrojs/rss";
import { Effect } from "effect";

import * as Entry from "~/lib/Entry";
import { Runtime } from "~/lib/Runtime";

export const GET: APIRoute = async (context) => {
  const entries = await Runtime.runPromise(
    Effect.gen(function* () {
      const entryService = yield* Entry.Service;

      return yield* entryService.list();
    }),
  );

  return rss({
    title: "Mackie Underdown",
    description: "A public reference for Mackie Underdown’s writing, notes, and guides.",
    site: context.site!,
    items: entries
      .filter((entry) => entry.kind !== "interactive")
      .map((entry) => ({
        title: entry.title,
        description: entry.description,
        link: entry.href,
        pubDate: new Date(entry.publicationDate.epochMilliseconds),
      })),
  });
};
