const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('simulationApi', {
  runSimulation: (inputs) => ipcRenderer.invoke('simulation:run', inputs)
});
