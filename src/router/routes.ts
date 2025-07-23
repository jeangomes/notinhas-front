import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: '',
        component: () => import('pages/LoginPage.vue')
      },
      {
        path: '/dashboard',
        component: () => import('pages/IndexPage.vue'),
        meta: { auth: true }
      },
      {
        path: '/login',
        name: 'login',
        component: () => import('pages/LoginPage.vue')
      }
      // {
      //   path: '/abacate',
      //   name: 'abacate',
      //   component: () => import('pages/FrutaAbacate.vue')
      // },
    ]
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue')
  }
];

export default routes;
