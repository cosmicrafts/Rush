<template>
  <div>
    <!-- Match History Button -->
    <button
      @click="openMatchHistory()"
      class="cosmic-hover text-white hover:text-cyan-400 transition-colors font-medium text-responsive-sm"
    >
      History
    </button>

    <!-- Match History Modal -->
    <Transition
      enter-active-class="duration-500 ease-out"
      enter-from-class="transform scale-95 opacity-0"
      enter-to-class="transform scale-100 opacity-100"
      leave-active-class="duration-300 ease-in"
      leave-from-class="transform scale-100 opacity-100"
      leave-to-class="transform scale-95 opacity-0"
    >
      <div
        v-if="showMatchHistoryModal"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-lg p-responsive"
        @click.self="closeMatchHistory"
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
          <div class="absolute top-1/3 left-1/6 text-pink-500 text-responsive-xs animate-pulse">+</div>
          <div class="absolute bottom-1/3 right-1/6 text-cyan-400 text-responsive-xs animate-ping">+</div>
          <div class="absolute top-2/3 left-2/3 text-pink-500 text-responsive-xs animate-bounce">+</div>
        </div>

        <div class="relative w-full max-w-5xl mx-auto card-responsive shadow-2xl overflow-hidden backdrop-blur-sm">
          <!-- Enhanced glowing border effect with COSMIC RUSH colors -->
          <div class="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-purple-500/20 blur-2xl"></div>
          
          <!-- Header with COSMIC RUSH theme -->
          <div class="relative p-responsive text-center border-b border-purple-500/20">
            <h2 class="text-responsive-xl font-extrabold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent tracking-tight">
              📊 Match History 
              <span v-if="selectedPlayerForHistory" class="text-cyan-400">
                - {{ selectedPlayerForHistory }}
              </span>
            </h2>
            <button 
              @click="closeMatchHistory" 
              class="absolute top-4 right-4 text-gray-400 hover:text-white text-2xl transition-colors"
            >
              ×
            </button>
          </div>

          
          <!-- Content -->
          <div class="relative p-responsive space-responsive max-h-[70vh] overflow-y-auto">
            <div v-if="loadingMatchHistory" class="text-center py-6">
              <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400 mx-auto"></div>
              <p class="text-gray-400 mt-2 text-responsive-base">Loading match history...</p>
            </div>
          
          <div v-else-if="matchHistory.length === 0" class="text-center py-6">
            <p class="text-gray-400 text-responsive-base">No matches found</p>
          </div>
          
          <div v-else class="space-responsive">
            <div 
              v-for="(match, index) in matchHistory" 
              :key="index"
              class="card-responsive"
            >
              <div class="flex justify-between items-start">
                <div class="flex-1">
                  <div class="flex items-center gap-3 mb-2">
                    <span class="text-purple-400 font-semibold text-responsive-base">Race #{{ match.raceId }}</span>
                    <span class="text-gray-400 text-responsive-sm">{{ formatDate(match.timestamp) }}</span>
                  </div>
                  
                  <div class="responsive-grid gap-responsive text-responsive-sm">
                    <div class="flex items-center gap-2">
                      <span class="text-gray-400">Ship:</span>
                      <img 
                        :src="`/ships/${getShipImageName(getShipNameById(match.shipBet))}.webp`"
                        :alt="getShipNameById(match.shipBet)"
                        class="w-6 h-6 object-contain"
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
        </div>
          
          <!-- Footer with COSMIC RUSH themed button -->
          <div class="relative bg-gradient-to-t from-black/50 to-transparent p-6 border-t border-purple-500/20">
            <div class="flex justify-center">
              <button 
                @click="closeMatchHistory" 
                class="bg-gradient-to-r from-purple-400 to-pink-500 hover:from-purple-500 hover:to-pink-600 text-white font-bold py-3 px-8 rounded-sm shadow-lg shadow-purple-400/25 transition-all duration-200 transform hover:scale-105"
              >
                <span class="flex items-center justify-center space-x-2">
                  <span>📊</span>
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
import { ref, computed } from 'vue'
import { useBetting } from '~/composables/useBetting'
import { useShips } from '~/composables/useShips'
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

// Use the unified ships composable
const { getShipImageName } = useShips()

// Only show the button when connected
const showHistoryButton = computed(() => isConnected.value)
</script>
