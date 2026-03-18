const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('backupAPI', {
  saveBackup: (data) => ipcRenderer.invoke('save-backup', data),
  restoreBackup: () => ipcRenderer.invoke('restore-backup')
})