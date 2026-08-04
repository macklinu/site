import type { APIRoute } from "astro";
import rss from "@astrojs/rss";
import { Effect } from "effect";

import * as Entry from "~/lib/Entry";

export const GET: APIRoute = async (context) => {
  const items = await Effect.runPromise(Entry.listRssItems());

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
