<template>
  <div>
    <!-- Contracts Modal -->
    <Transition
      enter-active-class="duration-500 ease-out"
      enter-from-class="transform scale-95 opacity-0"
      enter-to-class="transform scale-100 opacity-100"
      leave-active-class="duration-300 ease-in"
      leave-from-class="transform scale-100 opacity-100"
      leave-to-class="transform scale-95 opacity-0"
    >
      <div
        v-if="show"
        class="fixed inset-0 z-[60] flex items-center justify-center bg-black/25 backdrop-blur-sm px-4"
        @click.self="$emit('close')"
      >
        <!-- Enhanced animated background particles with COSMIC RUSH theme -->
        <div class="absolute inset-0 overflow-hidden pointer-events-none">
          <div
            class="absolute top-1/4 left-1/4 w-3 h-3 bg-cyan-400 rounded-full animate-pulse opacity-60 blur-sm shadow-lg shadow-cyan-400/50"
          />
          <div
            class="absolute top-3/4 right-1/4 w-2 h-2 bg-pink-500 rounded-full animate-ping opacity-50 shadow-lg shadow-pink-500/50"
          />
          <div
            class="absolute bottom-1/4 left-1/3 w-2 h-2 bg-cyan-400 rounded-full animate-bounce opacity-60 shadow-lg shadow-cyan-400/50"
          />
          <div
            class="absolute top-1/2 right-1/3 w-1 h-1 bg-pink-500 rounded-full animate-pulse opacity-40 shadow-lg shadow-pink-500/50"
          />
          <div
            class="absolute bottom-1/3 right-1/4 w-1.5 h-1.5 bg-cyan-400 rounded-full animate-ping opacity-30 shadow-lg shadow-cyan-400/50"
          />

          <!-- Circuit board lines -->
          <div
            class="absolute top-1/4 left-0 w-32 h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-30"
          />
          <div
            class="absolute bottom-1/4 right-0 w-32 h-px bg-gradient-to-l from-transparent via-pink-500 to-transparent opacity-30"
          />
          <div
            class="absolute top-0 left-1/3 w-px h-32 bg-gradient-to-b from-transparent via-cyan-400 to-transparent opacity-30"
          />
          <div
            class="absolute bottom-0 right-1/3 w-px h-32 bg-gradient-to-t from-transparent via-pink-500 to-transparent opacity-30"
          />

          <!-- Scattered plus signs -->
          <div class="absolute top-1/3 left-1/6 text-pink-500 text-xs animate-pulse">+</div>
          <div class="absolute bottom-1/3 right-1/6 text-cyan-400 text-xs animate-ping">+</div>
          <div class="absolute top-2/3 left-2/3 text-pink-500 text-xs animate-bounce">+</div>
        </div>

        <div
          class="relative w-full max-w-2xl mx-auto bg-gradient-to-tr from-gray-900 via-black to-gray-900 shadow-2xl border border-blue-500/30 overflow-hidden backdrop-blur-sm"
        >
          <!-- Enhanced glowing border effect with COSMIC RUSH colors -->
          <div
            class="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-pink-500/20 to-blue-500/20 blur-2xl"
          />

          <!-- Header with COSMIC RUSH theme -->
          <div class="relative p-6 text-center border-b border-blue-500/20">
            <h2
              class="text-2xl font-extrabold bg-gradient-to-r from-blue-400 to-pink-500 bg-clip-text text-transparent tracking-tight"
            >
              📋 Contract Addresses
            </h2>
            <button
              class="absolute top-4 right-4 text-gray-400 hover:text-white text-xl transition-colors"
              @click="$emit('close')"
            >
              ×
            </button>
          </div>

          <!-- Content -->
          <div class="relative p-6 space-y-6 max-h-[60vh] overflow-y-auto">
            <div class="space-y-4">
              <div class="bg-gray-800 border border-gray-700 rounded-lg p-4">
                <h3 class="text-sm font-bold text-blue-300 mb-2">🚀 Main Contract</h3>
                <div class="flex items-center justify-between">
                  <span class="text-gray-400 text-sm">SpaceshipRace:</span>
                  <div class="flex items-center gap-2">
                    <span class="text-cyan-400 text-sm">{{
                      contractAddresses.SpaceshipRace
                    }}</span>
                    <button
                      class="text-gray-400 hover:text-white text-xs"
                      title="Copy address"
                      @click="copyToClipboard(contractAddresses.SpaceshipRace)"
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
                    <span class="text-green-400 text-sm">{{
                      contractAddresses.SpiralToken
                    }}</span>
                    <button
                      class="text-gray-400 hover:text-white text-xs"
                      title="Copy address"
                      @click="copyToClipboard(contractAddresses.SpiralToken)"
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
                    <span class="text-purple-400 text-sm">{{
                      contractAddresses.AchievementNFT
                    }}</span>
                    <button
                      class="text-gray-400 hover:text-white text-xs"
                      title="Copy address"
                      @click="copyToClipboard(contractAddresses.AchievementNFT)"
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
                      <span class="text-yellow-400 text-sm">{{
                        contractAddresses.ShipConfiguration
                      }}</span>
                      <button
                        class="text-gray-400 hover:text-white text-xs"
                        title="Copy address"
                        @click="copyToClipboard(contractAddresses.ShipConfiguration)"
                      >
                        📋
                      </button>
                    </div>
                  </div>
                  <div class="flex items-center justify-between">
                    <span class="text-gray-400 text-sm">ChaosManager:</span>
                    <div class="flex items-center gap-2">
                      <span class="text-yellow-400 text-sm">{{
                        contractAddresses.ChaosManager
                      }}</span>
                      <button
                        class="text-gray-400 hover:text-white text-xs"
                        title="Copy address"
                        @click="copyToClipboard(contractAddresses.ChaosManager)"
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
          </div>

          <!-- Footer with COSMIC RUSH themed button -->
          <div
            class="relative bg-gradient-to-t from-black/50 to-transparent p-6 border-t border-blue-500/20"
          >
            <div class="flex justify-center">
              <button
                class="bg-gradient-to-r from-blue-400 to-pink-500 hover:from-blue-500 hover:to-pink-600 text-white font-bold py-3 px-8 rounded-sm shadow-lg shadow-blue-400/25 transition-all duration-200 transform hover:scale-102"
                @click="$emit('close')"
              >
                <span class="flex items-center justify-center space-x-2">
                  <span>📋</span>
                  <span>Close</span>
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue'

  // Get contract addresses from runtime config
  const config = useRuntimeConfig()

  // Props
  interface Props {
    show: boolean
  }

  defineProps<Props>()

  // Emits
  defineEmits<{
    close: []
  }>()

  // Contract addresses from environment
  const contractAddresses = computed(() => ({
    SpaceshipRace: config.public.spaceshipRaceAddress || 'Not deployed',
    SpiralToken: config.public.spiralTokenAddress || 'Not deployed',
    AchievementNFT: config.public.achievementNFTAddress || 'Not deployed',
    ShipConfiguration: config.public.shipConfigurationAddress || 'Not deployed',
    ChaosManager: config.public.chaosManagerAddress || 'Not deployed',
  }))

  // Network info from environment
  const networkInfo = computed(() => ({
    name: config.public.somniaChainName || 'Localhost (Hardhat)',
    chainId: config.public.somniaChainId || '0x539 (1337)',
    rpcUrl: config.public.somniaRpcUrl || 'http://localhost:8545',
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
