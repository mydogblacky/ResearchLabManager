import { createRouter, createWebHashHistory } from 'vue-router'
import Layout from '@/components/Layout.vue'
import Dashboard from '@/pages/Dashboard.vue'
import Team from '@/pages/Team.vue'
import PhdProgress from '@/pages/PhdProgress.vue'
import Projects from '@/pages/Projects.vue'
import BudgetEstimation from '@/pages/BudgetEstimation.vue'
import Publications from '@/pages/Publications.vue'
import MeetingNotes from '@/pages/MeetingNotes.vue'
import Kanban from '@/pages/Kanban.vue'
import Settings from '@/pages/Settings.vue'
import Login from '@/pages/Login.vue'
import { useAuthStore } from '@/stores/authStore'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/login', component: Login, meta: { public: true } },
    {
      path: '/',
      component: Layout,
      children: [
        { path: '', component: Dashboard },
        { path: 'team', component: Team },
        { path: 'phd-progress', component: PhdProgress },
        { path: 'projects', component: Projects },
        { path: 'budget', component: BudgetEstimation },
        { path: 'publications', component: Publications },
        { path: 'meetings', component: MeetingNotes },
        { path: 'kanban', component: Kanban },
        { path: 'settings', component: Settings },
      ],
    },
  ],
})

router.beforeEach((to) => {
  const auth = useAuthStore()
  if (to.meta.public) return true
  if (!auth.isAuthenticated) return { path: '/login' }
  return true
})

export default router
