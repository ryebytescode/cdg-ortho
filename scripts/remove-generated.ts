import * as fs from 'node:fs/promises'
import * as path from 'node:path'
import { DB_FILE_NAME } from '../src/shared/constants'
;(async () => {
  const toDelete = [
    path.join(__dirname, '..', 'migrations'),
    path.join(__dirname, '..', 'dist'),
    path.join(__dirname, '..', 'out'),
    path.join(__dirname, '..', `build/${DB_FILE_NAME}.db`),
  ]

  for (const entry of toDelete) {
    try {
      await fs.access(entry)
      await fs.rm(entry, { recursive: true, force: true })
      console.log(`${entry} deleted.`)
    } catch {
      console.log(`${entry} does not exist, skipped.`)
    }
  }
})()
