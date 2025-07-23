<template>
  <q-page class="row items-center justify-evenly">
    <example-component
      title="Example component"
      active
      :todos="todos"
      :meta="meta"
    ></example-component>
    <div class="row">
      <br>
      <q-input outlined bottom-slots v-model="percentual" label="Quanto é">
        <template v-slot:append>
          %
        </template>
      </q-input>
      <q-input outlined bottom-slots v-model="valueInput" label="de">
        <template v-slot:after>
          <q-btn round dense flat icon="send" @click="calculate1()" />
        </template>
      </q-input>
      <br>
      <h4>{{result}}</h4>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { Todo, Meta } from 'components/models';
import ExampleComponent from 'components/ExampleComponent.vue';

const todos = ref<Todo[]>([
  {
    id: 1,
    content: 'ct1',
  },
  {
    id: 2,
    content: 'ct2',
  },
  {
    id: 3,
    content: 'ct3',
  },
  {
    id: 4,
    content: 'ct4',
  },
  {
    id: 5,
    content: 'ct5',
  },
]);

const meta = ref<Meta>({
  totalCount: 1200,
});

const percentual = ref<string>('')
const valueInput = ref<string>('')
const result = ref<number>(0)

function calculate1 (): void {
  const percentualNum = parseFloat(percentual.value)
  const valueNum = parseFloat(valueInput.value)

  // Validation to ensure both values are valid numbers
  if (isNaN(percentualNum) || isNaN(valueNum)) {
    result.value = 0
    return
  }

  result.value = (percentualNum / 100) * valueNum
}
</script>
