<script setup>
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useToast } from 'primevue/usetoast'

import { useAuth } from '@/auth-management/infrastructure/composables/useAuth.js'
import { NotificationApiService } from '@/profile-management/infrastructure/notification-api.service.js'

const { t } = useI18n()
const toast = useToast()
const { user } = useAuth()

// Notificaciones dinámicas desde la API
const notifications = ref([])

const getTimeAgo = (timestamp) => {
  const now = new Date()
  const date = new Date(timestamp)
  const diff = Math.floor((now - date) / 1000)

  if (diff < 60) return 'Hace un momento'
  if (diff < 3600) return `Hace ${Math.floor(diff / 60)} minutos`
  if (diff < 86400) return `Hace ${Math.floor(diff / 3600)} horas`
  if (diff < 172800) return t('notifications.yesterday')
  return date.toLocaleDateString()
}

const groupNotifications = () => {
  const groups = {
    today: [],
    yesterday: [],
    older: []
  }

  notifications.value.forEach(notif => {
    const date = new Date(notif.time)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) {
      groups.today.push(notif)
    } else if (date.toDateString() === yesterday.toDateString()) {
      groups.yesterday.push(notif)
    } else {
      groups.older.push(notif)
    }
  })

  return groups
}

const notificationGroups = ref({
  today: [],
  yesterday: [],
  older: []
})

const unreadCount = ref(0)

const loadNotifications = async () => {
  notifications.value = await NotificationApiService.getAllForUser(user.value.id)

  notificationGroups.value = groupNotifications()
  unreadCount.value = notifications.value.filter(n => !n.read).length
}

const markAsRead = async (id) => {
  const notification = notifications.value.find(n => n.id === id)
  if (!notification || notification.read) return

  await NotificationApiService.markAsRead(id)

  notification.read = true
  unreadCount.value--
  notificationGroups.value = groupNotifications()
}

const markAllAsRead = async () => {
  await NotificationApiService.markAllAsRead(user.value.id)

  notifications.value.forEach(n => n.read = true)
  unreadCount.value = 0
  notificationGroups.value = groupNotifications()

  toast.add({
    severity: 'success',
    summary: 'Notificaciones marcadas como leídas',
    life: 2000
  })
}

const clearAll = async () => {
  await NotificationApiService.clearAll(user.value.id)

  notifications.value = []
  notificationGroups.value = groupNotifications()
  unreadCount.value = 0

  toast.add({
    severity: 'info',
    summary: 'Notificaciones eliminadas',
    life: 2000
  })
}

onMounted(loadNotifications)
</script>

<template>
  <div class="notifications-page">
    <Toast />

    <!-- Header -->
    <div class="notifications-header">
      <div class="header-left">
        <h1 class="notifications-title">
          {{ $t('notifications.title') }}
          <span v-if="unreadCount > 0" class="unread-badge">{{ unreadCount }}</span>
        </h1>
        <p class="notifications-subtitle">{{ $t('notifications.subtitle') }}</p>
      </div>

      <div class="header-actions">
        <Button
          :label="$t('notifications.markAllRead')"
          icon="pi pi-check"
          class="p-button-text p-button-sm"
          @click="markAllAsRead"
          v-if="unreadCount > 0"
        />
        <Button
          :label="$t('notifications.clearAll')"
          icon="pi pi-trash"
          class="p-button-text p-button-danger p-button-sm"
          @click="clearAll"
        />
      </div>
    </div>

    <!-- Notifications Container -->
    <div class="notifications-container">

      <!-- Today's Notifications -->
      <div v-if="notificationGroups.today.length > 0" class="notification-group">
        <h2 class="group-title">{{ $t('notifications.today') }}</h2>
        <div class="notifications-list">
          <div
            v-for="notification in notificationGroups.today"
            :key="notification.id"
            class="notification-item"
            :class="{ 'unread': !notification.read }"
            @click="markAsRead(notification.id)"
          >
            <div class="notification-icon" :style="{ background: notification.color }">
              <i :class="['pi', notification.icon]"></i>
            </div>
            <div class="notification-content">
              <h3 class="notification-title">{{ notification.title }}</h3>
              <p class="notification-message">{{ notification.message }}</p>
              <span class="notification-time">{{ getTimeAgo(notification.time) }}</span>
            </div>
            <div v-if="!notification.read" class="unread-indicator"></div>
          </div>
        </div>
      </div>

      <!-- Yesterday's Notifications -->
      <div v-if="notificationGroups.yesterday.length > 0" class="notification-group">
        <h2 class="group-title">{{ $t('notifications.yesterday') }}</h2>
        <div class="notifications-list">
          <div
            v-for="notification in notificationGroups.yesterday"
            :key="notification.id"
            class="notification-item"
            :class="{ 'unread': !notification.read }"
            @click="markAsRead(notification.id)"
          >
            <div class="notification-icon" :style="{ background: notification.color }">
              <i :class="['pi', notification.icon]"></i>
            </div>
            <div class="notification-content">
              <h3 class="notification-title">{{ notification.title }}</h3>
              <p class="notification-message">{{ notification.message }}</p>
              <span class="notification-time">{{ getTimeAgo(notification.time) }}</span>
            </div>
            <div v-if="!notification.read" class="unread-indicator"></div>
          </div>
        </div>
      </div>

      <!-- Older Notifications -->
      <div v-if="notificationGroups.older.length > 0" class="notification-group">
        <h2 class="group-title">{{ $t('notifications.older') }}</h2>
        <div class="notifications-list">
          <div
            v-for="notification in notificationGroups.older"
            :key="notification.id"
            class="notification-item"
            :class="{ 'unread': !notification.read }"
            @click="markAsRead(notification.id)"
          >
            <div class="notification-icon" :style="{ background: notification.color }">
              <i :class="['pi', notification.icon]"></i>
            </div>
            <div class="notification-content">
              <h3 class="notification-title">{{ notification.title }}</h3>
              <p class="notification-message">{{ notification.message }}</p>
              <span class="notification-time">{{ getTimeAgo(notification.time) }}</span>
            </div>
            <div v-if="!notification.read" class="unread-indicator"></div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="notifications.length === 0" class="empty-state">
        <i class="pi pi-bell empty-icon"></i>
        <h3>{{ $t('notifications.noNotifications') }}</h3>
        <p>No tienes notificaciones en este momento</p>
      </div>

    </div>
  </div>
</template>

<style scoped>
.notifications-page {
  max-width: 900px;
  margin: 0 auto;
  padding: 2rem 1rem;
}

/* Header */
.notifications-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.header-left {
  flex: 1;
}

.notifications-title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 2rem;
  font-weight: 700;
  color: #1c2541;
  margin-bottom: 0.5rem;
}

.unread-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 24px;
  height: 24px;
  padding: 0 0.5rem;
  background: #ef4444;
  color: #ffffff;
  font-size: 0.75rem;
  font-weight: 600;
  border-radius: 12px;
}

.notifications-subtitle {
  color: #6b7280;
  font-size: 1rem;
}

.header-actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

/* Container */
.notifications-container {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

/* Notification Group */
.notification-group {
  background: #ffffff;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.group-title {
  font-size: 0.875rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #6b7280;
  margin-bottom: 1rem;
}

/* Notifications List */
.notifications-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

/* Notification Item */
.notification-item {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
}

.notification-item:hover {
  background: #f9fafb;
}

.notification-item.unread {
  background: #f0fdfa;
  border-left: 3px solid #5bc0be;
}

.notification-item.unread:hover {
  background: #e6fcf8;
}

/* Notification Icon */
.notification-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 8px;
  flex-shrink: 0;
}

.notification-icon i {
  font-size: 1.25rem;
  color: #ffffff;
}

/* Notification Content */
.notification-content {
  flex: 1;
  min-width: 0;
}

.notification-title {
  font-size: 0.9375rem;
  font-weight: 600;
  color: #1c2541;
  margin-bottom: 0.25rem;
}

.notification-message {
  font-size: 0.875rem;
  color: #6b7280;
  line-height: 1.5;
  margin-bottom: 0.5rem;
}

.notification-time {
  font-size: 0.75rem;
  color: #9ca3af;
}

/* Unread Indicator */
.unread-indicator {
  width: 8px;
  height: 8px;
  background: #5bc0be;
  border-radius: 50%;
  flex-shrink: 0;
  margin-top: 0.5rem;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.empty-icon {
  font-size: 4rem;
  color: #d1d5db;
  margin-bottom: 1rem;
}

.empty-state h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1c2541;
  margin-bottom: 0.5rem;
}

.empty-state p {
  color: #6b7280;
  font-size: 0.9375rem;
}

/* Responsive */
@media (max-width: 768px) {
  .notifications-page {
    padding: 1rem;
  }

  .notifications-header {
    flex-direction: column;
  }

  .header-actions {
    width: 100%;
  }

  .header-actions button {
    flex: 1;
  }

  .notification-item {
    padding: 0.75rem;
  }

  .notification-icon {
    width: 36px;
    height: 36px;
  }

  .notification-icon i {
    font-size: 1.125rem;
  }
}

@media (max-width: 480px) {
  .notifications-title {
    font-size: 1.5rem;
  }

  .notification-group {
    padding: 1rem;
  }
}

/* PrimeVue deep selectors */
.notifications-page :deep(.p-button) {
  border-radius: 8px;
  font-weight: 600;
}
</style>
