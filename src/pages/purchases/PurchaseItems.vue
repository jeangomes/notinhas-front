<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { api } from 'boot/axios'
import { currencyFormat } from 'src/services/util'
import type { QTableColumn, QTableProps} from 'quasar';
import { QTable  } from 'quasar'

// Interfaces for type safety
interface Purchase {
  id: number
  purchased_at: string
  store: string
  amount: number
}

interface PurchaseItem {
  id: number
  product_name: string
  product_code: string
  quantity: number
  unit_measure: string
  unit_price: number
  total_price: number
  purchase: Purchase
}

// const tableRef = ref()
// const rows = ref([])
// const filter = ref('')
// const loading = ref(false)
// const pagination = ref({
//   sortBy: 'desc',
//   descending: false,
//   page: 1,
//   rowsPerPage: 3,
//   rowsNumber: 10
// })
// Reactive references with proper typing
const tableRef = ref<QTable>()
const rows = ref<PurchaseItem[]>([])
const filter = ref<string>('')
const loading = ref<boolean>(false)
const pagination = ref<QTableProps['pagination']>({
  sortBy: 'desc',
  descending: false,
  page: 1,
  rowsPerPage: 3,
  rowsNumber: 10
})

const dateTimeFormat = (value: string | undefined | null): string => {
  if (!value) return ''
  const date = new Date(value)
  return new Intl.DateTimeFormat('pt-BR', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(date)
}

const columns: QTableColumn<PurchaseItem>[] = [
  {
    name: 'purchased_at',
    align: 'center',
    label: 'Data',
    field: row => row.purchase.purchased_at,
    format: (val: string): string => dateTimeFormat(val)
  },
  {
    name: 'store',
    align: 'center',
    label: 'Local',
    field: row => row.purchase.store,
    sortable: false
  },
  {
    name: 'amount',
    align: 'center',
    label: 'Valor Total',
    field: row => row.purchase.amount,
    format: (val: number) => currencyFormat(val)
  },
  {
    name: 'product_name',
    align: 'center',
    label: 'Nome',
    field: 'product_name',
    sortable: false
  },
  {
    name: 'product_code',
    align: 'center',
    label: 'Code',
    field: 'product_code',
    sortable: false
  },
  {
    name: 'quantity',
    align: 'center',
    label: 'Quantidade',
    field: 'quantity',
    sortable: false
  },
  {
    name: 'unit_measure',
    align: 'center',
    label: 'Unidade',
    field: 'unit_measure',
    sortable: false
  },
  {
    name: 'unit_price',
    align: 'center',
    label: 'Valor unitário',
    field: 'unit_price',
    format: (val: number) => currencyFormat(val)
  },
  {
    name: 'total_price',
    align: 'center',
    label: 'Valor total',
    field: 'total_price',
    format: (val: number) => currencyFormat(val)
  }
]
const onRequest = (props: {
  pagination: {
    page: number
    rowsPerPage: number
    sortBy: string
    descending: boolean
  }
  filter?: string
}) => {
  const { page } = props.pagination
  const filter = props.filter

  loading.value = true
  api.get(`/purchase-items/?page=${page}&filter=${filter}`).then((response) => {
    rows.value = response.data.data

    pagination.value = {
      ...props.pagination,
      rowsNumber: response.data.total
    }
    pagination.value.page = response.data.current_page
    pagination.value.rowsPerPage = response.data.per_page
    pagination.value.rowsNumber = response.data.total
    loading.value = false
  }).catch((error) => {
    console.error('Auth check failed:', error)
  })
}
onMounted(() => {
  tableRef.value?.requestServerInteraction()
})
</script>

<template>
  <div class="q-pa-sm text-h4">Lista de items</div>
  <h2>colocar navegação por letra do alfabeto, order nas colunas, put charts</h2>
  <div class="q-pa-md">
    <q-table
      flat bordered dense
      ref="tableRef"
      :rows="rows"
      :columns="columns"
      row-key="id"
      v-model:pagination="pagination"
      :loading="loading"
      :filter="filter"
      binary-state-sort
      @request="onRequest"
    >
      <template v-slot:top-right>
        <q-input borderless dense debounce="300" v-model="filter" placeholder="Search">
          <template v-slot:append>
            <q-icon name="search" />
          </template>
        </q-input>
      </template>

    </q-table>
  </div>
</template>

<style scoped>

</style>
