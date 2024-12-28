import {
  Button,
  type ComboboxData,
  Group,
  InputBase,
  SegmentedControl,
  type SegmentedControlItem,
  Select,
  Stack,
  TextInput,
} from '@mantine/core'
import { DateInput } from '@mantine/dates'
import {
  type FormValidateInput,
  type UseFormReturnType,
  useForm,
} from '@mantine/form'
import { notifications } from '@mantine/notifications'
import { type ComponentRef, useEffect, useRef } from 'react'
import { IMaskInput } from 'react-imask'
import { useNavigate, useParams } from 'react-router'
import { LoadingOverlay } from '../components/LoadingOverlay'
import { PageView } from '../components/PageView'
import patterns from '../helpers/patterns'

const gender: SegmentedControlItem[] = [
  { label: 'Male', value: 'male' },
  { label: 'Female', value: 'female' },
]

const suffixes: ComboboxData = [
  { label: 'Jr', value: 'Jr' },
  { label: 'Sr', value: 'Sr' },
  { label: 'II', value: 'II' },
  { label: 'III', value: 'III' },
  { label: 'IV', value: 'IV' },
]

const initialValues: EditPatientFields = {
  firstName: '',
  lastName: '',
  middleName: '',
  suffix: '',
  birthdate: null,
  gender: 'male',
  phone: '',
  address: '',
}

const validators: FormValidateInput<EditPatientFields> = {
  firstName: (value) =>
    value.length < 2 ? 'First name must have at least 2 letters.' : null,
  lastName: (value) =>
    value.length < 2 ? 'Last name must have at least 2 letters.' : null,
  phone: (value) => (patterns.phone.test(value) ? null : 'Invalid format.'),
}

export default function EditPatient() {
  const { id } = useParams()
  const navigate = useNavigate()
  const form = useForm<EditPatientFields>({
    mode: 'uncontrolled',
    initialValues,
    validate: validators,
  })
  const loadingOverlayRef = useRef<ComponentRef<typeof LoadingOverlay>>(null)

  const handleSubmit = async (fields: EditPatientFields) => {
    loadingOverlayRef.current?.show()

    const result = await window.api.updatePatientRecord(fields)

    if (result) {
      notifications.show({
        title: 'Success!',
        message: 'Patient record updated.',
        color: 'green',
      })
    } else {
      notifications.show({
        title: 'Error',
        message: 'Cannot update patient record.',
        color: 'red',
      })
    }

    navigate(`/patient/${id}`)
  }

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    if (id) {
      ;(async () => {
        const result = await window.api.getPatientProfile(id)

        if (result) {
          form.setValues({
            ...result,
            birthdate: new Date(result.birthdate),
          })
        }
      })()
    }
  }, [])

  return (
    <PageView title="Edit patient" backTo={`/patient/${id}`}>
      <LoadingOverlay ref={loadingOverlayRef} />
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack>
          <Group grow>
            <TextInput
              label="First name"
              key={form.key('firstName')}
              required
              {...form.getInputProps('firstName')}
              rightSection={<EnyeSelector form={form} field="firstName" />}
            />
            <TextInput
              label="Last name"
              key={form.key('lastName')}
              required
              {...form.getInputProps('lastName')}
              rightSection={<EnyeSelector form={form} field="lastName" />}
            />
          </Group>
          <Group>
            <TextInput
              label="Middle name"
              key={form.key('middleName')}
              {...form.getInputProps('middleName')}
              rightSection={<EnyeSelector form={form} field="middleName" />}
              flex={1}
            />
            <Select
              label="Suffix"
              placeholder="Pick value"
              data={suffixes}
              allowDeselect
              clearable
              key={form.key('suffix')}
              {...form.getInputProps('suffix')}
              maw={120}
            />
          </Group>
          <DateInput
            label="Birthdate"
            placeholder="Pick a date"
            maxDate={new Date()}
            key={form.key('birthdate')}
            required
            {...form.getInputProps('birthdate')}
            popoverProps={{
              position: 'top-start',
            }}
          />
          <SegmentedControl
            data={gender}
            key={form.key('gender')}
            {...form.getInputProps('gender')}
          />
          <InputBase
            component={IMaskInput}
            label="Phone"
            placeholder="0912 345 6789"
            key={form.key('phone')}
            mask="0000 000 0000"
            required
            {...form.getInputProps('phone')}
          />
          <TextInput
            label="Address"
            maxLength={200}
            required
            key={form.key('address')}
            {...form.getInputProps('address')}
          />
          <Button type="submit" mt="md">
            Edit record
          </Button>
        </Stack>
      </form>
    </PageView>
  )
}

function EnyeSelector({
  form,
  field,
}: {
  form: UseFormReturnType<EditPatientFields>
  field: keyof EditPatientFields
}) {
  return (
    <Select
      data={[
        { label: 'Ñ', value: 'Ñ' },
        { label: 'ñ', value: 'ñ' },
      ]}
      onChange={(value) =>
        form.setFieldValue(field, (prev) => (prev as string) + value)
      }
    />
  )
}
