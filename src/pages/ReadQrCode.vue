<template>
  <q-page padding>
    <div class="row">
      <div class="col-12">
        <div
          v-if="showCamera"
          style="height: 400px;">
          <qr-stream @decode="onDecode">
            <div style="color: red;" class="frame"></div>
          </qr-stream>
        </div>
        <div
          v-if="qrcode"
          class="text-body1">
          <span class="text-purple-6">Leitura realizada: </span>
          <div style="word-break: break-word; overflow-wrap: anywhere;">{{ qrcode }}</div>
        </div>
        <div>
          <q-input outlined square
                   type="textarea"
                   name="nfce_key_access_url"
                   v-model="qrcode"
                   rows="3"
                   cols="90"
                   placeholder="URL."/>
          <br>
          <q-btn @click="copyKey" label="Copiar key" no-caps dense />
          <q-btn @click="saveKey" label="Salvar p depois" no-caps dense />
        </div>
        <div class="q-mt-lg">
          <q-toggle
            label="Iniciar o leitor"
            v-model="showCamera"
            size="lg"
          />
        </div>
        <div>
          <q-markup-table wrap-cells>
            <thead>
            <tr>
              <th class="text-left">Link</th>
              <th class="text-right">-</th>
              <th class="text-right">-</th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="n in rows" :key="n.id">
              <td class="text-left"><div style="word-break: break-word; overflow-wrap: anywhere;">{{ n.id }} - {{ n.content }}</div></td>
              <td class="text-right"><q-btn @click="copyValueToClipboard(n.content)" class="float-right" dense size="10px" color="blue-grey-3" outline icon="content_copy"/></td>
              <td class="text-right"><q-btn @click="deleteContent(n.id)" class="float-right" dense size="10px" color="negative" outline icon="delete"/></td>
            </tr>
            </tbody>
          </q-markup-table>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from 'vue';
import { QrStream } from 'vue3-qr-reader'
import { useQuasar, copyToClipboard } from 'quasar';
import { api } from 'boot/axios';
import useCopyToClipboardNotify from 'src/services/UseCopyToClipboardNotify';

export default defineComponent({
  name: 'ReadQrCode',
  components: {
    QrStream
  },
  setup () {
    const $q = useQuasar()
    const { copyValueToClipboard } = useCopyToClipboardNotify()
    const qrcode = ref('')
    const showCamera = ref(false)
    const onDecode = (data: string) => {
      qrcode.value = data
    }

    function getParameterByName(name: string, url: string): string {
      try {
        const urlParams = new URLSearchParams(new URL(url).search)
        const paramValue = urlParams.get(name)
        if (paramValue !== null) {
          const parts = paramValue.split('|')
          if (parts.length > 0 && parts[0]) {
            return parts[0].slice(0, 44)
          }
        }
        return ''
      } catch {
        return ''
      }
    }

    const copyKey = () => {
      if (qrcode.value) {
        console.log(qrcode.value)
        const pValue = getParameterByName('p', qrcode.value)
        console.log(pValue)
        copyToClipboard(pValue)
          .then(() => {
            $q.notify({
              type: 'positive',
              message: 'Copiado!'
            })
          })
          .catch(() => {
            // fail
          })
      }
    }

    const saveKey = () => {
      if (qrcode.value) {
        console.log(qrcode.value)
        api.post('/nfce-key-or-url', { content: qrcode.value }).then((response) => {
          qrcode.value = ''
          showCamera.value = false
          void onRequest()
          console.log(response)
        })
          .catch((error) => {
            console.error('Auth check failed:', error)
          })
      }
    }

    interface NfceItem {
      id: number
      content: string
      // Add other properties as needed
    }

    const rows = ref<NfceItem[]>([])
    const loading = ref<boolean>(false)

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

    return {
      onDecode,
      qrcode,
      showCamera,
      copyKey,
      saveKey,
      deleteContent,
      copyValueToClipboard,
      rows
    }
  }
})
</script>
