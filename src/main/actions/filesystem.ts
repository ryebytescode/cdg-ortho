import { createWriteStream } from 'node:fs'
import fs from 'node:fs/promises'
import path from 'node:path'
import { Readable } from 'node:stream'
import { eq } from 'drizzle-orm'
import { BrowserWindow, dialog, ipcMain } from 'electron'
import Logger from 'electron-log'
import {
  FileCategory,
  TEMP_FOLDER,
  UPLOADS_FOLDER,
} from '../../shared/constants'
import { DB } from '../database/connection'
import { files, files as filesTable } from '../database/schema'
import { getSettings } from '../utils'

export function registerFileSystemHandlers() {
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

  ipcMain.on(
    'upload-file',
    async (_, patientId: string, category: FileCategory, file: FileProps) => {
      const mainWindow = BrowserWindow.getFocusedWindow()
      const settings = await getSettings()
      const tempFolder = path.join(settings.appDataFolder, TEMP_FOLDER)
      const destination = path.join(
        tempFolder,
        `${file.name}.${file.data.position}.part`
      )
      const buffer = Buffer.from(file.data.chunk)
      const readStream = Readable.from(buffer)

      try {
        await fs.mkdir(tempFolder, { recursive: true })
        const writeStream = createWriteStream(destination)

        readStream.on('end', async () => {
          const files = await fs.readdir(tempFolder)
          const partFiles = files.filter(
            (f) => f.startsWith(file.name) && f.endsWith('.part')
          )
          const allPartsUploaded = partFiles.length === file.data.totalChunks

          if (allPartsUploaded) {
            const finalDestinationFolder = path.join(
              settings.appDataFolder,
              patientId,
              UPLOADS_FOLDER,
              category
            )
            const timestamp = Date.now()
            const randomString = Math.random().toString(36).substring(2, 15)
            const extension = path.extname(file.name)
            const destinationFilename =
              category !== FileCategory.DOCS
                ? `${timestamp}_${randomString}${extension}`
                : file.name
            const finalDestination = path.join(
              finalDestinationFolder,
              destinationFilename
            )

            await fs.mkdir(finalDestinationFolder, { recursive: true })

            const finalWriteStream = createWriteStream(finalDestination)

            for (let i = 1; i <= file.data.totalChunks; ++i) {
              const partPath = path.join(tempFolder, `${file.name}.${i}.part`)
              const partBuffer = await fs.readFile(partPath)
              finalWriteStream.write(partBuffer)
              await fs.unlink(partPath)
            }

            finalWriteStream.on('error', (error) => {
              Logger.error(error)
              mainWindow?.webContents.send('upload-error', error)
            })

            finalWriteStream.end(async () => {
              await DB.insert(filesTable).values({
                patientId,
                category,
                name: destinationFilename,
                size: buffer.length,
                thumbnail:
                  category === FileCategory.VIDEOS ? file.thumbnail : undefined,
              })

              mainWindow?.webContents.send('upload-complete', file.name)
            })
          }
        })

        readStream.pipe(writeStream)
      } catch (error) {
        Logger.error(error)
        mainWindow?.webContents.send('upload-error', error)
      }
    }
  )

  ipcMain.handle(
    'get-files-info',
    async (_, patientId: string, category: FileCategory): Promise<File[]> => {
      const fileRecords = await DB.query.files.findMany({
        where: (filesTable, { eq, and }) =>
          and(
            eq(filesTable.patientId, patientId),
            eq(filesTable.category, category)
          ),
        orderBy: (filesTable, { desc }) => [desc(filesTable.createdAt)],
      })

      const settings = await getSettings()
      const filesWithContent = await Promise.all(
        fileRecords.map(async (fileRecord) => {
          const filePath = path.join(
            settings.appDataFolder,
            fileRecord.patientId,
            UPLOADS_FOLDER,
            fileRecord.category,
            fileRecord.name
          )

          return {
            ...fileRecord,
            lastModified: new Date(fileRecord.createdAt).getTime(),
            path: filePath,
          }
        })
      )

      return filesWithContent as File[]
    }
  )

  ipcMain.handle('delete-file', async (_, fileId: string) => {
    const fileRecord = await DB.query.files.findFirst({
      where: (files, { eq }) => eq(files.id, fileId),
    })

    if (!fileRecord) {
      return false
    }

    const settings = await getSettings()
    const filePath = path.join(
      settings.appDataFolder,
      fileRecord.patientId,
      UPLOADS_FOLDER,
      fileRecord.category,
      fileRecord.name
    )

    try {
      await fs.unlink(filePath)
      await DB.delete(files).where(eq(files.id, fileId))
      return true
    } catch (error) {
      Logger.error(error)
      return false
    }
  })

  ipcMain.handle('clear-temp-folder', async () => {
    const settings = await getSettings()
    const tempFolder = path.join(settings.appDataFolder, TEMP_FOLDER)

    try {
      const files = await fs.readdir(tempFolder)

      for (const file of files) {
        await fs.unlink(path.join(tempFolder, file))
      }

      return true
    } catch (error) {
      Logger.error(error)
      return false
    }
  })
}
