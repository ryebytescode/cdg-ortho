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
import { notifications } from '@mantine/notifications'
import { EnyeSelector } from '@renderer/components/EnyeSelector'
import { type ComponentRef, useEffect, useRef } from 'react'
import { Controller, type SubmitHandler, useForm } from 'react-hook-form'
import { IMaskInput } from 'react-imask'
import { useNavigate, useParams } from 'react-router'
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

const defaultValues: PatientFields = {
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

export default function PatientForm({ isEdit = false }: { isEdit?: boolean }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const {
    control,
    handleSubmit,
    reset,
    watch,
    register,
    unregister,
    setValue,
  } = useForm<PatientFields>({
    defaultValues: isEdit
      ? async () => {
          const result = await window.api.getPatientProfile(id as string)

          if (result) {
            return {
              ...result,
              birthdate: new Date(result.birthdate),
            }
          }

          // fallback
          return defaultValues
        }
      : defaultValues,
  })
  const loadingOverlayRef = useRef<ComponentRef<typeof LoadingOverlay>>(null)

  const onSubmit: SubmitHandler<PatientFields> = async (fields) => {
    loadingOverlayRef.current?.show()

    const result = isEdit
      ? await window.api.updatePatientRecord(fields)
      : await window.api.createPatientRecord(fields)

    if (result) {
      notifications.show({
        title: 'Success!',
        message: `Patient record ${isEdit ? 'updated' : 'created'}.`,
        color: 'green',
      })
    } else {
      notifications.show({
        title: 'Error',
        message: `Cannot ${isEdit ? 'update' : 'create'} patient record.`,
        color: 'red',
      })
    }

    reset()
    loadingOverlayRef.current?.hide()

    if (isEdit) {
      navigate(`/patient/${id}`, { replace: true })
    }
  }

  useEffect(() => {
    if (watch('patientType') === 'old') register('entryDate')
    else unregister('entryDate')
  }, [watch, register, unregister])

  return (
    <PageView title="Add patient">
      <LoadingOverlay ref={loadingOverlayRef} />
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack>
          <Controller
            control={control}
            name="patientType"
            rules={{
              required: true,
            }}
            render={({ field }) => (
              <SegmentedControl data={patientTypes} {...field} />
            )}
          />
          <Controller
            control={control}
            name="entryDate"
            rules={{
              required: true,
            }}
            render={({ field }) => (
              <Collapse in={watch('patientType') === 'old'}>
                <DateInput
                  label="Date of entry"
                  placeholder="Pick a date"
                  maxDate={new Date()}
                  required={watch('patientType') === 'old'}
                  {...field}
                />
              </Collapse>
            )}
          />
          <Group grow>
            <Controller
              control={control}
              name="firstName"
              rules={{
                required: true,
                validate: {
                  minLength: (value) =>
                    value.length < 2 &&
                    'First name must have at least 2 letters.',
                },
              }}
              render={({ field }) => (
                <TextInput
                  label="First name"
                  required
                  rightSection={
                    <EnyeSelector setValue={setValue} field="firstName" />
                  }
                  {...field}
                />
              )}
            />
            <Controller
              control={control}
              name="lastName"
              rules={{
                required: true,
                validate: {
                  minLength: (value) =>
                    value.length < 2 &&
                    'Last name must have at least 2 letters.',
                },
              }}
              render={({ field }) => (
                <TextInput
                  label="Last name"
                  required
                  rightSection={
                    <EnyeSelector setValue={setValue} field="lastName" />
                  }
                  {...field}
                />
              )}
            />
          </Group>
          <Group>
            <Controller
              control={control}
              name="middleName"
              render={({ field }) => (
                <TextInput
                  label="Middle name"
                  rightSection={
                    <EnyeSelector setValue={setValue} field="middleName" />
                  }
                  {...field}
                />
              )}
            />
            <Controller
              control={control}
              name="suffix"
              render={({ field }) => (
                <Select
                  label="Suffix"
                  placeholder="Pick value"
                  data={suffixes}
                  allowDeselect
                  clearable
                  maw={120}
                  {...field}
                />
              )}
            />
          </Group>
          <Controller
            control={control}
            name="birthdate"
            rules={{
              required: true,
            }}
            render={({ field }) => (
              <DateInput
                label="Birthdate"
                placeholder="Pick a date"
                maxDate={new Date()}
                required
                popoverProps={{
                  position: 'top-start',
                }}
                {...field}
              />
            )}
          />
          <Controller
            control={control}
            name="gender"
            rules={{
              required: true,
            }}
            render={({ field }) => (
              <SegmentedControl data={gender} {...field} />
            )}
          />
          <Controller
            control={control}
            name="phone"
            rules={{
              required: true,
              validate: {
                format: (value) =>
                  !patterns.phone.test(value) && 'Invalid format.',
              },
            }}
            render={({ field }) => (
              <InputBase
                component={IMaskInput}
                label="Phone"
                placeholder="0912 345 6789"
                mask="0000 000 0000"
                required
                {...field}
              />
            )}
          />
          <Controller
            control={control}
            name="address"
            rules={{
              required: true,
            }}
            render={({ field }) => (
              <TextInput label="Address" maxLength={200} required {...field} />
            )}
          />
          <Button type="submit" mt="md">
            Create record
          </Button>
        </Stack>
      </form>
    </PageView>
  )
}
