import { Notify } from 'quasar'
import { api } from 'boot/axios'
import { useAuthStore } from 'stores/myAuth'
export default ({ router }) => {
  const store = useAuthStore()
  api.interceptors.response.use((response) => {
    return response
  }, (error) => {
    if (!error.response) {
      Notify.create({
        message: 'Erro de rede. Por favor, verifique sua conexão à internet',
        color: 'red'
      })
    }
    if ([401, 419].includes(error.response.status) && store.authUser) {
      Notify.create({
        message: 'Sem login válido/acesso expirado',
        color: 'red'
      })
      store.logoutFront()
      router.push('/login')
    }
    if ([503].includes(error.response.status)) {
      Notify.create({
        message: 'Servidor está em manutenção, tente novamente em alguns minutos!',
        type: 'negative',
        timeout: 5000
      })
    }
    return Promise.reject(error)
  })

  // store.registerModule('auth', auth)

  router.beforeEach((to, from, next) => {
    const authUser = store.authUser
    const reqAuth = to.matched.find(record => record.meta.auth)
    const loginQuery = { path: '/login' }
    if (reqAuth && !authUser) {
      store.getAuthUser().then(() => {
        if (!store.authUser) {
          next(loginQuery)
        } else {
          next()
        }
      })
    } else {
      next() // make sure to always call next()!
    }
  })
}
