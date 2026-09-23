import type { APIRoute } from "astro";
import rss from "@astrojs/rss";
import { Effect } from "effect";

import * as EntryService from "~/lib/EntryService";

export const GET: APIRoute = async (context) => {
  const items = await Effect.runPromise(
    Effect.gen(function* () {
      const entryService = yield* EntryService.EntryService;
      return yield* entryService.listRssItems();
    }).pipe(Effect.provide(EntryService.layer)),
  );

  if (context.site === undefined) {
    throw new Error("The Astro site configuration is required to generate the RSS feed.");
  }

  return rss({
    title: "Mackie Underdown",
    description: "A public reference for Mackie Underdown’s writing, notes, and guides.",
    site: context.site,
    items: items.map((item) => ({
      title: item.title,
      description: item.description,
      link: item.href,
      pubDate: new Date(item.publicationDate.epochMilliseconds),
    })),
  });
};
