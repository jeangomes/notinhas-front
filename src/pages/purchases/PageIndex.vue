<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { api } from 'boot/axios'
import { currencyFormat } from 'src/services/util'
import PurchaseDetail from 'components/PurchaseDetail.vue'
import type { QTableColumn, QTableProps} from 'quasar';
import { useQuasar, QTable  } from 'quasar'

const $q = useQuasar()
// const tableRef = ref()
const tableRef = ref<QTable>()
// const rows = ref([])
const rows = ref<Purchase[]>([])
const filter = ref<FilterData>({ date: '', store: '' })
const loading = ref<boolean>(false)
const pagination = ref<QTableProps['pagination']>({
  sortBy: 'desc',
  descending: false,
  page: 1,
  rowsPerPage: 3,
  rowsNumber: 10
})
// const filter = ref({ date: '', store: '' })
// const loading = ref(false)
// const pagination = ref({
//   sortBy: 'desc',
//   descending: false,
//   page: 1,
//   rowsPerPage: 3,
//   rowsNumber: 10
// })

// const name: string = 'Felipe'
// name = 23

const sum = (v1: number, v2: number): number => {
  return v1 + v2
}

const total = sum(72, 2)
console.log(total)

// enum Gender {
//   Male = 'male',
//   Female = 'female',
// }
//
// enum Roles {
//   Admin,
//   NormalUser
// }

// type User = {
//   firstName: string
//   lastName: string
//   name: string
//   age: number
//   gender: Gender
//   roles: Array<Roles>
//   hairColor?: string
// }

// const fullName = (user: User): string => {
//   return `${user.firstName} ${user.lastName} (${user.gender})`
// }

// console.log(fullName('Jean Gomes'))
// console.log(fullName({ firstName: 'Jean', lastName: 'Gomes', name: 'sa', age: 7, gender: Gender.Male, roles: [Roles.Admin] }))

// const users: Array<User> = [
//   {
//     firstName: '456',
//     lastName: 'Maria',
//     name: 'juca',
//     age: 35,
//     gender: Gender.Male,
//     roles: [Roles.NormalUser]
//   },
//   {
//     firstName: '456',
//     lastName: 'Julia',
//     name: 'juca',
//     age: 35,
//     gender: Gender.Male,
//     roles: [Roles.NormalUser]
//   }
// ]
// console.log(users)

// Interfaces for type safety
interface Purchase {
  id: number
  purchased_at: string
  store: string
  amount: number
  tax: number
  tax_percentage: number
  items_count: number
  nfce_key_access: string
}


interface FilterData {
  date: string
  store: string
}

// interface PaginationData {
//   sortBy: string
//   descending: boolean
//   page: number
//   rowsPerPage: number
//   rowsNumber: number
// }

interface ApiPaginatedResponse {
  data: Purchase[]
  current_page: number
  per_page: number
  total: number
}

const dateTimeFormat = (value: string | undefined | null): string => {
  if (!value) return ''
  const date = new Date(value)
  return new Intl.DateTimeFormat('pt-BR', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(date)
}

// const columns = ref([
const columns: QTableColumn<Purchase>[] = [
  {
    name: 'purchased_at',
    align: 'center',
    label: 'Data',
    field: 'purchased_at',
    format: (val: string): string => dateTimeFormat(val)
    // format: (val: string | undefined) => dateTimeFormat(val ?? '')
    // format: (val: string | undefined) => val ? dateTimeFormat(val) : ''
    //
  },
  {
    name: 'store',
    align: 'center',
    label: 'Local',
    field: 'store',
    sortable: false
  },
  {
    name: 'amount',
    align: 'center',
    label: 'Valor Total',
    field: 'amount',
    format: (val: number) => currencyFormat(val)
  },
  {
    name: 'tax',
    align: 'center',
    label: 'Imposto',
    field: 'tax',
    format: (val: number) => currencyFormat(val)
  },
  {
    name: 'tax_percent',
    align: 'center',
    label: 'Imposto %',
    field: 'tax_percentage',
    format: (val: number) => val + '%'
  },
  {
    name: 'items_count',
    align: 'center',
    label: 'Total de items',
    field: 'items_count',
    sortable: false
  }
]

// const onRequest = (props: RequestProps) => {
//   const { page } = props.pagination // rowsPerPage, sortBy, descending
//   const filter = props.filter
//
//   loading.value = true
//   // console.log(filter.date)
//   // console.log(filter.store)
//   api.get(`/purchase?page=${page}&filter=${filter.date}&filter2=${filter.store}`).then((response) => {
//     rows.value = response.data.data
//
//     pagination.value.page = response.data.current_page
//     pagination.value.rowsPerPage = response.data.per_page
//     pagination.value.rowsNumber = response.data.total
//     loading.value = false
//   }).catch((error) => {
//     console.error('Check failed:', error)
//   })
// }
// Server request function with proper typing and error handling
const onRequest = async (props: {
  pagination: {
    page: number
    rowsPerPage: number
    sortBy: string
    descending: boolean
  }
  filter?: {date: string, store: string}
}) => {
  try {
    loading.value = true
    const { page } = props.pagination
    const filterData = props.filter

    const response = await api.get<ApiPaginatedResponse>(
      `/purchase?page=${page}&filter=${filterData?.date}&filter2=${filterData?.store}`
    )

    rows.value = response.data.data
    pagination.value = {
      ...props.pagination,
      rowsNumber: response.data.total
    }
    pagination.value.page = response.data.current_page
    pagination.value.rowsPerPage = response.data.per_page
    pagination.value.rowsNumber = response.data.total
  } catch (error) {
    console.error('Error fetching purchases:', error)
    $q.notify({
      type: 'negative',
      message: 'Erro ao carregar dados'
    })
  } finally {
    loading.value = false
  }
}

const deleteRecord = (id: number) => {
  $q.dialog({
    title: 'Confirmação',
    message: 'Deseja remover?',
    cancel: true,
    persistent: true
  }).onOk(() => {
    api.delete(`/purchase/${id}`).then(() => {
      tableRef.value?.requestServerInteraction()
    }).catch((error) => {
      console.error('Check failed:', error)
    })
  })
}
onMounted(() => {
  tableRef.value?.requestServerInteraction()
})

/* onMounted(() => {
  api.get('/purchase').then((response) => {
    rows.value = response.data.purchases
  })
}) */
</script>

<template>
  <div class="q-pa-sm text-h4">Lista de compras</div>
  <div class="q-pa-md">
    <q-table
      v-model:pagination="pagination"
      :filter="filter"
      binary-state-sort
      @request="onRequest"
      ref="tableRef"
      dense
      table-header-class="bg-primary text-white text-h5"
      :rows="rows"
      :columns="columns"
      row-key="id"
      separator="cell"
      :loading="loading"
      :rows-per-page-options="[20]"
    >
      <template v-slot:loading>
        <q-inner-loading showing color="orange-10"/>
      </template>
      <template v-slot:top-right>
        <q-input label="Data" dense debounce="300" type="date" v-model="filter.date" outlined>
          <template v-slot:append>
            <q-icon name="search" />
          </template>
        </q-input>
        <q-separator vertical />
        <q-input borderless dense debounce="300" v-model="filter.store" placeholder="local" outlined>
          <template v-slot:append>
            <q-icon name="search" />
          </template>
        </q-input>
      </template>
      <template v-slot:header="props">
        <q-tr :props="props">
          <q-th auto-width />
          <q-th
            v-for="col in props.cols"
            :key="col.name"
            :props="props"
          >
            {{ col.label }}
          </q-th>
          <q-th auto-width />
        </q-tr>
      </template>

      <template v-slot:body="props">
        <q-tr :props="props">
          <q-td auto-width>
            <q-btn size="sm" color="accent" round dense @click="props.expand = !props.expand" :icon="props.expand ? 'remove' : 'add'" />
          </q-td>
          <q-td
            v-for="col in props.cols"
            :key="col.name"
            :props="props"
          >
            {{ col.value }}
          </q-td>
          <q-td auto-width>
            <q-btn size="sm" color="negative" round dense icon="delete" @click="deleteRecord(props.row.id)" />
          </q-td>
        </q-tr>
        <q-tr v-show="props.expand" :props="props">
          <q-td colspan="100%">
            <div class="text-left">
              <pre v-if="props.expand">{{props.row.nfce_key_access}}</pre>
              <purchase-detail v-if="props.expand" foo="789" :purchase_id="props.row.id"/>
            </div>
          </q-td>
        </q-tr>
      </template>
    </q-table>
  </div>
</template>

<style scoped>

</style>
