<template>
  <div class="w-full px-4 py-2 layout-relative flex-shrink-0" style="min-height: 5vh">
    <div class="layout-flex-between component-fit-height">
      <!-- Left side: Logo and Navigation -->
      <div class="layout-flex gap-responsive-md items-center">
        <!-- Logo -->
        <nuxt-img 
          src="/rush.svg"
          :alt="t('header.logo_alt')" 
          class="h-8 md:h-10 lg:h-12 w-auto"
          width="64"
          loading="eager"
          fetchpriority="high"
        />

        <!-- Navigation Links (only when connected) -->
        <div v-if="isConnected" class="layout-flex gap-responsive-md">
          <Leaderboard ref="leaderboardRef" />
          <button
            class="cosmic-hover"
            @click="openFAQ"
          >
            {{ t('header.faq') }}
          </button>
          <button
            class="cosmic-hover"
            :title="t('tour.title')"
            @click="funnel.openTour()"
          >
            🧭
          </button>
          <button
            v-if="!hasEmail"
            class="cosmic-hover text-emerald-300"
            @click="funnel.showSave.value = true"
          >
            💾 {{ t('save.button') }}
          </button>
        </div>
      </div>

      <!-- Right side controls -->
      <div class="layout-flex gap-responsive-md items-center min-w-0">
        <!-- Balance Display (only when connected) -->
        <div v-if="isConnected" class="flex-shrink-0">
          <BalanceDisplay ref="balanceRef" />
        </div>

        <!-- Notification Center (only when connected) -->
        <div v-if="isConnected" class="flex-shrink-0">
          <NotificationCenter @notification-click="handleNotificationClick" />
        </div>

        <!-- Play entry (WOU-ID identity, no wallet) -->
        <div class="layout-flex gap-responsive-sm flex-shrink-0" style="min-width: 140px; min-height: 40px;">
          <button
            v-if="!isConnected"
            :disabled="connecting"
            class="btn-inline-secondary px-3 py-2 flex items-center space-x-2"
            @click="connectWalletDirectly"
          >
            <div v-if="connecting" class="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
            <span>{{ connecting ? t('header.entering') : t('header.play') }}</span>
          </button>
          <div v-else class="flex items-center space-x-2 bg-green-500/20 text-green-400 px-2 py-1 rounded text-sm">
            <div class="w-2 h-2 bg-green-400 rounded-full"></div>
            <span>{{ shortAddress }}</span>
          </div>
        </div>

        <!-- User Profile (when connected) -->
        <div v-if="isConnected" class="flex-shrink-0">
          <UserProfileHeader
            ref="userProfileHeaderRef"
            :address="shortAddress"
            :wallet-type="walletType || 'metamask'"
            @disconnect="onWalletDisconnected"
          />
        </div>

        <!-- Language selector -->
        <div class="flex-shrink-0">
          <LanguageSelector />
        </div>
      </div>
    </div>

    <!-- FAQ Modal -->
    <FAQModal ref="faqModalRef" />
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted, onUnmounted, defineAsyncComponent } from 'vue'
  import { useWeb3 } from '~/composables/useBackend'
  import { useRushI18n } from '~/composables/useRushI18n'
  import { useFunnel } from '~/composables/useFunnel'
  import BalanceDisplay from './BalanceDisplay.vue'
  import Leaderboard from './Leaderboard.vue'
  import LanguageSelector from './LanguageSelector.vue'

  // Lazy load non-critical components

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

  const FAQModal = defineAsyncComponent({
    loader: () => import('./FAQModal.vue'),
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

  const { t } = useRushI18n()
  const funnel = useFunnel()

  // Modal states
  const connecting = ref(false)
  const userProfileHeaderRef = ref()
  const faqModalRef = ref()
  const leaderboardRef = ref()
  const balanceRef = ref()
  const hasEmail = ref(false)

  const refreshEmailState = async () => {
    try {
      const me = await useWeb3().wouAuth.getMe().catch(() => null)
      hasEmail.value = !!(me && me.email)
    } catch {
      /* unknown: keep the Save button visible */
    }
  }

  // Open FAQ modal
  const openFAQ = () => {
    if (faqModalRef.value) {
      faqModalRef.value.open()
    }
  }

  // Direct wallet connection
  const connectWalletDirectly = async () => {
    connecting.value = true
    try {
      await connectMetaMask()
      await updateBalance()
      await refreshEmailState()
      emit('connected')
    } catch (error) {
      console.error('Failed to connect wallet:', error)
    } finally {
      connecting.value = false
    }
  }

  // Wallet connection handlers
  const onWalletDisconnected = () => {
    emit('disconnected')
  }

  const handleNotificationClick = (notification: { type: string; title: string }) => {
    // Handle notification click - you can add custom logic here
    console.log('Notification clicked:', notification)

    // Determine which tab to open based on notification type and content
    let targetTab = 'profile' // default tab

    if (notification.type === 'success' && notification.title === t('notify.signup')) {
      targetTab = 'profile' // Open profile tab for registration notifications
    } else if (notification.type === 'achievement') {
      targetTab = 'achievements'
    } else if (notification.type === 'nft' || notification.title.includes('NFT')) {
      targetTab = 'nfts'
    } else if (notification.type === 'race-result' || notification.type === 'success') {
      targetTab = 'match-history'
    }

    // Open UserProfile modal with specific tab
    if (userProfileHeaderRef.value) {
      userProfileHeaderRef.value.openUserProfileModalWithTab(targetTab)
    }
  }

  // Funnel navigation: tour "Go" buttons dispatch these from anywhere.
  const onOpenProfileTab = (e: Event) => {
    const tab = (e as CustomEvent).detail?.tab || 'profile'
    userProfileHeaderRef.value?.openUserProfileModalWithTab?.(tab)
  }
  const onOpenLeaderboard = () => {
    leaderboardRef.value?.open?.()
  }
  const onClaimFaucet = () => {
    balanceRef.value?.claim?.()
  }

  // Auto-reconnect on mount
  onMounted(async () => {
    window.addEventListener('rush:open-profile-tab', onOpenProfileTab)
    window.addEventListener('rush:open-leaderboard', onOpenLeaderboard)
    window.addEventListener('rush:claim-faucet', onClaimFaucet)
    console.log('🚀 Header component mounted, attempting auto-reconnect...')
    try {
      const success = await autoReconnect()
      if (success) {
        console.log('✅ Auto-reconnect successful, emitting connected event')
        await refreshEmailState()
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

  onUnmounted(() => {
    window.removeEventListener('rush:open-profile-tab', onOpenProfileTab)
    window.removeEventListener('rush:open-leaderboard', onOpenLeaderboard)
    window.removeEventListener('rush:claim-faucet', onClaimFaucet)
  })
</script>

<style scoped>
  /* Component-specific styles can go here if needed */
</style>
