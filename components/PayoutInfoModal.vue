<template>
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
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-lg px-4"
      @click.self="$emit('close')"
    >
      <div class="relative w-full max-w-4xl mx-auto bg-gradient-to-tr from-gray-900 via-black to-gray-900 shadow-2xl border border-cyan-500/30 overflow-hidden backdrop-blur-sm">
        <!-- Enhanced glowing border effect with COSMIC RUSH colors -->
        <div class="absolute inset-0 bg-gradient-to-r from-cyan-500/20 via-pink-500/20 to-cyan-500/20 blur-2xl"></div>
        
        <!-- Header with COSMIC RUSH theme -->
        <div class="relative p-6 text-center border-b border-cyan-500/20">
          <h2 class="text-2xl font-extrabold bg-gradient-to-r from-cyan-400 to-pink-500 bg-clip-text text-transparent tracking-tight">
            💰 Payout Information
          </h2>
          <button 
            @click="$emit('close')" 
            class="absolute top-4 right-4 text-gray-400 hover:text-white text-xl transition-colors"
          >
            ×
          </button>
        </div>
        
        <!-- Content -->
        <div class="relative p-6 space-y-6 max-h-[60vh] overflow-y-auto">
          <div class="space-y-6">
          <!-- Payout Structure -->
          <div class="bg-gray-800 border border-gray-700 rounded-lg p-4">
            <h3 class="text-sm font-bold text-purple-300 mb-3">🏆 Race Payouts</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div class="flex items-center justify-between p-2 bg-gray-700 rounded">
                <div class="flex items-center gap-2">
                  <span class="text-yellow-400">🥇</span>
                  <span class="text-gray-300">1st Place</span>
                </div>
                <span class="text-green-400 font-bold">4X Bet</span>
              </div>
              <div class="flex items-center justify-between p-2 bg-gray-700 rounded">
                <div class="flex items-center gap-2">
                  <span class="text-gray-400">🥈</span>
                  <span class="text-gray-300">2nd Place</span>
                </div>
                <span class="text-green-400 font-bold">2X Bet</span>
              </div>
              <div class="flex items-center justify-between p-2 bg-gray-700 rounded">
                <div class="flex items-center gap-2">
                  <span class="text-amber-600">🥉</span>
                  <span class="text-gray-300">3rd Place</span>
                </div>
                <span class="text-gray-400 font-bold">1X Bet</span>
              </div>
              <div class="flex items-center justify-between p-2 bg-gray-700 rounded">
                <div class="flex items-center gap-2">
                  <span class="text-gray-500">4️⃣</span>
                  <span class="text-gray-300">4th Place</span>
                </div>
                <span class="text-red-400 font-bold">0.5X Bet</span>
              </div>
              <div class="flex items-center justify-between p-2 bg-gray-700 rounded">
                <div class="flex items-center gap-2">
                  <span class="text-gray-500">5️⃣</span>
                  <span class="text-gray-300">5th Place</span>
                </div>
                <span class="text-red-400 font-bold">0.35X Bet</span>
              </div>
              <div class="flex items-center justify-between p-2 bg-gray-700 rounded">
                <div class="flex items-center gap-2">
                  <span class="text-gray-500">6️⃣</span>
                  <span class="text-gray-300">6th Place</span>
                </div>
                <span class="text-red-400 font-bold">0.25X Bet</span>
              </div>
              <div class="flex items-center justify-between p-2 bg-gray-700 rounded">
                <div class="flex items-center gap-2">
                  <span class="text-gray-500">7️⃣</span>
                  <span class="text-gray-300">7th Place</span>
                </div>
                <span class="text-red-400 font-bold">0.1X Bet</span>
              </div>
              <div class="flex items-center justify-between p-2 bg-gray-700 rounded">
                <div class="flex items-center gap-2">
                  <span class="text-gray-500">8️⃣</span>
                  <span class="text-gray-300">8th Place</span>
                </div>
                <span class="text-red-400 font-bold">0X Bet</span>
              </div>
            </div>
            <p class="text-gray-400 text-xs mt-2">
              * House edge: 10% of each bet goes to jackpot pools
            </p>
          </div>

          <!-- Jackpot Information -->
          <div class="bg-gray-800 border border-gray-700 rounded-lg p-4">
            <h3 class="text-sm font-bold text-purple-300 mb-3">🎰 Jackpot System</h3>
            <p class="text-gray-300 text-sm mb-4">
              Every bet contributes to three jackpot pools. Jackpots are triggered randomly and are independent of race results.
            </p>
            
            <div class="space-y-4">
              <!-- Mini Jackpot -->
              <div class="flex items-center gap-4 p-3 bg-gray-700 rounded">
                <img 
                  src="/mini-jackpot.webp" 
                  alt="Mini Jackpot"
                  class="w-12 h-12 object-contain"
                />
                <div class="flex-1">
                  <h4 class="text-amber-400 font-bold">Mini Jackpot</h4>
                  <p class="text-gray-400 text-xs">5% chance to trigger</p>
                  <p class="text-gray-300 text-xs">10% of house edge goes to this pool</p>
                </div>
                <div class="text-right">
                  <div class="text-amber-400 font-bold text-lg">
                    <SpiralToken :amount="jackpotAmounts.mini" color="amber" size="lg" />
                  </div>
                </div>
              </div>

              <!-- Mega Jackpot -->
              <div class="flex items-center gap-4 p-3 bg-gray-700 rounded">
                <img 
                  src="/mega-jackpot.webp" 
                  alt="Mega Jackpot"
                  class="w-12 h-12 object-contain"
                />
                <div class="flex-1">
                  <h4 class="text-orange-400 font-bold">Mega Jackpot</h4>
                  <p class="text-gray-400 text-xs">3% chance to trigger</p>
                  <p class="text-gray-300 text-xs">25% of house edge goes to this pool</p>
                </div>
                <div class="text-right">
                  <div class="text-orange-400 font-bold text-lg">
                    <SpiralToken :amount="jackpotAmounts.mega" color="amber" size="lg" />
                  </div>
                </div>
              </div>

              <!-- Super Jackpot -->
              <div class="flex items-center gap-4 p-3 bg-gray-700 rounded">
                <img 
                  src="/super-jackpot.webp" 
                  alt="Super Jackpot"
                  class="w-12 h-12 object-contain"
                />
                <div class="flex-1">
                  <h4 class="text-red-400 font-bold">Super Jackpot</h4>
                  <p class="text-gray-400 text-xs">1% chance to trigger</p>
                  <p class="text-gray-300 text-xs">65% of house edge goes to this pool</p>
                </div>
                <div class="text-right">
                  <div class="text-red-400 font-bold text-lg">
                    <SpiralToken :amount="jackpotAmounts.super" color="red" size="lg" />
                  </div>
                </div>
              </div>
            </div>

            <div class="mt-4 p-3 bg-blue-900/20 border border-blue-500/30 rounded">
              <h4 class="text-blue-400 font-bold text-sm mb-2">💡 How Jackpots Work</h4>
              <ul class="text-gray-300 text-xs space-y-1">
                <li>• Jackpots are triggered randomly on every bet</li>
                <li>• Multiple jackpots can be won in a single race</li>
                <li>• Jackpot amounts are paid out immediately</li>
                <li>• Hit jackpots are reset to 0 and start accumulating again</li>
                <li>• Jackpot chances are independent of race placement</li>
              </ul>
            </div>
          </div>

          <!-- Betting Limits -->
          <div class="bg-gray-800 border border-gray-700 rounded-lg p-4">
            <h3 class="text-sm font-bold text-purple-300 mb-3">📊 Betting Limits</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div class="flex items-center justify-between p-2 bg-gray-700 rounded">
                <span class="text-gray-300">Minimum Bet:</span>
                <SpiralToken :amount="10" color="green" size="sm" />
              </div>
              <div class="flex items-center justify-between p-2 bg-gray-700 rounded">
                <span class="text-gray-300">Maximum Bet:</span>
                <SpiralToken :amount="1000" color="red" size="sm" />
              </div>
            </div>
          </div>
        </div>
        </div>
        
        <!-- Footer with COSMIC RUSH themed button -->
        <div class="relative bg-gradient-to-t from-black/50 to-transparent p-6 border-t border-cyan-500/20">
          <div class="flex justify-center">
            <button 
              @click="$emit('close')" 
              class="bg-gradient-to-r from-cyan-400 to-pink-500 hover:from-cyan-500 hover:to-pink-600 text-white font-bold py-3 px-8 rounded-sm shadow-lg shadow-cyan-400/25 transition-all duration-200 transform hover:scale-105"
            >
              <span class="flex items-center justify-center space-x-2">
                <span>💰</span>
                <span>Close</span>
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { useBetting } from '~/composables/useBetting'
import SpiralToken from './SpiralToken.vue'

// Props
interface Props {
  show: boolean
}

defineProps<Props>()

// Define emits
defineEmits<{
  close: []
}>()

// Use the betting composable for jackpot data
const {
  // State
  jackpotAmounts
} = useBetting()
</script>
