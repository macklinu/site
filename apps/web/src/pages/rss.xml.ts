import type { APIRoute } from "astro";
import rss from "@astrojs/rss";
import { Effect } from "effect";

import * as Entry from "~/lib/Entry";
import { Runtime } from "~/lib/Runtime";

export const GET: APIRoute = async (context) => {
  const items = await Runtime.runPromise(
    Effect.gen(function* () {
      const entryService = yield* Entry.Service;

      return yield* entryService.listRssItems();
    }),
  );

  return rss({
    title: "Mackie Underdown",
    description: "A public reference for Mackie Underdown’s writing, notes, and guides.",
    site: context.site!,
    items: items.map((item) => ({
      title: item.title,
      description: item.description,
      link: item.href,
      pubDate: new Date(item.publicationDate.epochMilliseconds),
    })),
  });
};
