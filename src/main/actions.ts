import { ipcMain } from 'electron'
import { registerBillingHandlers } from './actions/billing'
import { registerFileSystemHandlers } from './actions/filesystem'
import { registerPatientHandlers } from './actions/patient'
import { registerSettingsHandlers } from './actions/settings'

export function registerHandlers() {
  ipcMain.setMaxListeners(0)

  registerSettingsHandlers()
  registerFileSystemHandlers()
  registerPatientHandlers()
  registerBillingHandlers()
}
