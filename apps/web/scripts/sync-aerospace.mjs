import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { parse } from "smol-toml";

const [source, ...extra] = process.argv.slice(2);
if (!source || extra.length > 0) {
  console.error("Usage: pnpm cheatsheets:sync /path/to/aerospace.toml");
  process.exitCode = 1;
} else {
  const content = await readFile(resolve(source), "utf8");
  // Parse before replacing the tracked snapshot; the page parses this same TOML.
  parse(content);
  const destination = fileURLToPath(
    new URL("../src/data/cheatsheets/aerospace.toml", import.meta.url),
  );
  await mkdir(dirname(destination), { recursive: true });
  await writeFile(destination, content);
  console.log("Updated apps/web/src/data/cheatsheets/aerospace.toml");
}
