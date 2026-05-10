export interface SafeItem {
  id: string
  label: string
  value: string
  createdAt: number
}

export interface ChatMessage {
  id: string
  content: string
  timestamp: number
  sender: 'local' | 'remote'
}
