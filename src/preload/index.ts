import { electronAPI } from '@electron-toolkit/preload'
import { contextBridge, ipcRenderer } from 'electron'

// Custom APIs for renderer
const api = {
  openFolderSelectorDialog: async () => {
    return await ipcRenderer.invoke('open-folder-selector-dialog')
  },
  processCreatePatient: async () => {
    return await ipcRenderer.invoke('process-create-patient')
  },
  getHomeFolder: async () => {
    return await ipcRenderer.invoke('get-home-folder')
  },
  getConfigFolder: async () => {
    return await ipcRenderer.invoke('get-config-folder')
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
