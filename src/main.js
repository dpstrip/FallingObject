const path = require('path');
const { app, BrowserWindow, ipcMain } = require('electron');
const { FallingObjectSimulationService } = require('./services/FallingObjectSimulationService');

const simulationService = new FallingObjectSimulationService();

function createMainWindow() {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 820,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  mainWindow.loadFile(path.join(__dirname, 'renderer', 'index.html'));
}

ipcMain.handle('simulation:run', (_event, rawInputs) => {
  return simulationService.run(rawInputs);
});

app.whenReady().then(() => {
  createMainWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
