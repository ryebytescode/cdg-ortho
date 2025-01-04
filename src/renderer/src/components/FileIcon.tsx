import { DocumentType } from '@shared/constants'
import {
  IconFileTypeCsv,
  IconFileTypeDoc,
  IconFileTypeDocx,
  IconFileTypePdf,
  type IconProps,
} from '@tabler/icons-react'
import { Switch } from './Switch'

export function FileIcon({
  type,
  ...iconProps
}: { type: DocumentType } & IconProps) {
  return (
    <Switch condition={type}>
      <Switch.Case when={DocumentType.DOC}>
        <IconFileTypeDoc {...iconProps} />
      </Switch.Case>
      <Switch.Case when={DocumentType.DOCX}>
        <IconFileTypeDocx {...iconProps} />
      </Switch.Case>
      <Switch.Case when={DocumentType.PDF}>
        <IconFileTypePdf {...iconProps} />
      </Switch.Case>
      <Switch.Case when={DocumentType.CSV}>
        <IconFileTypeCsv {...iconProps} />
      </Switch.Case>
    </Switch>
  )
}
