import { MantineProvider } from '@mantine/core'
import '@mantine/core/styles.css'
import '@mantine/dates/styles.css'
import '@mantine/dropzone/styles.css'
import { ModalsProvider } from '@mantine/modals'
import { Notifications } from '@mantine/notifications'
import '@mantine/notifications/styles.css'
import { FileCategory } from '@shared/constants'
import log from 'electron-log/renderer'
import { useEffect } from 'react'
import { HashRouter, Route, Routes } from 'react-router'
import BillForm from './screens/BillForm'
import BillView from './screens/BillView'
import PhotoManager from './screens/Files'
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
      <ModalsProvider>
        <HashRouter>
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
            <Route path="/bill/:patientId/:billId" element={<BillView />} />
            <Route path="/bill/:patientId/new" element={<BillForm />} />
            <Route
              path="/bill/:patientId/:billId/edit"
              element={<BillForm isEdit={true} />}
            />
            <Route
              path="/photos/:patientId"
              element={<PhotoManager category={FileCategory.PHOTOS} />}
            />
            <Route
              path="/videos/:patientId"
              element={<PhotoManager category={FileCategory.VIDEOS} />}
            />
            <Route
              path="/docs/:patientId"
              element={<PhotoManager category={FileCategory.DOCS} />}
            />
          </Routes>
        </HashRouter>
      </ModalsProvider>
      <Notifications limit={3} position="top-right" />
    </MantineProvider>
  )
}
