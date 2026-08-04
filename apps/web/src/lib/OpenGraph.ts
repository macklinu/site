import { Resvg } from "@resvg/resvg-js";
import { Effect } from "effect";
import type { ReactNode } from "react";
import satori from "satori";

const fetchFont = (weight: 400 | 700) =>
  Effect.tryPromise(async (signal) => {
    const response = await fetch(
      `https://github.com/googlefonts/Inconsolata/raw/refs/heads/main/fonts/ttf/Inconsolata-${weight === 400 ? "Regular" : "Bold"}.ttf`,
      { signal },
    );

    if (!response.ok) {
      throw new Error(
        `Failed to fetch Inconsolata ${weight}: ${response.status} ${response.statusText}`,
      );
    }

    return response.arrayBuffer();
  });

const fetchFonts = Effect.runSync(
  Effect.cached(
    Effect.all([fetchFont(400), fetchFont(700)], {
      concurrency: "unbounded",
    }),
  ),
);

export const renderOpenGraphImage = (element: ReactNode) =>
  Effect.gen(function* () {
    const [regular, bold] = yield* fetchFonts;
    const svg = yield* Effect.tryPromise(() =>
      satori(element, {
        width: 1200,
        height: 630,
        embedFont: true,
        fonts: [
          { name: "Inconsolata", data: regular, weight: 400, style: "normal" },
          { name: "Inconsolata", data: bold, weight: 700, style: "normal" },
        ],
      }),
    );
    const png = yield* Effect.sync(() => new Resvg(svg).render().asPng());

    return new Uint8Array(png);
  });
