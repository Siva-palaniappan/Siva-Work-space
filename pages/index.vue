<template>
  <v-container class="py-10">
    <v-row justify="center">
      <v-col cols="12" md="8">
        <v-card>
          <v-card-title>
            Simple CRUD App
          </v-card-title>

          <v-card-text>
            <v-form @submit.prevent="addItem">
              <v-row align="center" class="mb-4">
                <v-col cols="9">
                  <v-text-field
                    v-model="newItem"
                    label="Enter new item"
                    outlined
                    dense
                  />
                </v-col>
                <v-col cols="3">
                  <v-btn type="submit" color="primary" block>Add</v-btn>
                </v-col>
              </v-row>
            </v-form>

            <!-- ✅ Using the TodoList component -->
            <!-- <TodoList
              :items="items"
              @delete="deleteItem"
              @update="updateItem"
            /> -->

                <to-do-main />

           
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue'

// import your components
// import TodoList from '~/components/TodoList.vue'

// Local items for CRUD
const items = ref([
  { text: 'Buy groceries' },
  { text: 'Finish Nuxt project' },
  { text: 'Call mom' },
])

const newItem = ref('')

function addItem() {
  if (newItem.value.trim()) {
    items.value.push({ text: newItem.value.trim() })
    newItem.value = ''
  }
}

function deleteItem(index) {
  items.value.splice(index, 1)
}

function updateItem(index) {
  // Hook API calls or validations here
}

// Example API composable usage
import { useTodoApi } from '~/composables/useTodoApi'

const { fetchTodos, addTodo, deleteTodo } = useTodoApi()
const todos = ref([])

onMounted(async () => {
  todos.value = await fetchTodos()
  console.log('API dataas', todos.value)
})

const newTodoText = ref('')

const addNewTodo = async () => {
  if (newTodoText.value.trim() === '') return
  const added = await addTodo({ text: newTodoText.value.trim() })
  if (added) {
    todos.value.push(added)
    newTodoText.value = ''
  }
}

const deleteExistingTodo = async (id) => {
  const success = await deleteTodo(id)
  if (success) {
    todos.value = todos.value.filter((todo) => todo.id !== id)
  }
}
</script>
