/** @vitest-environment jsdom */
import { beforeEach, describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createI18n } from 'vue-i18n'
import { createMemoryHistory, createRouter } from 'vue-router'
import { nextTick } from 'vue'
import HomePage from './HomePage.vue'
import { CATEGORIES, hotTools, TOOLS, toolsInCategory } from '@/registry'
import { i18n as appI18n } from '@/i18n'

async function mountHome(locale: 'en' | 'zh-CN' = 'en') {
  const pinia = createPinia()
  setActivePinia(pinia)
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', name: 'home', component: HomePage },
      { path: '/tools/:slug', name: 'tool', component: { template: '<div />' } },
    ],
  })
  await router.push('/')
  await router.isReady()
  const i18n = createI18n({
    legacy: false,
    locale,
    fallbackLocale: 'en',
    messages: {
      en: appI18n.global.getLocaleMessage('en'),
      'zh-CN': appI18n.global.getLocaleMessage('zh-CN'),
    },
  })
  const wrapper = mount(HomePage, { global: { plugins: [pinia, router, i18n] } })
  return { wrapper, i18n }
}

function listedSlugs(wrapper: ReturnType<typeof mount>) {
  return wrapper.findAll('[data-testid="tool-list"] [data-testid^="tool-card-"]').map((card) => card.attributes('data-testid')!.slice('tool-card-'.length))
}

beforeEach(() => {
  localStorage.clear()
})

describe('HomePage', () => {
  it('renders the category navigation and all tools with accurate counts', async () => {
    const { wrapper } = await mountHome()
    const nav = wrapper.get('[data-testid="category-navigation"]')
    expect(nav.attributes('aria-label')).toBe('Tool categories')
    expect(nav.find('svg').exists()).toBe(false)
    expect(wrapper.get('[data-testid="category-all"]').attributes('aria-pressed')).toBe('true')
    expect(wrapper.get('[data-testid="category-all"]').text()).toContain(`All${TOOLS.length}`)
    for (const category of CATEGORIES) {
      const count = toolsInCategory(category).length
      const button = wrapper.find(`[data-testid="category-${category}"]`)
      expect(button.exists()).toBe(count > 0)
      if (count > 0) expect(button.text()).toContain(String(count))
    }
    expect(listedSlugs(wrapper)).toHaveLength(TOOLS.length)
    expect(wrapper.get('[data-testid="tool-list-title"]').text()).toBe(`All · ${TOOLS.length} tools`)
    expect(wrapper.get('[data-testid="tool-card-base64"]').attributes('href')).toBe('/tools/base64')
  })

  it('keeps favorites and recent tools independent and clears only recent tools', async () => {
    localStorage.setItem('st_favorites', JSON.stringify(['base64']))
    localStorage.setItem('st_recent', JSON.stringify(['json-formatter', 'base64', 'uuid-generator', 'word-counter', 'image-resizer', 'timestamp-converter', 'hash-generator', 'missing']))
    const { wrapper } = await mountHome()
    const recent = wrapper.get('[data-testid="recent-section"]')
    const cards = recent.findAll('[data-testid^="tool-card-"]')
    expect(cards).toHaveLength(6)
    expect(cards[0]!.attributes('data-testid')).toBe('tool-card-json-formatter')
    expect(cards.at(-1)!.attributes('data-testid')).toBe('tool-card-timestamp-converter')
    expect(recent.find('[data-testid="tool-card-hash-generator"]').exists()).toBe(false)
    await recent.get('button').trigger('click')
    expect(wrapper.find('[data-testid="recent-section"]').exists()).toBe(false)
    expect(JSON.parse(localStorage.getItem('st_recent') ?? '[]')).toEqual([])
    expect(JSON.parse(localStorage.getItem('st_favorites') ?? '[]')).toEqual(['base64'])
    expect(listedSlugs(wrapper)).toHaveLength(TOOLS.length)
  })

  it('filters by category and searches within the selected category', async () => {
    localStorage.setItem('st_recent', JSON.stringify(['base64']))
    const { wrapper } = await mountHome()
    await wrapper.get('[data-testid="category-generate"]').trigger('click')
    expect(wrapper.get('[data-testid="category-generate"]').attributes('aria-pressed')).toBe('true')
    expect(wrapper.find('[data-testid="recent-section"]').exists()).toBe(false)
    const generated = toolsInCategory('generate')
    expect(listedSlugs(wrapper)).toEqual(generated.map((tool) => tool.slug))
    expect(wrapper.get('[data-testid="tool-list-title"]').text()).toBe(`Generate · ${generated.length} tools`)

    await wrapper.get('[data-testid="search"]').setValue('hash')
    expect(listedSlugs(wrapper)).toEqual([])
    expect(wrapper.get('[data-testid="tool-list-title"]').text()).toBe('Generate · 0 tools')
    expect(wrapper.text()).toContain('No matching tools')

    await wrapper.get('[data-testid="search"]').setValue('uuid random')
    expect(listedSlugs(wrapper)).toEqual(['uuid-generator'])
    await wrapper.get('[data-testid="search"]').setValue('')
    expect(listedSlugs(wrapper)).toEqual(generated.map((tool) => tool.slug))

    await wrapper.get('[data-testid="category-all"]').trigger('click')
    await wrapper.get('[data-testid="search"]').setValue('sha')
    expect(listedSlugs(wrapper)).toContain('hash-generator')
    expect(listedSlugs(wrapper)).not.toContain('base64')
  })

  it('provides a full-width category selector for mobile layouts', async () => {
    const { wrapper } = await mountHome()
    const select = wrapper.get('[data-testid="category-select"]')
    expect(select.classes()).toContain('w-full')
    expect(select.classes()).toContain('md:hidden')
    const options = select.findAll('option')
    expect(options).toHaveLength(CATEGORIES.filter((category) => toolsInCategory(category).length > 0).length + 2)
    expect(options[0]!.attributes('value')).toBe('hot')
    expect(options[0]!.text()).toBe(`Hot · ${hotTools().length}`)
    expect(wrapper.get('aside').classes()).toContain('hidden')

    await select.setValue('generate')
    expect(listedSlugs(wrapper)).toEqual(toolsInCategory('generate').map((tool) => tool.slug))
    expect(wrapper.get('[data-testid="category-generate"]').attributes('aria-pressed')).toBe('true')
  })

  it('pins the hot group first and lists hot tools in order while keeping their categories', async () => {
    const { wrapper, i18n } = await mountHome()
    const buttons = wrapper.get('[data-testid="category-navigation"]').findAll('button')
    expect(buttons[0]!.attributes('data-testid')).toBe('category-hot')
    expect(buttons[1]!.attributes('data-testid')).toBe('category-all')
    expect(buttons[0]!.text()).toContain(`Hot${hotTools().length}`)
    await buttons[0]!.trigger('click')
    expect(wrapper.get('[data-testid="category-hot"]').attributes('aria-pressed')).toBe('true')
    expect(listedSlugs(wrapper)).toEqual(['id-photo', 'agent', 'imagemagick', 'image-ocr', 'ffmpeg'])
    expect(wrapper.get('[data-testid="tool-list-title"]').text()).toBe('Hot · 5 tools')
    await wrapper.get('[data-testid="search"]').setValue('ocr')
    expect(listedSlugs(wrapper)).toEqual(['image-ocr'])
    await wrapper.get('[data-testid="search"]').setValue('')

    await wrapper.get('[data-testid="category-media"]').trigger('click')
    expect(listedSlugs(wrapper)).toEqual(expect.arrayContaining(['id-photo', 'imagemagick', 'image-ocr']))
    await wrapper.get('[data-testid="category-ai"]').trigger('click')
    expect(listedSlugs(wrapper)).toContain('agent')
    await wrapper.get('[data-testid="category-audiovisual"]').trigger('click')
    expect(listedSlugs(wrapper)).toContain('ffmpeg')

    i18n.global.locale.value = 'zh-CN'
    await nextTick()
    expect(wrapper.get('[data-testid="category-hot"]').text()).toContain('热门')
  })

  it('updates localized category labels and localized search results', async () => {
    const { wrapper, i18n } = await mountHome()
    i18n.global.locale.value = 'zh-CN'
    await nextTick()
    expect(wrapper.get('[data-testid="category-navigation"]').attributes('aria-label')).toBe('工具分类')
    expect(wrapper.get('[data-testid="category-all"]').text()).toContain('全部')
    await wrapper.get('[data-testid="search"]').setValue('时间戳')
    expect(listedSlugs(wrapper)).toEqual(['timestamp-converter'])
    expect(wrapper.get('[data-testid="tool-list-title"]').text()).toBe('全部 · 共 1 个工具')
  })
})
