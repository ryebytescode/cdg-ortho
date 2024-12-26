import { ActionIcon, Container, Group, Stack, Title } from '@mantine/core'
import { IconChevronLeft } from '@tabler/icons-react'
import type { PropsWithChildren } from 'react'
import { useNavigate } from 'react-router'

interface PageViewProps extends PropsWithChildren {
  title: string
}

export function PageView({ title, children }: PageViewProps) {
  const navigate = useNavigate()

  return (
    <Container size="md" py="xl">
      <Stack>
        <Group gap="xl">
          <ActionIcon onClick={() => navigate(-1)}>
            <IconChevronLeft />
          </ActionIcon>
          <Title order={2}>{title}</Title>
        </Group>
        {children}
      </Stack>
    </Container>
  )
}
