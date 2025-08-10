<template>
  <div class="max-w-none mb-6">
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-2xl font-bold text-cyan-400">Cosmic Rush</h1>
      </div>
      
      <!-- Right side controls -->
      <div class="flex items-center gap-4">
        <!-- Network Status -->
        <div v-if="!isCorrectNetwork" class="p-3 bg-red-900/50 border border-red-500 rounded-lg">
          <p class="text-red-400 text-sm">
            ⚠️ Please connect to Localhost to play
          </p>
        </div>
        
        <!-- Show Contracts Button -->
        <UButton
          @click="showContractsModal = true"
          variant="outline"
          size="sm"
          class="text-blue-400 border-blue-400 hover:bg-blue-400 hover:text-white text-xs"
        >
          📋 Contracts
        </UButton>
        
        <!-- Login Button/Status -->
        <div v-if="!isConnected" class="flex items-center gap-2">
          <UButton
            @click="showLoginPanel = true"
            class="bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-2 px-4 rounded text-sm"
          >
            Connect Wallet
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

    <!-- Contracts Modal -->
    <Transition
      enter-active-class="transition-all duration-300 ease-out"
      enter-from-class="opacity-0 scale-95"
      enter-to-class="opacity-100 scale-100"
      leave-active-class="transition-all duration-200 ease-in"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-95"
    >
      <div
        v-if="showContractsModal"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
        @click.self="showContractsModal = false"
      >
        <div class="bg-gray-900 border border-blue-500/30 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-lg font-bold text-blue-400">📋 Contract Addresses</h2>
            <button 
              @click="showContractsModal = false" 
              class="text-gray-400 hover:text-white text-xl"
            >
              ×
            </button>
          </div>
          
          <div class="space-y-4">
            <div class="bg-gray-800 border border-gray-700 rounded-lg p-4">
              <h3 class="text-sm font-bold text-blue-300 mb-2">🚀 Main Contract</h3>
              <div class="flex items-center justify-between">
                <span class="text-gray-400 text-sm">SpaceshipRace:</span>
                <div class="flex items-center gap-2">
                  <span class="text-cyan-400 font-mono text-sm">{{ contractAddresses.SpaceshipRace }}</span>
                  <button 
                    @click="copyToClipboard(contractAddresses.SpaceshipRace)"
                    class="text-gray-400 hover:text-white text-xs"
                    title="Copy address"
                  >
                    📋
                  </button>
                </div>
              </div>
            </div>

            <div class="bg-gray-800 border border-gray-700 rounded-lg p-4">
              <h3 class="text-sm font-bold text-green-300 mb-2">🪙 Token Contract</h3>
              <div class="flex items-center justify-between">
                <span class="text-gray-400 text-sm">SPIRAL Token:</span>
                <div class="flex items-center gap-2">
                  <span class="text-green-400 font-mono text-sm">{{ contractAddresses.SpiralToken }}</span>
                  <button 
                    @click="copyToClipboard(contractAddresses.SpiralToken)"
                    class="text-gray-400 hover:text-white text-xs"
                    title="Copy address"
                  >
                    📋
                  </button>
                </div>
              </div>
            </div>

            <div class="bg-gray-800 border border-gray-700 rounded-lg p-4">
              <h3 class="text-sm font-bold text-purple-300 mb-2">🏆 NFT Contract</h3>
              <div class="flex items-center justify-between">
                <span class="text-gray-400 text-sm">Achievement NFT:</span>
                <div class="flex items-center gap-2">
                  <span class="text-purple-400 font-mono text-sm">{{ contractAddresses.AchievementNFT }}</span>
                  <button 
                    @click="copyToClipboard(contractAddresses.AchievementNFT)"
                    class="text-gray-400 hover:text-white text-xs"
                    title="Copy address"
                  >
                    📋
                  </button>
                </div>
              </div>
            </div>

            <div class="bg-gray-800 border border-gray-700 rounded-lg p-4">
              <h3 class="text-sm font-bold text-yellow-300 mb-2">⚙️ Configuration</h3>
              <div class="space-y-2">
                <div class="flex items-center justify-between">
                  <span class="text-gray-400 text-sm">ShipConfiguration:</span>
                  <div class="flex items-center gap-2">
                    <span class="text-yellow-400 font-mono text-sm">{{ contractAddresses.ShipConfiguration }}</span>
                    <button 
                      @click="copyToClipboard(contractAddresses.ShipConfiguration)"
                      class="text-gray-400 hover:text-white text-xs"
                      title="Copy address"
                    >
                      📋
                    </button>
                  </div>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-gray-400 text-sm">ChaosManager:</span>
                  <div class="flex items-center gap-2">
                    <span class="text-yellow-400 font-mono text-sm">{{ contractAddresses.ChaosManager }}</span>
                    <button 
                      @click="copyToClipboard(contractAddresses.ChaosManager)"
                      class="text-gray-400 hover:text-white text-xs"
                      title="Copy address"
                    >
                      📋
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div class="bg-gray-800 border border-gray-700 rounded-lg p-4">
              <h3 class="text-sm font-bold text-orange-300 mb-2">🌐 Network Info</h3>
              <div class="space-y-2">
                <div class="flex items-center justify-between">
                  <span class="text-gray-400 text-sm">Network:</span>
                  <span class="text-orange-400 text-sm">Localhost (Hardhat)</span>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-gray-400 text-sm">Chain ID:</span>
                  <span class="text-orange-400 text-sm">0x539 (1337)</span>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-gray-400 text-sm">RPC URL:</span>
                  <span class="text-orange-400 text-sm">http://localhost:8545</span>
                </div>
              </div>
            </div>
          </div>
          
          <div class="flex justify-center mt-6">
            <button 
              @click="showContractsModal = false" 
              class="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded text-sm transition-colors"
            >
              Close
            </button>
          </div>
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
  autoReconnect
} = useWeb3()

// Modal states
const showLoginPanel = ref(false)
const showContractsModal = ref(false)

// Contract addresses (updated with latest deployment)
const contractAddresses = ref({
  SpaceshipRace: '0x09635F643e140090A9A8Dcd712eD6285858ceBef',
  SpiralToken: '0x4A679253410272dd5232B3Ff7cF5dbB88f295319',
  AchievementNFT: '0x7a2088a1bFc9d81c55368AE168C2C02570cB814F',
  ShipConfiguration: '0x322813Fd9A801c5507c9de605d63CEA4f2CE6c44',
  ChaosManager: '0xa85233C63b9Ee964Add6F2cffe00Fd84eb32338f'
})

// Copy to clipboard function
const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text)
    // You could add a toast notification here
    console.log('Address copied to clipboard:', text)
  } catch (err) {
    console.error('Failed to copy to clipboard:', err)
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

// Method to update contract addresses (called from parent)
const updateContractAddresses = (addresses: any) => {
  contractAddresses.value = addresses
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

// Expose the update method
defineExpose({
  updateContractAddresses
})
</script>
