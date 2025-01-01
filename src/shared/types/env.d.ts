declare global {
  namespace NodeJS {
    interface ProcessEnv {
      MAIN_VITE_DB_FILE_NAME: string
      MAIN_VITE_TURSO_DATABASE_URL: string
      MAIN_VITE_TURSO_AUTH_TOKEN: string
      MAIN_VITE_CUID2_FINGERPRINT: string
      MAIN_VITE_DB_ENCRYPTION_KEY: string
      MAIN_VITE_SETTINGS_FILE_NAME: string
      MAIN_VITE_TEMP_FOLDER: string
      MAIN_VITE_UPLOADS_FOLDER: string
    }
  }
}

export {}
