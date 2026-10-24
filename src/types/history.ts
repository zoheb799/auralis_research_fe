export interface Message {
  id: string
  role: 'user' | 'assistant'
  text: string
  stockIds?: string[]
}

export interface HistoryEntry {
  id: string
  title: string
  date: string
  preview: string
  suggestions: number
  messages: Message[]
}
