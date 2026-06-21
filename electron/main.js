const { app, BrowserWindow, shell } = require('electron');
const { fork } = require('child_process');
const net = require('net');
const path = require('path');

const isDev = !app.isPackaged;
const PORT = process.env.QCH_DESKTOP_PORT || '4789';
const HOST = '127.0.0.1';
let nextServer = null;

const getAppRoot = () => (isDev ? path.join(__dirname, '..') : process.resourcesPath);

const getServerPath = () => {
  const root = getAppRoot();
  return isDev
    ? path.join(root, '.next', 'standalone', 'server.js')
    : path.join(root, 'app', '.next', 'standalone', 'server.js');
};

const waitForServer = (port, host, timeoutMs = 30000) => new Promise((resolve, reject) => {
  const startedAt = Date.now();

  const tryConnect = () => {
    const socket = net.createConnection(Number(port), host);
    socket.once('connect', () => {
      socket.destroy();
      resolve();
    });
    socket.once('error', () => {
      socket.destroy();
      if (Date.now() - startedAt > timeoutMs) {
        reject(new Error(`QCH local server did not start on ${host}:${port}`));
        return;
      }
      setTimeout(tryConnect, 250);
    });
  };

  tryConnect();
});

const startNextServer = () => {
  const serverPath = getServerPath();
  const serverCwd = path.dirname(serverPath);
  const desktopDataDir = path.join(app.getPath('userData'), 'Data');

  nextServer = fork(serverPath, [], {
    cwd: serverCwd,
    env: {
      ...process.env,
      NODE_ENV: 'production',
      PORT,
      HOSTNAME: HOST,
      ELECTRON_RUN_AS_NODE: '1',
      QCH_DATA_DIR: desktopDataDir,
    },
    stdio: isDev ? 'inherit' : 'ignore',
  });

  nextServer.on('exit', code => {
    if (code && !app.isQuitting) app.quit();
  });
};

const createWindow = async () => {
  startNextServer();
  await waitForServer(PORT, HOST);

  const mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1180,
    minHeight: 720,
    fullscreen: false,
    kiosk: false,
    backgroundColor: '#020617',
    autoHideMenuBar: true,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  mainWindow.webContents.on('before-input-event', (event, input) => {
    if (input.type !== 'keyDown') return;
    if (!input.control || input.key !== 'Enter') return;

    event.preventDefault();
    mainWindow.setFullScreen(!mainWindow.isFullScreen());
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  await mainWindow.loadURL(`http://${HOST}:${PORT}`);
};

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  app.quit();
});

app.on('before-quit', () => {
  app.isQuitting = true;
  if (nextServer) nextServer.kill();
});