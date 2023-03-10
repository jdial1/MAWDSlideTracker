const routes = [
  {
    path: '/',
    name: 'home',
    component: () => import('./components/Home.vue'),
    props: true
  },
  {
    path: '/embedding',
    name: 'Embedding',
    component: () => import('./components/Embedding.vue'),
    props: true
  },
  {
    path: '/slideprinting',
    name: 'SlidePrinting',
    component: () => import('./components/SlidePrinting.vue'),
    props: true
  },
  {
    path: '/slidedistribution',
    name: 'SlideDistribution',
    component: () => import('./components/SlideDistribution.vue'),
    props: true
  },
  {
    path: '/settings',
    name: 'Settings',
    component: () => import('./components/Settings.vue'),
    props: true
  },
  {
    path: '/caseinquiry',
    name: 'CaseInquiry',
    component: () => import('./components/CaseInquiry.vue'),
    props: true
  }
];

export default routes;