export interface PaginatedResponse<T> {
  items?: T[]
  results?: T[]
  data?: T[]
  total?: number
  count?: number
}

export function getListItems<T>(payload: T[] | PaginatedResponse<T>): T[] {
  if (Array.isArray(payload)) {
    return payload
  }

  const items = payload.items ?? payload.results ?? payload.data
  if (!items) {
    throw new Error('The server returned an unsupported list response.')
  }

  return items
}
