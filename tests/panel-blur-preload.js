const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('notchAPI', {
  platform: process.platform,
  setMode: (mode) => ipcRenderer.invoke('test-window:set-mode', mode),
  beginCollapse: () => ipcRenderer.invoke('test-window:begin-collapse'),
  getMetrics: () => ipcRenderer.invoke('test-window:metrics'),
});
