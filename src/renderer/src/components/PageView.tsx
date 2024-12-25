import { ActionIcon, Container, Group, Stack, Title } from '@mantine/core'
import { IconChevronLeft } from '@tabler/icons-react'
import type { PropsWithChildren } from 'react'
import { Link } from 'react-router'

interface PageViewProps extends PropsWithChildren {
  title: string
  backTo?: string
}

export function PageView({ title, backTo, children }: PageViewProps) {
  return (
    <Container size="sm" py="xl">
      <Stack>
        <Group gap="xl">
          <ActionIcon component={Link} to={backTo ?? '/'}>
            <IconChevronLeft />
          </ActionIcon>
          <Title order={2}>{title}</Title>
        </Group>
        {children}
      </Stack>
    </Container>
  )
}
