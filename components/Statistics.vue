<template>
  <div>
    <!-- Statistics Button -->
    <button
      @click="openPlayerStatistics()"
      class="cosmic-hover text-white hover:text-cyan-400 transition-colors font-medium text-sm"
    >
      Statistics
    </button>

    <!-- Player Statistics Modal -->
    <Transition
      enter-active-class="duration-500 ease-out"
      enter-from-class="transform scale-95 opacity-0"
      enter-to-class="transform scale-100 opacity-100"
      leave-active-class="duration-300 ease-in"
      leave-from-class="transform scale-100 opacity-100"
      leave-to-class="transform scale-95 opacity-0"
    >
      <div
        v-if="showPlayerStatisticsModal"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-lg px-4"
        @click.self="closePlayerStatistics"
      >
        <!-- Enhanced animated background particles with COSMIC RUSH theme -->
        <div class="absolute inset-0 overflow-hidden">
          <div class="absolute top-1/4 left-1/4 w-3 h-3 bg-cyan-400 rounded-full animate-pulse opacity-60 blur-sm shadow-lg shadow-cyan-400/50"></div>
          <div class="absolute top-3/4 right-1/4 w-2 h-2 bg-pink-500 rounded-full animate-ping opacity-50 shadow-lg shadow-pink-500/50"></div>
          <div class="absolute bottom-1/4 left-1/3 w-2 h-2 bg-cyan-400 rounded-full animate-bounce opacity-60 shadow-lg shadow-cyan-400/50"></div>
          <div class="absolute top-1/2 right-1/3 w-1 h-1 bg-pink-500 rounded-full animate-pulse opacity-40 shadow-lg shadow-pink-500/50"></div>
          <div class="absolute bottom-1/3 right-1/4 w-1.5 h-1.5 bg-cyan-400 rounded-full animate-ping opacity-30 shadow-lg shadow-cyan-400/50"></div>
          
          <!-- Circuit board lines -->
          <div class="absolute top-1/4 left-0 w-32 h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-30"></div>
          <div class="absolute bottom-1/4 right-0 w-32 h-px bg-gradient-to-l from-transparent via-pink-500 to-transparent opacity-30"></div>
          <div class="absolute top-0 left-1/3 w-px h-32 bg-gradient-to-b from-transparent via-cyan-400 to-transparent opacity-30"></div>
          <div class="absolute bottom-0 right-1/3 w-px h-32 bg-gradient-to-t from-transparent via-pink-500 to-transparent opacity-30"></div>
          
          <!-- Scattered plus signs -->
          <div class="absolute top-1/3 left-1/6 text-pink-500 text-xs animate-pulse">+</div>
          <div class="absolute bottom-1/3 right-1/6 text-cyan-400 text-xs animate-ping">+</div>
          <div class="absolute top-2/3 left-2/3 text-pink-500 text-xs animate-bounce">+</div>
        </div>

        <div class="relative w-full max-w-2xl mx-auto bg-gradient-to-tr from-gray-900 via-black to-gray-900 shadow-2xl border border-purple-500/30 overflow-hidden backdrop-blur-sm">
          <!-- Enhanced glowing border effect with COSMIC RUSH colors -->
          <div class="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-purple-500/20 blur-2xl"></div>
          
          <!-- Header with COSMIC RUSH theme -->
          <div class="relative p-6 text-center border-b border-purple-500/20">
            <h2 class="text-2xl font-extrabold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent tracking-tight">
              📈 Player Statistics
            </h2>
            <button 
              @click="closePlayerStatistics" 
              class="absolute top-4 right-4 text-gray-400 hover:text-white text-xl transition-colors"
            >
              ×
            </button>
          </div>
          
          <!-- Content -->
          <div class="relative p-6 space-y-6 max-h-[60vh] overflow-y-auto">
            <div v-if="loadingPlayerStatistics" class="text-center py-6">
              <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-400 mx-auto"></div>
              <p class="text-gray-400 mt-1 text-sm">Loading player statistics...</p>
            </div>
          
          <div v-else-if="!playerStats" class="text-center py-6">
            <p class="text-gray-400 text-sm">No player statistics available</p>
          </div>
          
          <div v-else class="space-y-4">
            <!-- Player Info -->
            <div class="bg-gray-800 border border-gray-700 rounded-lg p-3">
              <h3 class="text-sm font-bold text-purple-300 mb-2">👤 Player Information</h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div>
                  <span class="text-gray-400">Address:</span>
                  <span class="text-cyan-400 font-mono ml-1">{{ shortAddress }}</span>
                </div>
                <div v-if="hasUsername">
                  <span class="text-gray-400">Username:</span>
                  <span class="text-purple-400 font-semibold ml-1">{{ playerUsername }}</span>
                </div>
                <div v-else>
                  <span class="text-gray-400">Username:</span>
                  <span class="text-orange-400 ml-1">Not registered</span>
                </div>
                <div>
                  <span class="text-gray-400">Current Balance:</span>
                  <SpiralToken :amount="formattedSpiralBalance.replace(' SPIRAL', '')" color="green" size="sm" />
                </div>
              </div>
            </div>

            <!-- Basic Statistics -->
            <div class="bg-gray-800 border border-gray-700 rounded-lg p-3">
              <h3 class="text-sm font-bold text-purple-300 mb-2">📊 Basic Statistics</h3>
              <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div class="text-center">
                  <div class="text-gray-400 text-xs">Total Races</div>
                  <div class="text-white font-bold text-lg">{{ playerStats.totalRaces }}</div>
                </div>
                <div class="text-center">
                  <div class="text-gray-400 text-xs">Total Winnings</div>
                  <div class="text-green-400 font-bold text-lg">
                    <SpiralToken :amount="playerStats.totalWinnings" color="green" size="lg" />
                  </div>
                </div>
                <div class="text-center">
                  <div class="text-gray-400 text-xs">Biggest Win</div>
                  <div class="text-yellow-400 font-bold text-lg">
                    <SpiralToken :amount="playerStats.biggestWin" color="yellow" size="lg" />
                  </div>
                </div>
                <div class="text-center">
                  <div class="text-gray-400 text-xs">Achievement Rewards</div>
                  <div class="text-purple-400 font-bold text-lg">
                    <SpiralToken :amount="playerStats.achievementRewards" color="purple" size="lg" />
                  </div>
                </div>
              </div>
            </div>

            <!-- Ship Performance -->
            <div class="bg-gray-800 border border-gray-700 rounded-lg p-3">
              <h3 class="text-sm font-bold text-purple-300 mb-2">🚀 Ship Performance</h3>
              <div class="grid grid-cols-2 md:grid-cols-4 gap-2">
                <div 
                  v-for="(wins, shipId) in playerStats.spaceshipWins" 
                  :key="shipId"
                  class="text-center p-2 bg-gray-700 rounded"
                >
                  <img 
                    :src="`/ships/${getShipImageName(getShipNameById(parseInt(shipId.toString())))}.webp`"
                    :alt="getShipNameById(parseInt(shipId.toString()))"
                    class="w-6 h-6 object-contain mx-auto mb-1"
                  />
                  <div class="text-gray-400 text-xs">{{ getShipNameById(parseInt(shipId.toString())) }}</div>
                  <div class="text-white font-bold text-sm">{{ wins }} wins</div>
                </div>
              </div>
            </div>

            <!-- Achievements -->
            <div v-if="achievementCount > 0" class="bg-gray-800 border border-gray-700 rounded-lg p-3">
              <h3 class="text-sm font-bold text-purple-300 mb-2 flex items-center">
                🏆 Achievements
                <span class="ml-auto text-xs bg-yellow-600 text-yellow-100 px-2 py-1 rounded">
                  {{ achievementCount }} Total
                </span>
              </h3>
              <p class="text-gray-400 text-xs">
                You have unlocked {{ achievementCount }} achievements! Check your wallet for NFT rewards.
              </p>
            </div>
          </div>
        </div>
          
          <!-- Footer with COSMIC RUSH themed button -->
          <div class="relative bg-gradient-to-t from-black/50 to-transparent p-6 border-t border-purple-500/20">
            <div class="flex justify-center">
              <button 
                @click="closePlayerStatistics" 
                class="bg-gradient-to-r from-purple-400 to-pink-500 hover:from-purple-500 hover:to-pink-600 text-white font-bold py-3 px-8 rounded-sm shadow-lg shadow-purple-400/25 transition-all duration-200 transform hover:scale-105"
              >
                <span class="flex items-center justify-center space-x-2">
                  <span>📈</span>
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
import { useBetting } from '~/composables/useBetting'
import SpiralToken from './SpiralToken.vue'

// Use the betting composable for statistics functionality
const {
  // State
  showPlayerStatisticsModal,
  loadingPlayerStatistics,
  playerStats,
  achievementCount,
  playerUsername,
  hasUsername,

  // Methods
  openPlayerStatistics,
  closePlayerStatistics,
  getShipNameById,

  // Web3 state
  isConnected,
  shortAddress,
  formattedSpiralBalance
} = useBetting()

// Function to get ship image name from ship name
const getShipImageName = (shipName: string): string => {
  const shipNameMap: { [key: string]: string } = {
    'The Comet': 'comet',
    'The Juggernaut': 'juggernaut',
    'The Shadow': 'shadow',
    'The Phantom': 'phantom',
    'The Phoenix': 'phoenix',
    'The Vanguard': 'vanguard',
    'The Wildcard': 'wildcard',
    'The Apex': 'apex'
  }
  return shipNameMap[shipName] || 'comet' // fallback to comet if not found
}

// Only show the button when connected
const showStatisticsButton = computed(() => isConnected.value)
</script>
