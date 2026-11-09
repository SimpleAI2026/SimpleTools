import type { ChatMessage, ChatThread, HistoryStore } from './types'

const DB_VERSION = 1
const DB_NAME_PREFIX = 'simpletools-agent'

function openDb(dbName: string): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(dbName, DB_VERSION)
    req.onupgradeneeded = () => {
      const db = req.result
      if (!db.objectStoreNames.contains('threads')) {
        db.createObjectStore('threads', { keyPath: 'id' })
      }
      if (!db.objectStoreNames.contains('messages')) {
        const store = db.createObjectStore('messages', { keyPath: 'id' })
        store.createIndex('byThread', 'threadId', { unique: false })
      }
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error ?? new Error('IndexedDB open failed'))
  })
}

function reqToPromise<T>(req: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error ?? new Error('IDB request failed'))
  })
}

export class IndexedDBStore implements HistoryStore {
  private dbPromise: Promise<IDBDatabase>

  /** storageKey scopes the DB; default matches AGENT_STORAGE_KEY without importing settings. */
  constructor(storageKey = DB_NAME_PREFIX) {
    this.dbPromise = openDb(`${DB_NAME_PREFIX}:${storageKey}`)
  }

  private async db(): Promise<IDBDatabase> {
    return this.dbPromise
  }

  async listThreads(): Promise<ChatThread[]> {
    const db = await this.db()
    const tx = db.transaction('threads', 'readonly')
    const all = await reqToPromise(tx.objectStore('threads').getAll())
    return (all as ChatThread[]).sort((a, b) => b.updatedAt - a.updatedAt)
  }

  async getMessages(threadId: string): Promise<ChatMessage[]> {
    const db = await this.db()
    const tx = db.transaction('messages', 'readonly')
    const idx = tx.objectStore('messages').index('byThread')
    const all = await reqToPromise(idx.getAll(threadId))
    return (all as ChatMessage[]).sort((a, b) => a.createdAt - b.createdAt)
  }

  async upsertThread(t: ChatThread): Promise<void> {
    const db = await this.db()
    const tx = db.transaction('threads', 'readwrite')
    await reqToPromise(tx.objectStore('threads').put(t))
  }

  async appendMessage(m: ChatMessage): Promise<void> {
    const db = await this.db()
    const tx = db.transaction('messages', 'readwrite')
    await reqToPromise(tx.objectStore('messages').put(m))
  }

  async updateMessage(m: ChatMessage): Promise<void> {
    const db = await this.db()
    const tx = db.transaction('messages', 'readwrite')
    await reqToPromise(tx.objectStore('messages').put(m))
  }

  async deleteThread(id: string): Promise<void> {
    const db = await this.db()
    const msgs = await this.getMessages(id)
    const tx = db.transaction(['threads', 'messages'], 'readwrite')
    tx.objectStore('threads').delete(id)
    for (const m of msgs) {
      tx.objectStore('messages').delete(m.id)
    }
    await new Promise<void>((resolve, reject) => {
      tx.oncomplete = () => resolve()
      tx.onerror = () => reject(tx.error ?? new Error('delete failed'))
    })
  }

  async clearAll(): Promise<void> {
    const db = await this.db()
    const tx = db.transaction(['threads', 'messages'], 'readwrite')
    tx.objectStore('threads').clear()
    tx.objectStore('messages').clear()
    await new Promise<void>((resolve, reject) => {
      tx.oncomplete = () => resolve()
      tx.onerror = () => reject(tx.error ?? new Error('clear failed'))
    })
  }
}

export function indexedDbStore(storageKey = DB_NAME_PREFIX): IndexedDBStore {
  return new IndexedDBStore(storageKey)
}
