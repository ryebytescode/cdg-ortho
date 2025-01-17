import { createClient } from '@libsql/client'
import 'dotenv/config'
import fs from 'node:fs'
import path from 'node:path'
import { drizzle } from 'drizzle-orm/libsql'
import { app } from 'electron'
import { BUILD_FOLDER, DB_FILE_NAME } from '../../shared/constants'
import * as schema from './schema'

export function initializeDatabase() {
  const databaseFolder = !app.isPackaged
    ? path.join(app.getAppPath(), BUILD_FOLDER)
    : process.resourcesPath
  const dbFile = path.join(databaseFolder, `${DB_FILE_NAME}.db`)
  let dbURL = `file:${dbFile}`

  if (fs.existsSync(dbFile) && app.isPackaged) {
    const newDbFile = path.join(app.getPath('userData'), `${DB_FILE_NAME}.db`)

    fs.cpSync(dbFile, newDbFile, {
      force: true,
      preserveTimestamps: true,
    })
    fs.rmSync(dbFile, { force: true })
    dbURL = `file:${newDbFile}`
  }

  const databaseClient = createClient({
    url: dbURL,
  })

  return drizzle(databaseClient, { schema })
}

export const DB = initializeDatabase()
