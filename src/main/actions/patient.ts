import fs from 'node:fs/promises'
import path from 'node:path'
import { eq } from 'drizzle-orm'
import { ipcMain } from 'electron'
import Logger from 'electron-log'
import { UPLOADS_FOLDER } from '../../shared/constants'
import { DB } from '../database/connection'
import { patients } from '../database/schema'
import { getSettings } from '../utils'

export function registerPatientHandlers() {
  ipcMain.handle('create-patient-record', async (_, fields: PatientFields) => {
    const settings = await getSettings()

    // Add to db
    const patient: typeof patients.$inferInsert = {
      ...fields,
      id: undefined,
      patientType: fields.patientType as string,
      birthdate: fields.birthdate as Date,
      entryDateIfOld: fields.entryDate ? (fields.entryDate as Date) : undefined,
    }

    const result = await DB.insert(patients).values(patient).returning()

    if (!result) return false

    // Create a new folder named with a unique ID
    try {
      await fs.mkdir(
        path.join(settings.appDataFolder, result[0].id, UPLOADS_FOLDER),
        { recursive: true }
      )

      return true
    } catch (error) {
      Logger.error(error)
      return false
    }
  })

  ipcMain.handle('update-patient-record', async (_, fields: PatientFields) => {
    const result = await DB.update(patients)
      .set({
        ...fields,
        birthdate: fields.birthdate as Date,
        entryDateIfOld: fields.entryDate,
      })
      .where(eq(patients.id, fields.id))

    return result.rowsAffected > 0
  })

  ipcMain.handle('get-patients', async () => {
    return await DB.select().from(patients)
  })

  ipcMain.handle('get-patient-profile', async (_, id: string) => {
    return await DB.select()
      .from(patients)
      .where(eq(patients.id, id))
      .then((values) => {
        if (values.length !== 1) return null

        return values[0]
      })
  })
}
