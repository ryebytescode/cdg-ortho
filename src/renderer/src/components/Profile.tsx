import { Button, Paper, Table } from '@mantine/core'
import { formatDate, joinNames } from '@renderer/helpers/utils'
import { differenceInYears, format } from 'date-fns'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'

export function Profile({ id }: { id: string }) {
  const navigate = useNavigate()
  const [patientData, setPatientData] = useState<Patient>()

  useEffect(() => {
    ;(async () => {
      const data = await window.api.getPatientProfile(id)

      if (data) setPatientData(data)
    })()
  }, [id])

  return (
    <Paper withBorder p={18}>
      <Button mb="md" onClick={() => navigate(`/patient/${id}/edit`)}>
        Edit
      </Button>
      {patientData && (
        <Table
          variant="vertical"
          withColumnBorders
          withRowBorders
          withTableBorder
        >
          <Table.Tbody>
            <Table.Tr>
              <Table.Th>Patient ID</Table.Th>
              <Table.Td>{patientData?.id}</Table.Td>
            </Table.Tr>
            <Table.Tr>
              <Table.Th>Date Created</Table.Th>
              <Table.Td>{formatDate(patientData?.createdAt)}</Table.Td>
            </Table.Tr>
            <Table.Tr>
              <Table.Th>Full Name</Table.Th>
              <Table.Td>
                {joinNames(
                  patientData.firstName,
                  patientData.lastName,
                  patientData.middleName,
                  patientData.suffix,
                  false,
                  true
                ).toUpperCase()}
              </Table.Td>
            </Table.Tr>
            <Table.Tr>
              <Table.Th>Patient Type</Table.Th>
              <Table.Td>{patientData.patientType.toUpperCase()}</Table.Td>
            </Table.Tr>
            {patientData.patientType === 'old' && (
              <Table.Tr>
                <Table.Th>Date of Entry</Table.Th>
                <Table.Td>
                  {format(
                    new Date(patientData.entryDateIfOld),
                    'MMMM dd, yyyy'
                  )}
                </Table.Td>
              </Table.Tr>
            )}
            <Table.Tr>
              <Table.Th>Sex</Table.Th>
              <Table.Td>
                {patientData.gender === 'male' ? 'Male' : 'Female'}
              </Table.Td>
            </Table.Tr>
            <Table.Tr>
              <Table.Th>Age</Table.Th>
              <Table.Td>
                {differenceInYears(new Date(), patientData.birthdate)}
              </Table.Td>
            </Table.Tr>
            <Table.Tr>
              <Table.Th>Date of Birth</Table.Th>
              <Table.Td>
                {format(new Date(patientData.birthdate), 'MMMM dd, yyyy')}
              </Table.Td>
            </Table.Tr>
            <Table.Tr>
              <Table.Th>Phone</Table.Th>
              <Table.Td>{patientData.phone}</Table.Td>
            </Table.Tr>
            <Table.Tr>
              <Table.Th>Address</Table.Th>
              <Table.Td>{patientData.address.toUpperCase()}</Table.Td>
            </Table.Tr>
          </Table.Tbody>
        </Table>
      )}
    </Paper>
  )
}
