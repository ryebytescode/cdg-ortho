import { Card, Grid, Paper, Text, Title } from '@mantine/core'
import { Link } from 'react-router'

export function FileManager({ id }: { id: string }) {
  return (
    <Paper withBorder p={18}>
      <Grid>
        <Grid.Col span={4}>
          <Card withBorder component={Link} to={`/photos/${id}`} py="xl">
            <Text>3 items</Text>
            <Title order={3}>Photos</Title>
          </Card>
        </Grid.Col>
        <Grid.Col span={4}>
          <Card withBorder component={Link} to={`/videos/${id}`} py="xl">
            <Text>3 items</Text>
            <Title order={3}>Videos</Title>
          </Card>
        </Grid.Col>
        <Grid.Col span={4}>
          <Card withBorder component={Link} to={`/docs/${id}`} py="xl">
            <Text>3 items</Text>
            <Title order={3}>Documents</Title>
          </Card>
        </Grid.Col>
      </Grid>
    </Paper>
  )
}
