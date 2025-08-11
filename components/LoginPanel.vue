<template>
  <div class="bg-gray-800 p-4 rounded-lg border border-gray-700">
    <!-- Wallet Connection -->
    <div v-if="!isConnected" class="text-center">
      <UButton
        @click="connectMetaMaskHandler"
        :loading="connecting"
        class="w-full bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-2 px-6 rounded text-sm"
      >
        {{ connecting ? 'Connecting...' : 'Connect Wallet' }}
      </UButton>
      <p class="text-xs text-gray-400 mt-2">Connect your MetaMask wallet to start betting</p>
    </div>
    
    <!-- Connected State -->
    <div v-else class="text-center">
      <div class="flex items-center justify-center gap-2 mb-2">
        <div class="w-2 h-2 bg-green-400 rounded-full"></div>
        <span class="text-green-400 text-sm font-medium">Connected</span>
      </div>
      <div class="text-xs text-gray-400 mb-3">
        {{ shortAddress }} ({{ walletType }})
      </div>
      <UButton
        @click="disconnect"
        variant="outline"
        size="sm"
        class="text-red-400 border-red-400 hover:bg-red-400 hover:text-white text-xs"
      >
        Disconnect
      </UButton>
    </div>

    <!-- Error Display -->
    <div v-if="error" class="mt-3 p-2 bg-red-900/50 border border-red-500 rounded text-xs">
      <p class="text-red-400">{{ error }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useWeb3 } from '~/composables/useWeb3'

// Define emits
const emit = defineEmits<{
  connected: []
  disconnected: []
}>()

// Use the Web3 composable
const {
  isConnected,
  shortAddress,
  walletType,
  isCorrectNetwork,
  connectMetaMask,
  disconnect: web3Disconnect,
  switchToSomniaTestnet,
  updateBalance
} = useWeb3()

// Local state
const connecting = ref(false)
const error = ref('')

// Methods
const connectMetaMaskHandler = async () => {
  connecting.value = true
  error.value = ''
  
  try {
    await connectMetaMask()
    await updateBalance()
    emit('connected')
  } catch (err: any) {
    error.value = err.message || 'Failed to connect MetaMask'
  } finally {
    connecting.value = false
  }
}

const handleSwitchNetwork = async () => {
  try {
    await switchToSomniaTestnet(window.ethereum)
  } catch (err: any) {
    error.value = err.message || 'Failed to switch network'
  }
}

const openSomniaNetwork = () => {
  window.open('https://testnet.somnia.network/', '_blank')
}

const disconnect = () => {
  web3Disconnect()
  emit('disconnected')
}
</script>
