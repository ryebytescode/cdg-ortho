import {
  ActionIcon,
  Button,
  Card,
  Group,
  LoadingOverlay,
  NumberInput,
  Select,
  Stack,
  Text,
  TextInput,
  Textarea,
} from '@mantine/core'
import { useForm } from '@mantine/form'
import { randomId } from '@mantine/hooks'
import { PageView } from '@renderer/components/PageView'
import { IconTrash } from '@tabler/icons-react'
import { type ComponentRef, useRef } from 'react'
import { useParams } from 'react-router'

const initialValues: BillFields = {
  procedure: 'ortho',
  description: '',
  serviceAmount: 0,
  items: [],
  totalAmount: 0,
}

export default function Bill() {
  const { id } = useParams()
  const loadingOverlayRef = useRef<ComponentRef<typeof LoadingOverlay>>(null)
  const form = useForm<BillFields>({
    mode: 'uncontrolled',
    initialValues,
  })

  const computeTotal = () => {}

  return (
    <PageView title="Add Bill" backTo={`/patient/${id}/transactions`}>
      <LoadingOverlay ref={loadingOverlayRef} />
      <form>
        <Stack>
          <Select
            label="Procedure"
            placeholder="Pick value"
            data={[{ label: 'Orthodontic', value: 'ortho' }]}
            allowDeselect={false}
            key={form.key('procedure')}
            {...form.getInputProps('procedure')}
            required
          />
          <Textarea
            label="Description"
            key={form.key('description')}
            required
            autosize
            minRows={4}
            {...form.getInputProps('description')}
          />
          <NumberInput
            label="Procedure Amount"
            min={0}
            key={form.key('procedure')}
            {...form.getInputProps('procedure')}
            required
          />
          <Stack gap="sm">
            <Group mt="md" justify="space-between">
              <Text>Items</Text>
              <Button
                size="xs"
                onClick={() =>
                  form.insertListItem('items', {
                    name: '',
                    amount: 0,
                    key: randomId(),
                  })
                }
              >
                Add item
              </Button>
            </Group>
            {form.getValues().items.length > 0 ? (
              <Group>
                <Text fw={500} size="sm" style={{ flex: 1 }}>
                  Item
                </Text>
                <Text fw={500} size="sm" pr={305}>
                  Amount
                </Text>
              </Group>
            ) : (
              <Text c="dimmed" ta="center">
                No items
              </Text>
            )}
            {form.getValues().items.map((item, index) => (
              <Group key={item.key}>
                <TextInput
                  required
                  style={{ flex: 1 }}
                  key={form.key(`items.${index}.name`)}
                  {...form.getInputProps(`items.${index}.name`)}
                />
                <NumberInput
                  min={0}
                  required
                  style={{ flex: 1 }}
                  key={form.key(`items.${index}.amount`)}
                  {...form.getInputProps(`items.${index}.amount`)}
                />
                <ActionIcon
                  color="red"
                  onClick={() => form.removeListItem('items', index)}
                >
                  <IconTrash size="1rem" />
                </ActionIcon>
              </Group>
            ))}
          </Stack>
          <Card>
            <Text>Total Amount</Text>
          </Card>
          <Button type="submit" mt="md">
            Create bill
          </Button>
        </Stack>
      </form>
    </PageView>
  )
}
