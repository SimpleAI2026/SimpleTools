import type { ChatMessage, ChatThread, HistoryStore } from './types'

export class MemoryStore implements HistoryStore {
  private threads = new Map<string, ChatThread>()
  private messages = new Map<string, ChatMessage[]>()

  async listThreads(): Promise<ChatThread[]> {
    return [...this.threads.values()].sort((a, b) => b.updatedAt - a.updatedAt)
  }

  async getMessages(threadId: string): Promise<ChatMessage[]> {
    return [...(this.messages.get(threadId) ?? [])]
  }

  async upsertThread(t: ChatThread): Promise<void> {
    this.threads.set(t.id, { ...t })
  }

  async appendMessage(m: ChatMessage): Promise<void> {
    const list = this.messages.get(m.threadId) ?? []
    list.push({ ...m })
    this.messages.set(m.threadId, list)
  }

  async updateMessage(m: ChatMessage): Promise<void> {
    const list = this.messages.get(m.threadId) ?? []
    const idx = list.findIndex((x) => x.id === m.id)
    if (idx >= 0) list[idx] = { ...m }
    else list.push({ ...m })
    this.messages.set(m.threadId, list)
  }

  async deleteThread(id: string): Promise<void> {
    this.threads.delete(id)
    this.messages.delete(id)
  }

  async clearAll(): Promise<void> {
    this.threads.clear()
    this.messages.clear()
  }
}
