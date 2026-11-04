import { describe, expect, it } from 'vitest'
import { chatCompletionsUrl, createId, normalizeBaseUrl } from '../types'
import { MemoryStore } from '../MemoryStore'

describe('chatCompletionsUrl', () => {
  it('appends /chat/completions and strips trailing slash', () => {
    expect(chatCompletionsUrl('https://api.example.com/v1')).toBe(
      'https://api.example.com/v1/chat/completions',
    )
    expect(chatCompletionsUrl('https://api.example.com/v1/')).toBe(
      'https://api.example.com/v1/chat/completions',
    )
  })
})

describe('MemoryStore', () => {
  it('upserts threads and appends messages in order', async () => {
    const store = new MemoryStore()
    const thread = {
      id: 'thread_1',
      title: '新会话',
      createdAt: 1,
      updatedAt: 1,
    }
    await store.upsertThread(thread)
    await store.appendMessage({
      id: 'msg_1',
      threadId: 'thread_1',
      role: 'user',
      content: 'hi',
      createdAt: 2,
      status: 'done',
    })
    expect(await store.listThreads()).toEqual([thread])
    expect((await store.getMessages('thread_1'))[0]?.content).toBe('hi')
  })
})

describe('createId', () => {
  it('prefixes ids', () => {
    expect(createId('thread').startsWith('thread_')).toBe(true)
  })
})
