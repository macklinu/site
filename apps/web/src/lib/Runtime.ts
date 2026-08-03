import { Layer, ManagedRuntime } from "effect";

import * as Author from "~/lib/Author";
import * as Entry from "~/lib/Entry";
import * as Post from "~/lib/Post";
import * as Project from "~/lib/Project";

export const Runtime = ManagedRuntime.make(
  Post.Service.layerAstro.pipe(
    Layer.provideMerge(Author.Service.layerStatic),
    Layer.provideMerge(Entry.Service.layerAstro),
    Layer.provideMerge(Project.Service.layerAstro),
  ),
);
