import { LocalStorage } from './localStorage'

export const Config = {
  appDataFolder: {
    get: async () => {
      if (LocalStorage.has('appDataFolder')) {
        return LocalStorage.get('appDataFolder')
      }

      return await window.api.getConfigFolder()
    },
    set: (path: string) => {
      LocalStorage.set('appDataFolder', path)
    },
  },

  patientDataFolder: {
    get: async () => {
      if (LocalStorage.has('patientDataFolder')) {
        return LocalStorage.get('patientDataFolder')
      }

      return await window.api.getHomeFolder()
    },
    set: (path: string) => {
      LocalStorage.set('patientDataFolder', path)
    },
  },
}

export const initialValues = await Promise.all(
  Object.entries(Config).map(async ([key, value]) => [key, await value.get()])
).then((entries) => Object.fromEntries(entries))
