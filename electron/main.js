const { app, BrowserWindow, ipcMain, shell } = require('electron');
const { fork } = require('child_process');
const net = require('net');
const path = require('path');

const isDev = !app.isPackaged;
const PORT = process.env.QCH_DESKTOP_PORT || '4789';
const HOST = '127.0.0.1';
let nextServer = null;

const WINDOWED_RESOLUTIONS = Object.freeze({
  '1280x720': [1280, 720],
  '1366x768': [1366, 768],
  '1440x900': [1440, 900],
  '1600x900': [1600, 900],
  '1920x1080': [1920, 1080],
});

const getDisplayState = mainWindow => {
  const [width, height] = mainWindow.getSize();
  return {
    mode: mainWindow.isFullScreen() ? 'fullscreen' : 'windowed',
    resolution: mainWindow.isFullScreen() ? 'native' : String(width) + 'x' + String(height),
    width,
    height,
    availableResolutions: Object.keys(WINDOWED_RESOLUTIONS),
  };
};

const publishDisplayState = mainWindow => {
  if (!mainWindow.isDestroyed()) {
    mainWindow.webContents.send('qch-display:changed', getDisplayState(mainWindow));
  }
};

ipcMain.handle('qch-display:get-state', event => {
  const mainWindow = BrowserWindow.fromWebContents(event.sender);
  return mainWindow ? getDisplayState(mainWindow) : null;
});

ipcMain.handle('qch-display:apply', async (event, settings = {}) => {
  const mainWindow = BrowserWindow.fromWebContents(event.sender);
  if (!mainWindow) return null;
  if (settings.mode !== 'fullscreen' && settings.mode !== 'windowed') throw new Error('Unsupported display mode');

  if (settings.mode === 'fullscreen') {
    mainWindow.setFullScreen(true);
    return { ...getDisplayState(mainWindow), mode: 'fullscreen', resolution: 'native' };
  }

  const hasResolution = typeof settings.resolution === 'string'
    && Object.prototype.hasOwnProperty.call(WINDOWED_RESOLUTIONS, settings.resolution);
  const size = hasResolution ? WINDOWED_RESOLUTIONS[settings.resolution] : null;
  if (!size) throw new Error('Unsupported display resolution');

  if (mainWindow.isFullScreen()) {
    await new Promise(resolve => {
      mainWindow.once('leave-full-screen', resolve);
      mainWindow.setFullScreen(false);
    });
  }

  mainWindow.setSize(size[0], size[1], true);
  mainWindow.center();
  return getDisplayState(mainWindow);
});

ipcMain.on('qch-app:quit', () => {
  app.quit();
});

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
    icon: path.join(app.getAppPath(), 'qch.ico'),
    width: 1440,
    height: 900,
    minWidth: 1180,
    minHeight: 720,
    fullscreen: false,
    kiosk: false,
    backgroundColor: '#020617',
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
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

  mainWindow.on('enter-full-screen', () => publishDisplayState(mainWindow));
  mainWindow.on('leave-full-screen', () => publishDisplayState(mainWindow));
  mainWindow.on('resized', () => publishDisplayState(mainWindow));

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
