<template>
  <Transition
    enter-active-class="duration-300 ease-out"
    enter-from-class="transform scale-95 opacity-0"
    enter-to-class="transform scale-100 opacity-100"
    leave-active-class="duration-200 ease-in"
    leave-from-class="transform scale-100 opacity-100"
    leave-to-class="transform scale-95 opacity-0"
  >
    <div
      v-if="show"
      :key="panelKey"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
      @click.self="$emit('close')"
    >
      <div class="w-full max-w-xl mx-4 bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl shadow-2xl border border-cyan-500/30 overflow-hidden">
        <!-- Header -->
        <div class="bg-gradient-to-r from-cyan-600 to-blue-600 p-4 text-center">
          <h2 class="text-xl font-bold text-white mb-1">🏁 Race Results</h2>
          <p class="text-cyan-100 text-sm">Race #{{ raceResults?.raceId || 'Loading...' }}</p>
        </div>

        <!-- Content -->
        <div class="p-4 space-y-3">
          <!-- Player Result & Earnings -->
          <div v-if="raceResults" class="bg-gray-700/50 rounded-lg p-3 border border-gray-600">
            <div class="flex items-center justify-between mb-2">
              <div class="flex items-center space-x-2">
                <div class="w-8 h-8 rounded-full flex items-center justify-center text-lg"
                     :style="{ backgroundColor: getShipColor(raceResults.playerShip) }">
                  🚀
                </div>
                <div>
                  <h3 class="text-sm font-bold text-white">{{ getShipName(raceResults.playerShip) }}</h3>
                  <p class="text-gray-400 text-xs">Your Ship</p>
                </div>
              </div>
              <div class="text-right">
                <div class="text-lg font-bold" :class="raceResults.placement === 1 ? 'text-yellow-400' : 'text-gray-300'">
                  {{ getPlaceEmoji(raceResults.placement) }} {{ getPlaceText(raceResults.placement) }}
                </div>
                <p class="text-xs text-gray-400">Final Position</p>
              </div>
            </div>

            <!-- Earnings -->
            <div class="bg-gray-800/50 rounded-lg p-2 border border-gray-600">
              <div class="grid grid-cols-2 gap-2 mb-2">
                <div>
                  <p class="text-gray-400 text-xs">Bet Amount</p>
                  <SpiralToken :amount="raceResults.betAmount || '0'" color="default" size="sm" />
                </div>
                <div class="text-right">
                  <p class="text-gray-400 text-xs">Total Payout</p>
                  <SpiralToken :amount="raceResults.totalPayout || '0'" color="green" size="sm" />
                </div>
              </div>
              
              <!-- Net Earnings -->
              <div class="border-t border-gray-600 pt-2">
                <div class="flex items-center justify-between">
                  <p class="text-gray-400 text-xs">Net Earnings</p>
                  <SpiralToken :amount="`${parseFloat(playerEarnings) > 0 ? '+' : ''}${parseFloat(playerEarnings).toFixed(4)}`" :color="parseFloat(playerEarnings) > 0 ? 'green' : parseFloat(playerEarnings) < 0 ? 'red' : 'default'" size="sm" />
                </div>
              </div>
              
              <!-- Jackpot Display -->
              <div v-if="raceResults?.jackpotTier > 0" class="mt-2 p-2 bg-gradient-to-r from-yellow-600/20 to-orange-600/20 rounded border border-yellow-500/30">
                <div class="flex items-center justify-center space-x-1">
                  <div class="text-lg">🎰</div>
                  <div class="text-center">
                    <p class="text-yellow-300 font-bold text-sm">JACKPOT HIT!</p>
                    <p class="text-xs text-yellow-200">
                      {{ raceResults.jackpotTier === 1 ? 'Mini Jackpot' : 
                         raceResults.jackpotTier === 2 ? 'Mega Jackpot' : 
                         raceResults.jackpotTier === 3 ? 'Super Jackpot' : 'Unknown Jackpot' }}
                    </p>
                    <SpiralToken :amount="`+${raceResults.jackpotAmount || '0'}`" color="yellow" size="sm" />
                  </div>
                  <div class="text-lg">🎰</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Final Standings -->
          <div class="bg-gray-700/50 rounded-lg p-3 border border-gray-600">
            <h3 class="text-sm font-bold text-white mb-2 flex items-center">
              🏆 Final Standings
            </h3>
            <div class="space-y-1">
              <div v-for="(shipId, index) in raceResults?.placements" :key="shipId" 
                   class="flex items-center justify-between p-2 rounded"
                   :class="shipId === raceResults.playerShip ? 'bg-cyan-900/30 border border-cyan-500/30' : 'bg-gray-800/30'">
                <div class="flex items-center space-x-2">
                  <div class="text-sm">{{ getPlaceEmoji(index + 1) }}</div>
                  <div class="w-6 h-6 rounded-full flex items-center justify-center text-sm"
                       :style="{ backgroundColor: getShipColor(shipId) }">
                    🚀
                  </div>
                  <div>
                    <p class="font-bold text-xs" :class="shipId === raceResults.playerShip ? 'text-cyan-400' : 'text-white'">
                      {{ getShipName(shipId) }}
                      <span v-if="shipId === raceResults.playerShip" class="text-cyan-300 text-xs">(YOU)</span>
                    </p>
                  </div>
                </div>
                <div class="text-right">
                  <p class="font-bold text-gray-300 text-xs">{{ getPlaceText(index + 1) }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Achievements -->
          <div v-if="achievementsUnlocked.length > 0" class="bg-gradient-to-r from-purple-900/30 to-pink-900/30 rounded-lg p-3 border border-purple-500/30">
            <h3 class="text-sm font-bold text-white mb-2 flex items-center">
              🏅 Achievements Unlocked!
            </h3>
            
            <!-- Achievements -->
            <div class="space-y-2">
              <div v-for="achievement in achievementsUnlocked" :key="achievement.id" 
                   class="flex items-center space-x-2 p-2 bg-purple-800/20 rounded">
                <div class="text-lg">🏅</div>
                <div class="flex-1">
                  <p class="font-bold text-purple-300 text-xs">{{ achievement.name }}</p>
                  <p class="text-xs text-purple-200">{{ achievement.description }}</p>
                </div>
                <div class="text-right">
                  <p class="text-xs text-green-400 font-bold">+{{ achievement.reward }} SPIRAL</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="bg-gray-800 p-3 flex justify-center space-x-3">
          <UButton
            @click="openRaceLog"
            class="bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-2 px-4 rounded text-sm transition-transform transform hover:scale-105"
          >
            📊 Race Log
          </UButton>
          <UButton
            @click="$emit('close')"
            class="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded text-sm transition-transform transform hover:scale-105"
          >
            Continue Racing
          </UButton>
        </div>
      </div>
    </div>
  </Transition>

  <RaceLogModal
    :show="showRaceLogModal"
    :race-log="raceLog"
    @close="closeRaceLog"
  />
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useGameStore } from '~/stores/game'
import { useWeb3 } from '~/composables/useWeb3'
import RaceLogModal from './RaceLogModal.vue'
import SpiralToken from './SpiralToken.vue'

// Props
interface Props {
  show: boolean
  raceResults: any
  playerEarnings: string
  achievementsUnlocked: any[]
  nftRewards: any[]
  panelKey: number
}

const props = defineProps<Props>()

// Emits
const emit = defineEmits<{
  close: []
}>()

// Race log functionality
const gameStore = useGameStore()
const { getShipName, getShipColor } = useWeb3()
const showRaceLogModal = ref(false)
const raceLog = computed(() => gameStore.raceLog)

const openRaceLog = () => {
  showRaceLogModal.value = true
}

const closeRaceLog = () => {
  showRaceLogModal.value = false
}

// Methods
const getPlaceText = (place: number) => {
  const suffixes = ['st', 'nd', 'rd', 'th', 'th', 'th', 'th', 'th']
  return `${place}${suffixes[Math.min(place - 1, 7)]}`
}

const getPlaceEmoji = (place: number) => {
  const emojis = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣']
  return emojis[place - 1] || '🏁'
}
</script>
