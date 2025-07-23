<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { api } from 'boot/axios'
import { currencyFormat } from 'src/services/util'

// Define proper TypeScript interfaces
interface PurchaseItem {
  id: number
  product_name: string
  product_code: string
  quantity: number
  unit_measure: string
  unit_price: number
  total_price: number
}

interface Purchase {
  id: number
  items: PurchaseItem[]
  // Add other purchase properties as needed
}

interface ApiResponse {
  purchase: Purchase
}

type TableFieldValue = string | number | boolean

interface TableColumn {
  name: string
  align: 'left' | 'center' | 'right'
  label: string
  field: string | ((row: PurchaseItem) => TableFieldValue)
  sortable?: boolean
  format?: (val: number) => string
}

// const props = defineProps({
//   foo: { type: String, required: true },
//   purchase_id: Number
// })

// Props with proper typing
interface Props {
  foo: string
  purchase_id?: number
}

const props = withDefaults(defineProps<Props>(), {
  purchase_id: 0
})

// Reactive refs with proper typing
const rows = ref<PurchaseItem[]>([])
const loading = ref<boolean>(false)

// const loading = ref(false)
// const rows = ref([])
const columns = ref<TableColumn[]>([
  {
    name: 'product_name',
    align: 'left',
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
])

// Function to fetch purchase data with proper error handling
const fetchPurchaseData = async (): Promise<void> => {
  if (!props.purchase_id) {
    console.warn('No purchase_id provided')
    return
  }

  try {
    loading.value = true
    const response = await api.get<ApiResponse>(`/purchase/${props.purchase_id}`)
    rows.value = response.data.purchase.items
  } catch (error) {
    console.error('Error fetching purchase data:', error)
    // You might want to show a user-friendly error message here
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchPurchaseData().catch((error) => {
    console.error('Request failed:', error)
  })
})
</script>

<template>
  <q-table
    title="Items"
    :rows="rows"
    :columns="columns"
    row-key="name"
    :rows-per-page-options="[rows.length]"
  />
</template>

<style scoped>

</style>
