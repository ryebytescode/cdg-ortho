import path, { dirname } from 'node:path'
import { app } from 'electron'
import log from 'electron-log/main'
import { LOGS_FOLDER } from '../shared/constants'

export function initializeLogger() {
  log.initialize()
  log.transports.file.maxSize = 5242880 // 5 mb
  log.transports.file.resolvePathFn = (vars) =>
    path.join(
      dirname(app.getPath('exe')),
      LOGS_FOLDER,
      // biome-ignore lint/style/noNonNullAssertion:
      vars.fileName!
    )

  return log
}

export const Logger = initializeLogger()
