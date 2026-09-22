# Distribution Packaging

Renaissance ships as an Electron desktop app with a bundled Fastify server.
The server is compiled into a single JS bundle using [ncc](https://github.com/vercel/ncc)
and packed inside the Electron app as an `extraResource`.

---

## Architecture

```
resources/
  app.asar                  ← Electron app (main + renderer, vite-built)
  app.asar.unpacked/
    resources/
      server-bin/
        index.js            ← ncc bundle (Fastify server, all deps inlined)
        keytar.node         ← native addon (unpacked from asar so it can dlopen)
        worker.js           ← keytar worker
        package.json
```

At runtime the Electron main process spawns the bundle via its own Node runtime:

```ts
spawn(process.execPath, ['--no-warnings', bundleJs], {
  env: { ...process.env, PORT: '...', ELECTRON_RUN_AS_NODE: '1' }
})
```

No separate Node installation is required on the user's machine.

---

## Build Steps

### 1. Bundle the server

Run this whenever server code changes. Produces `apps/server/bundle/index.js`.

```bash
pnpm --filter @renaissance/server run build:bundle
```

### 2. Package the Electron app

```bash
# Linux  → dist/Renaissance-1.0.0.AppImage  +  dist/Renaissance-1.0.0.deb
pnpm --filter @renaissance/client run build:linux

# Windows → dist/Renaissance-1.0.0-setup.exe
pnpm --filter @renaissance/client run build:win

# macOS  → dist/Renaissance-1.0.0.dmg
pnpm --filter @renaissance/client run build:mac
```

Or use the combined root-level scripts (add these to the root `package.json`):

```json
"package:linux": "pnpm --filter @renaissance/server run build:bundle && pnpm --filter @renaissance/client run build:linux",
"package:win":   "pnpm --filter @renaissance/server run build:bundle && pnpm --filter @renaissance/client run build:win",
"package:mac":   "pnpm --filter @renaissance/server run build:bundle && pnpm --filter @renaissance/client run build:mac"
```

---

## Output Files

| Platform | File |
|----------|------|
| Linux    | `apps/client/dist/Renaissance-1.0.0.AppImage` |
| Linux    | `apps/client/dist/Renaissance-1.0.0.deb` |
| Windows  | `apps/client/dist/Renaissance-1.0.0-setup.exe` |
| macOS    | `apps/client/dist/Renaissance-1.0.0.dmg` |

---

## Cross-Compilation

electron-builder only builds natively by default:

| Build target | Must run on |
|---|---|
| Linux builds | Linux |
| Windows builds | Windows (or Linux + Wine) |
| macOS builds | macOS |

For CI, use a GitHub Actions matrix across `ubuntu-latest`, `windows-latest`, and `macos-latest`.

---

## Why ncc instead of pkg

The server uses `"type": "module"` (ESM output) and `node:sqlite` (a Node built-in accessed via the `node:` protocol). `pkg` v5 cannot handle either of these:

- It cannot bundle ESM modules
- It treats `node:sqlite` as a missing file path rather than a built-in

`ncc` compiles the TypeScript entry point and inlines all third-party dependencies
into a single CJS file. Node built-ins (`node:sqlite`, `node:fs`, etc.) are left
as-is and resolved at runtime by the Electron Node binary.

---

## Configuration Files

| File | Purpose |
|---|---|
| [`apps/server/package.json`](../apps/server/package.json) | `build:bundle` script (ncc) |
| [`apps/client/electron-builder.yml`](../apps/client/electron-builder.yml) | Electron packaging config, `extraResources` points to `server/bundle/` |
| [`apps/client/src/main/index.ts`](../apps/client/src/main/index.ts) | `startServer()` — spawns the bundle in production |
