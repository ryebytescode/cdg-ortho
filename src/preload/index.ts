import { electronAPI } from '@electron-toolkit/preload'
import { contextBridge, ipcRenderer } from 'electron'
import type { FileCategory } from '../shared/constants'

// Custom APIs for renderer
const api = {
  openFolderSelectorDialog: async () => {
    return await ipcRenderer.invoke('open-folder-selector-dialog')
  },

  createPatientRecord: async (fields: PatientFields) => {
    return await ipcRenderer.invoke('create-patient-record', fields)
  },
  updatePatientRecord: async (fields: PatientFields) => {
    return await ipcRenderer.invoke('update-patient-record', fields)
  },
  getPatients: async () => {
    return await ipcRenderer.invoke('get-patients')
  },
  getPatientProfile: async (id: string) => {
    return await ipcRenderer.invoke('get-patient-profile', id)
  },
  createBill: async (fields: BillFields) => {
    return await ipcRenderer.invoke('create-bill', fields)
  },
  updateBill: async (fields: BillFields) => {
    return await ipcRenderer.invoke('update-bill', fields)
  },
  getBills: async (id: string) => {
    return await ipcRenderer.invoke('get-bills', id)
  },
  getBill: async (id: string) => {
    return await ipcRenderer.invoke('get-bill', id)
  },
  settleBill: async (fields: SettleFields) => {
    return await ipcRenderer.invoke('settle-bill', fields)
  },
  uploadFile: (patientId: string, category: FileCategory, file: FileProps) => {
    ipcRenderer.send('upload-file', patientId, category, file)
  },

  getFiles: async (patientId: string, category: FileCategory) => {
    return await ipcRenderer.invoke('get-files', patientId, category)
  },

  onUploadComplete: (callback: (fileName: string) => void) => {
    ipcRenderer.on(
      'upload-complete',
      (_: Electron.IpcRendererEvent, fileName: string) => callback(fileName)
    )
  },
  onUploadError: (callback: () => void) => {
    ipcRenderer.on('upload-error', callback)
  },
  onUploadProgress: (
    callback: (fileName: string, progress: number) => void
  ) => {
    ipcRenderer.on('upload-progress', (_, fileName, progress) =>
      callback(fileName, progress)
    )
  },
  removeUploadProgressListener: (
    callback: (fileName: string, progress: number) => void
  ) => {
    const wrappedCallback = (
      _: Electron.IpcRendererEvent,
      fileName: string,
      progress: number
    ) => callback(fileName, progress)
    ipcRenderer.removeListener('upload-progress', wrappedCallback)
  },

  getSettings: async () => {
    return await ipcRenderer.invoke('get-settings')
  },
  saveSettings: async (
    settings: AppConfig | ((prevSettings: AppConfig) => AppConfig)
  ) => {
    let _settings = settings

    if (typeof settings === 'function') {
      const appSettings = await ipcRenderer.invoke('get-settings')
      _settings = settings(appSettings ?? {})
    }

    return await ipcRenderer.invoke('save-settings', _settings)
  },
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
