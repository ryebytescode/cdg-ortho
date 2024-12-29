import 'dotenv/config'
import path from 'node:path'
import { cwd } from 'node:process'
import { createClient } from '@libsql/client'
import { drizzle } from 'drizzle-orm/libsql'
import { app } from 'electron'
import * as schema from './schema'

const dbClient = createClient(
  app.isPackaged
    ? {
        url: `file:${path.join(
          app.getPath('exe'),
          'data',
          process.env.MAIN_VITE_DB_FILE_NAME
        )}.db`,
        syncUrl: process.env.MAIN_VITE_TURSO_DATABASE_URL,
        authToken: process.env.MAIN_VITE_TURSO_AUTH_TOKEN,
        encryptionKey: process.env.MAIN_VITE_DB_ENCRYPTION_KEY,
      }
    : {
        url: `file:${path.join(cwd(), 'data', process.env.MAIN_VITE_DB_FILE_NAME)}.db`,
      }
)

export const DB = drizzle(dbClient, { schema })
