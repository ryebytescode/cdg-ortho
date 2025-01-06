import {
  ActionIcon,
  Card,
  Group,
  Image as MTImage,
  Overlay,
  Paper,
  Progress,
  Text,
  rem,
} from '@mantine/core'
import {
  Dropzone,
  type DropzoneProps,
  type FileRejection,
  type FileWithPath,
  PDF_MIME_TYPE,
} from '@mantine/dropzone'
import { modals } from '@mantine/modals'
import { notifications } from '@mantine/notifications'
import { FileIcon } from '@renderer/components/FileIcon'
import {
  FileViewer,
  type FileViewerHandleProps,
} from '@renderer/components/FileViewer'
import { LoadingOverlay } from '@renderer/components/LoadingOverlay'
import { PageView } from '@renderer/components/PageView'
import {
  capFirstLetter,
  formatDate,
  generateThumbnail,
  getThumbnailUrl,
} from '@renderer/helpers/utils'
import { FileCategory, documentTypeMap } from '@shared/constants'
import { IconPhoto, IconTrash, IconUpload, IconX } from '@tabler/icons-react'
import {
  type ComponentRef,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react'
import Masonry, { ResponsiveMasonry } from 'react-responsive-masonry'
import { useParams } from 'react-router'

const mimeTypes: Record<FileCategory, DropzoneProps['accept']> = {
  photos: ['image/jpeg', 'image/png'],
  videos: ['video/mp4', 'video/mpeg', 'video/avi'],
  docs: PDF_MIME_TYPE,
  // docs: [...MS_WORD_MIME_TYPE, ...PDF_MIME_TYPE, MIME_TYPES.csv],
}

const CHUNK_SIZE = 1_048_576 // 1 MB
const MAX_FILES = 10

export default function PhotoManager({ category }: { category: FileCategory }) {
  const { patientId } = useParams()
  const [previews, setPreviews] = useState<
    { file: FileWithPath; thumbnail: string }[]
  >([])
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>(
    {}
  )
  const loadingOverlayRef = useRef<ComponentRef<typeof LoadingOverlay>>(null)
  const fileViewerRef = useRef<FileViewerHandleProps>(null)
  const [selectedFile, setSelectedFile] = useState<FileInfo | null>(null)

  const handlePreviewClick = (file: FileInfo) => {
    setSelectedFile(file)
    fileViewerRef.current?.show()
  }

  const fetchFiles = useCallback(async () => {
    loadingOverlayRef.current?.show()

    const files = await window.api.getFilesInfo(patientId as string, category)
    const newPreviews = files.map((file) => ({
      file,
      thumbnail: getThumbnailUrl(patientId as string, category, file.name),
    }))

    setPreviews(newPreviews)
    setUploadProgress({})

    loadingOverlayRef.current?.hide()
  }, [category, patientId])

  useEffect(() => {
    fetchFiles()
  }, [fetchFiles])

  useEffect(() => {
    if (Object.values(uploadProgress).length > 0) fetchFiles()
  }, [uploadProgress, fetchFiles])

  useEffect(() => {
    const handleUploadComplete = (_, fileName: string) => {
      setUploadProgress((prev) => ({
        ...prev,
        [fileName]: 100,
      }))

      notifications.show({
        title: 'Upload complete',
        message: `File ${fileName} uploaded successfully`,
        color: 'green',
      })

      loadingOverlayRef.current?.hide()
    }

    const handleUploadError = (_, fileName: string) => {
      notifications.show({
        title: 'Upload error',
        message: `Failed to upload file ${fileName}`,
        color: 'red',
      })

      loadingOverlayRef.current?.hide()
    }

    window.electron.ipcRenderer.on('upload-complete', handleUploadComplete)
    window.electron.ipcRenderer.on('upload-error', handleUploadError)

    return () => {
      window.electron.ipcRenderer.removeAllListeners('upload-complete')
      window.electron.ipcRenderer.removeAllListeners('upload-error')

      setPreviews([])
    }
  }, [])

  const handleDrop = async (files: FileWithPath[]) => {
    loadingOverlayRef.current?.show()

    const newPreviews = await Promise.all(
      files.map(async (file) => {
        const thumbnail = await generateThumbnail(file)
        return { file, thumbnail }
      })
    )

    setPreviews((prev) => [...newPreviews, ...prev])
    // loadingOverlayRef.current?.hide()

    files.map(async (file) => {
      const totalChunks = Math.ceil(file.size / CHUNK_SIZE)
      let startByte = 0

      for (let i = 1; i <= totalChunks; ++i) {
        const endByte = Math.min(startByte + CHUNK_SIZE, file.size)
        const chunk = file.slice(startByte, endByte)
        const buffer = await chunk.arrayBuffer()

        window.api.uploadFile(patientId as string, category, {
          data: {
            chunk: buffer,
            totalChunks,
            position: i,
          },
          name: file.name,
          size: file.size,
          thumbnail:
            file.category !== FileCategory.DOCS
              ? await generateThumbnail(file)
              : undefined,
        })

        startByte = endByte

        // Update progress
        setUploadProgress((prev) => ({
          ...prev,
          [file.name]: Math.round((i / totalChunks) * 100),
        }))
      }
    })
  }

  const handleReject = (files: FileRejection[]) => {
    if (files.length > MAX_FILES) {
      notifications.show({
        title: 'Too many files',
        message: `You can only upload a maximum of ${MAX_FILES} files at once.`,
        color: 'red',
      })
    } else {
      notifications.show({
        title: 'Invalid files',
        message: 'Only upload valid image files.',
        color: 'red',
      })
    }
  }

  const handleDelete = async (fileId: string) => {
    modals.openConfirmModal({
      title: 'Delete file',
      children: <Text>Are you sure you want to delete this file?</Text>,
      onConfirm: async () => {
        loadingOverlayRef.current?.show()
        const result = await window.api.deleteFile(fileId)
        loadingOverlayRef.current?.hide()

        if (result) {
          // Optimistic update
          setPreviews((prev) => prev.filter(({ file }) => file.id !== fileId))

          notifications.show({
            title: 'File deleted',
            message: 'File deleted successfully',
            color: 'green',
          })
        } else {
          notifications.show({
            title: 'Failed to delete file',
            message: 'An error occurred while deleting the file',
            color: 'red',
          })
        }
      },
      labels: {
        confirm: 'Delete',
        cancel: 'Cancel',
      },
      confirmProps: {
        color: 'red',
      },
      centered: true,
    })
  }

  return (
    <PageView
      title={capFirstLetter(category)}
      backTo={`/patient/${patientId}/files`}
    >
      <LoadingOverlay ref={loadingOverlayRef} />
      <Dropzone
        onDrop={handleDrop}
        onReject={handleReject}
        accept={mimeTypes[category]}
        maxFiles={MAX_FILES}
      >
        <Group
          justify="center"
          gap="xl"
          mih={180}
          style={{ pointerEvents: 'none' }}
        >
          <Dropzone.Accept>
            <IconUpload
              style={{
                width: rem(52),
                height: rem(52),
                color: 'var(--mantine-color-blue-6)',
              }}
              stroke={1.5}
            />
          </Dropzone.Accept>
          <Dropzone.Reject>
            <IconX
              style={{
                width: rem(52),
                height: rem(52),
                color: 'var(--mantine-color-red-6)',
              }}
              stroke={1.5}
            />
          </Dropzone.Reject>
          <Dropzone.Idle>
            <IconPhoto
              style={{
                width: rem(52),
                height: rem(52),
                color: 'var(--mantine-color-dimmed)',
              }}
              stroke={1.5}
            />
          </Dropzone.Idle>

          <div>
            <Text size="xl" inline>
              Drag {category} here or click to select files
            </Text>
            <Text size="sm" c="dimmed" inline mt={7}>
              You can attach up to maximum of {MAX_FILES} files at once.
            </Text>
          </div>
        </Group>
      </Dropzone>
      <Paper mt="md">
        <ResponsiveMasonry columnsCountBreakPoints={{ 350: 1, 750: 2, 900: 3 }}>
          <Masonry gutter={18} sequential={true}>
            {previews.map(({ file, thumbnail }) => (
              <Card key={file.name} withBorder w="100%">
                {category === FileCategory.DOCS ? (
                  <Group
                    py="md"
                    style={{ cursor: 'pointer' }}
                    onClick={() =>
                      handlePreviewClick({
                        ...file,
                        patientId: patientId as string,
                      })
                    }
                  >
                    <FileIcon
                      type={
                        documentTypeMap[file.name.split('.').pop() as string]
                      }
                      size={32}
                      style={{ alignSelf: 'start' }}
                    />
                    <Text flex={1}>{file.name}</Text>
                  </Group>
                ) : (
                  <Card.Section
                    style={{ cursor: 'pointer' }}
                    onClick={() =>
                      handlePreviewClick({
                        ...file,
                        patientId: patientId as string,
                      })
                    }
                  >
                    <MTImage
                      src={thumbnail}
                      alt={file.name}
                      onLoad={() => URL.revokeObjectURL(thumbnail)}
                    />
                    {uploadProgress[file.name] < 100 && (
                      <Overlay
                        backgroundOpacity={0.6}
                        zIndex={5}
                        blur={3}
                        center
                      >
                        <Progress
                          value={uploadProgress[file.name]}
                          size="xl"
                          transitionDuration={500}
                          w="90%"
                        />
                      </Overlay>
                    )}
                  </Card.Section>
                )}
                <Card.Section p="xs" withBorder>
                  <Group justify="space-between">
                    <Text size="xs" c="dimmed">
                      {file.createdAt ? formatDate(file.createdAt) : 'Just now'}
                    </Text>
                    <ActionIcon
                      variant="subtle"
                      color="red"
                      onClick={() => handleDelete(file.id)}
                    >
                      <IconTrash style={{ width: rem(16), height: rem(16) }} />
                    </ActionIcon>
                  </Group>
                </Card.Section>
              </Card>
            ))}
          </Masonry>
        </ResponsiveMasonry>
      </Paper>

      <FileViewer ref={fileViewerRef} file={selectedFile} />
    </PageView>
  )
}
