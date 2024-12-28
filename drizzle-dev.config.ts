import fs from 'node:fs/promises'
import type { Config } from 'drizzle-kit'

;(async () => {
  try {
    await fs.mkdir('data')
  } catch (error) {}
})()

export default {
  schema: './src/main/database/schema.ts',
  out: './migrations/dev',
  dialect: 'sqlite',
  dbCredentials: {
    url: `file:data/${process.env.MAIN_VITE_DB_FILE_NAME}.db`,
  },
} satisfies Config
