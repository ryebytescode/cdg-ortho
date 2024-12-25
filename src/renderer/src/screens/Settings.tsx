import { Button, Group, Stack, TextInput } from '@mantine/core'
import { useForm } from '@mantine/form'
import { useEffect } from 'react'
import { PageView } from '../components/PageView'

interface Fields {
  appDataFolder: string
  patientDataFolder: string
}

export default function Settings() {
  const { setFieldValue, key, getInputProps } = useForm<Fields>()

  const handleFolderSelection = async (type: 'app' | 'patient') => {
    const folderPath = await window.api.openFolderSelectorDialog()

    if (!folderPath) return

    if (type === 'app') setFieldValue('appDataFolder', folderPath)
    else setFieldValue('patientDataFolder', folderPath)
  }

  useEffect(() => {
    ;(async () => {
      const configFolder = await window.api.getConfigFolder()
      const homeFolder = await window.api.getHomeFolder()

      setFieldValue('appDataFolder', configFolder)
      setFieldValue('patientDataFolder', homeFolder)
    })()
  }, [setFieldValue])

  return (
    <PageView title="Settings">
      <form>
        <Stack>
          <Group align="flex-end">
            <TextInput
              label="App data folder location"
              description="This is where the app's configuration is stored."
              placeholder="Click 'Select'"
              readOnly
              flex={1}
              key={key('appDataFolder')}
              {...getInputProps('appDataFolder')}
            />
            <Button onClick={() => handleFolderSelection('app')}>Select</Button>
          </Group>
          <Group align="flex-end">
            <TextInput
              label="Patient data folder location"
              description="This is where all patient data is stored."
              placeholder="Click 'Select'"
              readOnly
              flex={1}
              key={key('patientDataFolder')}
              {...getInputProps('patientDataFolder')}
            />
            <Button onClick={() => handleFolderSelection('patient')}>
              Select
            </Button>
          </Group>
          <Button mt="md">Save</Button>
        </Stack>
      </form>
    </PageView>
  )
}
