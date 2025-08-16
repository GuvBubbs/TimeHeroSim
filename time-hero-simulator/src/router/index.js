import { createRouter, createWebHistory } from 'vue-router'

// Import page components
const Dashboard = () => import('../pages/Dashboard.vue')
const GameConfiguration = () => import('../pages/GameConfiguration.vue')
const UpgradeTree = () => import('../pages/UpgradeTree.vue')
const PlayerPersonas = () => import('../pages/PlayerPersonas.vue')
const SimulationSetup = () => import('../pages/SimulationSetup.vue')
const LiveMonitor = () => import('../pages/LiveMonitor.vue')
const Analysis = () => import('../pages/Analysis.vue')
const Reports = () => import('../pages/Reports.vue')

const routes = [
  {
    path: '/',
    name: 'Dashboard',
    component: Dashboard,
    meta: {
      title: 'Dashboard',
      icon: 'ChartBarIcon'
    }
  },
  {
    path: '/configuration',
    name: 'GameConfiguration',
    component: GameConfiguration,
    meta: {
      title: 'Game Configuration',
      icon: 'CogIcon'
    }
  },
  {
    path: '/upgrade-tree',
    name: 'UpgradeTree',
    component: UpgradeTree,
    meta: {
      title: 'Upgrade Tree',
      icon: 'ShareIcon'
    }
  },
  {
    path: '/personas',
    name: 'PlayerPersonas',
    component: PlayerPersonas,
    meta: {
      title: 'Player Personas',
      icon: 'UserGroupIcon'
    }
  },
  {
    path: '/setup',
    name: 'SimulationSetup',
    component: SimulationSetup,
    meta: {
      title: 'Simulation Setup',
      icon: 'PlayIcon'
    }
  },
  {
    path: '/monitor',
    name: 'LiveMonitor',
    component: LiveMonitor,
    meta: {
      title: 'Live Monitor',
      icon: 'EyeIcon'
    }
  },
  {
    path: '/analysis',
    name: 'Analysis',
    component: Analysis,
    meta: {
      title: 'Analysis',
      icon: 'ChartPieIcon'
    }
  },
  {
    path: '/reports',
    name: 'Reports',
    component: Reports,
    meta: {
      title: 'Reports',
      icon: 'DocumentTextIcon'
    }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Navigation guard to update page titles
router.beforeEach((to, from, next) => {
  document.title = `${to.meta.title} - Time Hero Simulator`
  next()
})

export default router
