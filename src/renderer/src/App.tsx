import { MantineProvider } from '@mantine/core'
import '@mantine/core/styles.css'
import '@mantine/dates/styles.css'
import { Notifications } from '@mantine/notifications'
import '@mantine/notifications/styles.css'
import log from 'electron-log/renderer'
import { useEffect } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router'
import Bill from './screens/Bill'
import Index from './screens/Index'
import PatientForm from './screens/PatientForm'
import PatientView from './screens/PatientView'
import Patients from './screens/Patients'
import Settings from './screens/Settings'

export default function App() {
  useEffect(() => {
    log.info('App renderer process started')
  }, [])

  return (
    <MantineProvider defaultColorScheme="dark">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/new" element={<PatientForm />} />
          <Route path="/patients" element={<Patients />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/patient/:id" element={<PatientView />} />
          <Route path="/patient/:id/:tab?" element={<PatientView />} />
          <Route
            path="/patient/:id/edit"
            element={<PatientForm isEdit={true} />}
          />
          <Route path="/bill/:id/new" element={<Bill />} />
        </Routes>
      </BrowserRouter>
      <Notifications limit={3} position="top-right" />
    </MantineProvider>
  )
}
