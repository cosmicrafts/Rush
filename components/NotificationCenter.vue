<template>
  <div class="relative notification-center">
    <!-- Notification Bell Icon -->
    <button
      v-if="isConnected"
      class="relative flex items-center justify-center w-10 h-10 bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 rounded-sm transition-all duration-200 border border-gray-600 hover:border-cyan-400/50 group"
      @click="toggleNotifications"
    >
      <!-- Bell Icon -->
      <svg
        class="w-5 h-5 text-gray-300 group-hover:text-cyan-400 transition-colors"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M15 17h5l-5 5v-5zM10.5 3.75a6 6 0 00-6 6v3.75l-2.25 2.25v3h15v-3L15.75 12.75V9.75a6 6 0 00-6-6z"
        />
      </svg>

      <!-- Notification Badge -->
      <div
        v-if="notificationCount > 0"
        class="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-pink-500 to-cyan-500 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-lg"
      >
        {{ notificationCount > 99 ? '99+' : notificationCount }}
      </div>

      <!-- Pulse Animation for New Notifications -->
      <div
        v-if="hasNewNotifications"
        class="absolute inset-0 rounded-sm bg-gradient-to-r from-pink-500/20 to-cyan-500/20 animate-pulse"
      />
    </button>

    <!-- Notifications Dropdown -->
    <Transition
      enter-active-class="transition ease-out duration-200"
      enter-from-class="transform opacity-0 scale-95 translate-y-2"
      enter-to-class="transform opacity-100 scale-100 translate-y-0"
      leave-active-class="transition ease-in duration-150"
      leave-from-class="transform opacity-100 scale-100 translate-y-0"
      leave-to-class="transform opacity-0 scale-95 translate-y-2"
    >
      <div
        v-if="showNotifications"
        class="absolute right-0 mt-2 w-80 max-h-96 bg-gradient-to-tr from-gray-800 via-gray-900 to-gray-800 border border-cyan-500/30 rounded-sm shadow-2xl z-50 backdrop-blur-sm overflow-hidden"
      >
        <!-- Header -->
        <div class="p-4 border-b border-cyan-500/20 bg-gradient-to-r from-gray-800 to-gray-900">
          <div class="flex items-center justify-between">
            <h3 class="text-sm font-semibold text-white flex items-center space-x-2">
              <svg class="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M15 17h5l-5 5v-5zM10.5 3.75a6 6 0 00-6 6v3.75l-2.25 2.25v3h15v-3L15.75 12.75V9.75a6 6 0 00-6-6z"
                />
              </svg>
              <span>Notifications</span>
            </h3>
            <div class="flex items-center space-x-2">
              <span class="text-xs text-gray-400">{{ notificationCount }} total</span>
              <button
                v-if="notificationCount > 0"
                class="text-xs text-red-400 hover:text-red-300 transition-colors"
                @click="clearAllNotifications"
              >
                Clear All
              </button>
            </div>
          </div>
        </div>

        <!-- Notifications List -->
        <div class="max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
          <div v-if="notifications.length === 0" class="p-6 text-center">
            <div class="text-gray-400 text-sm">
              <svg class="w-8 h-8 mx-auto mb-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                />
              </svg>
              <p>No notifications yet</p>
              <p class="text-xs mt-1">Your notifications will appear here</p>
            </div>
          </div>

          <div v-else class="divide-y divide-gray-700">
            <div
              v-for="notification in notifications"
              :key="notification.id"
              class="p-4 hover:bg-gray-700/50 transition-colors cursor-pointer group"
              @click="handleNotificationClick(notification)"
            >
              <!-- Notification Header -->
              <div class="flex items-start space-x-3">
                <!-- Icon based on notification type -->
                <div class="flex-shrink-0 mt-0.5">
                  <div
                    class="w-8 h-8 rounded-full flex items-center justify-center"
                    :class="getNotificationIconClass(notification.type)"
                  >
                    <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        :d="getNotificationIconPath(notification.type)"
                      />
                    </svg>
                  </div>
                </div>

                <!-- Content -->
                <div class="flex-1 min-w-0">
                  <div class="flex items-start justify-between">
                    <h4 class="text-sm font-medium text-white truncate">
                      {{ notification.title }}
                    </h4>
                    <span class="text-xs text-gray-400 flex-shrink-0 ml-2">
                      {{ formatTimestamp(notification.timestamp) }}
                    </span>
                  </div>
                  
                  <p v-if="notification.description" class="text-xs text-gray-300 mt-1 line-clamp-2">
                    {{ notification.description }}
                  </p>

                  <!-- Type Badge -->
                  <div class="flex items-center space-x-2 mt-2">
                    <span
                      class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
                      :class="getNotificationBadgeClass(notification.type)"
                    >
                      {{ getNotificationTypeLabel(notification.type) }}
                    </span>
                  </div>
                </div>

                <!-- Delete Button -->
                <button
                  class="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-red-400 flex-shrink-0"
                  @click.stop="deleteNotification(notification.id)"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div v-if="notifications.length > 0" class="p-3 border-t border-cyan-500/20 bg-gradient-to-r from-gray-800 to-gray-900">
          <div class="flex items-center justify-between text-xs text-gray-400">
            <span>Showing {{ notifications.length }} of {{ notificationCount }}</span>
            <button
              class="text-cyan-400 hover:text-cyan-300 transition-colors"
              @click="loadMoreNotifications"
            >
              Load More
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Backdrop -->
    <div v-if="showNotifications" class="fixed inset-0 z-40" @click="closeNotifications" />
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
  import { useWeb3 } from '~/composables/useWeb3'
  import { useCache } from '~/composables/useCache'
  import { useNotifications } from '~/composables/useNotifications'

  // Props
  const props = defineProps<{
    maxDisplayed?: number
  }>()

  // Emits
  const emit = defineEmits<{
    'notification-click': [notification: any]
  }>()

  // Composables
  const { isConnected, account } = useWeb3()
  const { loadNotifications, clearNotifications, saveNotification, isCacheLoaded, notificationCount } = useCache()
  const { showSuccess, showError } = useNotifications()

  // State
  const showNotifications = ref(false)
  const notifications = ref<any[]>([])
  const displayedCount = ref(props.maxDisplayed || 10)
  const hasNewNotifications = computed(() => {
    const oneHourAgo = Date.now() - (60 * 60 * 1000)
    return notifications.value.some(n => n.timestamp > oneHourAgo)
  })

  // Methods
  const toggleNotifications = () => {
    showNotifications.value = !showNotifications.value
    if (showNotifications.value) {
      loadCachedNotifications()
    }
  }

  const closeNotifications = () => {
    showNotifications.value = false
  }

  const loadCachedNotifications = () => {
    if (!isConnected.value || !account.value) {
      console.log('❌ Cannot load notifications: not connected or no account')
      return
    }

    try {
      const cachedNotifications = loadNotifications()
      console.log('📊 Loaded notifications from cache:', cachedNotifications.length)
      // notificationCount is now reactive from useCache
      notifications.value = cachedNotifications.slice(0, displayedCount.value)
      debugCache()
    } catch (error) {
      console.error('Failed to load notifications:', error)
    }
  }

  const loadMoreNotifications = () => {
    displayedCount.value += 10
    loadCachedNotifications()
  }

  const clearAllNotifications = async () => {
    try {
      const success = clearNotifications()
      if (success) {
        notifications.value = []
        // notificationCount is now reactive from useCache
        showSuccess('Notifications cleared!', 'All notifications have been removed')
      } else {
        showError('Failed to clear notifications')
      }
    } catch (error) {
      console.error('Failed to clear notifications:', error)
      showError('Failed to clear notifications')
    }
  }

  const deleteNotification = (notificationId: string) => {
    // For now, we'll just remove from the display
    // In a full implementation, you'd want to remove from cache
    notifications.value = notifications.value.filter(n => n.id !== notificationId)
    // notificationCount is now reactive from useCache
  }

  const handleNotificationClick = (notification: any) => {
    // Handle transaction notifications - extract hash and open explorer
    if (notification.type === 'success' && notification.description && notification.description.includes('Hash:')) {
      const hashMatch = notification.description.match(/Hash: (0x[a-fA-F0-9]+)/)
      if (hashMatch) {
        const fullHash = hashMatch[1]
        const explorerUrl = `https://shannon-explorer.somnia.network/tx/${fullHash}`
        window.open(explorerUrl, '_blank')
        closeNotifications()
        return
      }
    }
    
    // Handle other notifications normally
    emit('notification-click', notification)
    closeNotifications()
  }

  const formatTimestamp = (timestamp: number) => {
    const now = Date.now()
    const diff = now - timestamp

    if (diff < 60000) return 'Just now'
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`
    if (diff < 604800000) return `${Math.floor(diff / 86400000)}d ago`
    
    return new Date(timestamp).toLocaleDateString()
  }

  const getNotificationIconClass = (type: string) => {
    const classes = {
      success: 'bg-green-500',
      error: 'bg-red-500',
      warning: 'bg-yellow-500',
      info: 'bg-blue-500',
      jackpot: 'bg-gradient-to-r from-amber-500 to-yellow-500',
      achievement: 'bg-gradient-to-r from-purple-500 to-pink-500',
      nft: 'bg-gradient-to-r from-emerald-500 to-teal-500',
      'race-result': 'bg-gradient-to-r from-cyan-500 to-blue-500'
    }
    return classes[type as keyof typeof classes] || 'bg-gray-500'
  }

  const getNotificationIconPath = (type: string) => {
    const paths = {
      success: 'M5 13l4 4L19 7',
      error: 'M6 18L18 6M6 6l12 12',
      warning: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z',
      info: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
      jackpot: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1',
      achievement: 'M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z',
      nft: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z',
      'race-result': 'M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z'
    }
    return paths[type as keyof typeof paths] || 'M15 17h5l-5 5v-5zM10.5 3.75a6 6 0 00-6 6v3.75l-2.25 2.25v3h15v-3L15.75 12.75V9.75a6 6 0 00-6-6z'
  }

  const getNotificationBadgeClass = (type: string) => {
    const classes = {
      success: 'bg-green-900/50 text-green-300 border border-green-500/30',
      error: 'bg-red-900/50 text-red-300 border border-red-500/30',
      warning: 'bg-yellow-900/50 text-yellow-300 border border-yellow-500/30',
      info: 'bg-blue-900/50 text-blue-300 border border-blue-500/30',
      jackpot: 'bg-gradient-to-r from-amber-900/50 to-yellow-900/50 text-amber-300 border border-amber-500/30',
      achievement: 'bg-gradient-to-r from-purple-900/50 to-pink-900/50 text-purple-300 border border-purple-500/30',
      nft: 'bg-gradient-to-r from-emerald-900/50 to-teal-900/50 text-emerald-300 border border-emerald-500/30',
      'race-result': 'bg-gradient-to-r from-cyan-900/50 to-blue-900/50 text-cyan-300 border border-cyan-500/30'
    }
    return classes[type as keyof typeof classes] || 'bg-gray-900/50 text-gray-300 border border-gray-500/30'
  }

  const getNotificationTypeLabel = (type: string) => {
    const labels = {
      success: 'Success',
      error: 'Error',
      warning: 'Warning',
      info: 'Info',
      jackpot: 'Jackpot',
      achievement: 'Achievement',
      nft: 'NFT',
      'race-result': 'Race Result'
    }
    return labels[type as keyof typeof labels] || 'Notification'
  }

  // Lifecycle
  onMounted(() => {
    if (isConnected.value) {
      // Wait a bit for cache to initialize
      setTimeout(() => {
        loadCachedNotifications()
      }, 100)
    }
  })

  // Watch for connection changes
  watch(isConnected, (connected) => {
    if (connected) {
      // Wait a bit for cache to initialize
      setTimeout(() => {
        loadCachedNotifications()
      }, 100)
    } else {
      notifications.value = []
    }
  })

  // Watch for account changes
  watch(account, () => {
    if (account.value) {
      // Wait a bit for cache to initialize
      setTimeout(() => {
        loadCachedNotifications()
      }, 100)
    }
  })

  // Watch for cache loading
  watch(isCacheLoaded, (loaded) => {
    if (loaded && isConnected.value) {
      loadCachedNotifications()
    }
  })

  // No longer needed - notificationCount is now reactive from useCache

  // Debug logging
  const debugCache = () => {
    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 Notification Cache Debug:', {
        isConnected: isConnected.value,
        account: account.value,
        notificationsLoaded: notifications.value.length,
        cacheResult: loadNotifications()
      })
    }
  }


</script>

<style scoped>
  .scrollbar-thin {
    scrollbar-width: thin;
  }

  .scrollbar-thumb-gray-600::-webkit-scrollbar-thumb {
    background-color: #4b5563;
    border-radius: 4px;
  }

  .scrollbar-track-gray-800::-webkit-scrollbar-track {
    background-color: #1f2937;
  }

  .scrollbar-thin::-webkit-scrollbar {
    width: 6px;
  }

  .line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
</style>
