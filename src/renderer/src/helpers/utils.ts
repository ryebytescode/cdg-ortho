export function truncateString(str, maxLength) {
  return str.length > maxLength ? `${str.slice(0, maxLength - 3)}...` : str
}

export function joinNames(
  first: string,
  last: string,
  mid?: string,
  suffix?: string,
  isLastFirst = false
) {
  return isLastFirst
    ? `${last}${suffix ? ` ${suffix}` : ''}, ${first}${mid ? ` ${mid?.at(0)}.` : ''}`
    : `${first}${mid ? ` ${mid?.at(0)}.` : ''} ${last}${suffix ? ` ${suffix}` : ''}`
}
