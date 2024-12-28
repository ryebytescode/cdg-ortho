import { Button, Center, Paper, Stack, Text } from '@mantine/core'
import { IconDatabaseOff } from '@tabler/icons-react'
import { useNavigate } from 'react-router'

export function Transaction({ id }: { id: string }) {
  const navigate = useNavigate()

  return (
    <Paper withBorder p={18}>
      <Center py={64}>
        <Stack align="center" justify="center" gap="lg">
          <Stack align="center" justify="center" gap="xs">
            <IconDatabaseOff size={56} />
            <Text size="lg">No transactions yet</Text>
          </Stack>
          <Button size="lg" onClick={() => navigate(`/bill/${id}`)}>
            Create a bill
          </Button>
        </Stack>
      </Center>
    </Paper>
  )
}
