import { createClient } from '@libsql/client'
import 'dotenv/config'
import path from 'node:path'
import { drizzle } from 'drizzle-orm/libsql'
import { app } from 'electron'
import { BUILD_FOLDER, DB_FILE_NAME } from '../../shared/constants'
import * as schema from './schema'

export function initializeDatabase() {
  const databaseFolder = !app.isPackaged
    ? path.join(app.getAppPath(), BUILD_FOLDER)
    : process.resourcesPath
  const databaseClient = createClient({
    url: `file:${path.join(databaseFolder, DB_FILE_NAME)}.db`,
  })

  return drizzle(databaseClient, { schema })
}

export const DB = initializeDatabase()
