import type { MantineColor } from '@mantine/core'
import type { FileWithPath } from '@mantine/dropzone'
import { type DateArg, format } from 'date-fns'

export const statusColors: Record<string, MantineColor> = {
  pending: 'gray',
  partial: 'orange',
  paid: 'green',
}

const MAX_IMAGE_WIDTH = 3000
const MAX_IMAGE_HEIGHT = 3000
const IMAGE_QUALITY = 0.9

export function truncateString(str, maxLength) {
  return str.length > maxLength ? `${str.slice(0, maxLength - 3)}...` : str
}

export function joinNames(
  first: string,
  last: string,
  mid?: string,
  suffix?: string,
  isLastFirst = false,
  isFull = false
) {
  return isLastFirst
    ? `${last}${suffix ? ` ${suffix}` : ''}, ${first}${mid ? ` ${isFull ? mid : `${mid.at(0)}.`}` : ''}`
    : `${first}${mid ? ` ${isFull ? mid : `${mid.at(0)}.`}` : ''} ${last}${suffix ? ` ${suffix}` : ''}`
}

export function formatMoney(value: number) {
  return Intl.NumberFormat('en-PH', {
    currency: 'PHP',
    style: 'currency',
  }).format(value)
}

export function formatDate(date: DateArg<Date> & {}) {
  return format(date, 'PPp')
}

export function capFirstLetter(str: string) {
  return str[0].toUpperCase() + str.slice(1)
}

export function getStatus(totalDue: number, totalPaid: number) {
  if (totalPaid === 0) return 'pending'
  if (totalPaid < totalDue) return 'partial'

  return 'paid'
}

export function calcBalance(totalDue: number, totalPaid: number) {
  return totalDue > totalPaid ? totalDue - totalPaid : 0
}

export function isPaid(totalDue: number, totalPaid: number) {
  return calcBalance(totalDue, totalPaid) === 0
}

export interface ImageDimensions {
  srcWidth: number
  srcHeight: number
  maxWidth: number
  maxHeight: number
}

// https://stackoverflow.com/a/14731922
export function calculateAspectRatioFit({
  srcWidth,
  srcHeight,
  maxWidth,
  maxHeight,
}: ImageDimensions) {
  const ratio = Math.min(maxWidth / srcWidth, maxHeight / srcHeight)

  return {
    width: Math.floor(srcWidth / ratio),
    height: Math.floor(srcHeight / ratio),
  }
}

export interface FileInfo {
  file: File
  objectURL: string
}

export async function compressImage(
  file: FileWithPath
): Promise<FileInfo | null> {
  const img = await createImageBitmap(file)
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')

  const { width, height } = calculateAspectRatioFit({
    srcWidth: img.width,
    srcHeight: img.height,
    maxWidth: MAX_IMAGE_WIDTH,
    maxHeight: MAX_IMAGE_HEIGHT,
  })

  canvas.width = width
  canvas.height = height

  ctx?.drawImage(img, 0, 0, width, height)

  return new Promise((resolve) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve({
            file: new File([blob], file.name, { ...file }),
            objectURL: URL.createObjectURL(blob),
          })
        } else {
          resolve(null)
        }
      },
      'image/jpeg',
      IMAGE_QUALITY
    )
  })
}

export const generateThumbnail = (file: FileWithPath): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (file.type.startsWith('video/')) {
      const video = document.createElement('video')

      video.addEventListener('loadedmetadata', () => {
        video.currentTime = video.duration / 2

        video.addEventListener('seeked', () => {
          const canvas = document.createElement('canvas')

          const scaleFactor = 0.5
          canvas.width = video.videoWidth * scaleFactor
          canvas.height = video.videoHeight * scaleFactor

          const context = canvas.getContext('2d')
          context?.drawImage(video, 0, 0, canvas.width, canvas.height)
          resolve(canvas.toDataURL('image/png'))
        })
      })

      video.addEventListener('error', (error) => {
        reject(error)
      })

      video.src = URL.createObjectURL(file)
      video.load()
    } else {
      const reader = new FileReader()
      reader.onload = (event) => {
        resolve(event.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  })
}
