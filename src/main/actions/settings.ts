import fs from 'node:fs/promises'
import path, { dirname } from 'node:path'
import { app, ipcMain } from 'electron'
import Logger from 'electron-log'
import { SETTINGS_FILE } from '../../shared/types/constants'
import { getSettings } from '../utils'

export function registerSettingsHandlers() {
  ipcMain.handle('get-settings', getSettings)

  ipcMain.handle('save-settings', async (_, settings: AppConfig) => {
    const settingsFile = path.join(dirname(app.getPath('exe')), SETTINGS_FILE)

    try {
      // Copy app data folder if it has changed
      const oldSettings = await getSettings()
      const oldAppDataFolder = oldSettings.appDataFolder
      const newAppDataFolder = settings.appDataFolder

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

          return true
        } catch (err) {
          Logger.error(err)
        }
      }
    } catch (error) {
      Logger.error(error)
    }

    return false
  })
}
