export type ItemType = 'LINK' | 'NOTE' | 'CODE' | 'PASS'

export interface SafeItem {
  id: string
  type: ItemType
  title: string
  value: string
  createdAt: number
  isNew?: boolean
}

export interface StoredItem {
  id: string
  type: ItemType
  title?: string
  ciphertext: string
  iv: string
  createdAt: number
}

export interface ChatMessage {
  id: string
  sender: string
  content: string
  timestamp: number
}
