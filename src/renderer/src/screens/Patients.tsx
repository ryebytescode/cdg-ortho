import { Button, Center, Stack, Table, Text } from '@mantine/core'
import { joinNames, truncateString } from '@renderer/helpers/utils'
import { IconDatabaseOff } from '@tabler/icons-react'
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { differenceInYears } from 'date-fns'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { PageView } from '../components/PageView'

const fallbackData: Patient[] = []
const columnHelper = createColumnHelper<Patient>()

const columns = [
  columnHelper.accessor('id', {
    header: 'ID',
    cell: (cell) => truncateString(cell.getValue(), 10),
  }),
  columnHelper.accessor(
    ({ firstName, lastName, middleName, suffix }) =>
      joinNames(firstName, lastName, middleName, suffix, true).toUpperCase(),
    {
      id: 'fullname',
      header: 'Full Name',
    }
  ),
  columnHelper.accessor('gender', {
    header: 'Sex',
    cell: (cell) => (cell.getValue() === 'male' ? 'M' : 'F'),
  }),
  columnHelper.accessor('birthdate', {
    header: 'Age',
    cell: (cell) => differenceInYears(new Date(), cell.getValue()),
  }),
  columnHelper.accessor('patientType', {
    header: 'Type',
    cell: (cell) => cell.getValue().toUpperCase(),
  }),
  columnHelper.accessor('address', {
    header: 'Address',
    cell: (cell) => cell.getValue().toUpperCase(),
  }),
  columnHelper.accessor('phone', {
    header: 'Phone',
  }),
]

export default function Patients() {
  const navigate = useNavigate()
  const [patients, setPatients] = useState<Patient[]>()
  const table = useReactTable({
    columns,
    data: patients ?? fallbackData,
    getCoreRowModel: getCoreRowModel(),
  })

  useEffect(() => {
    ;(async () => {
      const data = await window.api.getPatients()
      setPatients(data)
    })()
  }, [])

  return (
    <PageView title="Patients" backTo="/">
      {!patients?.length ? (
        <Center py={64}>
          <Stack align="center" justify="center" gap="lg">
            <Stack align="center" justify="center" gap="xs">
              <IconDatabaseOff size={56} />
              <Text size="lg">No records yet</Text>
            </Stack>
            <Button size="lg" onClick={() => navigate('/new')}>
              Create a record
            </Button>
          </Stack>
        </Center>
      ) : (
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
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </Table.Td>
                ))}
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      )}
    </PageView>
  )
}
