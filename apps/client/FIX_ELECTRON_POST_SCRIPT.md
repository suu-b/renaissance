# Fixing Electron Installation in the Renaissance Project

## Problem

When running `make client`, the Electron application may fail to start with errors such as:

```text
Error: Electron uninstall
```

or:

```text
Error: Cannot find module 'electron/package.json'
```

The Electron package may be present in `node_modules`, but its binary has not been extracted correctly. This can happen when Electron's automatic postinstall process fails to complete successfully.

## Environment

This issue was observed with the following setup:

- **OS:** Linux
- **Package manager:** pnpm 10.12.1
- **Node.js:** v26.3.1
- **Electron:** 39.8.10
- **Package:** `apps/client`

## Solution

### 1. Navigate to the Electron package directory

From the repository root, run:

```bash
cd ~/IdeaProjects/renaissance/node_modules/.pnpm/electron@39.8.10/node_modules/electron
```

If the Electron version changes, adjust the directory accordingly.

### 2. Extract the Electron binary manually

Electron's distribution ZIP may already be downloaded in the local cache, even if the installation script failed to extract it.

Run:

```bash
unzip -o "$HOME/.cache/electron/41a5d68646d956d50e13830e121ea0b3d6ab378b6a0ce422aefc1ff214707879/electron-v39.8.10-linux-x64.zip" -d "$(pwd)/dist"
```

This extracts the Electron distribution into the package's `dist` directory.

**Note:** The cache directory contains a hash, and the ZIP filename depends on the Electron version and platform. If this exact path does not exist, locate the appropriate ZIP under `~/.cache/electron/`.

To check whether the archive exists, run:

```bash
find "$HOME/.cache/electron" -name 'electron-v*-linux-x64.zip'
```

Use the matching archive for your Electron version.

### 3. Verify the extracted files

Run:

```bash
ls -lh dist/electron dist/version
cat dist/version
```

The expected output should show:

- `dist/electron` — the Electron executable, approximately 191 MB in this environment.
- `dist/version` — the installed Electron version, such as `39.8.10`.

The executable should have execute permissions. If necessary, run:

```bash
chmod +x dist/electron
```

### 4. Create the Electron path marker

Electron uses a `path.txt` file to determine the location of its executable.

From the Electron package directory, run:

```bash
printf 'electron' > path.txt
```

This tells the package to use the binary at `dist/electron`.

### 5. Verify the Electron package

Run:

```bash
node -e "console.log(require('./index.js'))"
```

Expected output:

```text
/home/<user>/IdeaProjects/renaissance/node_modules/.pnpm/electron@39.8.10/node_modules/electron/dist/electron
```

The exact path will depend on your machine.

If the command prints the path to `dist/electron`, the package can resolve its executable.

### 6. Run the client application

Return to the repository root:

```bash
cd ~/IdeaProjects/renaissance
make client
```

The application should now proceed past the Electron installation error.

## Troubleshooting

### The Electron ZIP file cannot be found

Search the local Electron cache:

```bash
find "$HOME/.cache/electron" -name 'electron-v*-linux-x64.zip'
```

If no suitable archive exists, rerun the Electron installation process or download the matching distribution from the official [Electron releases](https://github.com/electron/electron/releases).

### The `dist/electron` binary is missing

Make sure the extraction command completed successfully:

```bash
unzip -o "/absolute/path/to/electron-v39.8.10-linux-x64.zip" -d "$(pwd)/dist"
```

The destination must be an absolute path when using `extract-zip` directly. The system `unzip` command used above also works with the absolute destination.

### The Electron package still cannot resolve its binary

Check that `path.txt` exists and contains the correct value:

```bash
cat path.txt
```

Expected contents:

```text
electron
```

Then verify the binary:

```bash
test -x dist/electron && echo "Electron binary exists and is executable"
```

### The problem returns after reinstalling dependencies

The manual fix modifies files inside `node_modules`. These changes can be lost when dependencies are reinstalled, pruned, or rebuilt.

If the problem recurs, repeat the extraction and verification steps. Investigate why Electron's postinstall script fails rather than relying permanently on manual extraction.

## Summary

The workaround is to:

1. Extract the cached Electron ZIP into `electron/dist`.
2. Verify `dist/electron` and `dist/version`.
3. Create `path.txt` containing `electron`.
4. Confirm that `require('./index.js')` resolves to the executable.
5. Run `make client` from the repository root.

**Important:** This workaround fixes the current installation. It does not establish the root cause of the failed automatic extraction, so the postinstall issue may need further investigation if it happens again.