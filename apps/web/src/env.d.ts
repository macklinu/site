/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

declare module "*.wasm" {
  const wasm: any;
  export default wasm;
}

declare var __isWasmInitialized__: boolean;
