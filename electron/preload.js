const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('qchDesktop', {
  display: {
    getState: () => ipcRenderer.invoke('qch-display:get-state'),
    apply: settings => ipcRenderer.invoke('qch-display:apply', settings),
    onChanged: callback => {
      const listener = (_event, state) => callback(state);
      ipcRenderer.on('qch-display:changed', listener);
      return () => ipcRenderer.removeListener('qch-display:changed', listener);
    },
  },
});
