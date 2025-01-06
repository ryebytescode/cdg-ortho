import { zodResolver } from '@hookform/resolvers/zod'
import {
  ActionIcon,
  Alert,
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
import { AddBillSchema } from '@renderer/helpers/fields'
import { formatMoney } from '@renderer/helpers/utils'
import { IconAlertTriangleFilled, IconTrash } from '@tabler/icons-react'
import {
  type ComponentRef,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react'
import {
  type Control,
  Controller,
  type SubmitHandler,
  useFieldArray,
  useForm,
  useWatch,
} from 'react-hook-form'
import { useNavigate, useParams } from 'react-router'

const defaultValues: BillFields = {
  id: '',
  patientId: '',
  procedure: 'ortho',
  description: '',
  serviceAmount: 0,
  items: [],
  totalAmount: 0,
}

export default function BillForm({ isEdit = false }: { isEdit?: boolean }) {
  const { patientId, billId } = useParams()
  const navigate = useNavigate()
  const [isPartial, setIsPartial] = useState(false)
  const { control, setValue, getValues, watch, register, handleSubmit } =
    useForm<BillFields>({
      resolver: zodResolver(AddBillSchema),
      defaultValues: isEdit
        ? async () => {
            const result = await window.api.getBill(billId as string)

            if (result) {
              if (result.totalPaid > 0) setIsPartial(true)

              return {
                ...result,
                patientId: patientId as string,
                id: billId as string,
                serviceAmount: result.serviceAmount,
                totalAmount: result.totalDue,
              }
            }

            // fallback
            return defaultValues
          }
        : defaultValues,
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

    const result = isEdit
      ? await window.api.updateBill({
          ...fields,
          id: billId as string,
          patientId: patientId as string,
        })
      : await window.api.createBill({
          ...fields,
          patientId: patientId as string,
        })

    if (result) {
      notifications.show({
        title: 'Success!',
        message: 'Bill created.',
        color: 'green',
      })

      navigate(`/patient/${patientId}/transactions`, { replace: true })
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
    <PageView
      title={`${isEdit ? 'Edit' : 'Add'} Bill`}
      backTo={`/patient/${patientId}/transactions`}
    >
      <LoadingOverlay ref={loadingOverlayRef} />
      <form onSubmit={handleSubmit(onSubmit)}>
        <input type="hidden" {...register('totalAmount')} />
        <Stack>
          {isPartial && (
            <Alert
              variant="light"
              color="orange"
              title="Note"
              icon={<IconAlertTriangleFilled />}
            >
              This bill has been partially paid and some fields cannot be
              modified anymore.
            </Alert>
          )}
          <Controller
            control={control}
            name="procedure"
            render={({ field, fieldState: { error } }) => (
              <Select
                label="Procedure"
                placeholder="Pick value"
                data={[{ label: 'Orthodontic', value: 'ortho' }]}
                allowDeselect={false}
                withAsterisk
                {...field}
                error={error?.message}
              />
            )}
          />
          <Controller
            control={control}
            name="description"
            render={({ field, fieldState: { error } }) => (
              <Textarea
                label="Description"
                autosize
                minRows={4}
                withAsterisk
                {...field}
                error={error?.message}
              />
            )}
          />
          <ProcedureAmountInput
            control={control}
            computer={computeTotal}
            disabled={isPartial}
          />
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
                disabled={isPartial}
              >
                Add item
              </Button>
            </Group>
            {fields.length > 0 ? (
              <Group grow>
                <Text fw={500} size="sm">
                  Item
                </Text>
                <Text fw={500} size="sm" mr="lg">
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
                  render={({ field, fieldState: { error } }) => (
                    <TextInput
                      withAsterisk
                      style={{ flex: 1 }}
                      {...field}
                      error={error?.message}
                    />
                  )}
                />
                <ItemAmountInput
                  index={index}
                  control={control}
                  computer={computeTotal}
                  disabled={isPartial}
                />
                <ActionIcon
                  color="red"
                  onClick={() => remove(index)}
                  disabled={isPartial}
                >
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
            {isEdit ? 'Update' : 'Create'} bill
          </Button>
        </Stack>
      </form>
    </PageView>
  )
}

function ProcedureAmountInput({
  control,
  computer: computeTotal,
  disabled = false,
}: {
  control: Control<BillFields>
  computer: () => void
  disabled?: boolean
}) {
  const amount = useWatch({
    control,
    name: 'serviceAmount',
  })

  useEffect(() => {
    if (amount >= 0) computeTotal()
  }, [amount, computeTotal])

  return (
    <Controller
      control={control}
      name="serviceAmount"
      disabled={disabled}
      render={({ field, fieldState: { error } }) => (
        <NumberInput
          label="Procedure Amount"
          min={0}
          max={1_000_000}
          withAsterisk
          {...field}
          error={error?.message}
        />
      )}
    />
  )
}

function ItemAmountInput({
  control,
  index,
  computer: computeTotal,
  disabled = false,
}: {
  control: Control<BillFields>
  index: number
  computer: () => void
  disabled?: boolean
}) {
  const amount = useWatch({
    control,
    name: `items.${index}.amount`,
    defaultValue: 0,
  })

  useEffect(() => {
    if (amount >= 0) computeTotal()
  }, [amount, computeTotal])

  useEffect(() => {
    return () => {
      computeTotal()
    }
  }, [computeTotal])

  return (
    <Controller
      control={control}
      name={`items.${index}.amount`}
      render={({ field, fieldState: { error } }) => (
        <NumberInput
          min={0}
          max={1_000_000}
          withAsterisk
          style={{ flex: 1 }}
          {...field}
          error={error?.message}
          disabled={disabled}
        />
      )}
    />
  )
}
