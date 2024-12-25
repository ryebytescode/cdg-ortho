import { Button, SimpleGrid } from '@mantine/core'
import {
  IconContract,
  IconDatabaseDollar,
  IconLibraryPhoto,
} from '@tabler/icons-react'
import { Link } from 'react-router'
import { PageView } from '../components/PageView'

export default function Patients() {
  return (
    <PageView title="Add patient" backTo="/">
      <SimpleGrid cols={1}>
        <Button
          component={Link}
          size="xl"
          to="/new"
          leftSection={<IconContract />}
        >
          Create contract
        </Button>
        <Button
          component={Link}
          size="xl"
          to="/new"
          leftSection={<IconDatabaseDollar />}
        >
          Transactions
        </Button>
        <Button
          component={Link}
          size="xl"
          to="/new"
          leftSection={<IconLibraryPhoto />}
        >
          Gallery
        </Button>
      </SimpleGrid>
    </PageView>
  )
}
