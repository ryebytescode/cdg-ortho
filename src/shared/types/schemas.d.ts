interface PatientFields {
  id: string
  patientType?: string
  entryDate?: import('@mantine/dates').DateValue
  firstName: string
  lastName: string
  middleName?: string
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
  id: string
  patientId: string
  procedure: string
  description: string
  serviceAmount: number
  items: {
    name: string
    amount: number
  }[]
  totalAmount: number
}

interface Bill {
  id: string
  createdAt: string
  patientId: string
  procedure: string
  description: string
  serviceAmount: number
  items: BillFields['items']
  lastPaymentDate: string
  totalDue: number
  totalPaid: number
  patient: Patient
  payments: Payment[]
}

interface Payment {
  id: string
  createdAt: string
  billId: string
  amount: number
  balance: number
  paymentMode: string
}

interface SettleFields {
  billId: string
  amount: number
  balance: number
  paymentMode: string | null
}
