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
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/25 backdrop-blur-sm p-responsive-lg"
      @click.self="$emit('close')"
    >
      <div
        class="w-full max-w-sm max-h-[90vh] bg-gray-900 rounded-lg shadow-2xl overflow-hidden flex flex-col"
      >
        <!-- Compact Header -->
        <div class="bg-gradient-to-r from-cyan-600 to-blue-600 p-2 text-center flex-shrink-0">
          <h2 class="text-sm font-bold text-white">
            🏁 Race #{{ raceResults?.raceId || 'Loading...' }}
          </h2>
        </div>

        <!-- Scrollable Content -->
        <div class="flex-1 overflow-y-auto p-4 space-y-3">
          <!-- Compact Player Result & Earnings -->
          <div v-if="raceResults" class="bg-gray-800/50 rounded-lg p-3 border border-gray-600">
            <div class="flex items-center justify-between mb-2">
              <div class="flex items-center space-x-2">
                <img
                  :src="`/ships/${getShipImageName(getShipName(raceResults.playerShip))}.webp`"
                  :alt="getShipName(raceResults.playerShip)"
                  class="w-8 h-8 object-contain"
                >
                <div>
                  <h3 class="text-sm font-bold text-white">
                    {{ getShipName(raceResults.playerShip) }}
                  </h3>
                  <p class="text-xs text-gray-400">Your Ship</p>
                </div>
              </div>
              <div class="text-right">
                <div
                  class="text-2xl font-bold"
                  :class="raceResults.placement === 1 ? 'text-yellow-400' : 'text-gray-300'"
                >
                  {{ getPlaceEmoji(raceResults.placement) }}
                </div>
              </div>
            </div>

            <!-- Compact Earnings -->
            <div class="space-y-2 text-xs">
              <div class="grid grid-cols-2 gap-2">
                <div>
                  <p class="text-gray-400">Bet</p>
                  <SpiralToken :amount="raceResults.betAmount || '0'" color="default" size="sm" />
                </div>
                <div class="text-right">
                  <p class="text-gray-400">Payout</p>
                  <SpiralToken :amount="raceResults.totalPayout || '0'" color="green" size="sm" />
                </div>
              </div>
              <div class="border-t border-gray-600 pt-2">
                <div class="flex items-center justify-between">
                  <p class="text-gray-400">Net Earnings</p>
                  <SpiralToken
                    :amount="`${parseFloat(playerEarnings) > 0 ? '+' : ''}${parseFloat(playerEarnings).toFixed(4)}`"
                    :color="
                      parseFloat(playerEarnings) > 0
                        ? 'green'
                        : parseFloat(playerEarnings) < 0
                          ? 'red'
                          : 'default'
                    "
                    size="sm"
                  />
                </div>
              </div>
            </div>

            <!-- Compact Jackpot Display -->
            <div
              v-if="raceResults?.jackpotTier > 0"
              class="mt-2 p-2 bg-gradient-to-r from-yellow-600/20 to-orange-600/20 rounded border border-yellow-500/30"
            >
              <div class="flex items-center justify-center space-x-2">
                <div class="text-sm">🎰</div>
                <div class="text-center">
                  <p class="text-yellow-300 font-bold text-xs">JACKPOT!</p>
                  <p class="text-xs text-yellow-200">
                    {{
                      raceResults.jackpotTier === 1
                        ? 'Mini'
                        : raceResults.jackpotTier === 2
                          ? 'Mega'
                          : raceResults.jackpotTier === 3
                            ? 'Super'
                            : 'Unknown'
                    }}
                  </p>
                  <SpiralToken
                    :amount="`+${raceResults.jackpotAmount || '0'}`"
                    color="yellow"
                    size="sm"
                  />
                </div>
                <div class="text-sm">🎰</div>
              </div>
            </div>
          </div>

          <!-- Compact Final Standings -->
          <div class="bg-gray-800/30 rounded-lg p-3">
            <h3 class="text-md font-bold text-white mb-2 flex items-center">🏆 Final Standings</h3>
            <div class="space-y-1">
              <div
                v-for="(shipId, index) in raceResults?.placements"
                :key="shipId"
                class="flex items-center justify-between p-1 rounded text-sm"
                :class="
                  shipId === raceResults.playerShip
                    ? 'bg-cyan-900/30 border border-cyan-500/30'
                    : 'bg-gray-800/30'
                "
              >
                <div class="flex items-center space-x-1">
                  <div class="text-xs">{{ getPlaceEmoji(index + 1) }}</div>
                  <img
                    :src="`/ships/${getShipImageName(getShipName(shipId))}.webp`"
                    :alt="getShipName(shipId)"
                    class="w-4 h-4 object-contain"
                  >
                  <span
                    class="font-bold"
                    :class="shipId === raceResults.playerShip ? 'text-cyan-400' : 'text-white'"
                  >
                    {{ getShipName(shipId).replace('The ', '') }}
                    <span v-if="shipId === raceResults.playerShip" class="text-cyan-300"
                      >(YOU)</span
                    >
                  </span>
                </div>
                <div class="text-right">
                  <p class="font-bold text-gray-300 text-xs">{{ getPlaceText(index + 1) }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Compact Achievements -->
          <div
            v-if="achievementsUnlocked.length > 0"
            class="bg-gradient-to-r from-purple-900/30 to-pink-900/30 rounded-lg p-2 border border-purple-500/30"
          >
            <h3 class="text-xs font-bold text-white mb-1 flex items-center">
              🏅 Achievements Unlocked!
            </h3>

            <div class="space-y-1">
              <div
                v-for="achievement in achievementsUnlocked"
                :key="achievement.id"
                class="flex items-center space-x-2 p-1 bg-purple-800/20 rounded text-xs"
              >
                <div class="text-sm">🏅</div>
                <div class="flex-1">
                  <p class="font-bold text-purple-300">{{ achievement.name }}</p>
                  <p class="text-purple-200">{{ achievement.description }}</p>
                </div>
                <div class="text-right">
                  <p class="text-green-400 font-bold">+{{ achievement.reward }} SPIRAL</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Compact Footer -->
        <div class="bg-gray-800 p-3 flex justify-center space-x-3 flex-shrink-0">
          <UButton
            class="bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-1 px-3 rounded text-xs transition-transform transform hover:scale-102"
            @click="openRaceLog"
          >
            📊 Race Log
          </UButton>
          <UButton
            class="bg-gray-600 hover:bg-gray-700 text-white font-bold py-1 px-3 rounded text-xs transition-transform transform hover:scale-102"
            @click="handleClose"
          >
            Continue Racing
          </UButton>
        </div>
      </div>
    </div>
  </Transition>

  <RaceLogModal :show="showRaceLogModal" :race-log="raceLog" @close="closeRaceLog" />
</template>

<script setup lang="ts">
  import { computed, ref } from 'vue'
  import { useGameStore } from '~/stores/game'
  import { useWeb3 } from '~/composables/useWeb3'
  import { useShips } from '~/composables/useShips'
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
  const { getShipImageName } = useShips()
  const showRaceLogModal = ref(false)
  const raceLog = computed(() => gameStore.raceLog)

  const openRaceLog = () => {
    showRaceLogModal.value = true
  }

  const closeRaceLog = () => {
    showRaceLogModal.value = false
  }

  const handleClose = () => {
    console.log('Continue Racing button clicked')
    emit('close')
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
