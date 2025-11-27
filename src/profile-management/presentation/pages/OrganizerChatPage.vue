<template>
  <div class="chat-page flex h-[80vh] max-w-6xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
    <!-- Panel izquierdo: Lista de clientes -->
    <aside class="w-1/3 border-r bg-gray-50 p-4 flex flex-col">
      <h2 class="text-lg font-bold text-[#3A506B] mb-3">Clientes</h2>
      <input
        v-model="search"
        type="text"
        placeholder="Buscar cliente..."
        class="mb-3 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#3A506B] outline-none"
      />

      <div v-if="filteredClients.length > 0" class="overflow-y-auto flex-1 space-y-2">
        <div
          v-for="client in filteredClients"
          :key="client.id"
          class="p-3 rounded-lg cursor-pointer transition flex items-center gap-3"
          :class="client.id === selectedClient?.id ? 'bg-[#3A506B] text-white' : 'hover:bg-gray-200'"
          @click="selectClient(client)"
        >
          <div class="w-10 h-10 rounded-full bg-[#6fffe9] flex items-center justify-center text-[#3A506B] font-bold">
            {{ client.name.charAt(0).toUpperCase() }}
          </div>
          <div>
            <p class="font-medium">{{ client.name }}</p>
            <p class="text-xs opacity-80">{{ client.status }}</p>
          </div>
        </div>
      </div>

      <div v-else class="text-gray-500 text-sm text-center mt-10">
        No hay clientes disponibles
      </div>
    </aside>

    <!-- Panel derecho: Chat -->
    <section class="w-2/3 flex flex-col">
      <div v-if="selectedClient" class="flex flex-col h-full">
        <!-- Header del chat -->
        <div class="flex items-center justify-between p-3 bg-[#3A506B] text-white">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-full bg-[#6fffe9] flex items-center justify-center text-[#3A506B] font-bold">
              {{ selectedClient.name.charAt(0).toUpperCase() }}
            </div>
            <div>
              <h3 class="font-semibold">{{ selectedClient.name }}</h3>
              <p class="text-xs opacity-80">{{ selectedClient.status }}</p>
            </div>
          </div>
          <button @click="closeChat" class="hover:text-[#6fffe9] transition">✕</button>
        </div>

        <!-- Mensajes -->
        <div ref="messagesContainer" class="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
          <div
            v-for="message in messages"
            :key="message.id"
            class="flex"
            :class="message.sender === 'organizer' ? 'justify-end' : 'justify-start'"
          >
            <div
              class="max-w-[70%] px-3 py-2 rounded-lg"
              :class="message.sender === 'organizer'
                ? 'bg-[#3A506B] text-white rounded-br-none'
                : 'bg-gray-200 text-gray-800 rounded-bl-none'"
            >
              <p class="text-sm break-words">{{ message.text }}</p>
              <span class="text-[10px] opacity-70 block mt-1 text-right">
                {{ formatTime(message.time) }}
              </span>
            </div>
          </div>
        </div>

        <!-- Input -->
        <div class="p-3 border-t bg-white flex items-center">
          <input
            v-model="newMessage"
            @keyup.enter="sendMessage"
            type="text"
            placeholder="Escribe un mensaje..."
            class="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#3A506B] outline-none"
          />
          <button
            @click="sendMessage"
            class="ml-2 px-4 py-2 bg-[#3A506B] text-white rounded-lg hover:bg-[#6fffe9] hover:text-[#3A506B] transition"
          >
            Enviar
          </button>
        </div>
      </div>

      <div v-else class="flex-1 flex items-center justify-center text-gray-500">
        Selecciona un cliente para iniciar el chat 💬
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, nextTick, onMounted } from 'vue'
import { ChatApiService } from '@/profile-management/application/chat-api.service.js'

const clients = ref([])
const selectedClient = ref(null)
const search = ref('')
const messages = ref([])
const newMessage = ref('')
const messagesContainer = ref(null)

// Simulación de clientes (esto vendría de tu API en la práctica)
onMounted(async () => {
  try {
    clients.value = await ChatApiService.getClients()
  } catch (error) {
    console.error('Error cargando clientes:', error)
  }
})

const filteredClients = computed(() => {
  if (!search.value) return clients.value
  return clients.value.filter(c =>
    c.name.toLowerCase().includes(search.value.toLowerCase())
  )
})

async function selectClient(client) {
  selectedClient.value = client
  try {
    messages.value = await ChatApiService.getMessages(client.id)
    scrollToBottom()
  } catch (error) {
    console.error('Error al cargar mensajes:', error)
  }
}

function closeChat() {
  selectedClient.value = null
  messages.value = []
}

async function sendMessage() {
  if (!newMessage.value.trim()) return

  const message = {
    id: Date.now(),
    text: newMessage.value,
    sender: 'organizer',
    time: new Date().toISOString(),
    clientId: selectedClient.value.id
  }

  messages.value.push(message)
  newMessage.value = ''
  scrollToBottom()

  try {
    await ChatApiService.sendMessage(selectedClient.value.id, message)
  } catch (error) {
    console.error('Error enviando mensaje:', error)
  }
}

function scrollToBottom() {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
}

function formatTime(time) {
  const date = new Date(time)
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}
</script>

<style scoped>
.chat-page {
  margin-top: 2rem;
}

aside::-webkit-scrollbar,
.chat-page .flex-1::-webkit-scrollbar {
  width: 6px;
}
aside::-webkit-scrollbar-thumb,
.chat-page .flex-1::-webkit-scrollbar-thumb {
  background-color: #cbd5e0;
  border-radius: 4px;
}
</style>
