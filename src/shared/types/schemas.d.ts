interface NewPatientFields {
  patientType: string
  firstName: string
  lastName: string
  middleName: string
  suffix: string
  birthdate: import('@mantine/dates').DateValue
  gender: string
  phone: string
  address: string
  entryDate: import('@mantine/dates').DateValue
}

interface Patient {
  id: string
  createdAt: string
  updatedAt: string
  patientType: string
  firstName: string
  lastName: string
  middleName: string
  suffix: string
  birthdate: number
  gender: string
  phone: string
  address: string
  entryDate: number
}
