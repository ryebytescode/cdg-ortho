import { zodResolver } from '@hookform/resolvers/zod'
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
import { AddPatientSchema } from '@renderer/helpers/fields'
import { type ComponentRef, useEffect, useRef } from 'react'
import {
  Controller,
  FormProvider,
  type SubmitHandler,
  useForm,
  useFormContext,
} from 'react-hook-form'
import { IMaskInput } from 'react-imask'
import { useNavigate, useParams } from 'react-router'
import { LoadingOverlay } from '../components/LoadingOverlay'
import { PageView } from '../components/PageView'

const patientTypes: SegmentedControlItem[] = [
  { label: 'New patient', value: 'new' },
  { label: 'Old patient', value: 'old' },
]

const gender: SegmentedControlItem[] = [
  { label: 'Male', value: 'male' },
  { label: 'Female', value: 'female' },
]

const suffixes: ComboboxData = [
  { label: 'JR', value: 'Jr' },
  { label: 'SR', value: 'Sr' },
  { label: 'II', value: 'II' },
  { label: 'III', value: 'III' },
  { label: 'IV', value: 'IV' },
]

const defaultValues: PatientFields = {
  id: '',
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
  const methods = useForm<PatientFields>({
    resolver: zodResolver(AddPatientSchema),
    defaultValues: isEdit
      ? async () => {
          const result = await window.api.getPatientProfile(id as string)

          if (result) {
            return {
              ...result,
              id: id as string,
              birthdate: new Date(result.birthdate),
            }
          }

          // fallback
          return defaultValues
        }
      : defaultValues,
  })
  const { control, handleSubmit, watch, resetField } = methods
  const loadingOverlayRef = useRef<ComponentRef<typeof LoadingOverlay>>(null)
  const patientType = watch('patientType')

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

      if (isEdit) {
        navigate(`/patient/${id}`, { replace: true })
      } else {
        navigate('/patients', { replace: true })
      }
    } else {
      notifications.show({
        title: 'Error',
        message: `Cannot ${isEdit ? 'update' : 'create'} patient record.`,
        color: 'red',
      })

      loadingOverlayRef.current?.hide()
    }
  }

  useEffect(() => {
    if (patientType === 'new') {
      resetField('entryDate')
    }
  }, [patientType, resetField])

  return (
    <PageView
      title={`${isEdit ? 'Edit' : 'Add'} patient`}
      backTo={isEdit ? `/patient/${id}` : '/'}
    >
      <LoadingOverlay ref={loadingOverlayRef} />
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Stack>
            <Controller
              control={control}
              name="patientType"
              render={({ field }) => (
                <SegmentedControl data={patientTypes} {...field} />
              )}
            />
            <Controller
              control={control}
              name="entryDate"
              render={({ field, fieldState: { error } }) => (
                <Collapse in={patientType === 'old'}>
                  <DateInput
                    label="Date of entry"
                    placeholder="Pick a date"
                    maxDate={new Date()}
                    withAsterisk={patientType === 'old'}
                    styles={{
                      input: {
                        textTransform: 'uppercase',
                      },
                    }}
                    error={error?.message}
                    {...field}
                  />
                </Collapse>
              )}
            />
            <Group>
              <Group grow flex={1} gap="xs">
                <Controller
                  control={control}
                  name="firstName"
                  render={({ field, fieldState: { error } }) => (
                    <Group>
                      <TextInput
                        label="First name"
                        withAsterisk
                        flex={1}
                        styles={{
                          input: {
                            textTransform: 'uppercase',
                          },
                        }}
                        error={error?.message}
                        {...field}
                      />
                      <EnyeButton field="firstName" />
                    </Group>
                  )}
                />
              </Group>
              <Controller
                control={control}
                name="suffix"
                render={({ field }) => (
                  <Select
                    label="Suffix"
                    placeholder="Select"
                    data={suffixes}
                    allowDeselect
                    clearable
                    styles={{
                      input: {
                        textTransform: 'uppercase',
                      },
                    }}
                    maw={120}
                    {...field}
                  />
                )}
              />
            </Group>
            <Controller
              control={control}
              name="middleName"
              render={({ field, fieldState: { error } }) => (
                <Group>
                  <TextInput
                    label="Middle name"
                    flex={1}
                    {...field}
                    styles={{
                      input: {
                        textTransform: 'uppercase',
                      },
                    }}
                    error={error?.message}
                  />
                  <EnyeButton field="middleName" />
                </Group>
              )}
            />
            <Controller
              control={control}
              name="lastName"
              render={({ field, fieldState: { error } }) => (
                <Group>
                  <TextInput
                    label="Last name"
                    withAsterisk
                    flex={1}
                    styles={{
                      input: {
                        textTransform: 'uppercase',
                      },
                    }}
                    error={error?.message}
                    {...field}
                  />
                  <EnyeButton field="lastName" />
                </Group>
              )}
            />
            <Controller
              control={control}
              name="birthdate"
              render={({ field, fieldState: { error } }) => (
                <DateInput
                  label="Birthdate"
                  placeholder="Pick a date"
                  maxDate={new Date()}
                  withAsterisk
                  styles={{
                    input: {
                      textTransform: 'uppercase',
                    },
                  }}
                  popoverProps={{
                    position: 'top-start',
                  }}
                  error={error?.message}
                  {...field}
                />
              )}
            />
            <Controller
              control={control}
              name="gender"
              render={({ field }) => (
                <SegmentedControl data={gender} {...field} />
              )}
            />
            <Controller
              control={control}
              name="phone"
              render={({ field, fieldState: { error } }) => (
                <InputBase
                  component={IMaskInput}
                  label="Phone"
                  placeholder="0912 345 6789"
                  mask="0000 000 0000"
                  unmask={true}
                  withAsterisk
                  error={error?.message}
                  {...field}
                  onChange={undefined}
                  onAccept={(value) => field.onChange(value)}
                />
              )}
            />
            <Controller
              control={control}
              name="address"
              render={({ field, fieldState: { error } }) => (
                <TextInput
                  label="Address"
                  maxLength={200}
                  withAsterisk
                  styles={{
                    input: {
                      textTransform: 'uppercase',
                    },
                  }}
                  error={error?.message}
                  {...field}
                />
              )}
            />
            <Button type="submit" mt="md">
              {isEdit ? 'Update' : 'Create'} record
            </Button>
          </Stack>
        </form>
      </FormProvider>
    </PageView>
  )
}

function EnyeButton({ field }: { field: keyof PatientFields }) {
  const { setValue, getValues } = useFormContext<PatientFields>()

  return (
    <Button
      mt={24}
      onClick={() => setValue(field, `${getValues(field)}Ñ`)}
      color="gray"
    >
      Ñ
    </Button>
  )
}
