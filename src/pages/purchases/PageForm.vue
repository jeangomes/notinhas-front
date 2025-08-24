<script setup lang="ts">
import { ref } from 'vue';
import { api } from 'boot/axios';
import { copyToClipboard, date, useQuasar } from 'quasar';
import { useRouter } from 'vue-router'

const purchase = ref({
  store: 'SACOLÃO (REDE QUALY)',
  purchased_at: '',
  temp_datetime: '',
  amount: '',
  tax: '',
  nfce_key_access: '',
  content: '',
  content_write: ''
})

const router = useRouter()

const nfceKeyUrl = ref('')
const $q = useQuasar()

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
  if (nfceKeyUrl.value) {
    console.log(nfceKeyUrl.value)
    const pValue = getParameterByName('p', nfceKeyUrl.value)
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
  if (nfceKeyUrl.value) {
    console.log(nfceKeyUrl.value)
    api.post('/nfce-key-or-url', { content: nfceKeyUrl.value }).then((response) => {
      $q.notify({
        type: 'positive',
        message: 'Ok!'
      })
      window.location.reload()
      console.log(response)
    })
      .catch((error) => {
        console.error('Auth check failed:', error)
      })
  }
}

const sendData = () => {
  // console.log(purchase.value.content)
  purchase.value.content_write = purchase.value.content.replace(/\n/g, '\r\n') // funciona no chrome
  api.post('/purchase', purchase.value).then((response) => {
    if (response.status === 201) {
      void router.push({ name: 'purchases', query: { purchased_at: response.data.purchased_at } })
    }
  }).catch((error) => {
      console.error('Auth check failed:', error)
    })
}

const convertAndPastDate = (evt: Event) => {
  const target = evt.target as HTMLInputElement
  const inputDate = target.value
  const parsedDate = date.extractDate(inputDate, 'DD/MM/YYYY HH:mm')
  const outputFormat = 'YYYY-MM-DDTHH:mm'
  purchase.value.purchased_at = date.formatDate(parsedDate, outputFormat)
}

</script>

<template>
  <div v-if="false" class="q-pa-sm text-h4">Cadastro de Purchase - compras</div>
  <div class="q-pa-md">
    <q-input outlined square
             type="textarea"
             name="nfce_key_access_url"
             v-model="nfceKeyUrl"
             rows="3"
             cols="90"
             placeholder="URL."/>
    <br>
    <q-btn @click="copyKey" label="Copiar" dense />
    <q-btn @click="saveKey" label="Salvar p depois" no-caps dense />
    <br><br>

    <q-form @submit="sendData" method="post">
      <q-input outlined square label="Local" type="text" v-model="purchase.store" list="list-stores" name="store"/>
      <datalist id="list-stores">
        <option value="SACOLÃO (REDE QUALY)"></option>
        <option value="SUPERMERCADOS MUNDIAL"></option>
        <option value="APOLO"></option>
        <option value="GUANABARA"></option>
        <option value="ASSAI"></option>
      </datalist>
      <br>
      <q-input outlined square
               type="textarea"
               name="content"
               v-model="purchase.content"
               rows="10"
               cols="90"
               placeholder="Comment text."/>
      <br>
      <div class="row q-col-gutter-x-xs q-col-gutter-y-lg">
        <div class="col-12 col-md">
          <q-input outlined square label="Valor" type="number" name="amount" v-model="purchase.amount" step="0.01"/>
        </div>
        <div class="col-12 col-md">
          <q-input outlined square label="Imposto" type="number" v-model="purchase.tax" name="tax" step="0.01"/>
        </div>
      </div>
      <br>
      <div class="row q-col-gutter-x-xs q-col-gutter-y-lg">
        <div class="col-12 col-md">
          <q-input outlined square stack-label label="temp_datetime" @blur="convertAndPastDate" type="text" v-model="purchase.temp_datetime" placeholder="Cole a data aqui"/>
        </div>
        <div class="col-12 col-md">
          <q-input outlined square label="Quando" type="datetime-local" v-model="purchase.purchased_at" name="purchased_at"/>
        </div>
      </div>
      <br>
      <pre v-if="purchase.temp_datetime">{{purchase.temp_datetime}}</pre>
      <pre v-if="purchase.purchased_at">{{purchase.purchased_at}}</pre>
      <br>
      <q-input outlined square label="Chave nfce" type="text" v-model="purchase.nfce_key_access" name="nfce_key_access" id="nfce_key_access"/>
      <div class="text-center q-mt-md">
        <q-btn type="submit" label="Salvar"/>
      </div>
    </q-form>
  </div>
</template>

<style scoped>

</style>
