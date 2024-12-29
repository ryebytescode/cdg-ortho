import { Select } from '@mantine/core'
import type {
  FieldValues,
  Path,
  PathValue,
  UseFormSetValue,
} from 'react-hook-form'

export function EnyeSelector<T extends FieldValues>({
  setValue,
  field,
}: {
  setValue: UseFormSetValue<T>
  field: keyof T
}) {
  return (
    <Select
      label=" "
      data={[
        { label: 'Ñ', value: 'Ñ' },
        { label: 'ñ', value: 'ñ' },
      ]}
      maw={64}
      placeholder="Ñ"
      onChange={(value) =>
        setValue(field as Path<T>, value as PathValue<T, Path<T>>)
      }
    />
  )
}
