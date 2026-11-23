# Packaging 
**Software Packaging** is the process of bundling an application's code, dependencies, configuration files etc into a standardized unit for distribution.

**Distribution** involves making the package available for different spectrum of users via internet through sites like GitHub releases etc.

**Deployment** is the separate process of installing the package on the target systems.

## Packaging Renaissance

First, I am targetting to package renaissance as an AppImage for Linux Users. The reason being - this is the most accessible way for me. I will gradually support deb, flatpak, and eventually Windows. 

### 1. Bundling the server
A local fastify server exists here: `apps/server`. It contains the business code for the client exposed via HTTP. The server is started by the client on startup. In development, we run the server spawning a child process using `pnpm --filter @renaissance/server run dev`. In production however, we wouldn't have pnpm installed. 
Therefore, we will bundle the fastify server as a standalone js file using **EsBuild** using `pnpm --filter server build:bundle`. This will create a bundled file at `apps/server/bundle/index.cjs`. 

### 2. Packaging the client
We are using **electron-builder** to package the client electron app. The configuration is present at `apps/client/electron-builder.yml`. An important thing to note - the bundled file at `apps/server/bundle/index.cjs` will be copied to `resources` by electron builder and the client will spawn it from there.

Here, the bundled server is copied to resources:

```yaml
extraResources:
  - from: "../server/bundle"
    to: "server-bin"
```

The client will spawn it in production like this:

```js
const bundleJs = path.join(process.resourcesPath, 'server-bin', 'index.cjs')
spawn(process.execPath, ['--no-warnings', bundleJs], {
    env: {
        ...process.env,
        PORT: String(serverPort),
        RENAISSANCE_INSTALL_PATH,
        RENAISSANCE_RUNTIME_PATH,
        ELECTRON_RUN_AS_NODE: '1',
    },
    stdio: 'inherit',
})
```

### 3. AppImage
An appImage is a self-contained executable file that contains the application code and all its dependencies. It is a popular way to distribute applications on Linux because it does not require installation and can be run from anywhere.

Once the above steps are performed, an app image will be created like this: `apps/client/dist/Renaissance-1.0.0.AppImage`. It can be run like `./apps/client/dist/Renaissance-1.0.0.AppImage`.

## Issues Encountered 
### Before the first successfull packaging
#### Server bundle execution failure
Server was failing to start after bundling. There were two primary such cases:
- CJS vs ESM: We have to create a cjs bundle because many dependencies seemed to make use of `require`. 
- Swagger: Swagger, after getting bundled, was referencing some static assets which I had no idea how to copy to the end bundle. I ended up excluding swagger from the production bundle and though keeping it there for dev purposes.

#### Stylesheet overrriding
Once up and running, the app image was not importing styles from `index.css`, especially the primary color. I had just one stylesheet defined, `styles/index.css`. However, after some debugging I found that there are actually two stylesheets present in the packaged app. The other one seemed to override `index.css`. Turned out, Harmonia Text Editor (a dependency created by myself some time back) was injecting a css file which was overriding our styles. I decided to migrate off from it to pure slate.

#### Poppins Font Issues
I was importing it directly from google fonts using a url. Was getting blocked. Ended up bundling them together with the app.

#### Routing Issue
The initial screen after successful deployment was blank screen. Turned out I had to use HashRouter instead of BrowserRouter in the client. I am still unclear about the reason.