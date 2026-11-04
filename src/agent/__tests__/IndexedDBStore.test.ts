/** @vitest-environment jsdom */
import 'fake-indexeddb/auto'
import { describe, expect, it } from 'vitest'
import { IndexedDBStore } from '../IndexedDBStore'

describe('IndexedDBStore', () => {
  it('persists threads and messages', async () => {
    const store = new IndexedDBStore('test')
    await store.upsertThread({
      id: 't1',
      title: 'A',
      createdAt: 1,
      updatedAt: 2,
    })
    await store.appendMessage({
      id: 'm1',
      threadId: 't1',
      role: 'user',
      content: 'hi',
      createdAt: 3,
      status: 'done',
    })
    expect((await store.listThreads())[0]?.title).toBe('A')
    expect((await store.getMessages('t1'))[0]?.content).toBe('hi')
    await store.deleteThread('t1')
    expect(await store.listThreads()).toHaveLength(0)
  })
})
