import { ManagedRuntime } from "effect";

import * as Entry from "~/lib/Entry";

export const Runtime = ManagedRuntime.make(Entry.Service.layerAstro);
