import path from 'node:path'
import log from 'electron-log/main'
import { APP_FOLDER, LOGS_FOLDER } from '../shared/types/constants'
import { getSettingsSync } from './utils'

export function initializeLogger() {
  log.initialize()

  const settings = getSettingsSync()

  log.transports.file.maxSize = 5242880 // 5 mb
  log.transports.file.resolvePathFn = (vars) =>
    path.join(
      settings.appDataFolder,
      APP_FOLDER,
      LOGS_FOLDER,
      // biome-ignore lint/style/noNonNullAssertion:
      vars.fileName!
    )

  return log
}

export const Logger = initializeLogger()
