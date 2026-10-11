import { Schema } from "effect";

const Hotkeys = Schema.Record(Schema.String, Schema.Array(Schema.String));
const Mode = Schema.Struct({ hotkeys: Hotkeys });
const NeruConfig = Schema.Struct({
  hotkeys: Schema.Struct({ bindings: Hotkeys }),
  hints: Mode,
  grid: Schema.Struct({ hotkeys: Hotkeys, sublayerKeys: Schema.String }),
  recursiveGrid: Schema.Struct({
    hotkeys: Hotkeys,
    keys: Schema.String,
    gridRows: Schema.Number,
    gridCols: Schema.Number,
  }),
  bisect: Mode,
  scroll: Mode,
  stickyModifiers: Schema.Struct({ enabled: Schema.Boolean }),
});
export interface NeruSnapshot extends NeruConfig {
  version: string;
}
interface NeruConfig extends Schema.Schema.Type<typeof NeruConfig> {}

const actions: Record<string, string> = {
  hints: "Hints",
  recursive_grid: "Recursive grid",
  scroll: "Scroll",
  grid: "Grid",
  bisect: "Bisect",
  idle: "Exit",
  "action left_click": "Left click",
  "action right_click": "Right click",
  "action middle_click": "Middle click",
  "action left_click --state down": "Hold left button",
  "action left_click --state up": "Release left button",
  "action move_mouse_relative --dx=-10 --dy=0": "Move left 10 px",
  "action move_mouse_relative --dx=0 --dy=10": "Move down 10 px",
  "action move_mouse_relative --dx=0 --dy=-10": "Move up 10 px",
  "action move_mouse_relative --dx=10 --dy=0": "Move right 10 px",
  "action backspace": "Undo",
  "action reset": "Reset",
  "action search_hints": "Search text",
  "action cycle_hint": "Next hint",
  "action cycle_hint --backward": "Previous hint",
  "toggle-cursor-follow-selection": "Toggle pointer follow",
  "action bisect --direction=left": "Keep left half",
  "action bisect --direction=down": "Keep bottom half",
  "action bisect --direction=up": "Keep top half",
  "action bisect --direction=right": "Keep right half",
  "action bisect --direction=up_left": "Keep top-left quarter",
  "action bisect --direction=up_right": "Keep top-right quarter",
  "action bisect --direction=down_left": "Keep bottom-left quarter",
  "action bisect --direction=down_right": "Keep bottom-right quarter",
  "action scroll_down": "Scroll down",
  "action scroll_up": "Scroll up",
  "action scroll_left": "Scroll left",
  "action scroll_right": "Scroll right",
  "action page_down": "Page down",
  "action page_up": "Page up",
  "action go_top": "Top",
  "action go_bottom": "Bottom",
};

const keyPattern =
  /^(?:(?:Primary|Cmd|Command|Ctrl|Control|Alt|Option|Shift|Super|Meta)\+)*(?:[a-zA-Z0-9]{1,2}|Space|Return|Enter|Escape|Tab|Backspace|Delete|Up|Down|Left|Right|PageUp|PageDown|Home|End|F\d{1,2}|[`\-=[\]\\;',./])$/;

// Publish only navigation fields and known commands, never exec, macros, paths or app settings.
export function createNeruSnapshot(source: string, version: string) {
  if (!/^\d+\.\d+\.\d+$/.test(version)) throw new Error("Expected a Neru version such as 1.57.0");
  const config: NeruConfig = Schema.decodeUnknownSync(NeruConfig)(JSON.parse(source));
  const filter = (hotkeys: NeruConfig["hints"]["hotkeys"]) =>
    Object.fromEntries(
      Object.entries(hotkeys).filter(
        ([key, commands]) =>
          keyPattern.test(key) &&
          commands.length === 1 &&
          Object.hasOwn(actions, commands[0] ?? ""),
      ),
    );
  if (
    !/^[a-z0-9]+$/.test(config.grid.sublayerKeys) ||
    !/^[a-z0-9]+$/.test(config.recursiveGrid.keys) ||
    config.recursiveGrid.gridRows !== 3 ||
    config.recursiveGrid.gridCols !== 3 ||
    config.recursiveGrid.keys.length !== 9
  ) {
    throw new Error("Expected a 3×3 recursive grid and letter/number grid keys");
  }
  return {
    version,
    hotkeys: { bindings: filter(config.hotkeys.bindings) },
    hints: { hotkeys: filter(config.hints.hotkeys) },
    grid: { hotkeys: filter(config.grid.hotkeys), sublayerKeys: config.grid.sublayerKeys },
    recursiveGrid: {
      hotkeys: filter(config.recursiveGrid.hotkeys),
      keys: config.recursiveGrid.keys,
      gridRows: config.recursiveGrid.gridRows,
      gridCols: config.recursiveGrid.gridCols,
    },
    bisect: { hotkeys: filter(config.bisect.hotkeys) },
    scroll: { hotkeys: filter(config.scroll.hotkeys) },
    stickyModifiers: { enabled: config.stickyModifiers.enabled },
  };
}

const keyNames: Record<string, string> = {
  Primary: "⌘",
  Cmd: "⌘",
  Command: "⌘",
  Super: "⌘",
  Meta: "⌘",
  Ctrl: "⌃",
  Control: "⌃",
  Alt: "⌥",
  Option: "⌥",
  Shift: "⇧",
  Space: "Space",
  Escape: "Esc",
  Backspace: "⌫",
  Up: "↑",
  Down: "↓",
  Left: "←",
  Right: "→",
};
function formatKey(key: string) {
  return key
    .split("+")
    .map((part) => keyNames[part] ?? part)
    .join(" ");
}

type Row = { keys: string; description: string };
export function createNeruCheatsheet(config: NeruSnapshot) {
  const modes = [config.hints, config.grid, config.recursiveGrid, config.bisect, config.scroll];
  const shared = Object.fromEntries(
    Object.entries(config.hints.hotkeys).filter(
      ([key, commands]) =>
        commands[0] !== "action backspace" &&
        modes.every((mode) => mode.hotkeys[key]?.[0] === commands[0]),
    ),
  );
  function rows(hotkeys: NeruConfig["hints"]["hotkeys"], groups: [string[], string][] = []) {
    const result: Row[] = [];
    const used = new Set<string>();
    for (const [commands, description] of groups) {
      const keys = commands.map((command) =>
        Object.entries(hotkeys)
          .filter(([, steps]) => steps[0] === command)
          .map(([key]) => formatKey(key))
          .join(" or "),
      );
      if (keys.every(Boolean)) {
        result.push({ keys: keys.join(" / "), description });
        commands.forEach((command) => used.add(command));
      }
    }
    for (const [key, commands] of Object.entries(hotkeys)) {
      const command = commands[0];
      if (command && !used.has(command) && actions[command]) {
        result.push({ keys: formatKey(key), description: actions[command] });
      }
    }
    return result;
  }
  function specific(hotkeys: NeruConfig["hints"]["hotkeys"]) {
    return Object.fromEntries(
      Object.entries(hotkeys).filter(([key]) => !Object.hasOwn(shared, key)),
    );
  }
  function matrix(keys: string) {
    return [keys.slice(0, 3), keys.slice(3, 6), keys.slice(6, 9)]
      .map((row) => [...row].join(" "))
      .join(" · ");
  }
  const commonRows = rows(shared, [
    [
      ["action left_click", "action right_click", "action middle_click"],
      "Left / right / middle click",
    ],
    [
      ["action left_click --state down", "action left_click --state up"],
      "Hold / release left button",
    ],
    [
      [
        "action move_mouse_relative --dx=-10 --dy=0",
        "action move_mouse_relative --dx=0 --dy=10",
        "action move_mouse_relative --dx=0 --dy=-10",
        "action move_mouse_relative --dx=10 --dy=0",
      ],
      "Move pointer 10 px",
    ],
  ]);
  if (config.stickyModifiers.enabled)
    commonRows.push({ keys: "⌘ ⌃ ⌥ ⇧ (tap)", description: "Hold / release modifier" });
  return [
    {
      id: "modes",
      title: "Modes",
      rows: rows(config.hotkeys.bindings),
      note: "Select moves the pointer; click separately. Esc exits.",
    },
    {
      id: "pointer",
      title: "Click & drag",
      rows: commonRows,
      note: "Exit releases a held mouse button.",
    },
    {
      id: "hints",
      title: "Hints",
      rows: [
        { keys: "Label", description: "Select target" },
        ...rows(specific(config.hints.hotkeys), [
          [["action cycle_hint", "action cycle_hint --backward"], "Next / previous hint"],
        ]),
      ],
    },
    {
      id: "recursive-grid",
      title: "Recursive grid",
      rows: [
        { keys: matrix(config.recursiveGrid.keys), description: "Select cell; repeat to narrow" },
        ...rows(specific(config.recursiveGrid.hotkeys)),
      ],
    },
    {
      id: "bisect",
      title: "Bisect",
      rows: rows(specific(config.bisect.hotkeys), [
        [
          [
            "action bisect --direction=left",
            "action bisect --direction=down",
            "action bisect --direction=up",
            "action bisect --direction=right",
          ],
          "Keep left / bottom / top / right half",
        ],
        [
          [
            "action bisect --direction=up_left",
            "action bisect --direction=up_right",
            "action bisect --direction=down_left",
            "action bisect --direction=down_right",
          ],
          "Keep top-left / top-right / bottom-left / bottom-right quarter",
        ],
      ]),
    },
    {
      id: "grid",
      title: "Grid",
      rows: [
        { keys: "Label → sublabel", description: "Select cell → point" },
        { keys: matrix(config.grid.sublayerKeys.slice(0, 9)), description: "Subgrid cells" },
        ...rows(specific(config.grid.hotkeys)),
      ],
    },
    {
      id: "scroll",
      title: "Scroll",
      note: "Place the pointer over the pane first.",
      rows: rows(specific(config.scroll.hotkeys), [
        [["action scroll_down", "action scroll_up"], "Down / up"],
        [["action scroll_left", "action scroll_right"], "Left / right"],
        [["action page_down", "action page_up"], "Page down / up"],
        [["action go_top", "action go_bottom"], "Top / bottom"],
      ]),
    },
  ];
}
