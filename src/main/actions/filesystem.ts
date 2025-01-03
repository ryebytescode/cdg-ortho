import { createWriteStream } from 'node:fs'
import fs from 'node:fs/promises'
import path from 'node:path'
import { Readable } from 'node:stream'
import { eq, or } from 'drizzle-orm'
import { BrowserWindow, dialog, ipcMain } from 'electron'
import Logger from 'electron-log'
import {
  FileCategory,
  TEMP_FOLDER,
  UPLOADS_FOLDER,
} from '../../shared/constants'
import { DB } from '../database/connection'
import { files as filesTable } from '../database/schema'
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
              settings.appDataFolder,
              patientId,
              UPLOADS_FOLDER,
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
        Logger.error(error)
        mainWindow?.webContents.send('upload-error', error)
      }
    }
  )

  ipcMain.handle(
    'get-files',
    async (_, patientId: string, category: FileCategory): Promise<File[]> => {
      const fileRecords = await DB.select()
        .from(filesTable)
        .where(
          or(
            eq(filesTable.patientId, patientId),
            eq(filesTable.category, category)
          )
        )

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
