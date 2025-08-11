<template>
  <div class="max-w-none mb-6">
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-2xl font-bold text-cyan-400">Cosmic Rush</h1>
      </div>
      
      <!-- Right side controls -->
      <div class="flex items-center gap-4">
        
        <!-- Contract Display Component -->
        <ContractDisplay />
        
        <!-- Login Button/Status -->
        <div v-if="!isConnected" class="flex items-center gap-2">
          <UButton
            @click="connectWalletDirectly"
            :loading="connecting"
            class="bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-2 px-4 rounded text-sm"
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
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
        @click.self="showLoginPanel = false"
      >
        <div class="bg-gray-900 border border-cyan-500/30 rounded-lg p-6 max-w-md w-full mx-4">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-lg font-bold text-cyan-400">Connect Wallet</h2>
            <button 
              @click="showLoginPanel = false" 
              class="text-gray-400 hover:text-white text-xl"
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

// Define emits
const emit = defineEmits<{
  connected: []
  disconnected: []
}>()

const { 
  isConnected, 
  shortAddress,
  isCorrectNetwork,
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
