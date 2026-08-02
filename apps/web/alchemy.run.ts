import * as Alchemy from "alchemy";
import * as Cloudflare from "alchemy/Cloudflare";
import * as Effect from "effect/Effect";

export default Alchemy.Stack(
  "mackie-underdown-wiki",
  { providers: Cloudflare.providers(), state: Cloudflare.state() },
  Effect.gen(function* () {
    const stage = yield* Alchemy.Stage;
    const website = yield* Cloudflare.Website.StaticSite("website", {
      name: `mackie-underdown-wiki-website-${stage}`,
      command: "bun run build",
      outdir: "dist",
      dev: { command: "bun run astro dev" },
      routes: [{ pattern: "mackie.underdown.wiki/*" }],
      assets: {
        htmlHandling: "drop-trailing-slash",
      },
    });

    return { url: website.url };
  }),
);
