import assert from "node:assert/strict";
import test from "node:test";
import { createAeroSpaceCheatsheet } from "./AeroSpaceCheatsheet";

for (const { source, path } of [
  { source: "mode = []", path: /mode/ },
  { source: "mode.main = []", path: /main/ },
  { source: "mode.main.binding = []", path: /binding/ },
  { source: "[mode.main.binding]\nalt-h = 42", path: /alt-h/ },
  { source: "[mode.main.binding]\nalt-h = ['focus left', 42]", path: /alt-h/ },
]) {
  test(`rejects malformed binding data: ${source}`, () => {
    assert.throws(() => createAeroSpaceCheatsheet(source), path);
  });
}

test("keeps unknown commands and dynamic modes visible without rejecting other TOML settings", () => {
  const { sections } = createAeroSpaceCheatsheet(`
config-version = 2
on-window-detected = [{ if = 'true', run = 'layout floating' }]
gaps.inner.horizontal = 8

[mode.main.binding]
alt-z = 'future-command'
alt-y = ['future-first', 'future-second']

[mode.service.binding]
f = ['exec-and-forget open -b com.google.Chrome', 'mode main']

[mode.constructor.binding]
x = ['custom-one', 'custom-two']
`);

  assert.deepEqual(
    sections.find(({ id }) => id === "other")?.rows.map(({ keys, commands }) => ({ keys, commands })),
    [
      { keys: "⌥ Z", commands: ["future-command"] },
      { keys: "⌥ Y", commands: ["future-first", "future-second"] },
    ],
  );
  assert.deepEqual(
    sections.find(({ id }) => id === "service")?.rows.map(({ commands }) => commands),
    [["exec-and-forget open -b com.google.Chrome", "mode main"]],
  );
  assert.deepEqual(
    sections.find(({ id }) => id === "mode-constructor")?.rows.map(({ commands }) => commands),
    [["custom-one", "custom-two"]],
  );
  assert.equal(sections.some(({ id }) => id === "apps"), false);
});

test("groups equivalent command forms but expands a family when a full sequence changes", () => {
  const source = `
[mode.main.binding]
alt-h = 'focus left'
alt-j = ['focus down']
alt-k = 'focus up'
alt-l = ['focus right']
`;
  const grouped = createAeroSpaceCheatsheet(source).sections;
  assert.deepEqual(
    grouped.find(({ id }) => id === "windows")?.rows.map(({ keys }) => keys),
    ["⌥ H J K L"],
  );

  const changed = createAeroSpaceCheatsheet(
    source.replace("alt-h = 'focus left'", "alt-h = ['focus left', 'mode service']"),
  ).sections;
  assert.deepEqual(
    changed.find(({ id }) => id === "windows")?.rows.map(({ keys }) => keys),
    ["⌥ J", "⌥ K", "⌥ L"],
  );
  assert.deepEqual(
    changed.find(({ id }) => id === "other")?.rows.map(({ keys, commands }) => ({ keys, commands })),
    [{ keys: "⌥ H", commands: ["focus left", "mode service"] }],
  );
});
