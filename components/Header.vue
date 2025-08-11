<template>
  <div class="max-w-none mb-1 px-3 py-2 relative">
    <img 
      src="/cosmicrush.webp" 
      alt="Cosmic Rush Logo" 
      class="h-21 w-auto absolute top-1 left-0 z-100"
    />
    <div class="flex justify-between items-center">
      <!-- Left side: Logo and Navigation -->
      <div class="flex items-center gap-4">
        <div class="relative">
          <!-- Logo placeholder to maintain layout -->
        </div>
        
        <!-- Navigation Links (only when connected) -->
        <div v-if="isConnected" class="flex items-center gap-8 ml-32">
          <MatchHistory />
          <Leaderboard />
          <Statistics />
          <Achievements />
        </div>
        
        <!-- Contract Display Component -->
        <ContractDisplay />
      </div>
      
      <!-- Right side controls -->
      <div class="flex items-center gap-4">
        
        <!-- Balance Display (only when connected) -->
        <div v-if="isConnected">
          <BalanceDisplay />
        </div>
        
        <!-- Login Button/Status -->
        <div v-if="!isConnected" class="flex items-center gap-2">
          <UButton
            @click="connectWalletDirectly"
            :loading="connecting"
            class="bg-gradient-to-r from-cyan-400 to-pink-500 hover:from-cyan-500 hover:to-pink-600 text-white font-bold py-2 px-6 rounded-sm text-sm shadow-lg shadow-cyan-400/25 transition-all duration-200 transform hover:scale-105"
          >
            {{ connecting ? 'Connecting...' : 'Connect Wallet' }}
          </UButton>
        </div>
        
        <!-- Connected Status -->
        <div v-else>
          <UserProfileHeader
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
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-lg"
        @click.self="showLoginPanel = false"
      >
        <div class="bg-gradient-to-tr from-gray-900 via-black to-gray-900 border border-cyan-500/30 rounded-lg p-6 max-w-md w-full mx-4 shadow-2xl">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-lg font-bold bg-gradient-to-r from-cyan-400 to-pink-500 bg-clip-text text-transparent">Connect Wallet</h2>
            <button 
              @click="showLoginPanel = false" 
              class="text-gray-400 hover:text-white text-xl transition-colors"
            >
              ×
            </button>
          </div>
          
          <LoginPanel 
            @connected="onWalletConnected"
            @disconnected="onWalletDisconnected"
          />
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useWeb3 } from '~/composables/useWeb3'
import LoginPanel from './LoginPanel.vue'
import UserProfileHeader from './UserProfileHeader.vue'
import ContractDisplay from './ContractDisplay.vue'
import BalanceDisplay from './BalanceDisplay.vue'
import MatchHistory from './MatchHistory.vue'
import Leaderboard from './Leaderboard.vue'
import Statistics from './Statistics.vue'
import Achievements from './Achievements.vue'

// Define emits
const emit = defineEmits<{
  connected: []
  disconnected: []
}>()

const { 
  isConnected, 
  shortAddress,
  walletType,
  disconnect,
  autoReconnect,
  connectMetaMask,
  updateBalance
} = useWeb3()

// Modal states
const showLoginPanel = ref(false)
const connecting = ref(false)

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
    }
  } catch (error) {
    console.error('❌ Auto-reconnect error:', error)
  }
})
</script>

<style scoped>
/* Cosmic Hover Effect for Navigation Links */
.cosmic-hover {
  text-shadow: 0 2px 4px rgba(0, 0, 0, .75);
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
  transition: color 0.15s ease-in-out, text-shadow 0.25s ease-in-out;
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
  height: .15rem;
  width: 50%;
  background-color: var(--color-accent);
  transition: transform 0.45s ease, box-shadow 0.65s ease;
  box-shadow: 0px 0px 4px rgba(255, 162, 0, 0.948);
  transform: scaleX(0);
  /* Use z-index to ensure the lines appear above/below without affecting layout */
  z-index: 1;
}

.cosmic-hover::before {
  top: -.1rem; /* Orange line above text */
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
