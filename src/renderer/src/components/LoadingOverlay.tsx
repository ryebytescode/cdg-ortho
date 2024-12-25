import { LoadingOverlay as MLoadingOverlay, Transition } from '@mantine/core'
import { type Ref, useImperativeHandle, useState } from 'react'

interface LoadingOverlayHandleProps {
  show: () => void
  hide: () => void
}

export const LoadingOverlay = ({
  ref,
}: { ref: Ref<LoadingOverlayHandleProps> }) => {
  const [isVisible, setIsVisible] = useState(false)

  useImperativeHandle(ref, () => ({
    show() {
      setIsVisible(true)
    },
    hide() {
      setIsVisible(false)
    },
  }))

  return (
    <Transition
      mounted={isVisible}
      transition="fade"
      duration={500}
      timingFunction="ease-out"
    >
      {() => (
        <MLoadingOverlay
          visible={true}
          loaderProps={{ type: 'dots', size: 'xl' }}
          pos="fixed"
        />
      )}
    </Transition>
  )
}
