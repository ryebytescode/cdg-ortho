import {
  Badge,
  Button,
  Group,
  Paper,
  Stack,
  Table,
  Text,
  Title,
} from '@mantine/core'
import { randomId, useDisclosure } from '@mantine/hooks'
import { PageView } from '@renderer/components/PageView'
import { Payments } from '@renderer/components/Payments'
import { SettleModal } from '@renderer/components/SettleModal'
import {
  formatDate,
  formatMoney,
  getStatus,
  isPaid,
  joinNames,
  statusColors,
} from '@renderer/helpers/utils'
import { IconDatabaseOff } from '@tabler/icons-react'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router'

export default function BillView() {
  const { patientId, billId } = useParams()
  const navigate = useNavigate()
  const [opened, { open, close }] = useDisclosure(false)
  const [bill, setBill] = useState<Bill>()
  const status = bill ? getStatus(bill.totalDue, bill.totalPaid) : 'unpaid'

  useEffect(() => {
    ;(async () => {
      const data = await window.api.getBill(billId as string)
      setBill(data)
    })()
  }, [billId])

  return (
    <PageView title="View Bill" backTo={`/patient/${patientId}/transactions`}>
      {bill && (
        <>
          <SettleModal bill={bill} opened={opened} onClose={close} />
          <Group>
            <Button
              onClick={open}
              disabled={isPaid(bill.totalDue, bill.totalPaid)}
            >
              Settle bill
            </Button>
            <Button
              onClick={() => navigate(`/bill/${patientId}/${billId}/edit`)}
              disabled={isPaid(bill.totalDue, bill.totalPaid)}
            >
              Edit bill
            </Button>
          </Group>
          <Group grow>
            <Stack>
              <Title order={4}>General</Title>
              <Table
                variant="vertical"
                withColumnBorders
                withRowBorders
                withTableBorder
              >
                <Table.Tbody>
                  <Table.Tr>
                    <Table.Th w={150}>Bill ID</Table.Th>
                    <Table.Td>{bill.id}</Table.Td>
                  </Table.Tr>
                  <Table.Tr>
                    <Table.Th w={150}>Date Created</Table.Th>
                    <Table.Td>{formatDate(bill.createdAt)}</Table.Td>
                  </Table.Tr>
                  <Table.Tr>
                    <Table.Th>Status</Table.Th>
                    <Table.Td>
                      <Badge color={statusColors[status]}>{status}</Badge>
                    </Table.Td>
                  </Table.Tr>
                  <Table.Tr>
                    <Table.Th>Patient</Table.Th>
                    <Table.Td>
                      {joinNames(
                        bill.patient.firstName,
                        bill.patient.lastName,
                        bill.patient.middleName,
                        bill.patient.suffix
                      ).toUpperCase()}
                    </Table.Td>
                  </Table.Tr>
                  <Table.Tr>
                    <Table.Th>Procedure</Table.Th>
                    <Table.Td>Orthodontic</Table.Td>
                  </Table.Tr>
                  <Table.Tr>
                    <Table.Th>Description</Table.Th>
                    <Table.Td>{bill.description}</Table.Td>
                  </Table.Tr>
                </Table.Tbody>
              </Table>
            </Stack>
            <Stack style={{ alignSelf: 'start' }}>
              <Title order={4}>Particulars</Title>
              <Table
                variant="vertical"
                withColumnBorders
                withRowBorders
                withTableBorder
              >
                <Table.Tbody>
                  <Table.Tr>
                    <Table.Th w={150}>Procedure</Table.Th>
                    <Table.Td ta="right">
                      + {formatMoney(bill.serviceAmount)}
                    </Table.Td>
                  </Table.Tr>
                  <Table.Tr>
                    <Table.Th>Items</Table.Th>
                    <Table.Td ta="right">
                      {bill.items.length > 0 &&
                        bill.items.map((item) => (
                          <Text size="sm" key={randomId()}>
                            {item.name} + {formatMoney(item.amount)}
                          </Text>
                        ))}
                    </Table.Td>
                  </Table.Tr>
                  <Table.Tr>
                    <Table.Th fw="bold">Total</Table.Th>
                    <Table.Td ta="right" fw="bold">
                      {formatMoney(bill.totalDue)}
                    </Table.Td>
                  </Table.Tr>
                  <Table.Tr>
                    <Table.Th fw="bold">Total Paid</Table.Th>
                    <Table.Td ta="right" fw="bold">
                      {formatMoney(bill.totalPaid)}
                    </Table.Td>
                  </Table.Tr>
                  <Table.Tr>
                    <Table.Th fw="bold">Balance</Table.Th>
                    <Table.Td ta="right" fw="bold" c="blue">
                      {formatMoney(bill.totalDue - bill.totalPaid)}
                    </Table.Td>
                  </Table.Tr>
                </Table.Tbody>
              </Table>
            </Stack>
          </Group>
          <Stack>
            <Title order={4} mt="md">
              Payments Log
            </Title>
            {bill.payments.length > 0 ? (
              <Payments bill={bill} />
            ) : (
              <Paper withBorder p={18}>
                <Stack align="center" justify="center" gap="lg">
                  <Stack align="center" justify="center" gap="xs">
                    <IconDatabaseOff size={56} />
                    <Text size="lg">No payments yet</Text>
                  </Stack>
                  <Button size="lg" onClick={open}>
                    Settle bill
                  </Button>
                </Stack>
              </Paper>
            )}
          </Stack>
        </>
      )}
    </PageView>
  )
}
