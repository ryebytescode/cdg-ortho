import path from 'node:path'
import express from 'express'
import {
  FILE_SERVER_PORT,
  FileCategory,
  UPLOADS_FOLDER,
} from '../shared/constants'
import { DB } from './database/connection'
import { Logger } from './logger'
import { getSettings } from './utils'

const app = express()

app.get('/files/:patientId/:category/:fileName', async (req, res) => {
  const { patientId, category, fileName } = req.params

  if (category === FileCategory.PHOTOS) {
    const settings = await getSettings()
    const filePath = path.join(
      settings.appDataFolder,
      patientId,
      UPLOADS_FOLDER,
      category,
      fileName
    )

    return res.sendFile(filePath, (err) => {
      if (err) {
        res.status(404).send('File not found')
      }
    })
  }

  if (category === FileCategory.VIDEOS) {
    const result = await DB.query.files.findFirst({
      columns: {
        name: true,
        thumbnail: true,
      },
      where: (files, { eq, and }) =>
        and(
          eq(files.patientId, patientId),
          eq(files.category, category),
          eq(files.name, fileName)
        ),
      orderBy: (files, { desc }) => [desc(files.createdAt)],
    })

    if (!result || !result.thumbnail) {
      return res.status(404).send('Thumbnail not found')
    }

    const base64Data = (result.thumbnail as string).replace(
      /^data:image\/\w+;base64,/,
      ''
    )
    const imgBuffer = Buffer.from(base64Data, 'base64')

    res.writeHead(200, {
      'Content-Type': 'image/png',
      'Content-Length': imgBuffer.length,
    })

    return res.end(imgBuffer)
  }

  res.status(404).send('File not found')
})

app.listen(FILE_SERVER_PORT, () => {
  Logger.info(`File server is running on http://localhost:${FILE_SERVER_PORT}`)
  console.log(`File server is running on http://localhost:${FILE_SERVER_PORT}`)
})
