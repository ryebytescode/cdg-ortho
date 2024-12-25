// https://gist.github.com/scrubmx/a240a912a475ab0a2c43

export const LocalStorage = {
  /**
   * Determine if browser supports local storage.
   */
  isSupported() {
    return typeof Storage !== 'undefined'
  },

  /**
   * Check if key exists in local storage.
   */
  has(key: string) {
    return localStorage.getItem(key)
  },

  /**
   * Retrieve an object from local storage.
   */
  get(key: string) {
    const item = localStorage.getItem(key)

    if (typeof item !== 'string') return item

    if (item === 'undefined') return undefined

    if (item === 'null') return null

    // Check for numbers and floats
    if (/^'-?\d{1,}?\.?\d{1,}'$/.test(item)) return Number(item)

    // Check for numbers in scientific notation
    if (/^'-?\d{1}\.\d+e\+\d{2}'$/.test(item)) return Number(item)

    // Check for serialized objects and arrays
    if (item[0] === '{' || item[0] === '[') return JSON.parse(item)

    return item
  },

  /**
   * Save some value to local storage.
   */
  set(
    key: string,
    value: string | number | object | (string | number | object)[]
  ) {
    if (typeof value === 'undefined' || value === null || value === '') return

    if (typeof value === 'object' || Array.isArray(value)) {
      localStorage.setItem(key, JSON.stringify(value))
      return
    }

    localStorage.setItem(key, value.toString())
  },

  /**
   * Remove element from local storage.
   */
  remove(key: string): void {
    localStorage.removeItem(key)
  },
}
