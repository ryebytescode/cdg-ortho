import type { ElectronAPI } from '@electron-toolkit/preload'

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      openFolderSelectorDialog: () => Promise<string | null>
      processCreatePatient: () => void
      getHomeFolder: () => string
      getConfigFolder: () => string
    }
  }
}
