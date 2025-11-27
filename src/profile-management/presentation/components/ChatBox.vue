<template>
  <div class="chat-box-container flex flex-col h-full max-h-[600px] border rounded-lg shadow bg-white">
    <!-- Header del chat -->
    <div class="chat-header flex items-center justify-between p-3 bg-[#3A506B] text-white rounded-t-lg">
      <div class="flex items-center gap-2">
        <div class="w-10 h-10 rounded-full bg-[#6fffe9] flex items-center justify-center text-[#3A506B] font-bold">
          {{ selectedClient?.name?.charAt(0).toUpperCase() || 'C' }}
        </div>
        <div>
          <h3 class="font-semibold">{{ selectedClient?.name || 'Cliente' }}</h3>
          <p class="text-xs opacity-80">{{ selectedClient?.status || 'Conectado' }}</p>
        </div>
      </div>
      <button @click="$emit('close')" class="hover:text-[#6fffe9] transition">✕</button>
    </div>

    <!-- Mensajes -->
    <div ref="messagesContainer" class="chat-messages flex-1 overflow-y-auto p-4 space-y-3">
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
          <span class="text-[10px] opacity-70 block mt-1 text-right">{{ formatTime(message.time) }}</span>
        </div>
      </div>
    </div>

    <!-- Input -->
    <div class="chat-input flex items-center p-3 border-t bg-gray-50 rounded-b-lg">
      <input
        v-model="newMessage"
        @keyup.enter="sendMessage"
        type="text"
        placeholder="Escribe un mensaje..."
        class="flex-1 px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-[#3A506B]"
      />
      <button
        @click="sendMessage"
        class="ml-2 px-4 py-2 bg-[#3A506B] text-white rounded-lg hover:bg-[#6fffe9] hover:text-[#3A506B] transition"
      >
        Enviar
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { ChatApiService } from '@/profile-management/application/services/chat-api.service.js'

// Simulación de cliente seleccionado
const selectedClient = ref({
  id: 1,
  name: 'Cliente Ejemplo',
  status: 'Conectado'
})

const messages = ref([])
const newMessage = ref('')
const messagesContainer = ref(null)

// Cargar mensajes (puedes integrar con API)
onMounted(async () => {
  try {
    messages.value = await ChatApiService.getMessages(selectedClient.value.id)
    scrollToBottom()
  } catch (error) {
    console.error('Error cargando mensajes:', error)
  }
})

// Enviar mensaje
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

function formatTime(time) {
  const date = new Date(time)
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function scrollToBottom() {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
}
</script>

<style scoped>
.chat-box-container {
  width: 100%;
  max-width: 450px;
}
.chat-messages::-webkit-scrollbar {
  width: 6px;
}
.chat-messages::-webkit-scrollbar-thumb {
  background-color: #cbd5e0;
  border-radius: 4px;
}
</style>
