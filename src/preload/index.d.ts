/// <reference types="../shared/types/config" />

import type { ElectronAPI } from '@electron-toolkit/preload'

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      openFolderSelectorDialog: () => Promise<string | null>
      createPatientRecord: (fields: PatientFields) => Promise<boolean>
      updatePatientRecord: (fields: PatientFields) => Promise<boolean>
      getPatients: () => Promise<Patient[]>
      getPatientProfile: (id: string) => Promise<Patient | null>
      getSettings: () => Promise<AppConfig>
      saveSettings: (
        settings: AppConfig | ((prevSettings: AppConfig) => AppConfig)
      ) => Promise<boolean>
      createBill: (fields: BillFields) => Promise<boolean>
      updateBill: (fields: BillFields) => Promise<boolean>
      getBills: (id: string) => Promise<Bill[]>
      getBill: (id: string) => Promise<Bill>
      settleBill: (fields: SettleFields) => Promise<boolean>
      uploadFile: (
        patientId: string,
        category: FileCategory,
        file: FileProps
      ) => void
      getFilesInfo: (
        patientId: string,
        category: FileCategory
      ) => Promise<File[]>
      deleteFile: (fileId: string) => Promise<boolean>
    }
  }
}
