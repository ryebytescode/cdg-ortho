interface PatientFields {
  patientType?: string
  entryDate?: import('@mantine/dates').DateValue
  firstName: string
  lastName: string
  middleName: string
  suffix: string
  birthdate: import('@mantine/dates').DateValue
  gender: string
  phone: string
  address: string
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
  entryDateIfOld: number
}

interface BillFields {
  procedure: string
  description: string
  serviceAmount: number
  items: {
    name: string
    amount: number
  }[]
  totalAmount: number
}
