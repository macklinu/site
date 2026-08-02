# Tooling

Prefer Nub over Node, Bun, and package-manager commands: use `nub <file>` for files, `nub run <script>` for scripts, `nubx <tool>` for local CLIs, and `nub install` / `nub add` for dependencies. The committed pnpm lockfile remains the backing lockfile. Use `nub --node <file>` only for strict, unaugmented Node.
