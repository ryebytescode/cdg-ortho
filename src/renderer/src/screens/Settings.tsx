import { Button, Group, Stack, TextInput } from '@mantine/core'
import { useForm } from '@mantine/form'
import { notifications } from '@mantine/notifications'
import { Config, initialValues } from '@renderer/helpers/config'
import { useNavigate } from 'react-router'
import { PageView } from '../components/PageView'

export default function Settings() {
  const navigate = useNavigate()
  const { setFieldValue, key, getInputProps, onSubmit } = useForm<AppConfig>({
    mode: 'uncontrolled',
    initialValues,
  })

  const handleFolderSelection = async (type: keyof AppConfig) => {
    const folderPath = await window.api.openFolderSelectorDialog()

    if (!folderPath) return

    setFieldValue(type, folderPath)
  }

  const handleSubmit = async (fields: AppConfig) => {
    const result = await Config.setAll(fields)

    if (result) {
      notifications.show({
        title: 'Success!',
        message: 'Settings changed.',
        color: 'green',
      })
    } else {
      notifications.show({
        title: 'Error',
        message: 'Cannot change the settings.',
        color: 'red',
      })
    }

    navigate('/', { replace: true })
  }

  return (
    <PageView title="Settings">
      <form onSubmit={onSubmit(handleSubmit)}>
        <Stack>
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
