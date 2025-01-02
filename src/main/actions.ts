import { createWriteStream } from 'node:fs'
import fs from 'node:fs/promises'
import path, { dirname } from 'node:path'
import { Readable } from 'node:stream'
import { eq, or, sql } from 'drizzle-orm'
import { BrowserWindow, app, dialog, ipcMain } from 'electron'
import log from 'electron-log/main'
import { FileCategory } from '../shared/types/enums'
import { DB } from './database/init'
import {
  bills,
  files,
  files as filesTable,
  patients,
  payments,
} from './database/schema'

const SETTINGS_FILE = path.join(
  dirname(app.getPath('exe')),
  process.env.MAIN_VITE_SETTINGS_FILE_NAME
)

async function getSettings(): Promise<AppConfig> {
  try {
    const settings = await fs.readFile(SETTINGS_FILE, { encoding: 'utf-8' })

    return JSON.parse(settings) as AppConfig
  } catch (error) {
    log.warn(
      `${process.env.MAIN_VITE_SETTINGS_FILE_NAME} will be created once the user changed the default settings.`
    )

    // Return defaults
    return {
      patientDataFolder: app.getPath('appData'),
    }
  }
}

export function setListeners() {
  ipcMain.setMaxListeners(0)

  ipcMain.handle('open-folder-selector-dialog', async () => {
    const result = await dialog.showOpenDialog({
      title: 'Select data folder location',
      properties: ['openDirectory'],
    })

    if (result.canceled) {
      return null
    }

    return result.filePaths[0]
  })

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
        path.join(
          settings.patientDataFolder,
          result[0].id,
          process.env.MAIN_VITE_UPLOADS_FOLDER
        ),
        { recursive: true }
      )

      return true
    } catch (error) {
      log.error(error)
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

  ipcMain.handle('create-bill', async (_, fields: BillFields) => {
    const result = await DB.insert(bills).values({
      ...fields,
      totalDue: fields.totalAmount,
    })

    return result.rowsAffected > 0
  })

  ipcMain.handle('update-bill', async (_, fields: BillFields) => {
    const result = await DB.update(bills)
      .set({
        ...fields,
        totalDue: fields.totalAmount,
      })
      .where(eq(bills.id, fields.id))

    return result.rowsAffected > 0
  })

  ipcMain.handle('get-bills', async (_, id: string) => {
    return await DB.query.bills.findMany({
      where: (bills, { eq }) => eq(bills.patientId, id),
      orderBy: (bills, { desc }) => [
        desc(bills.createdAt),
        desc(bills.lastPaymentDate),
      ],
    })
  })

  ipcMain.handle('get-bill', async (_, id: string) => {
    return await DB.query.bills.findFirst({
      where: (bills, { eq }) => eq(bills.id, id),
      with: {
        patient: true,
        payments: true,
      },
    })
  })

  ipcMain.handle('settle-bill', async (_, fields: SettleFields) => {
    const result = await DB.transaction(async (tx) => {
      let hasError = false
      const insertPaymentResult = await tx.insert(payments).values({
        ...fields,
        paymentMode: fields.paymentMode ?? '',
      })

      if (insertPaymentResult.rowsAffected === 0) hasError = true

      const updateBillResult = await tx
        .update(bills)
        .set({
          totalPaid: sql`${bills.totalPaid} + ${fields.amount}`,
        })
        .where(eq(bills.id, fields.billId))

      if (updateBillResult.rowsAffected === 0) hasError = true

      if (hasError) tx.rollback()

      return hasError
    })

    return !result
  })

  ipcMain.on(
    'upload-file',
    async (_, patientId: string, category: FileCategory, file: FileProps) => {
      const mainWindow = BrowserWindow.getFocusedWindow()
      const settings = await getSettings()
      const tempFolder = path.join(
        settings.patientDataFolder,
        process.env.MAIN_VITE_TEMP_FOLDER
      )
      const destination = path.join(
        tempFolder,
        `${file.name}.${file.data.position}.part`
      )
      const buffer = Buffer.from(file.data.chunk)
      const readStream = Readable.from(buffer)
      // let uploadedSize = file.data.position * buffer.length

      try {
        await fs.mkdir(tempFolder, { recursive: true })
        const writeStream = createWriteStream(destination)

        // readStream.on('data', (chunk: Buffer) => {
        //   uploadedSize += chunk.length

        //   const progress = Math.floor(
        //     (uploadedSize / (file.data.totalChunks * buffer.length)) * 100
        //   )
        //   mainWindow?.webContents.send('upload-progress', file.name, progress)
        // })

        readStream.on('end', async () => {
          // Check if all parts are uploaded
          const files = await fs.readdir(tempFolder)
          const partFiles = files.filter(
            (f) => f.startsWith(file.name) && f.endsWith('.part')
          )
          const allPartsUploaded = partFiles.length === file.data.totalChunks

          if (allPartsUploaded) {
            const finalDestinationFolder = path.join(
              settings.patientDataFolder,
              patientId,
              process.env.MAIN_VITE_UPLOADS_FOLDER,
              category
            )
            const timestamp = Date.now()
            const randomString = Math.random().toString(36).substring(2, 15)
            const extension = path.extname(file.name)
            const destinationFilename =
              category !== FileCategory.docs
                ? `${timestamp}_${randomString}${extension}`
                : file.name
            const finalDestination = path.join(
              finalDestinationFolder,
              destinationFilename
            )

            // Create the destination folder if it does not exist
            await fs.mkdir(finalDestinationFolder, { recursive: true })

            const finalWriteStream = createWriteStream(finalDestination)

            for (let i = 1; i <= file.data.totalChunks; ++i) {
              const partPath = path.join(tempFolder, `${file.name}.${i}.part`)
              const partBuffer = await fs.readFile(partPath)
              finalWriteStream.write(partBuffer)
              await fs.unlink(partPath)
            }

            finalWriteStream.end()

            // Store file info in the database
            await DB.insert(filesTable).values({
              patientId,
              category,
              name: destinationFilename,
              size: buffer.length,
              thumbnail:
                category === FileCategory.videos ? file.thumbnail : undefined,
            })
          }
        })

        readStream.pipe(writeStream)
      } catch (error) {
        log.error(error)
        mainWindow?.webContents.send('upload-error', error)
      }
    }
  )

  ipcMain.handle('clear-temp-folder', async () => {
    const settings = await getSettings()
    const tempFolder = path.join(
      settings.patientDataFolder,
      process.env.MAIN_VITE_TEMP_FOLDER
    )

    try {
      const files = await fs.readdir(tempFolder)

      for (const file of files) {
        await fs.unlink(path.join(tempFolder, file))
      }

      return true
    } catch (error) {
      log.error(error)
      return false
    }
  })

  ipcMain.handle('get-settings', getSettings)

  ipcMain.handle('save-settings', async (_, settings: AppConfig) => {
    try {
      await fs.writeFile(SETTINGS_FILE, JSON.stringify(settings, null, 2), {
        encoding: 'utf8',
      })

      return true
    } catch (error) {
      log.error(error)
      return false
    }
  })

  ipcMain.handle(
    'get-files',
    async (_, patientId: string, category: FileCategory): Promise<File[]> => {
      const fileRecords = await DB.select()
        .from(files)
        .where(or(eq(files.patientId, patientId), eq(files.category, category)))

      const settings = await getSettings()
      const filesWithContent = await Promise.all(
        fileRecords.map(async (fileRecord) => {
          const filePath = path.join(
            settings.patientDataFolder,
            fileRecord.patientId,
            process.env.MAIN_VITE_UPLOADS_FOLDER,
            fileRecord.category,
            fileRecord.name
          )
          let content: string | ArrayBuffer | null = null

          if (category === FileCategory.photos) {
            content = await fs.readFile(filePath, { encoding: 'base64' })
          } else if (category === FileCategory.videos) {
            content = fileRecord.thumbnail as string | ArrayBuffer | null
          }

          return {
            ...fileRecord,
            thumbnail: content,
            lastModified: new Date(fileRecord.createdAt).getTime(),
            path: filePath,
          }
        })
      )

      return filesWithContent as File[]
    }
  )
}
