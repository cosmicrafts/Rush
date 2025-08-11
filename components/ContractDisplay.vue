<template>
  <div>
    <!-- Show Contracts Button -->
    <UButton
      @click="showContractsModal = true"
      variant="outline"
      size="sm"
      class="text-blue-400 border-blue-400 hover:bg-blue-400 hover:text-white text-xs"
    >
      📋 Contracts
    </UButton>

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
                  <span class="text-orange-400 text-sm">{{ networkInfo.name }}</span>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-gray-400 text-sm">Chain ID:</span>
                  <span class="text-orange-400 text-sm">{{ networkInfo.chainId }}</span>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-gray-400 text-sm">RPC URL:</span>
                  <span class="text-orange-400 text-sm">{{ networkInfo.rpcUrl }}</span>
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
import { ref, computed } from 'vue'

// Get contract addresses from runtime config
const config = useRuntimeConfig()

// Modal state
const showContractsModal = ref(false)

// Contract addresses from environment
const contractAddresses = computed(() => ({
  SpaceshipRace: config.public.spaceshipRaceAddress || 'Not deployed',
  SpiralToken: config.public.spiralTokenAddress || 'Not deployed',
  AchievementNFT: config.public.achievementNFTAddress || 'Not deployed',
  ShipConfiguration: config.public.shipConfigurationAddress || 'Not deployed',
  ChaosManager: config.public.chaosManagerAddress || 'Not deployed'
}))

// Network info from environment
const networkInfo = computed(() => ({
  name: config.public.somniaChainName || 'Localhost (Hardhat)',
  chainId: config.public.somniaChainId || '0x539 (1337)',
  rpcUrl: config.public.somniaRpcUrl || 'http://localhost:8545'
}))

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
</script>
