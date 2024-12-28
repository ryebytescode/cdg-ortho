/// <reference types="../shared/types/config" />

import type { ElectronAPI } from '@electron-toolkit/preload'

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      openFolderSelectorDialog: () => Promise<string | null>
      createPatientRecord: (fields: NewPatientFields) => Promise<boolean>
      updatePatientRecord: (fields: EditPatientFields) => Promise<boolean>
      getPatients: () => Promise<Patient[]>
      getPatientProfile: (id: string) => Promise<Patient | null>
      getSettings: () => Promise<AppConfig>
      saveSettings: (
        settings: AppConfig | ((prevSettings: AppConfig) => AppConfig)
      ) => Promise<boolean>
    }
  }
}
