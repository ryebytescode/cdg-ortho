import {
  Badge,
  Button,
  Center,
  type MantineColor,
  Paper,
  Stack,
  Table,
  Text,
} from '@mantine/core'
import {
  formatDate,
  formatMoney,
  truncateString,
} from '@renderer/helpers/utils'
import { IconDatabaseOff } from '@tabler/icons-react'
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'

const fallbackData: Bill[] = []
const columnHelper = createColumnHelper<Bill>()

const status: Record<string, MantineColor> = {
  pending: 'gray',
  partial: 'orange',
  paid: 'green',
}

const columns = [
  columnHelper.accessor('id', {
    header: 'ID',
    cell: (cell) => truncateString(cell.getValue(), 10),
  }),
  columnHelper.accessor('createdAt', {
    header: 'Created At',
    cell: (cell) => formatDate(cell.getValue()),
  }),
  columnHelper.accessor('totalDue', {
    header: 'Total Amount',
    cell: (cell) => formatMoney(cell.getValue()),
  }),
  columnHelper.accessor('totalPaid', {
    header: 'Total Paid',
    cell: (cell) => formatMoney(cell.getValue()),
  }),
  columnHelper.accessor('lastPaymentDate', {
    header: 'Last Payment Date',
    cell: (cell) => (cell.getValue() ? formatDate(cell.getValue()) : '-'),
  }),
  columnHelper.accessor(
    ({ totalDue, totalPaid }) => {
      if (totalPaid === 0) return 'pending'
      if (totalPaid < totalDue) return 'partial'

      return 'paid'
    },
    {
      id: 'status',
      cell: (cell) => (
        <Badge color={status[cell.getValue()]}>{cell.getValue()}</Badge>
      ),
    }
  ),
]

export function Transaction({ id }: { id: string }) {
  const navigate = useNavigate()
  const [bills, setBills] = useState<Bill[]>()
  const table = useReactTable({
    columns,
    data: bills ?? fallbackData,
    getCoreRowModel: getCoreRowModel(),
  })

  useEffect(() => {
    ;(async () => {
      const data = await window.api.getBills(id)
      setBills(data)
    })()
  }, [id])

  return (
    <Paper withBorder p={18}>
      {!bills?.length ? (
        <Center py={64}>
          <Stack align="center" justify="center" gap="lg">
            <Stack align="center" justify="center" gap="xs">
              <IconDatabaseOff size={56} />
              <Text size="lg">No transactions yet</Text>
            </Stack>
            <Button size="lg" onClick={() => navigate(`/bill/${id}/new`)}>
              Create a bill
            </Button>
          </Stack>
        </Center>
      ) : (
        <>
          <Button mb="md" onClick={() => navigate(`/bill/${id}/new`)}>
            Create a bill
          </Button>
          <Table highlightOnHover withTableBorder withColumnBorders>
            <Table.Thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <Table.Tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <Table.Th key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </Table.Th>
                  ))}
                </Table.Tr>
              ))}
            </Table.Thead>
            <Table.Tbody>
              {table.getRowModel().rows.map((row) => (
                <Table.Tr
                  key={row.id}
                  style={{ cursor: 'pointer' }}
                  onClick={() =>
                    navigate(`/patient/${row.getVisibleCells()[0].getValue()}`)
                  }
                >
                  {row.getVisibleCells().map((cell) => (
                    <Table.Td key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </Table.Td>
                  ))}
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </>
      )}
    </Paper>
  )
}
