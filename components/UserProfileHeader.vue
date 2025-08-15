<template>
  <div class="relative user-profile-header">
    <!-- User Profile Button -->
    <button
      class="flex items-center space-x-3 bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 rounded-sm px-3 py-2 transition-all duration-200 border border-gray-600 hover:border-cyan-400/50 min-w-0"
      @click="toggleMenu"
    >
      <!-- Avatar -->
      <div class="relative flex-shrink-0">
        <img
          :src="avatarSrc"
          :alt="displayName"
          class="w-10 h-10 rounded-sm border-2 border-gray-500 object-cover"
        >
        <!-- Connection Status Indicator -->
        <div class="absolute -bottom-1 -right-1 w-4 h-4">
          <Icon name="logos:metamask-icon" class="w-4 h-4" />
        </div>
      </div>

      <!-- User Info -->
      <div class="flex flex-col items-start min-w-0 flex-1">
        <div class="text-sm font-medium text-white truncate w-full text-left">
          {{ displayName }}
        </div>
        <div class="text-xs text-gray-400 font-mono truncate w-full text-left">
          {{ shortAddressDisplay }}
        </div>
      </div>

      <!-- Dropdown Arrow -->
      <svg
        class="w-4 h-4 text-gray-400 transition-transform flex-shrink-0"
        :class="{ 'rotate-180': showMenu }"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
      </svg>
    </button>

    <!-- Dropdown Menu -->
    <Transition
      enter-active-class="transition ease-out duration-100"
      enter-from-class="transform opacity-0 scale-95"
      enter-to-class="transform opacity-100 scale-100"
      leave-active-class="transition ease-in duration-75"
      leave-from-class="transform opacity-100 scale-100"
      leave-to-class="transform opacity-0 scale-95"
    >
      <div
        v-if="showMenu"
        class="absolute right-0 mt-2 w-64 bg-gradient-to-tr from-gray-800 via-gray-900 to-gray-800 border border-cyan-500/30 rounded-sm shadow-2xl z-50 backdrop-blur-sm"
      >
        <!-- User Info Section -->
        <div class="p-4 border-b border-cyan-500/20">
          <div class="flex items-center space-x-3">
            <div class="flex-shrink-0">
              <img
                :src="avatarSrc"
                :alt="displayName"
                class="w-12 h-12 rounded-sm border-2 border-gray-500 object-cover"
              >
            </div>
            <div class="flex-1 min-w-0">
              <div class="text-sm font-medium text-white truncate">{{ displayName }}</div>
              <div class="flex items-center space-x-2 mt-1">
                <span class="text-xs text-gray-400 font-mono truncate">{{
                  shortAddressDisplay
                }}</span>
                <button
                  class="text-gray-400 hover:text-cyan-400 transition-colors flex-shrink-0"
                  title="Copy full address"
                  @click="copyAddress"
                >
                  <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                </button>
              </div>
              <div class="flex items-center space-x-1 mt-1">
                <div
                  class="w-2 h-2 bg-gradient-to-r from-cyan-400 to-pink-500 rounded-sm flex-shrink-0"
                />
                <span class="text-xs text-gray-300 capitalize truncate">{{
                  walletTypeDisplay
                }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Menu Options -->
        <div class="py-2">
          <!-- Register Username (only if no username) -->
          <button
            v-if="!hasUsername && !isLoadingUsername"
            class="w-full flex items-center space-x-3 px-4 py-2 text-sm bg-gradient-to-r from-cyan-400 to-pink-500 bg-clip-text text-transparent hover:bg-gray-700 transition-colors font-medium"
            @click="showRegistrationModal = true"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
            <span>Register Username</span>
          </button>

          <!-- Profile -->
          <button
            class="w-full flex items-center space-x-3 px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-purple-400 transition-colors"
            @click="openUserProfileModal"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
            <span>Profile</span>
          </button>

          <!-- View on Explorer -->
          <button
            class="w-full flex items-center space-x-3 px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-cyan-400 transition-colors"
            @click="viewOnExplorer"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
            <span>View on Explorer</span>
          </button>

          <!-- Contracts -->
          <button
            class="w-full flex items-center space-x-3 px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-blue-400 transition-colors"
            @click="openContractsModal"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <span>Contracts</span>
          </button>

          <!-- Divider -->
          <div class="border-t border-cyan-500/20 my-2" />

          <!-- Disconnect -->
          <button
            class="w-full flex items-center space-x-3 px-4 py-2 text-sm text-red-400 hover:bg-red-900/20 hover:text-red-300 transition-colors"
            @click="disconnect"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            <span>Disconnect</span>
          </button>
        </div>
      </div>
    </Transition>

    <!-- Backdrop to close menu -->
    <div v-if="showMenu" class="fixed inset-0 z-40" @click="closeMenu" />

    <!-- Username Registration Modal -->
    <UsernameRegistrationModal
      :show="showRegistrationModal"
      @register="handleRegister"
      @skip="handleSkip"
      @close="showRegistrationModal = false"
    />

    <!-- Contracts Modal -->
    <ContractDisplay :show="showContractsModal" @close="showContractsModal = false" />

    <!-- User Profile Modal -->
    <UserProfile
      :show="showUserProfileModal"
      :target-address="account"
      :initial-tab="activeTab"
      @close="showUserProfileModal = false"
      @open-username-registration="openUsernameRegistrationFromProfile"
    />
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
  import { useWeb3 } from '~/composables/useWeb3'
  import { useNotifications } from '~/composables/useNotifications'
  import UsernameRegistrationModal from './UsernameRegistrationModal.vue'
  import ContractDisplay from './ContractDisplay.vue'
  import UserProfile from './UserProfile.vue'

  // Props
  const props = defineProps<{
    address?: string | null
    username?: string
    avatarId?: number
    walletType?: string
    initialTab?: string
  }>()

  // Emits
  const emit = defineEmits<{
    disconnect: []
  }>()

  // Initialize notification system
  const { showSuccess } = useNotifications()

  // Web3 composable
  const {
    isConnected,
    account,
    walletType: web3WalletType,
    connectionState,
    disconnect: web3Disconnect,
    playerHasUsername,
    getUsername,
    getPlayerAvatar,
    registerUsername: web3RegisterUsername,
    network,
  } = useWeb3()

  // Local state
  const showMenu = ref(false)
  const copySuccess = ref(false)
  const localUsername = ref('')
  const localAvatarId = ref(255)
  const hasUsername = ref(false)
  const isLoadingUsername = ref(false)
  const activeTab = ref(props.initialTab || 'profile')

  // Registration modal state
  const showRegistrationModal = ref(false)

  // Contract modal state
  const showContractsModal = ref(false)

  // User Profile modal state
  const showUserProfileModal = ref(false)

  // Computed properties
  const displayName = computed(() => {
    return localUsername.value || props.username || 'Anon'
  })

  const fullAddress = computed(() => {
    return account.value || props.address || ''
  })

  const shortAddressDisplay = computed(() => {
    const addr = fullAddress.value
    if (!addr) return ''
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  })

  const avatarSrc = computed(() => {
    // If user has a username, use their selected avatar
    if (hasUsername.value && localAvatarId.value !== 255) {
      return `/avatars/${localAvatarId.value}.webp`
    }
    
    // If user has a username but no local avatar, use props avatar
    if (hasUsername.value && props.avatarId !== undefined) {
      return `/avatars/${props.avatarId}.webp`
    }
    
    // For anonymous/unregistered users, use the default avatar
    return '/avatars/null.webp'
  })

  const walletTypeDisplay = computed(() => {
    return web3WalletType.value || props.walletType || 'metamask'
  })

  const networkDisplay = computed(() => {
    return network.getNetworkDisplay.value
  })

  const networkIndicatorClass = computed(() => {
    return network.getNetworkIndicatorClass.value
  })

  // Methods
  const toggleMenu = () => {
    showMenu.value = !showMenu.value
  }

  const closeMenu = () => {
    showMenu.value = false
  }

  const copyAddress = async () => {
    try {
      await navigator.clipboard.writeText(fullAddress.value)
      copySuccess.value = true
      showSuccess('Address copied!', 'Wallet address copied to clipboard 📋')
      setTimeout(() => {
        copySuccess.value = false
      }, 2000)
    } catch (err) {
      console.error('Failed to copy address:', err)
    }
  }

  const viewOnExplorer = () => {
    const address = fullAddress.value
    if (!address) return

    // Always use Somnia explorer
    const explorerUrl = `https://shannon-explorer.somnia.network/address/${address}`
    window.open(explorerUrl, '_blank')
  }

  const openContractsModal = () => {
    showContractsModal.value = true
    closeMenu()
  }

  const openUserProfileModal = () => {
    // Reset to profile tab when opening from header
    activeTab.value = 'profile'
    showUserProfileModal.value = true
    closeMenu()
  }

  const openUserProfileModalWithTab = (tab: string) => {
    // Force the tab to the requested one (from notification)
    activeTab.value = tab
    showUserProfileModal.value = true
    closeMenu()
  }

  // Method to handle opening username registration from UserProfile
  const openUsernameRegistrationFromProfile = () => {
    // Don't close UserProfile modal, just open registration
    showRegistrationModal.value = true
  }

  const disconnect = () => {
    web3Disconnect()
    emit('disconnect')
    closeMenu()
  }

  const handleRegister = async (username: string, avatarId: number) => {
    try {
      await web3RegisterUsername(username, avatarId)

      // Update local state
      localUsername.value = username
      localAvatarId.value = avatarId
      hasUsername.value = true

      // Close modal
      showRegistrationModal.value = false
    } catch (err: unknown) {
      console.error('Username registration failed:', err)
      // The modal component will handle displaying the error
    }
  }

  const handleSkip = () => {
    showRegistrationModal.value = false
    hasUsername.value = true // Mark as "skipped" so we don't show the option again
  }



  // Load user data when connected
  const loadUserData = async () => {
    if (!isConnected.value || connectionState.value !== 'ready') return

    isLoadingUsername.value = true
    try {
      // Check if user has username
      const hasUsernameCheck = await playerHasUsername()
      hasUsername.value = hasUsernameCheck

      if (hasUsernameCheck) {
        localUsername.value = await getUsername()
        localAvatarId.value = await getPlayerAvatar()
      }
    } catch (error) {
      console.error('Failed to load user data:', error)
      hasUsername.value = false
    } finally {
      isLoadingUsername.value = false
    }
  }

  // Watch for connection changes
  const watchConnection = () => {
    if (isConnected.value && connectionState.value === 'ready') {
      loadUserData()
    }
  }

  // Click outside to close menu
  const handleClickOutside = (event: Event) => {
    const target = event.target as Element
    if (!target.closest('.user-profile-header')) {
      closeMenu()
    }
  }

  // Lifecycle
  onMounted(() => {
    watchConnection()
    document.addEventListener('click', handleClickOutside)
  })

  onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside)
  })

  // Watch for connection state changes
  watch(connectionState, newState => {
    if (newState === 'ready') {
      loadUserData()
    }
  })

  // Watch for account changes
  watch(account, () => {
    if (account.value) {
      loadUserData()
    }
  })

  // Expose methods for external use
  defineExpose({
    openUserProfileModalWithTab
  })
</script>

<style scoped>
  .user-profile-header {
    position: relative;
  }
</style>
