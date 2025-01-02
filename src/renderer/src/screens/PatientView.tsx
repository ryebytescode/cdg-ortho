import { Tabs, rem } from '@mantine/core'
import { FileManager } from '@renderer/components/FileManager'
import { Profile } from '@renderer/components/Profile'
import { Transaction } from '@renderer/components/Transaction'
import {
  IconDatabaseDollar,
  IconLibraryPhoto,
  IconUser,
} from '@tabler/icons-react'
import { useState } from 'react'
import { useParams } from 'react-router'
import { PageView } from '../components/PageView'
import classes from '../styles/tab.module.css'

export default function PatientView() {
  const { id, tab } = useParams()
  const [activeTab, setActiveTab] = useState<string | null>(tab ?? 'profile')

  return (
    <PageView title="Patient" backTo="/patients">
      <Tabs
        variant="unstyled"
        value={activeTab}
        onChange={setActiveTab}
        classNames={classes}
      >
        <Tabs.List grow mb={18}>
          <Tabs.Tab
            value="profile"
            leftSection={
              <IconUser style={{ width: rem(18), height: rem(18) }} />
            }
            style={{ fontSize: '18px' }}
          >
            Profile
          </Tabs.Tab>
          <Tabs.Tab
            value="transactions"
            leftSection={
              <IconDatabaseDollar style={{ width: rem(18), height: rem(18) }} />
            }
            style={{ fontSize: '18px' }}
          >
            Transactions
          </Tabs.Tab>
          <Tabs.Tab
            value="files"
            leftSection={
              <IconLibraryPhoto style={{ width: rem(18), height: rem(18) }} />
            }
            style={{ fontSize: '18px' }}
          >
            Files
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="profile">
          <Profile id={id as string} />
        </Tabs.Panel>
        <Tabs.Panel value="transactions">
          <Transaction id={id as string} />
        </Tabs.Panel>
        <Tabs.Panel value="files">
          <FileManager id={id as string} />
        </Tabs.Panel>
      </Tabs>
    </PageView>
  )
}
