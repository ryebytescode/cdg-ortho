import {
  ActionIcon,
  Button,
  Card,
  Group,
  NumberInput,
  Select,
  Stack,
  Text,
  TextInput,
  Textarea,
} from '@mantine/core'
import { notifications } from '@mantine/notifications'
import { LoadingOverlay } from '@renderer/components/LoadingOverlay'
import { PageView } from '@renderer/components/PageView'
import { formatMoney } from '@renderer/helpers/utils'
import { IconTrash } from '@tabler/icons-react'
import { type ComponentRef, useCallback, useEffect, useRef } from 'react'
import {
  type Control,
  Controller,
  type SubmitHandler,
  useFieldArray,
  useForm,
  useWatch,
} from 'react-hook-form'
import { useNavigate, useParams } from 'react-router'

const defaultValues: Omit<BillFields, 'patientId'> = {
  procedure: 'ortho',
  description: '',
  serviceAmount: 0,
  items: [],
  totalAmount: 0,
}

export default function Bill() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { control, setValue, getValues, watch, handleSubmit } =
    useForm<BillFields>({
      defaultValues,
    })
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items',
  })
  const loadingOverlayRef = useRef<ComponentRef<typeof LoadingOverlay>>(null)

  const computeTotal = useCallback(() => {
    let total = 0

    total += getValues('serviceAmount')
    // biome-ignore lint/complexity/noForEach:
    getValues('items').forEach(({ amount }) => {
      total += amount
    })

    setValue('totalAmount', total)
  }, [getValues, setValue])

  const onSubmit: SubmitHandler<BillFields> = async (fields) => {
    loadingOverlayRef.current?.show()

    const result = await window.api.createBill({
      ...fields,
      patientId: id as string,
    })

    if (result) {
      notifications.show({
        title: 'Success!',
        message: 'Bill created.',
        color: 'green',
      })

      navigate(`/patient/${id}/transactions`, { replace: true })
    } else {
      notifications.show({
        title: 'Error',
        message: 'Cannot created bill.',
        color: 'red',
      })

      loadingOverlayRef.current?.hide()
    }
  }

  return (
    <PageView title="Add Bill" backTo={`/patient/${id}/transactions`}>
      <LoadingOverlay ref={loadingOverlayRef} />
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack>
          <Controller
            control={control}
            name="procedure"
            rules={{
              required: true,
            }}
            render={({ field }) => (
              <Select
                label="Procedure"
                placeholder="Pick value"
                data={[{ label: 'Orthodontic', value: 'ortho' }]}
                allowDeselect={false}
                required
                {...field}
              />
            )}
          />
          <Controller
            control={control}
            name="description"
            rules={{
              required: true,
            }}
            render={({ field }) => (
              <Textarea
                label="Description"
                required
                autosize
                minRows={4}
                {...field}
              />
            )}
          />
          <ProcedureAmountInput control={control} computer={computeTotal} />
          <Stack gap="sm">
            <Group mt="md" justify="space-between">
              <Text>Items</Text>
              <Button
                size="xs"
                onClick={() =>
                  append({
                    name: '',
                    amount: 0,
                  })
                }
              >
                Add item
              </Button>
            </Group>
            {fields.length > 0 ? (
              <Group>
                <Text fw={500} size="sm" style={{ flex: 1 }}>
                  Item
                </Text>
                <Text fw={500} size="sm" pr={305}>
                  Amount
                </Text>
              </Group>
            ) : (
              <Text c="dimmed" ta="center">
                No items
              </Text>
            )}
            {fields.map((item, index) => (
              <Group key={item.id}>
                <Controller
                  control={control}
                  name={`items.${index}.name`}
                  rules={{
                    required: true,
                  }}
                  render={({ field }) => (
                    <TextInput required style={{ flex: 1 }} {...field} />
                  )}
                />
                <ItemAmountInput
                  index={index}
                  control={control}
                  computer={computeTotal}
                />
                <ActionIcon color="red" onClick={() => remove(index)}>
                  <IconTrash size="1rem" />
                </ActionIcon>
              </Group>
            ))}
          </Stack>
          <Card ta="center">
            <Text c="dimmed">Total Amount:</Text>
            <Text size="lg" fw="bold">
              {formatMoney(watch('totalAmount'))}
            </Text>
          </Card>
          <Button type="submit" mt="md">
            Create bill
          </Button>
        </Stack>
      </form>
    </PageView>
  )
}

function ProcedureAmountInput({
  control,
  computer: computeTotal,
}: {
  control: Control<BillFields>
  computer: () => void
}) {
  const amount = useWatch({
    control,
    name: 'serviceAmount',
    defaultValue: 0,
  })

  useEffect(() => {
    if (amount) computeTotal()
  }, [amount, computeTotal])

  return (
    <Controller
      control={control}
      name="serviceAmount"
      rules={{
        required: true,
      }}
      render={({ field }) => (
        <NumberInput label="Procedure Amount" min={0} required {...field} />
      )}
    />
  )
}

function ItemAmountInput({
  control,
  index,
  computer: computeTotal,
}: {
  control: Control<BillFields>
  index: number
  computer: () => void
}) {
  const amount = useWatch({
    control,
    name: `items.${index}.amount`,
    defaultValue: 0,
  })

  useEffect(() => {
    if (amount) computeTotal()
  }, [amount, computeTotal])

  return (
    <Controller
      control={control}
      name={`items.${index}.amount`}
      rules={{
        required: true,
      }}
      render={({ field }) => (
        <NumberInput min={0} required style={{ flex: 1 }} {...field} />
      )}
    />
  )
}
