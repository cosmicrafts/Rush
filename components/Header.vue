<template>
  <div class="w-full px-4 py-2 layout-relative flex-shrink-0" style="min-height: 5vh">
    <div class="layout-flex-between component-fit-height">
      <!-- Left side: Logo and Navigation -->
      <div class="layout-flex gap-responsive-md items-center">
        <!-- Logo -->
        <img src="/cosmicrush.webp" alt="Cosmic Rush Logo" class="h-8 md:h-10 lg:h-12 w-auto" />

        <!-- Navigation Links (only when connected) -->
        <div v-if="isConnected" class="layout-flex gap-responsive-md">
          <Leaderboard />
        </div>
      </div>

      <!-- Right side controls -->
      <div class="layout-flex gap-responsive-md items-center min-w-0">
        <!-- Balance Display (only when connected) -->
        <div v-if="isConnected" class="flex-shrink-0">
          <BalanceDisplay />
        </div>

        <!-- Notification Center (only when connected) -->
        <div v-if="isConnected" class="flex-shrink-0">
          <NotificationCenter @notification-click="handleNotificationClick" />
        </div>

        <!-- Login Button/Status - Reserve space to prevent layout shift -->
        <div 
          v-if="!isConnected" 
          class="layout-flex gap-responsive-sm flex-shrink-0"
          style="min-width: 140px; min-height: 40px;"
        >
          <button
            :disabled="connecting"
            class="btn-inline-secondary flex items-center justify-center space-x-2 px-3 py-2"
            @click="connectWalletDirectly"
          >
            <div v-if="connecting" class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            <span>{{ connecting ? 'Connecting...' : 'Connect Wallet' }}</span>
          </button>
        </div>

        <!-- Connected Status - Reserve same space to prevent layout shift -->
        <div 
          v-else 
          class="flex-shrink-0"
          style="min-width: 140px; min-height: 40px;"
        >
          <UserProfileHeader
            ref="userProfileHeaderRef"
            :address="shortAddress"
            :wallet-type="walletType || 'metamask'"
            @disconnect="onWalletDisconnected"
          />
        </div>
      </div>
    </div>

    <!-- Login Panel Modal -->
    <Transition
      enter-active-class="transition-all duration-300 ease-out"
      enter-from-class="opacity-0 scale-95"
      enter-to-class="opacity-100 scale-100"
      leave-active-class="transition-all duration-200 ease-in"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-95"
    >
      <div
        v-if="showLoginPanel"
        class="layout-fixed viewport-center layout-flex-center bg-black/90 backdrop-blur-lg p-responsive-lg z-50"
        @click.self="showLoginPanel = false"
      >
        <div class="modal-responsive card-responsive shadow-2xl">
          <div class="layout-flex-between mb-responsive-md">
            <h2
              class="text-responsive-xl font-bold bg-gradient-to-r from-cyan-400 to-pink-500 bg-clip-text text-transparent"
            >
              Connect Wallet
            </h2>
            <button
              class="text-gray-400 hover:text-white text-responsive-xl transition-colors"
              @click="showLoginPanel = false"
            >
              ×
            </button>
          </div>

          <LoginPanel @connected="onWalletConnected" @disconnected="onWalletDisconnected" />
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted, defineAsyncComponent } from 'vue'
  import { useWeb3 } from '~/composables/useWeb3'
  import BalanceDisplay from './BalanceDisplay.vue'
  import Leaderboard from './Leaderboard.vue'

  // Lazy load non-critical components
  const LoginPanel = defineAsyncComponent({
    loader: () => import('./LoginPanel.vue'),
    delay: 0,
    timeout: 5000,
  })

  const UserProfileHeader = defineAsyncComponent({
    loader: () => import('./UserProfileHeader.vue'),
    delay: 0,
    timeout: 5000,
  })

  const NotificationCenter = defineAsyncComponent({
    loader: () => import('./NotificationCenter.vue'),
    delay: 0,
    timeout: 5000,
  })

  // Define component name for ESLint
  defineOptions({
    name: 'AppHeader',
  })

  // Define emits
  const emit = defineEmits<{
    connected: []
    disconnected: []
    'auto-reconnect-failed': []
    'open-user-profile': [{ tab: string }]
  }>()

  const { isConnected, shortAddress, walletType, autoReconnect, connectMetaMask, updateBalance } =
    useWeb3()

  // Modal states
  const showLoginPanel = ref(false)
  const connecting = ref(false)
  const userProfileHeaderRef = ref()

  // Direct wallet connection
  const connectWalletDirectly = async () => {
    connecting.value = true
    try {
      await connectMetaMask()
      await updateBalance()
      emit('connected')
    } catch (error) {
      console.error('Failed to connect wallet:', error)
    } finally {
      connecting.value = false
    }
  }

  // Wallet connection handlers
  const onWalletConnected = () => {
    showLoginPanel.value = false
    emit('connected')
  }

  const onWalletDisconnected = () => {
    showLoginPanel.value = false
    emit('disconnected')
  }

  const handleNotificationClick = (notification: { type: string; title: string }) => {
    // Handle notification click - you can add custom logic here
    console.log('Notification clicked:', notification)

    // Determine which tab to open based on notification type and content
    let targetTab = 'profile' // default tab

    if (notification.type === 'achievement') {
      targetTab = 'achievements'
    } else if (notification.type === 'nft' || notification.title.includes('NFT')) {
      targetTab = 'nfts'
    } else if (
      notification.type === 'race-result' ||
      (notification.type === 'success' && notification.title.includes('finished'))
    ) {
      targetTab = 'match-history'
    } else if (notification.type === 'success' && notification.title === 'Sign up') {
      targetTab = 'profile' // Open profile tab for registration notifications
    }

    // Open UserProfile modal with specific tab
    if (userProfileHeaderRef.value) {
      userProfileHeaderRef.value.openUserProfileModalWithTab(targetTab)
    }
  }

  // Auto-reconnect on mount
  onMounted(async () => {
    console.log('🚀 Header component mounted, attempting auto-reconnect...')
    try {
      const success = await autoReconnect()
      if (success) {
        console.log('✅ Auto-reconnect successful, emitting connected event')
        emit('connected')
      } else {
        console.log('❌ Auto-reconnect failed or not needed')
        emit('auto-reconnect-failed')
      }
    } catch (error) {
      console.error('❌ Auto-reconnect error:', error)
      emit('auto-reconnect-failed')
    }
  })
</script>

<style scoped>
  /* Cosmic Hover Effect for Navigation Links */
  .cosmic-hover {
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.75);
    position: relative;
    display: inline-block;
    text-decoration: none;
    font-weight: var(--weight-bold);
    color: var(--color-text-primary);
    /* Add initial transparent borders to prevent layout shift */
    border-top: 1px solid transparent;
    border-bottom: 1px solid transparent;
    /* Use box-sizing to maintain size */
    box-sizing: border-box;
    /* Fixed padding that won't change */
    padding: 0.2rem 0.5rem;
    /* Only transition the visual properties */
    transition:
      color 0.15s ease-in-out,
      text-shadow 0.25s ease-in-out;
  }

  .cosmic-hover:hover {
    color: var(--color-primary);
    border-bottom: 1px solid var(--color-primary);
    border-top: 1px solid var(--color-primary);
    text-shadow: 0px 0px 2px rgba(0, 191, 255, 0.686);
    /* No padding changes on hover */
  }

  .cosmic-hover::before,
  .cosmic-hover::after {
    content: '';
    position: absolute;
    height: 0.15rem;
    width: 50%;
    background-color: var(--color-accent);
    transition:
      transform 0.45s ease,
      box-shadow 0.65s ease;
    box-shadow: 0px 0px 4px rgba(255, 162, 0, 0.948);
    transform: scaleX(0);
    /* Use z-index to ensure the lines appear above/below without affecting layout */
    z-index: 1;
  }

  .cosmic-hover::before {
    top: -0.1rem; /* Orange line above text */
    left: -4%;
    transform-origin: left;
  }

  .cosmic-hover::after {
    bottom: -1px; /* Orange line below text */
    right: -4%;
    transform-origin: right;
  }

  .cosmic-hover:hover::before,
  .cosmic-hover:hover::after {
    transform: scaleX(1.25);
    box-shadow: 0px 0px 5px rgba(255, 162, 0, 0.936);
  }
</style>
