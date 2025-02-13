import { ActionIcon, Container, Group, Stack, Title } from '@mantine/core'
import { IconChevronLeft } from '@tabler/icons-react'
import type { PropsWithChildren } from 'react'
import { useNavigate } from 'react-router'

interface PageViewProps extends PropsWithChildren {
  title: string
  backTo?: string
  isLoading?: boolean
}

export function PageView({
  title,
  children,
  backTo,
  isLoading = false,
}: PageViewProps) {
  const navigate = useNavigate()

  return (
    <Container size="md" py="xl">
      <Stack>
        <Group gap="xl">
          <ActionIcon
            disabled={isLoading}
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
