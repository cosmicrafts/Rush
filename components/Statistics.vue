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
      enter-active-class="transition-all duration-300 ease-out"
      enter-from-class="opacity-0 scale-95"
      enter-to-class="opacity-100 scale-100"
      leave-active-class="transition-all duration-200 ease-in"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-95"
    >
      <div
        v-if="showPlayerStatisticsModal"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
        @click.self="closePlayerStatistics"
      >
        <div class="bg-gray-900 border border-purple-500/30 rounded-lg p-4 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
          <div class="flex justify-between items-center mb-3">
            <h2 class="text-lg font-bold text-purple-400">📈 Player Statistics</h2>
            <button 
              @click="closePlayerStatistics" 
              class="text-gray-400 hover:text-white text-xl"
            >
              ×
            </button>
          </div>
          
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
          
          <div class="flex justify-center mt-4">
            <button 
              @click="closePlayerStatistics" 
              class="bg-gray-700 hover:bg-gray-600 text-white px-4 py-1 rounded text-sm transition-colors"
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

// Only show the button when connected
const showStatisticsButton = computed(() => isConnected.value)
</script>
