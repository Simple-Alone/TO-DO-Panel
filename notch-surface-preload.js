const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('notchSurfaceAPI', {
  toggle: () => ipcRenderer.send('notch-surface:toggle'),
  onState: (callback) => {
    const handler = (_event, state) => callback(state);
    ipcRenderer.on('notch-surface:state', handler);
    return () => ipcRenderer.removeListener('notch-surface:state', handler);
  },
});
