<template>
  <div>
    <!-- Match History Button -->
    <button
      @click="openMatchHistory()"
      class="cosmic-hover text-white hover:text-cyan-400 transition-colors font-medium text-sm"
    >
      History
    </button>

    <!-- Match History Modal -->
    <Transition
      enter-active-class="transition-all duration-300 ease-out"
      enter-from-class="opacity-0 scale-95"
      enter-to-class="opacity-100 scale-100"
      leave-active-class="transition-all duration-200 ease-in"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-95"
    >
      <div
        v-if="showMatchHistoryModal"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
        @click.self="closeMatchHistory"
      >
        <div class="bg-gray-900 border border-purple-500/30 rounded-lg p-4 max-w-4xl w-full mx-4 max-h-[80vh] overflow-y-auto">
          <div class="flex justify-between items-center mb-3">
            <h2 class="text-lg font-bold text-purple-400">
              📊 Match History 
              <span v-if="selectedPlayerForHistory" class="text-cyan-400">
                - {{ selectedPlayerForHistory }}
              </span>
            </h2>
            <button 
              @click="closeMatchHistory" 
              class="text-gray-400 hover:text-white text-xl"
            >
              ×
            </button>
          </div>
          
          <div v-if="loadingMatchHistory" class="text-center py-6">
            <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-400 mx-auto"></div>
            <p class="text-gray-400 mt-1 text-sm">Loading match history...</p>
          </div>
          
          <div v-else-if="matchHistory.length === 0" class="text-center py-6">
            <p class="text-gray-400 text-sm">No matches found</p>
          </div>
          
          <div v-else class="space-y-2">
            <div 
              v-for="(match, index) in matchHistory" 
              :key="index"
              class="bg-gray-800 border border-gray-700 rounded-lg p-3"
            >
              <div class="flex justify-between items-start">
                <div class="flex-1">
                  <div class="flex items-center gap-3 mb-1">
                    <span class="text-purple-400 font-semibold text-sm">Race #{{ match.raceId }}</span>
                    <span class="text-gray-400 text-xs">{{ formatDate(match.timestamp) }}</span>
                  </div>
                  
                  <div class="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                    <div class="flex items-center gap-2">
                      <span class="text-gray-400">Ship:</span>
                      <img 
                        :src="`/ships/${getShipImageName(getShipNameById(match.shipBet))}.webp`"
                        :alt="getShipNameById(match.shipBet)"
                        class="w-4 h-4 object-contain"
                      />
                      <span class="text-cyan-400">{{ getShipNameById(match.shipBet) }}</span>
                    </div>
                    <div>
                      <span class="text-gray-400">Bet:</span>
                      <SpiralToken :amount="match.betAmount" color="yellow" size="sm" />
                    </div>
                    <div>
                      <span class="text-gray-400">Position:</span>
                      <span :class="getPlacementColor(match.placement)" class="ml-1">
                        {{ getPlacementText(match.placement) }}
                      </span>
                    </div>
                    <div>
                      <span class="text-gray-400">Payout:</span>
                      <SpiralToken :amount="match.payout" :color="match.payout > match.betAmount ? 'green' : 'red'" size="sm" />
                    </div>
                  </div>
                  
                  <div v-if="match.jackpotTier > 0" class="mt-1 text-xs">
                    <span class="text-amber-400">🎰 Jackpot Hit!</span>
                    <span class="text-gray-400">Tier {{ match.jackpotTier }}:</span>
                    <SpiralToken :amount="match.jackpotAmount" color="amber" size="sm" />
                  </div>
                </div>
                
                <div class="text-right">
                  <div class="text-sm font-semibold">
                    <span :class="(match.payout + match.jackpotAmount) > match.betAmount ? 'text-green-400' : 'text-red-400'">
                      {{ (match.payout + match.jackpotAmount) > match.betAmount ? '+' : '' }}{{ ((match.payout + match.jackpotAmount) - match.betAmount).toFixed(4) }}
                    </span>
                  </div>
                  <div class="text-xs text-gray-400">Net P&L</div>
                </div>
              </div>
            </div>
          </div>
          
          <div class="flex justify-center mt-4">
            <button 
              @click="closeMatchHistory" 
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
import { ref, computed } from 'vue'
import { useBetting } from '~/composables/useBetting'
import SpiralToken from './SpiralToken.vue'

// Use the betting composable for history functionality
const {
  // State
  showMatchHistoryModal,
  matchHistory,
  loadingMatchHistory,
  selectedPlayerForHistory,

  // Methods
  openMatchHistory,
  closeMatchHistory,
  formatAddress,
  formatDate,
  getPlacementText,
  getPlacementColor,
  getShipNameById,

  // Web3 state
  isConnected
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
const showHistoryButton = computed(() => isConnected.value)
</script>
