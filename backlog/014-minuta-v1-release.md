# Minuta v1.0.0 Release

## Tasks

1. **Rename packages**
   - `minuta` → `minuta`
   - `minuta-vue` → `minuta-vue`
   - `minuta-react` → `minuta-react`
   - `minuta-svelte` → `minuta-svelte`

2. **Update all internal imports** across framework packages

3. **Update README** — new name, new examples, new import paths

4. **Update package.json** — name, version 1.0.0, description, homepage, repository

5. **Update slides** — new library name in presentation

6. **Publish to npm** — `minuta@1.0.0`

7. **Fix framework re-exports** (backlog/013) — only export framework bindings, not core ops

## Open questions

- npm scope: `minuta` or `@minuta/core`?
- Keep `minuta` as deprecated redirect?
