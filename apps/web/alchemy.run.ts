import * as Alchemy from "alchemy";
import * as Cloudflare from "alchemy/Cloudflare";
import * as GitHub from "alchemy/GitHub";
import * as Output from "alchemy/Output";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";

export default Alchemy.Stack(
  "mackie-underdown-wiki",
  {
    providers: Layer.mergeAll(Cloudflare.providers(), GitHub.providers()),
    state: Cloudflare.state(),
  },
  Effect.gen(function* () {
    const stage = yield* Alchemy.Stage;
    const website = yield* Cloudflare.Website.StaticSite("website", {
      name: `mackie-underdown-wiki-website-${stage}`,
      command: "nub run build",
      outdir: "dist",
      dev: { command: "nub run astro dev" },
      routes: stage === "prod" ? [{ pattern: "mackie.underdown.wiki/*" }] : undefined,
      assets: {
        htmlHandling: "drop-trailing-slash",
      },
    });

    if (stage.startsWith("pr-") && process.env.PULL_REQUEST) {
      const pullRequest = Number(process.env.PULL_REQUEST);
      const buildSha = process.env.BUILD_SHA;

      yield* GitHub.Comment("preview-comment", {
        owner: "macklinu",
        repository: "site",
        issueNumber: pullRequest,
        body: Output.interpolate`
          ## Preview Deployed

          **Website:** ${website.url}

          Built from commit ${
            buildSha
              ? `[\`${buildSha.slice(0, 7)}\`](https://github.com/macklinu/site/commit/${buildSha})`
              : "unknown"
          }.

          ---
          <sub>This comment updates automatically with each push.</sub>
        `,
      });
    }

    return { url: website.url };
  }),
);
