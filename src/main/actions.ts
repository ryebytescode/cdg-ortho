import { app, dialog, ipcMain } from 'electron'

export function setListeners() {
  ipcMain.handle('open-folder-selector-dialog', async () => {
    const result = await dialog.showOpenDialog({
      title: 'Select data folder location',
      properties: ['openDirectory'],
    })

    if (result.canceled) {
      return null
    }

    return result.filePaths[0]
  })

  ipcMain.handle('process-create-patient', async () => {})

  ipcMain.handle('get-home-folder', () => {
    return app.getPath('home')
  })

  ipcMain.handle('get-config-folder', () => {
    return app.getPath('appData')
  })
}
