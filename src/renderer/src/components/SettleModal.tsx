import { zodResolver } from '@hookform/resolvers/zod'
import {
  Button,
  Card,
  type ComboboxData,
  Group,
  Modal,
  NumberInput,
  Select,
  Stack,
  Text,
} from '@mantine/core'
import { modals } from '@mantine/modals'
import { notifications } from '@mantine/notifications'
import { SettleBillSchema } from '@renderer/helpers/fields'
import { calcBalance, formatDate, formatMoney } from '@renderer/helpers/utils'
import { IconCurrencyPeso } from '@tabler/icons-react'
import { Controller, type SubmitHandler, useForm } from 'react-hook-form'
import { useNavigate } from 'react-router'

const paymentModes: ComboboxData = [
  { label: 'Cash', value: 'Cash' },
  { label: 'GCash', value: 'GCash' },
  { label: 'Bank Transfer', value: 'Bank Transfer' },
]

const defaultValues: Omit<SettleFields, 'billId'> = {
  amount: 0,
  balance: 0,
  paymentMode: null,
}

export function SettleModal({
  bill,
  opened,
  onClose: close,
}: {
  bill: Bill
  opened: boolean
  onClose: () => void
}) {
  const navigate = useNavigate()
  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<SettleFields>({
    defaultValues,
    resolver: zodResolver(SettleBillSchema),
  })

  const settleBill = async (fields: SettleFields) => {
    const result = await window.api.settleBill({
      ...fields,
      billId: bill.id,
      balance: calcBalance(bill.totalDue, bill.totalPaid + fields.amount),
    })

    if (result) {
      notifications.show({
        title: 'Success!',
        message: 'Bill settled.',
        color: 'green',
      })

      navigate(`/patient/${bill.patientId}/transactions`, { replace: true })
    } else {
      notifications.show({
        title: 'Error',
        message: 'Cannot settle the bill.',
        color: 'red',
      })
    }
  }

  const onSubmit: SubmitHandler<SettleFields> = async (fields) => {
    modals.openConfirmModal({
      title: 'Warning',
      children: (
        <Text>Once this bill is settled, the action cannot be reversed.</Text>
      ),
      onConfirm: () => settleBill(fields),
      labels: {
        confirm: 'Proceed',
        cancel: 'Cancel',
      },
      centered: true,
    })
  }

  return (
    <Modal
      opened={opened}
      onClose={close}
      title="Settle Bill"
      withCloseButton={false}
      keepMounted={false}
      centered
    >
      <Card>
        <Group>
          <Stack flex={1} gap={0}>
            <Text c="dimmed" flex={1}>
              Balance
            </Text>
            <Text size="xl" fw="bold">
              {formatMoney(calcBalance(bill.totalDue, bill.totalPaid))}
            </Text>
          </Stack>
          <Text size="xs" c="dimmed" style={{ alignSelf: 'flex-start' }}>
            As of {formatDate(bill.lastPaymentDate ?? bill.createdAt)}
          </Text>
        </Group>
      </Card>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack>
          <Controller
            control={control}
            name="amount"
            disabled={isSubmitting}
            render={({ field, fieldState: { error } }) => (
              <NumberInput
                label="Amount"
                min={0}
                withAsterisk
                error={error?.message}
                leftSection={<IconCurrencyPeso size={18} />}
                {...field}
              />
            )}
          />
          <Controller
            control={control}
            name="paymentMode"
            disabled={isSubmitting}
            render={({ field, fieldState: { error } }) => (
              <Select
                label="Mode of Payment"
                placeholder="Select"
                data={paymentModes}
                allowDeselect={false}
                withAsterisk
                error={error?.message}
                {...field}
              />
            )}
          />
          <Group justify="flex-end">
            <Button
              type="button"
              onClick={close}
              variant="outline"
              color="gray"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              Settle
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  )
}
