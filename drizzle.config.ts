import type { Config } from 'drizzle-kit'
import { DB_FILE_NAME } from './src/shared/types/constants'

export default {
  schema: './src/main/database/schema.ts',
  out: './migrations',
  dialect: 'sqlite',
  dbCredentials: {
    url: `file:build/${DB_FILE_NAME}.db`,
  },
} satisfies Config
