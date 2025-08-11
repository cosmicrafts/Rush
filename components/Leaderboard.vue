<template>
  <div>
    <!-- Leaderboard Button -->
    <UButton
      @click="openLeaderboards()"
      class="bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white px-3 py-1.5 rounded-sm transition-all duration-200 transform hover:scale-105 font-medium text-xs"
    >
      Leaderboard
    </UButton>

    <!-- Leaderboards Modal -->
    <Transition
      enter-active-class="transition-all duration-300 ease-out"
      enter-from-class="opacity-0 scale-95"
      enter-to-class="opacity-100 scale-100"
      leave-active-class="transition-all duration-200 ease-in"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-95"
    >
      <div
        v-if="showLeaderboardsModal"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
        @click.self="closeLeaderboards"
      >
        <div class="bg-gray-900 border border-yellow-500/30 rounded-lg p-4 max-w-4xl w-full mx-4 max-h-[80vh] overflow-y-auto">
          <div class="flex justify-between items-center mb-3">
            <h2 class="text-lg font-bold text-yellow-400">🏆 Leaderboards</h2>
            <button 
              @click="closeLeaderboards" 
              class="text-gray-400 hover:text-white text-xl"
            >
              ×
            </button>
          </div>
          
          <div v-if="loadingLeaderboards" class="text-center py-6">
            <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-yellow-400 mx-auto"></div>
            <p class="text-gray-400 mt-1 text-sm">Loading leaderboards...</p>
          </div>
          
          <div v-else-if="leaderboardData.players.length === 0" class="text-center py-6">
            <p class="text-gray-400 text-sm">No leaderboard data available</p>
          </div>
          
          <div v-else class="space-y-2">
            <div 
              v-for="(player, index) in leaderboardData.players" 
              :key="index"
              class="bg-gray-800 border border-gray-700 rounded-lg p-3 hover:bg-gray-750 cursor-pointer transition-colors"
              @click="openPlayerHistory(player, leaderboardData.usernames[index])"
            >
              <div class="flex justify-between items-center">
                <div class="flex items-center gap-3">
                  <div class="text-lg font-bold text-yellow-400">
                    #{{ index + 1 }}
                  </div>
                  <div>
                    <div class="font-semibold text-cyan-400">
                      <span class="font-mono text-xs">{{ formatAddress(player) }}</span>
                    </div>
                    <div v-if="leaderboardData.usernames[index]" class="text-purple-400 text-xs">
                      👤 {{ leaderboardData.usernames[index] }}
                    </div>
                    <div v-else class="text-gray-500 text-xs">
                      Anon
                    </div>
                  </div>
                </div>
                
                <div class="text-right">
                  <div class="text-sm font-semibold text-green-400">
                    <SpiralToken :amount="leaderboardData.winnings[index] || '0'" color="green" size="sm" />
                  </div>
                  <div class="text-xs text-gray-400">Total Winnings</div>
                </div>
              </div>
              
              <div class="text-xs text-gray-500 mt-1">
                Click to view match history
              </div>
            </div>
          </div>
          
          <div class="flex justify-center mt-4">
            <button 
              @click="closeLeaderboards" 
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

// Use the betting composable for leaderboard functionality
const {
  // State
  showLeaderboardsModal,
  leaderboardData,
  loadingLeaderboards,

  // Methods
  openLeaderboards,
  closeLeaderboards,
  openPlayerHistory,
  formatAddress,

  // Web3 state
  isConnected
} = useBetting()

// Only show the button when connected
const showLeaderboardButton = computed(() => isConnected.value)
</script>
