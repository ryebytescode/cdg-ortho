import {
  Button,
  Collapse,
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
import { type ComponentRef, useRef } from 'react'
import { IMaskInput } from 'react-imask'
import { LoadingOverlay } from '../components/LoadingOverlay'
import { PageView } from '../components/PageView'
import patterns from '../helpers/patterns'

const patientTypes: SegmentedControlItem[] = [
  { label: 'New patient', value: 'new' },
  { label: 'Old patient', value: 'old' },
]

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

const initialValues: NewPatientFields = {
  patientType: 'new',
  firstName: '',
  lastName: '',
  middleName: '',
  suffix: '',
  birthdate: null,
  gender: 'male',
  phone: '',
  address: '',
  entryDate: null,
}

const validators: FormValidateInput<NewPatientFields> = {
  firstName: (value) =>
    value.length < 2 ? 'First name must have at least 2 letters.' : null,
  lastName: (value) =>
    value.length < 2 ? 'Last name must have at least 2 letters.' : null,
  phone: (value) => (patterns.phone.test(value) ? null : 'Invalid format.'),
}

export default function NewPatient() {
  const form = useForm<NewPatientFields>({
    mode: 'uncontrolled',
    initialValues,
    validate: validators,
  })
  const loadingOverlayRef = useRef<ComponentRef<typeof LoadingOverlay>>(null)

  const handleSubmit = async (fields: NewPatientFields) => {
    loadingOverlayRef.current?.show()

    const result = await window.api.createPatientRecord(fields)

    if (result) {
      notifications.show({
        title: 'Success!',
        message: 'Patient record created.',
        color: 'green',
      })
    } else {
      notifications.show({
        title: 'Error',
        message: 'Cannot created patient record.',
        color: 'red',
      })
    }

    form.reset()
    loadingOverlayRef.current?.hide()
  }

  return (
    <PageView title="Add patient">
      <LoadingOverlay ref={loadingOverlayRef} />
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack>
          <SegmentedControl
            data={patientTypes}
            key={form.key('patientType')}
            {...form.getInputProps('patientType')}
          />
          <Collapse in={form.getValues().patientType === 'old'}>
            <DateInput
              label="Date of entry"
              placeholder="Pick a date"
              required={form.getValues().patientType === 'old'}
              maxDate={new Date()}
              key={form.key('entryDate')}
              {...form.getInputProps('entryDate')}
            />
          </Collapse>
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
            Create record
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
  form: UseFormReturnType<NewPatientFields>
  field: keyof NewPatientFields
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
