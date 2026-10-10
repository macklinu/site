import { parse } from "smol-toml";

export interface ShortcutRow {
  keys: string;
  bindingKeys: string[];
  description: string;
  commands?: string[];
}

export interface ShortcutSection {
  id: string;
  title: string;
  rows: ShortcutRow[];
}

type Binding = { key: string; commands: string[] };
type SectionId = "apps" | "workspaces" | "windows" | "tiling" | "service" | "other";

const appNames: Record<string, string> = {
  "com.mitchellh.ghostty": "Ghostty",
  "com.google.Chrome": "Chrome",
  "com.linear": "Linear",
  "com.apple.MobileSMS": "Messages",
  "com.flexibits.fantastical2.mac": "Fantastical",
  "com.apple.reminders": "Reminders",
  "com.apple.systempreferences": "System Settings",
  "net.whatsapp.WhatsApp": "WhatsApp",
  "com.lexfriedman.G-As-In-Gnome": "Gnome",
};

const keyNames: Record<string, string> = {
  alt: "⌥",
  shift: "⇧",
  ctrl: "⌃",
  cmd: "⌘",
  minus: "−",
  equal: "=",
  slash: "/",
  comma: ",",
  semicolon: ";",
  esc: "Esc",
  tab: "Tab",
  space: "Space",
  left: "←",
  down: "↓",
  up: "↑",
  right: "→",
};

function formatKey(key: string) {
  return key
    .split("-")
    .map((part) => (Object.hasOwn(keyNames, part) ? keyNames[part] : part.toUpperCase()))
    .join(" ");
}

function table(value: unknown): Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function describe(binding: Binding): { section: SectionId; description: string; raw?: true } {
  const { commands } = binding;
  if (commands.length === 2 && commands[1] === "mode main") {
    if (commands[0] === "reload-config")
      return { section: "service", description: "Reload config; then exit" };
    if (commands[0] === "flatten-workspace-tree")
      return { section: "service", description: "Reset tree; then exit" };
    if (commands[0] === "layout floating tiling")
      return { section: "service", description: "Float / tile; then exit" };
    const join = commands[0]?.match(/^join-with (left|down|up|right)$/);
    if (join) return { section: "service", description: `Join ${join[1]}; then exit` };
  }
  if (commands.length !== 1)
    return { section: "other", description: "Configured commands", raw: true };
  const command = commands[0] ?? "";
  const app = command.match(/^exec-and-forget open -b ([\w.-]+)$/);
  if (app) {
    const name = Object.hasOwn(appNames, app[1] ?? "") ? appNames[app[1] ?? ""] : undefined;
    return name
      ? { section: "apps", description: name }
      : { section: "apps", description: "Open / activate app", raw: true };
  }
  const direction = command.match(/^(focus|move) (left|down|up|right)$/);
  if (direction)
    return {
      section: "windows",
      description: `${direction[1] === "focus" ? "Focus" : "Move in tiled tree:"} ${direction[2]}`,
    };
  const workspace = command.match(/^(workspace|move-node-to-workspace) ([\w-]+)$/);
  if (workspace)
    return {
      section: "workspaces",
      description:
        workspace[1] === "workspace"
          ? `Switch to workspace ${workspace[2]}`
          : `Send to workspace ${workspace[2]}; stay here`,
    };
  const resize = command.match(/^resize smart ([+-]?\d+)$/);
  if (resize) return { section: "tiling", description: `Resize smart ${resize[1]} (tiled only)` };
  switch (command) {
    case "layout tiles horizontal vertical":
      return { section: "tiling", description: "Tiles: switch orientation" };
    case "layout accordion horizontal vertical":
      return { section: "tiling", description: "Accordion: switch orientation" };
    case "workspace-back-and-forth":
      return { section: "workspaces", description: "Previous workspace" };
    case "move-workspace-to-monitor --wrap-around next":
      return { section: "workspaces", description: "Move workspace to next monitor" };
    case "mode service":
      return { section: "service", description: "Enter service mode" };
    default:
      return { section: "other", description: "Configured command", raw: true };
  }
}

// Collapse a family only when every key and its full command sequence match.
function takeGroup(options: {
  bindings: Map<string, Binding>;
  prefix: string;
  members: { key: string; commands: string[] }[];
  label: string;
  description: string;
}): ShortcutRow | undefined {
  const { bindings, prefix, members, label, description } = options;
  if (
    !members.every(({ key, commands }) => {
      const actual = bindings.get(`${prefix}${key}`)?.commands;
      return (
        actual?.length === commands.length &&
        commands.every((command, index) => actual[index] === command)
      );
    })
  )
    return;
  const bindingKeys = members.map(({ key }) => `${prefix}${key}`);
  for (const key of bindingKeys) bindings.delete(key);
  return { keys: `${formatKey(prefix.slice(0, -1))} ${label}`, bindingKeys, description };
}

export function createAeroSpaceCheatsheet(source: string) {
  const config = parse(source);
  const sections: ShortcutSection[] = [
    { id: "apps", title: "Open / activate apps", rows: [] },
    { id: "workspaces", title: "Workspaces & monitors", rows: [] },
    { id: "windows", title: "Focus & move", rows: [] },
    { id: "tiling", title: "Tiled window layout", rows: [] },
    { id: "service", title: "Service mode", rows: [] },
    { id: "other", title: "Other main bindings", rows: [] },
  ];
  const byId = new Map(sections.map((section) => [section.id, section]));
  const directions = [
    { key: "h", direction: "left" },
    { key: "j", direction: "down" },
    { key: "k", direction: "up" },
    { key: "l", direction: "right" },
  ];
  const numbers = Array.from({ length: 9 }, (_, index) => String(index + 1));
  const modes = table(config.mode);
  for (const [mode, value] of Object.entries(modes)) {
    const bindings = new Map<string, Binding>();
    for (const [key, command] of Object.entries(table(table(value).binding))) {
      const commands = typeof command === "string" ? [command] : command;
      if (
        !Array.isArray(commands) ||
        !commands.every((item): item is string => typeof item === "string")
      ) {
        throw new Error(`Unsupported AeroSpace binding: mode.${mode}.binding.${key}`);
      }
      bindings.set(key, { key, commands });
    }
    if (mode === "main") {
      for (const group of [
        {
          section: "workspaces",
          prefix: "alt-",
          members: numbers.map((key) => ({ key, commands: [`workspace ${key}`] })),
          label: "1–9",
          description: "Switch workspace",
        },
        {
          section: "workspaces",
          prefix: "alt-shift-",
          members: numbers.map((key) => ({ key, commands: [`move-node-to-workspace ${key}`] })),
          label: "1–9",
          description: "Send window; stay here",
        },
        {
          section: "windows",
          prefix: "alt-",
          members: directions.map(({ key, direction }) => ({
            key,
            commands: [`focus ${direction}`],
          })),
          label: "H J K L",
          description: "Focus ← ↓ ↑ →",
        },
        {
          section: "windows",
          prefix: "alt-shift-",
          members: directions.map(({ key, direction }) => ({
            key,
            commands: [`move ${direction}`],
          })),
          label: "H J K L",
          description: "Move ← ↓ ↑ → in tiled tree",
        },
      ]) {
        const row = takeGroup({ bindings, ...group });
        if (row) byId.get(group.section)?.rows.push(row);
      }
    } else if (mode === "service") {
      const row = takeGroup({
        bindings,
        prefix: "alt-shift-",
        members: directions.map(({ key, direction }) => ({
          key,
          commands: [`join-with ${direction}`, "mode main"],
        })),
        label: "H J K L",
        description: "Join ← ↓ ↑ →; then exit",
      });
      if (row) byId.get("service")?.rows.push(row);
    }
    const customSection: ShortcutSection = { id: `mode-${mode}`, title: `${mode} mode`, rows: [] };
    for (const binding of bindings.values()) {
      const detail = describe(binding);
      const row: ShortcutRow = {
        keys: formatKey(binding.key),
        bindingKeys: [binding.key],
        description: detail.description,
        ...(detail.raw ? { commands: binding.commands } : {}),
      };
      if (mode === "main") byId.get(detail.section)?.rows.push(row);
      else if (mode === "service") {
        // Service keys must never be confused with main-mode app launchers.
        byId.get("service")?.rows.push(
          detail.section === "service"
            ? row
            : {
                ...row,
                description: "Configured commands",
                commands: binding.commands,
              },
        );
      } else
        customSection.rows.push({
          ...row,
          description: "Configured commands",
          commands: binding.commands,
        });
    }
    if (customSection.rows.length) sections.push(customSection);
  }
  const windowRules = config["on-window-detected"];
  const floatingDefault =
    Array.isArray(windowRules) &&
    windowRules.length === 1 &&
    table(windowRules[0]).if === "true" &&
    table(windowRules[0]).run === "layout floating";
  return { sections: sections.filter((section) => section.rows.length > 0), floatingDefault };
}
