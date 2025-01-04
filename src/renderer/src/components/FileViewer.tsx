import { Image, Modal } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { FILE_SERVER_URL, FileCategory } from '@shared/constants'
import { type Ref, useEffect, useImperativeHandle, useState } from 'react'
import { Switch } from './Switch'

export interface FileViewerHandleProps {
  show: () => void
}

interface FileViewerProps {
  file: FileInfo | null
  ref: Ref<FileViewerHandleProps>
}

export function FileViewer({ file, ref }: FileViewerProps) {
  const [opened, { open, close }] = useDisclosure(false)
  const [sourceURL, setSourceURL] = useState('')

  useEffect(() => {
    if (file) {
      setSourceURL(
        `${FILE_SERVER_URL}/${file.patientId}/${file.category}/${file.name}`
      )
    }
  }, [file])

  useImperativeHandle(ref, () => ({
    show: open,
  }))

  return (
    <Modal
      opened={opened}
      onClose={close}
      title="File Viewer"
      size="xl"
      centered
    >
      {file && sourceURL && (
        <Switch condition={file.category}>
          <Switch.Case when={FileCategory.PHOTOS}>
            <Image src={sourceURL} alt={file.name} />
          </Switch.Case>
          <Switch.Case when={FileCategory.VIDEOS}>
            {/* biome-ignore lint/a11y/useMediaCaption: */}
            <video controls style={{ width: '100%' }}>
              <source src={sourceURL} />
              Your browser does not support the video tag.
            </video>
          </Switch.Case>
          <Switch.Case when={FileCategory.DOCS}>
            <iframe
              src={sourceURL}
              title={file.name}
              style={{ width: '100%', height: window.outerHeight }}
            />
          </Switch.Case>
        </Switch>
      )}
    </Modal>
  )
}
