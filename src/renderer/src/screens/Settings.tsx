import { Button, Group, Stack, TextInput } from '@mantine/core'
import { notifications } from '@mantine/notifications'
import { Config } from '@renderer/helpers/config'
import { Controller, type SubmitHandler, useForm } from 'react-hook-form'
import { useNavigate } from 'react-router'
import { PageView } from '../components/PageView'

export default function Settings() {
  const navigate = useNavigate()
  const { control, setValue, handleSubmit } = useForm<AppConfig>({
    defaultValues: async () => await Config.getAll(),
  })

  const handleFolderSelection = async (type: keyof AppConfig) => {
    const folderPath = await window.api.openFolderSelectorDialog()

    if (!folderPath) return

    setValue(type, folderPath)
  }

  const onSubmit: SubmitHandler<AppConfig> = async (fields) => {
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
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack>
          <Group align="flex-end">
            <Controller
              control={control}
              name="appDataFolder"
              rules={{
                required: true,
              }}
              render={({ field }) => (
                <TextInput
                  label="Patient data folder location"
                  description="This is where all patient data is stored."
                  placeholder="Click 'Select'"
                  readOnly
                  flex={1}
                  required
                  {...field}
                />
              )}
            />
            <Button onClick={() => handleFolderSelection('appDataFolder')}>
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
