import { readFileSync, writeFileSync } from 'node:fs'
import fs from 'node:fs/promises'
import path, { dirname } from 'node:path'
import { app } from 'electron'
import { APP_NAME, SETTINGS_FILE } from '../shared/constants'

const defaultSettings: AppConfig = {
  appDataFolder: path.join(app.getPath('appData'), APP_NAME, APP_NAME),
}

const settingsFile = path.join(dirname(app.getPath('exe')), SETTINGS_FILE)

export async function getSettings(): Promise<AppConfig> {
  try {
    const settings = await fs.readFile(settingsFile, { encoding: 'utf-8' })
    return JSON.parse(settings) as AppConfig
  } catch (error) {
    await fs.writeFile(settingsFile, JSON.stringify(defaultSettings, null, 2), {
      encoding: 'utf-8',
    })
    return defaultSettings
  }
}

export function getSettingsSync(): AppConfig {
  try {
    const settings = readFileSync(settingsFile, { encoding: 'utf-8' })
    return JSON.parse(settings) as AppConfig
  } catch (error) {
    writeFileSync(settingsFile, JSON.stringify(defaultSettings, null, 2), {
      encoding: 'utf-8',
    })
    return defaultSettings
  }
}
