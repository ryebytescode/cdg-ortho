import type { MantineColor } from '@mantine/core'
import type { FileWithPath } from '@mantine/dropzone'
import { type DateArg, format } from 'date-fns'

export const statusColors: Record<string, MantineColor> = {
  pending: 'gray',
  partial: 'orange',
  paid: 'green',
}

const MAX_IMAGE_WIDTH = 1000
const MAX_IMAGE_HEIGHT = 1000
const IMAGE_QUALITY = 0.7

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

export async function compressImage(file: FileWithPath): Promise<FileInfo> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.src = URL.createObjectURL(file)

    img.onload = () => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')

      if (!ctx) reject('Cannot obtain the canvas context')

      const { width, height } = calculateAspectRatioFit({
        srcWidth: img.width,
        srcHeight: img.height,
        maxWidth: MAX_IMAGE_WIDTH,
        maxHeight: MAX_IMAGE_HEIGHT,
      })

      canvas.width = width
      canvas.height = height

      ctx?.drawImage(img, 0, 0, width, height)

      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve({
              file: new File([blob], file.name, { ...file }),
              objectURL: URL.createObjectURL(blob),
            })
          } else {
            reject(new Error('Image compression failed'))
          }
        },
        'image/jpeg',
        IMAGE_QUALITY
      )

      URL.revokeObjectURL(img.src)
    }

    img.onerror = reject
  })
}
