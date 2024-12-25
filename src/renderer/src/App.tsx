import { MantineProvider } from '@mantine/core'
import '@mantine/core/styles.css'
import '@mantine/dates/styles.css'
import '@mantine/notifications/styles.css'
import { Notifications } from '@mantine/notifications'
import { BrowserRouter, Route, Routes } from 'react-router'
import Index from './screens/Index'
import NewPatient from './screens/NewPatient'
import Patients from './screens/Patients'
import Settings from './screens/Settings'

export default function App() {
  return (
    <MantineProvider defaultColorScheme="dark">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/new" element={<NewPatient />} />
          <Route path="/patients" element={<Patients />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </BrowserRouter>
      <Notifications limit={3} />
    </MantineProvider>
  )
}
