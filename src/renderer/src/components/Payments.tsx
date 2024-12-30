import { Table } from '@mantine/core'
import {
  formatDate,
  formatMoney,
  truncateString,
} from '@renderer/helpers/utils'
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'

const fallbackData: Payment[] = []
const columnHelper = createColumnHelper<Payment>()

const columns = [
  columnHelper.accessor('id', {
    header: 'ID',
    cell: (cell) => truncateString(cell.getValue(), 10),
  }),
  columnHelper.accessor('createdAt', {
    header: 'Paid At',
    cell: (cell) => formatDate(cell.getValue()),
  }),
  columnHelper.accessor('amount', {
    header: 'Amount',
    cell: (cell) => formatMoney(cell.getValue()),
  }),
  columnHelper.accessor('balance', {
    header: 'Balance',
    cell: (cell) => formatMoney(cell.getValue()),
  }),
  columnHelper.accessor('paymentMode', {
    header: 'Payment Mode',
  }),
]

export function Payments({ bill }: { bill: Bill }) {
  const table = useReactTable({
    columns,
    data: bill.payments ?? fallbackData,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
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
          <Table.Tr key={row.id}>
            {row.getVisibleCells().map((cell) => (
              <Table.Td key={cell.id}>
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </Table.Td>
            ))}
          </Table.Tr>
        ))}
      </Table.Tbody>
    </Table>
  )
}
