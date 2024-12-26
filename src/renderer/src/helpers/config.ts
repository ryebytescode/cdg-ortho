export const Config = {
  get: async (key: keyof AppConfig) => {
    const settings = await window.api.getSettings()

    if (settings?.[key]) return settings[key]

    return null
  },
  getAll: async () => {
    return await window.api.getSettings()
  },
  set: async (key: keyof AppConfig, value: string) => {
    return await window.api.saveSettings((prevSettings) => ({
      ...prevSettings,
      [key]: value,
    }))
  },
  setAll: async (settings: AppConfig) => {
    return await window.api.saveSettings(settings)
  },
}

export const initialValues = await Config.getAll()
