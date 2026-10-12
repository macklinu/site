import type { APIRoute } from "astro";
import { Effect } from "effect";

import { renderOpenGraphImageResponse } from "~/lib/OpenGraph";
import { entryImage } from "~/og";

const title = "San Francisco";
const description = "My favorite places from when I lived in San Francisco from 2018 to 2020.";

export const GET: APIRoute = () =>
  Effect.runPromise(renderOpenGraphImageResponse(entryImage({ title, description })));
