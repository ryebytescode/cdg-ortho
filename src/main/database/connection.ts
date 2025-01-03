import path from 'node:path'
import { createClient } from '@libsql/client'
import { drizzle } from 'drizzle-orm/libsql'
import { app } from 'electron'
import { BUILD_FOLDER, DB_FILE_NAME } from '../../shared/types/constants'
import * as schema from './schema'

export function initializeDatabase() {
  const databaseFolder = path.join(app.getAppPath(), BUILD_FOLDER)
  const databaseUrl = `file:${path.join(databaseFolder, DB_FILE_NAME)}.db`

  return drizzle(createClient({ url: databaseUrl }), { schema })
}

export const DB = initializeDatabase()
