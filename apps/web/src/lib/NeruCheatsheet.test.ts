import assert from "node:assert/strict";
import test from "node:test";
import snapshot from "../data/cheatsheets/neru.json";
import { createNeruCheatsheet, createNeruSnapshot } from "./NeruCheatsheet";

test("publishes only navigation data, not executable bindings or private config", () => {
  const input = structuredClone(snapshot);
  const filtered = createNeruSnapshot(
    JSON.stringify({
      ...input,
      hotkeys: {
        bindings: {
          ...input.hotkeys.bindings,
          "Ctrl+P": ["exec secret-command"],
          "Ctrl+Q": ["macro private-name"],
          "Ctrl+R": ["hints", "exec secret-command"],
        },
      },
      logging: { logFile: "/private/path" },
      hints: { ...input.hints, appConfigs: [{ bundleId: "private-app" }] },
    }),
    "1.57.0",
  );
  assert.deepEqual(filtered, snapshot);
});

test("keeps a mode-specific click override out of the shared click row", () => {
  const input = structuredClone(snapshot);
  input.scroll.hotkeys["Shift+L"] = ["action right_click"];
  const sections = createNeruCheatsheet(input);
  assert.equal(
    sections
      .find(({ id }) => id === "pointer")
      ?.rows.some(({ description }) => description.includes("Left click")),
    false,
  );
  assert.deepEqual(
    sections.find(({ id }) => id === "hints")?.rows.find(({ keys }) => keys === "⇧ L"),
    { keys: "⇧ L", description: "Left click" },
  );
  assert.deepEqual(
    sections.find(({ id }) => id === "scroll")?.rows.find(({ keys }) => keys === "⇧ L"),
    { keys: "⇧ L", description: "Right click" },
  );
});

test("does not restore a removed global launcher from defaults", () => {
  const input = {
    ...snapshot,
    hotkeys: {
      bindings: Object.fromEntries(
        Object.entries(snapshot.hotkeys.bindings).filter(([key]) => key !== "Ctrl+Alt+Space"),
      ),
    },
  };
  const modes = createNeruCheatsheet(input).find(({ id }) => id === "modes");
  assert.deepEqual(
    modes?.rows.map(({ keys }) => keys),
    ["⌃ ⌥ C", "⌃ ⌥ S", "⌘ ⇧ B", "⌘ ⇧ G"],
  );
});

test("rejects incomplete dumps and unsupported recursive grid layouts", () => {
  assert.throws(() => createNeruSnapshot("{}", "1.57.0"));
  assert.throws(
    () =>
      createNeruSnapshot(
        JSON.stringify({ ...snapshot, recursiveGrid: { ...snapshot.recursiveGrid, gridRows: 2 } }),
        "1.57.0",
      ),
    /3×3/,
  );
});
