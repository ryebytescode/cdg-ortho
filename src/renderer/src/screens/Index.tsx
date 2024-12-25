import { ActionIcon, Button, Flex, Image, SimpleGrid } from '@mantine/core'
import { IconSettings, IconUserPlus, IconUsers } from '@tabler/icons-react'
import { Link } from 'react-router'
import logo from '../assets/cdg-logo.svg'

export default function Index() {
  return (
    <Flex direction="column" align="center" justify="center" gap="xl" h="100vh">
      <Image src={logo} w={100} />
      <SimpleGrid cols={1}>
        <Button
          component={Link}
          size="xl"
          to="/new"
          leftSection={<IconUserPlus />}
        >
          Add patient
        </Button>
        <Button
          component={Link}
          size="xl"
          to="/patients"
          leftSection={<IconUsers />}
        >
          View patients
        </Button>
      </SimpleGrid>
      <ActionIcon
        component={Link}
        to="/settings"
        radius="xl"
        pos="absolute"
        bottom={30}
        right={30}
      >
        <IconSettings />
      </ActionIcon>
    </Flex>
  )
}
