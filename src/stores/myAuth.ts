import { defineStore, acceptHMRUpdate } from 'pinia';
import AuthService from 'src/services/AuthService'
import { LocalStorage } from 'quasar'

// Defina aqui o tipo do usuário (ajuste conforme seu backend)
interface User {
  id: number
  name: string
  email: string
  // Adicione outros campos conforme necessário
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as User | null
  }),
  getters: {
    // authenticated: function(state): boolean {
    authenticated (state): boolean {
      return !!state.user;
    },

    // authUser: (state): User | null => state.user,
    authUser (state): User | null {
      return state.user
    },

    guest: (): boolean => {
      const storageItem = window.localStorage.getItem('guest')
      return storageItem === 'isGuest'
    }
  },
  actions: {
    async getAuthUser (): Promise<User | null> {
      try {
        const response = await AuthService.getAuthUser()
        this.user = response.data
        return response.data
      } catch {
        this.user = null
        // console.error('Erro ao obter usuário autenticado:', error)
        return null
      }
    },

    logoutApi (): void {
      AuthService.logout()
        .then(() => {
          this.user = null
          LocalStorage.clear()
          if (this.router?.currentRoute.value.name !== 'login') {
            this.router.push({ path: '/login' }).catch((error) => {
              console.error('Auth check failed:', error)
            })
          }
        })
        .catch((error: unknown) => {
          console.error('Erro ao deslogar:', error)
        })
    },

    logoutFront (): void {
      this.user = null
    }
  }
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useAuthStore, import.meta.hot));
}
