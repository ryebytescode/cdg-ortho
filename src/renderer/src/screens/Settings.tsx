import { Button, Group, Stack, TextInput } from '@mantine/core'
import { useForm } from '@mantine/form'
import { notifications } from '@mantine/notifications'
import { type Config, initialValues } from '@renderer/helpers/config'
import { LocalStorage } from '@renderer/helpers/localStorage'
import { PageView } from '../components/PageView'

type Fields = {
  [key in keyof typeof Config]: string
}

export default function Settings() {
  const { setFieldValue, key, getInputProps, onSubmit } = useForm<Fields>({
    mode: 'uncontrolled',
    initialValues,
  })

  const handleFolderSelection = async (type: keyof typeof Config) => {
    const folderPath = await window.api.openFolderSelectorDialog()

    if (!folderPath) return

    setFieldValue(type, folderPath)
  }

  const handleSubmit = (fields: Fields) => {
    for (const [key, value] of Object.entries(fields)) {
      LocalStorage.set(key, value)
    }

    notifications.show({
      title: 'Success!',
      message: 'Settings changed.',
      color: 'green',
    })
  }

  return (
    <PageView title="Settings">
      <form onSubmit={onSubmit(handleSubmit)}>
        <Stack>
          <Group align="flex-end">
            <TextInput
              label="App data folder location"
              description="This is where the app's configuration is stored."
              placeholder="Click 'Select'"
              readOnly
              flex={1}
              required
              key={key('appDataFolder')}
              {...getInputProps('appDataFolder')}
            />
            <Button onClick={() => handleFolderSelection('appDataFolder')}>
              Select
            </Button>
          </Group>
          <Group align="flex-end">
            <TextInput
              label="Patient data folder location"
              description="This is where all patient data is stored."
              placeholder="Click 'Select'"
              readOnly
              flex={1}
              required
              key={key('patientDataFolder')}
              {...getInputProps('patientDataFolder')}
            />
            <Button onClick={() => handleFolderSelection('patientDataFolder')}>
              Select
            </Button>
          </Group>
          <Button mt="md" type="submit">
            Save
          </Button>
        </Stack>
      </form>
    </PageView>
  )
}
