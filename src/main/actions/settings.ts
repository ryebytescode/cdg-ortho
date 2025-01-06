import fs from 'node:fs/promises'
import path, { dirname } from 'node:path'
import { app, ipcMain } from 'electron'
import Logger from 'electron-log'
import { APP_NAME, SETTINGS_FILE } from '../../shared/constants'
import { getSettings } from '../utils'

export function registerSettingsHandlers() {
  ipcMain.handle('get-settings', getSettings)

  ipcMain.handle('save-settings', async (_, settings: AppConfig) => {
    const settingsFile = path.join(dirname(app.getPath('exe')), SETTINGS_FILE)

    // Copy app data folder if it has changed
    const oldSettings = await getSettings()
    const oldAppDataFolder = path.join(oldSettings.appDataFolder, APP_NAME)
    const newAppDataFolder = path.join(settings.appDataFolder, APP_NAME)

    if (oldAppDataFolder !== newAppDataFolder) {
      try {
        await fs.cp(oldAppDataFolder, newAppDataFolder, {
          recursive: true,
          preserveTimestamps: true,
        })

        // Save settings to file
        await fs.writeFile(settingsFile, JSON.stringify(settings, null, 2), {
          encoding: 'utf8',
        })

        Logger.info('App data folder copied successfully')
      } catch (err) {
        Logger.error(err)
        return false
      }
    }

    return true
  })
}
