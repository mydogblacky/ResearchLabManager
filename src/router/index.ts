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

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
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

export default router
