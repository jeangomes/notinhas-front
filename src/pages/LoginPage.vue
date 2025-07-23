<template>
  <q-page padding>
    <div class="absolute-center">
      <q-form @submit="handleLogin">
        <q-card square class="text-center q-pa-xl" style="width: 400px;">
          <q-card-section>
            <div class="text-h4 text-indigo">Acesse seu cadastro</div>
          </q-card-section>
          <q-card-section>
            <div class="text-left">
              <q-input id="document" autocomplete="email" type="text" stack-label outlined square v-model="state.form.email"
                       label="E-mail" :rules="[val => !!val || 'Informe seu email/login!']" autofocus/>
              <br>
              <q-input
                v-model="state.form.password"
                autocomplete="current-password"
                label="Senha"
                :rules="[ val => val && val.length > 0 || 'Preencha o campo!']"
                outlined
                stack-label
                :type="state.isPwd ? 'password' : 'text'">
                <template v-slot:append>
                  <q-icon
                    :name="state.isPwd ? 'visibility_off' : 'visibility'"
                    class="cursor-pointer"
                    @click="state.isPwd = !state.isPwd"
                  />
                </template>
              </q-input>
              <br>
            </div>

          </q-card-section>
          <q-card-actions vertical align="center">
            <q-btn label="Login" icon="login" :loading="state.loading" type="submit" class="fit q-mb-md" color="primary"
                   no-caps/>
            <router-link to="/password-forgot">
              <a>Esqueci minha senha</a>
            </router-link>
          </q-card-actions>
        </q-card>
      </q-form>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { reactive, onMounted } from 'vue'
import AuthService from 'src/services/AuthService'
import { useQuasar } from 'quasar'
import { useAuthStore } from 'stores/myAuth'
import { useRouter } from 'vue-router'
import type { LoginPayload } from 'src/services/AuthService'

// Composables
const router = useRouter()
const $q = useQuasar()
const store = useAuthStore()

// Types
interface FormState {
  isPwd: boolean
  form: LoginPayload
  loading: boolean
  errors: Record<string, string>
}

// Reactive state
const state = reactive<FormState>({
  isPwd: true,
  form: {
    email: '',
    password: '',
    spa_description: 'admin-panel',
    device_information: {}
  },
  loading: false,
  errors: {}
})

// const state = reactive({
//   isPwd: true,
//   form: {
//     email: '',
//     password: '',
//     spa_description: 'admin-panel',
//     device_information: {}
//   },
//   loading: false
// })

// Computed properties
// const isFormValid = computed((): boolean => {
//   return Boolean(
//     state.form.email &&
//     state.form.password &&
//     /\S+@\S+\.\S+/.test(state.form.email)
//   )
// })

// Methods
function validateForm(): boolean {
  state.errors = {}

  if (!state.form.email) {
    state.errors.email = 'Email é obrigatório'
  } else if (!/\S+@\S+\.\S+/.test(state.form.email)) {
    state.errors.email = 'Email deve ter um formato válido'
  }

  if (!state.form.password) {
    state.errors.password = 'Senha é obrigatória'
  } else if (state.form.password.length < 6) {
    state.errors.password = 'Senha deve ter pelo menos 6 caracteres'
  }

  return Object.keys(state.errors).length === 0
}

async function handleLogin(): Promise<void> {
  if (!validateForm()) {
    return
  }

  state.loading = true

  try {
    // Attempt login
    await AuthService.login(state.form)

    // Get user data after successful login
    const authUser = await store.getAuthUser()

    if (authUser) {
      $q.notify({
        type: 'positive',
        message: 'Login realizado com sucesso!',
        timeout: 2000
      })
      await router.push('/dashboard')
    }
  } catch (error) {
    console.error('Login error:', error)

    // Show user-friendly error message
    const errorMessage = error instanceof Error
      ? error.message
      : 'Erro interno. Tente novamente.'

    $q.notify({
      type: 'negative',
      message: errorMessage,
      timeout: 4000
    })
  } finally {
    state.loading = false
  }
}

// async function handleLogin () {
//   state.loading = true
//   try {
//     await AuthService.login(state.form)
//     const authUser = await store.getAuthUser()
//     if (authUser) {
//       state.loading = false
//       await router.push('/dashboard')
//     } else {
//       $q.notify({
//         type: 'negative',
//         message: 'Essas credenciais não foram encontradas em nossos registros.'
//       })
//     }
//     state.loading = false
//   } catch {
//     state.loading = false
//     $q.notify({
//       type: 'negative',
//       message: 'Essas credenciais não foram encontradas em nossos registros.'
//     })
//   }
// }

async function checkAuthStatus(): Promise<void> {
  if (store.authenticated) {
    await router.push('/dashboard')
    return
  }

  try {
    await store.getAuthUser()
    if (store.authUser) {
      await router.push('/dashboard')
    }
  } catch (error) {
    console.log(error);
    // User is not authenticated, stay on login page
    console.log('User not authenticated')
  }
}


onMounted(() => {
  // state.form.device_information = {
  //   ScreenSizeRealByJS: screen.width + 'x' + screen.height,
  //   ScreenSizeUsedByQuasar: $q.screen.width + 'x' + $q.screen.height,
  //   mobile: $q.platform.is.mobile,
  //   hasTouch: $q.platform.has.touch,
  //   hasWebStorage: $q.platform.has.webStorage,
  //   platform: $q.platform.is.platform,
  //   browserName: $q.platform.is.name,
  //   platformIs: { ...$q.platform.is }
  // }
  checkAuthStatus().catch((error) => {
    console.error('Auth check failed:', error)
  })
  // if (store.authenticated) {
  //   router.push('/clientes')
  // }
  // const authUser = store.authUser
  // if (!authUser) {
  //   store.getAuthUser().then(() => {
  //     if (store.authUser) {
  //       router.push('/clientes')
  //     }
  //   })
  // }
})
</script>
