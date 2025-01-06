import { Card, Grid, Paper, Text, Title } from '@mantine/core'
import { pluralize } from '@renderer/helpers/utils'
import { FileCategory } from '@shared/constants'
import { useEffect, useState } from 'react'
import { Link } from 'react-router'

export function FileManager({ id }: { id: string }) {
  const [counts, setCounts] = useState({
    photos: 0,
    videos: 0,
    docs: 0,
  })

  useEffect(() => {
    ;(async () => {
      setCounts({
        photos: await window.api.countFiles(id, FileCategory.PHOTOS),
        videos: await window.api.countFiles(id, FileCategory.VIDEOS),
        docs: await window.api.countFiles(id, FileCategory.DOCS),
      })
    })()
  }, [id])

  return (
    <Paper withBorder p={18}>
      <Grid>
        <Grid.Col span={4}>
          <Card withBorder component={Link} to={`/photos/${id}`} py="xl">
            <Text>{pluralize('item', counts.photos)}</Text>
            <Title order={3}>Photos</Title>
          </Card>
        </Grid.Col>
        <Grid.Col span={4}>
          <Card withBorder component={Link} to={`/videos/${id}`} py="xl">
            <Text>{pluralize('item', counts.videos)}</Text>
            <Title order={3}>Videos</Title>
          </Card>
        </Grid.Col>
        <Grid.Col span={4}>
          <Card withBorder component={Link} to={`/docs/${id}`} py="xl">
            <Text>{pluralize('item', counts.docs)}</Text>
            <Title order={3}>Documents</Title>
          </Card>
        </Grid.Col>
      </Grid>
    </Paper>
  )
}
