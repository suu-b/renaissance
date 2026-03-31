const { app, BrowserWindow } = require('electron')
const { spawn } = require('child_process')
const path = require('path')

let backendConn;

function createWindow(){
    const win = new BrowserWindow({
        width: 1000,
        height: 700
    })
    
    win.loadURL("http://localhost:5173");
}

function startLocalBackend(){
    const pythonPath = path.join(__dirname, "../server/venv/bin/python");
    backendConn = spawn(pythonPath, [path.join(__dirname, "../server/main.py")]);

    backendConn.stdout.on("data", (data) => {
        console.log(`backend: ${data}`);
    });

    backendConn.stderr.on("data", (data) => {
        console.error(`backend error: ${data}`);
    });
}

async function waitForBackend() {
  const maxRetries = 10;

  for (let i = 0; i < maxRetries; i++) {
    try {
      await fetch("http://localhost:8000/health");
      return;
    } catch {
      await new Promise(r => setTimeout(r, 300));
    }
  }

  throw new Error("Backend failed to start");
}

app.whenReady().then(async () => {
  startLocalBackend();
  await waitForBackend();

  createWindow();
});

app.on("will-quit", () => {
  if (backendConn) backendConn.kill();
});