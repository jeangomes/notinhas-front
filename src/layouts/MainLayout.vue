<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-btn flat dense round icon="menu" aria-label="Menu" @click="toggleLeftDrawer" />

        <q-toolbar-title> Notinhas App </q-toolbar-title>

        <template v-if="user">
          <q-btn-dropdown
            v-if="authenticated"
            color="white" no-caps text-color="primary"
            push
            icon="account_circle"
            :label="user.name"
          >
            <q-list dense separator>
              <q-item :to="{ name: 'updatePassword' }" dense clickable v-close-popup>
                <q-item-section avatar>
                  <q-avatar size="md" icon="password"/>
                </q-item-section>
                <q-item-section>
                  Alterar minha senha
                </q-item-section>
              </q-item>
              <q-item dense clickable v-close-popup @click="logout">
                <q-item-section avatar>
                  <q-avatar size="md" icon="power_settings_new" color="negative" text-color="white"/>
                </q-item-section>
                <q-item-section>
                  <q-item-label>Sair</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-btn-dropdown>
          <q-separator vertical spaced="md"/>
        </template>
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" show-if-above bordered  v-if="authenticated">
      <q-list>
        <q-item-label header> Essential Links </q-item-label>

        <EssentialLink v-for="link in linksList" :key="link.title" v-bind="link" />
        <q-item
          :to="{name: 'purchases'}"
        >
          <q-item-section
            avatar
          >
            <q-icon name="money" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Compras</q-item-label>
            <q-item-label caption>Listagem</q-item-label>
          </q-item-section>
        </q-item>
        <q-item
          :to="{name: 'newPurchase'}"
        >
          <q-item-section
            avatar
          >
            <q-icon name="money" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Cadastrar Compra</q-item-label>
          </q-item-section>
        </q-item>
        <q-item
          :to="{name: 'purchaseItems'}"
        >
          <q-item-section
            avatar
          >
            <q-icon name="money" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Lista items</q-item-label>
          </q-item-section>
        </q-item>
        <q-item href="https://consultadfe.fazenda.rj.gov.br/consultaDFe/paginas/consultaChaveAcesso.faces" target="_blank">
          <q-item-label>Consulta NFCE</q-item-label>
        </q-item>
        <q-item v-for="n in rows" :key="n.id">
          <q-item-section>
            <q-item-label>content: {{n.content}}</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-btn @click="copyValueToClipboard(n.id)" class="float-right" dense size="10px" color="blue-grey-3" outline icon="content_copy"/>
          </q-item-section>
          <q-item-section side>
            <q-btn @click="deleteContent(n.id)" class="float-right" dense size="10px" color="negative" outline icon="delete"/>
          </q-item-section>
        </q-item>
      </q-list>
      <pre>{{user}}</pre>
      <q-separator/>
      <pre>{{authenticated}}</pre>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { onMounted, computed, ref } from 'vue';
import EssentialLink, { type EssentialLinkProps } from 'components/EssentialLink.vue'
import { useAuthStore } from 'stores/myAuth';
import { useQuasar } from 'quasar';
import useCopyToClipboardNotify from 'src/services/UseCopyToClipboardNotify'
import { api } from 'boot/axios'

const linksList: EssentialLinkProps[] = [
  {
    title: 'Login',
    caption: 'quasar.dev',
    icon: 'school',
    link: '/login',
  },
];

const leftDrawerOpen = ref(false);
const { copyValueToClipboard } = useCopyToClipboardNotify()
const store = useAuthStore()
const $q = useQuasar()

const authenticated = computed(() => store.authenticated)
const user = computed(() => store.authUser)

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value;
}

function logout () {
  $q.dialog({
    title: 'Confirmação',
    message: 'Tem certeza que deseja sair?',
    ok: 'Sair',
    cancel: 'Cancelar'
  }).onOk(() => {
    store.logoutApi()
  })
}
// Define interface for the row data
interface NfceItem {
  id: number
  content: string
  // Add other properties as needed
}

// Reactive references with proper typing
const rows = ref<NfceItem[]>([])
const loading = ref<boolean>(false)

// Function to fetch data with proper error handling
const onRequest = async (): Promise<void> => {
  try {
    loading.value = true
    const response = await api.get<NfceItem[]>('/nfce-key-or-url')
    rows.value = response.data
  } catch (error) {
    console.error('Error fetching NFCE data:', error)
    // Handle error appropriately (show notification, etc.)
  } finally {
    loading.value = false
  }
}
// const rows = ref([])
// const onRequest = () => {
//   api.get('/nfce-key-or-url').then((response) => {
//     rows.value = response.data
//   })
// }
// const deleteContent = (id) => {
//   api.delete('/nfce-key-or-url/' + id).then(() => {
//     onRequest()
//   })
// }
// Function to delete content with proper typing and error handling
const deleteContent = async (id: number): Promise<void> => {
  try {
    loading.value = true
    await api.delete(`/nfce-key-or-url/${id}`)
    await onRequest() // Refresh the list
  } catch (error) {
    console.error('Error deleting content:', error)
    // Handle error appropriately (show notification, etc.)
  } finally {
    loading.value = false
  }
}
onMounted(() => {
  void onRequest()
})
</script>
