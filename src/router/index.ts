import { createRouter, createWebHashHistory, createWebHistory } from 'vue-router'
import { i18n } from '@/i18n'
import { getTool } from '@/registry'
import { useUserStore } from '@/stores/user'

/** Hash history for chrome-extension:// and VS Code webviews; history for normal web. */
const history =
  import.meta.env.VITE_ROUTER_MODE === 'hash'
    ? createWebHashHistory(import.meta.env.BASE_URL)
    : createWebHistory(import.meta.env.BASE_URL)

export const router = createRouter({
  history,
  routes: [
    { path: '/', name: 'home', component: () => import('@/pages/HomePage.vue') },
    {
      path: '/tools/:slug',
      name: 'tool',
      component: () => import('@/pages/ToolPage.vue'),
      props: true,
      beforeEnter: (to) => (getTool(String(to.params.slug)) ? true : { name: 'not-found', params: { pathMatch: to.path.slice(1).split('/') } }),
    },
    { path: '/:pathMatch(.*)*', name: 'not-found', component: () => import('@/pages/NotFoundPage.vue') },
  ],
  scrollBehavior: () => ({ top: 0 }),
})

router.afterEach((to) => {
  const t = i18n.global.t
  if (to.name === 'tool') {
    const slug = String(to.params.slug)
    useUserStore().addRecent(slug)
    document.title = `${t(`tools.${slug}.name`)} · SimpleTools`
  } else {
    document.title = 'SimpleTools'
  }
})
