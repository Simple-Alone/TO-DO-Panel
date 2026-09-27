function createNotchSurfaceWindow({
  BrowserWindow,
  bounds,
  preloadPath,
  htmlPath,
  theme,
  installLocalWebContentsGuards,
  onReady,
  onClosed,
}) {
  const window = new BrowserWindow({
    ...bounds,
    frame: false,
    transparent: true,
    backgroundColor: '#00000000',
    resizable: false,
    movable: false,
    focusable: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    hasShadow: false,
    acceptFirstMouse: true,
    hiddenInMissionControl: true,
    fullscreenable: false,
    minimizable: false,
    maximizable: false,
    roundedCorners: false,
    show: false,
    webPreferences: {
      preload: preloadPath,
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      backgroundThrottling: false,
    },
  });

  installLocalWebContentsGuards(window.webContents);
  window.setAlwaysOnTop(true, 'screen-saver', 1);
  window.setVisibleOnAllWorkspaces(true, {
    visibleOnFullScreen: true,
    skipTransformProcessType: true,
  });
  window.loadFile(htmlPath, { query: { theme } });
  window.webContents.once('did-finish-load', () => onReady(window));
  window.on('closed', () => onClosed(window));
  return window;
}

module.exports = { createNotchSurfaceWindow };
