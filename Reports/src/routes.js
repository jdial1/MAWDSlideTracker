// routes.js

import Home from './components/Home.vue'
import BlocksByTech from './components/BlocksByTech.vue'
import Login from './components/Login.vue'
import Profile from './components/Profile.vue'

const routes = [
  { path: '/', component: Home },
  { path: '/blocksbytech', component: BlocksByTech, name: 'BlocksByTech', props: true },
  { path: '/login', component: Login },
  { path: '/profile', component: Profile, name: 'Profile', props: true }
]

export default routes
