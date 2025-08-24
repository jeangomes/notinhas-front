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
      },
      {
        path: '/purchases',
        name: 'purchases',
        component: () => import('pages/purchases/PageIndex.vue'),
        meta: { auth: true }
      },
      {
        path: '/new-purchase',
        name: 'newPurchase',
        component: () => import('pages/purchases/PageForm.vue'),
        meta: { auth: true }
      },
      {
        path: '/purchase-items',
        name: 'purchaseItems',
        component: () => import('pages/purchases/PurchaseItems.vue'),
        meta: { auth: true }
      },
      {
        path: '/read-qrcode',
        name: 'readQrCode',
        component: () => import('pages/ReadQrCode.vue'),
        meta: { auth: true }
      },
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
