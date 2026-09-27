const test = require('node:test');
const assert = require('node:assert/strict');
const { createNotchSurfaceWindow } = require('../main/notch-surface-window');

test('macOS notch surface stays isolated and above the resizable panel window', () => {
  const events = {};
  const calls = [];
  const fakeWindow = {
    webContents: {
      once(name, callback) { events[name] = callback; },
    },
    setAlwaysOnTop(...args) { calls.push(['alwaysOnTop', ...args]); },
    setVisibleOnAllWorkspaces(...args) { calls.push(['workspaces', ...args]); },
    loadFile(...args) { calls.push(['load', ...args]); },
    on(name, callback) { events[name] = callback; },
  };
  function Window(options) {
    calls.push(['options', options]);
    return fakeWindow;
  }
  const ready = [];
  const result = createNotchSurfaceWindow({
    BrowserWindow: Window,
    bounds: { x: 10, y: 20, width: 200, height: 38 },
    preloadPath: 'notch-surface-preload.js',
    htmlPath: 'notch-surface.html',
    theme: 'dark',
    installLocalWebContentsGuards: () => calls.push(['guards']),
    onReady: (window) => ready.push(window),
    onClosed: () => calls.push(['closed']),
  });

  assert.equal(result, fakeWindow);
  assert.deepEqual(calls[0][1], {
    x: 10, y: 20, width: 200, height: 38,
    frame: false, transparent: true, backgroundColor: '#00000000',
    resizable: false, movable: false, focusable: false, alwaysOnTop: true,
    skipTaskbar: true, hasShadow: false, acceptFirstMouse: true,
    hiddenInMissionControl: true, fullscreenable: false, minimizable: false,
    maximizable: false, roundedCorners: false, show: false,
    webPreferences: {
      preload: 'notch-surface-preload.js', contextIsolation: true,
      nodeIntegration: false, sandbox: true, backgroundThrottling: false,
    },
  });
  assert.deepEqual(calls.find((entry) => entry[0] === 'alwaysOnTop'), ['alwaysOnTop', true, 'screen-saver', 1]);
  assert.deepEqual(calls.find((entry) => entry[0] === 'workspaces'), [
    'workspaces', true, { visibleOnFullScreen: true, skipTransformProcessType: true },
  ]);
  assert.deepEqual(calls.find((entry) => entry[0] === 'load'), [
    'load', 'notch-surface.html', { query: { theme: 'dark' } },
  ]);
  events['did-finish-load']();
  assert.deepEqual(ready, [fakeWindow]);
});
