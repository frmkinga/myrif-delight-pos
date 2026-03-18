const { app, BrowserWindow, ipcMain, dialog } = require('electron')
const path = require('path')
const fs = require('fs')

function getBackupFolder() {
  const folder = path.join(app.getPath('documents'), 'POS System Backups')
  if (!fs.existsSync(folder)) {
    fs.mkdirSync(folder, { recursive: true })
  }
  return folder
}

ipcMain.handle('save-backup', async (_event, data) => {
  try {
    const folder = getBackupFolder()
    const stamp = new Date().toISOString().replace(/[:.]/g, '-')
    const filePath = path.join(folder, `pos-backup-${stamp}.json`)
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8')
    return { success: true, filePath }
  } catch (error) {
    return { success: false, error: error.message }
  }
})

ipcMain.handle('restore-backup', async () => {
  try {
    const result = await dialog.showOpenDialog({
      title: 'Select POS Backup File',
      filters: [{ name: 'JSON Files', extensions: ['json'] }],
      properties: ['openFile']
    })

    if (result.canceled || !result.filePaths.length) {
      return { success: false, canceled: true }
    }

    const filePath = result.filePaths[0]
    const content = fs.readFileSync(filePath, 'utf-8')
    const parsed = JSON.parse(content)

    return { success: true, data: parsed, filePath }
  } catch (error) {
    return { success: false, error: error.message }
  }
})

function createWindow() {
  const win = new BrowserWindow({
    width: 1400,
    height: 900,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false
    }
  })

  win.loadFile(path.join(__dirname, 'dist', 'index.html'))
}

app.whenReady().then(() => {
  createWindow()
})