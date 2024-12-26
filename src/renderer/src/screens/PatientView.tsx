import { Tabs, rem } from '@mantine/core'
import { Profile } from '@renderer/components/Profile'
import {
  IconDatabaseDollar,
  IconLibraryPhoto,
  IconUser,
} from '@tabler/icons-react'
import { useParams } from 'react-router'
import { PageView } from '../components/PageView'
import classes from '../styles/tab.module.css'

export default function PatientView() {
  const { id } = useParams()

  return (
    <PageView title="Patient">
      <Tabs
        variant="unstyled"
        keepMounted={false}
        defaultValue="profile"
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
          <Profile id={id ?? ''} />
        </Tabs.Panel>
        <Tabs.Panel value="transactions">Messages tab content</Tabs.Panel>
        <Tabs.Panel value="files">Settings tab content</Tabs.Panel>
      </Tabs>
    </PageView>
  )
}
