export const APP_NAME = 'cdg-ortho'
export const DB_FILE_NAME = 'cdg-data'
export const SETTINGS_FILE = 'settings.json'
export const TEMP_FOLDER = 'temp'
export const UPLOADS_FOLDER = 'uploads'
export const LOGS_FOLDER = 'logs'
export const BUILD_FOLDER = 'build'
export const FILE_SERVER_PORT = 3245
export const FILE_SERVER_URL = `http://localhost:${FILE_SERVER_PORT}/files`

export enum FileCategory {
  PHOTOS = 'photos',
  VIDEOS = 'videos',
  DOCS = 'docs',
}

export enum DocumentType {
  DOC = 'doc',
  DOCX = 'docx',
  PDF = 'pdf',
  CSV = 'csv',
}

export const documentTypeMap: Record<DocumentType, string> = {
  [DocumentType.DOC]: 'doc',
  [DocumentType.DOCX]: 'docx',
  [DocumentType.PDF]: 'pdf',
  [DocumentType.CSV]: 'csv',
}
