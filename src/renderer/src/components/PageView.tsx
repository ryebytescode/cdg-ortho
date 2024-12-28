import { ActionIcon, Container, Group, Stack, Title } from '@mantine/core'
import { IconChevronLeft } from '@tabler/icons-react'
import type { PropsWithChildren } from 'react'
import { useNavigate } from 'react-router'

interface PageViewProps extends PropsWithChildren {
  title: string
  backTo?: string
}

export function PageView({ title, children, backTo }: PageViewProps) {
  const navigate = useNavigate()

  return (
    <Container size="sm" py="xl">
      <Stack>
        <Group gap="xl">
          <ActionIcon
            onClick={() => {
              backTo ? navigate(backTo) : navigate(-1)
            }}
          >
            <IconChevronLeft />
          </ActionIcon>
          <Title order={2}>{title}</Title>
        </Group>
        {children}
      </Stack>
    </Container>
  )
}
