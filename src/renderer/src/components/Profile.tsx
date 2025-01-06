import { Button, Group, Paper, Table, Text } from '@mantine/core'
import { modals } from '@mantine/modals'
import { notifications } from '@mantine/notifications'
import { formatDate, joinNames } from '@renderer/helpers/utils'
import { differenceInYears, format } from 'date-fns'
import { type ComponentRef, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router'
import { LoadingOverlay } from './LoadingOverlay'

export function Profile({ id }: { id: string }) {
  const navigate = useNavigate()
  const [patientData, setPatientData] = useState<Patient>()
  const loadingOverlayRef = useRef<ComponentRef<typeof LoadingOverlay>>(null)

  const handleDelete = () => {
    modals.openConfirmModal({
      title: 'Confirm Delete',
      children: (
        <Text>
          Deleting this record will delete all the transactions and files
          associated with this patient. Do you really want to proceed?
        </Text>
      ),
      onConfirm: async () => {
        loadingOverlayRef.current?.show()
        const result = await window.api.deletePatientRecord(id)

        if (result) {
          notifications.show({
            title: 'Deleted',
            message: 'Patient record was successfully deleted.',
            color: 'green',
          })

          navigate('/patients')
        } else {
          notifications.show({
            title: 'Failed',
            message: 'Could not delete this record.',
            color: 'red',
          })
          loadingOverlayRef.current?.hide()
        }
      },
      labels: {
        confirm: 'Delete',
        cancel: 'Cancel',
      },
      confirmProps: {
        color: 'red',
      },
      centered: true,
    })
  }

  useEffect(() => {
    ;(async () => {
      const data = await window.api.getPatientProfile(id)

      if (data) setPatientData(data)
    })()
  }, [id])

  return (
    <>
      <LoadingOverlay ref={loadingOverlayRef} />
      <Paper withBorder p={18}>
        <Group>
          <Button mb="md" onClick={() => navigate(`/patient/${id}/edit`)}>
            Edit
          </Button>
          <Button mb="md" onClick={handleDelete} color="red">
            Delete
          </Button>
        </Group>
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
                <Table.Td>
                  {formatDate(
                    patientData.patientType === 'old'
                      ? patientData?.entryDateIfOld
                      : patientData?.createdAt
                  )}
                </Table.Td>
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
    </>
  )
}
