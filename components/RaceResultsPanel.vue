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
      <div class="w-full max-w-2xl mx-4 bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-2xl border border-cyan-500/30 overflow-hidden">
        <!-- Header -->
        <div class="bg-gradient-to-r from-cyan-600 to-blue-600 p-6 text-center">
          <h2 class="text-3xl font-bold text-white mb-2">🏁 Race Results</h2>
          <p class="text-cyan-100 text-lg">Race #{{ raceResults?.raceId }}</p>
        </div>

        <!-- Content -->
        <div class="p-6 space-y-6">
          <!-- Player Result & Earnings -->
          <div v-if="raceResults" class="bg-gray-700/50 rounded-lg p-4 border border-gray-600">
            <div class="flex items-center justify-between mb-4">
              <div class="flex items-center space-x-3">
                <div class="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
                     :style="{ backgroundColor: getShipColor(raceResults.playerShip) }">
                  🚀
                </div>
                <div>
                  <h3 class="text-xl font-bold text-white">{{ getShipName(raceResults.playerShip) }}</h3>
                  <p class="text-gray-400">Your Ship</p>
                </div>
              </div>
              <div class="text-right">
                <div class="text-3xl font-bold" :class="raceResults.placement === 1 ? 'text-yellow-400' : 'text-gray-300'">
                  {{ getPlaceEmoji(raceResults.placement) }} {{ getPlaceText(raceResults.placement) }}
                </div>
                <p class="text-sm text-gray-400">Final Position</p>
              </div>
            </div>

            <!-- Earnings -->
            <div class="bg-gray-800/50 rounded-lg p-4 border border-gray-600">
              <div class="grid grid-cols-2 gap-4 mb-3">
                <div>
                  <p class="text-gray-400 text-sm">Bet Amount</p>
                  <p class="text-white font-bold">{{ raceResults.betAmount }} SPIRAL</p>
                </div>
                <div class="text-right">
                  <p class="text-gray-400 text-sm">Total Payout</p>
                  <p class="text-green-400 font-bold">{{ raceResults.totalPayout }} SPIRAL</p>
                </div>
              </div>
              
              <!-- Net Earnings -->
              <div class="border-t border-gray-600 pt-3">
                <div class="flex items-center justify-between">
                  <p class="text-gray-400 text-sm">Net Earnings</p>
                  <p class="text-2xl font-bold" :class="parseFloat(playerEarnings) > 0 ? 'text-green-400' : parseFloat(playerEarnings) < 0 ? 'text-red-400' : 'text-gray-400'">
                    {{ parseFloat(playerEarnings) > 0 ? '+' : '' }}{{ parseFloat(playerEarnings).toFixed(4) }} SPIRAL
                  </p>
                </div>
              </div>
              
              <!-- Jackpot Display -->
              <div v-if="raceResults?.jackpotTier > 0" class="mt-3 p-3 bg-gradient-to-r from-yellow-600/20 to-orange-600/20 rounded-lg border border-yellow-500/30">
                <div class="flex items-center justify-center space-x-2">
                  <div class="text-2xl">🎰</div>
                  <div class="text-center">
                    <p class="text-yellow-300 font-bold">JACKPOT HIT!</p>
                    <p class="text-sm text-yellow-200">
                      {{ raceResults.jackpotTier === 1 ? 'Mini Jackpot' : 
                         raceResults.jackpotTier === 2 ? 'Mega Jackpot' : 
                         raceResults.jackpotTier === 3 ? 'Super Jackpot' : 'Unknown Jackpot' }}
                    </p>
                    <p class="text-lg text-yellow-100 font-bold">+{{ raceResults.jackpotAmount }} SPIRAL</p>
                  </div>
                  <div class="text-2xl">🎰</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Final Standings -->
          <div class="bg-gray-700/50 rounded-lg p-4 border border-gray-600">
            <h3 class="text-lg font-bold text-white mb-4 flex items-center">
              🏆 Final Standings
            </h3>
            <div class="space-y-2">
              <div v-for="(shipId, index) in raceResults?.placements" :key="shipId" 
                   class="flex items-center justify-between p-3 rounded-lg"
                   :class="shipId === raceResults.playerShip ? 'bg-cyan-900/30 border border-cyan-500/30' : 'bg-gray-800/30'">
                <div class="flex items-center space-x-3">
                  <div class="text-2xl">{{ getPlaceEmoji(index + 1) }}</div>
                  <div class="w-8 h-8 rounded-full flex items-center justify-center text-lg"
                       :style="{ backgroundColor: getShipColor(shipId) }">
                    🚀
                  </div>
                  <div>
                    <p class="font-bold" :class="shipId === raceResults.playerShip ? 'text-cyan-400' : 'text-white'">
                      {{ getShipName(shipId) }}
                      <span v-if="shipId === raceResults.playerShip" class="text-cyan-300 text-sm">(YOU)</span>
                    </p>
                  </div>
                </div>
                <div class="text-right">
                  <p class="font-bold text-gray-300">{{ getPlaceText(index + 1) }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Achievements & NFTs -->
          <div v-if="achievementsUnlocked.length > 0 || nftRewards.length > 0" class="bg-gradient-to-r from-purple-900/30 to-pink-900/30 rounded-lg p-4 border border-purple-500/30">
            <h3 class="text-lg font-bold text-white mb-4 flex items-center">
              🏅 Achievements Unlocked!
            </h3>
            
            <!-- Achievements -->
            <div v-if="achievementsUnlocked.length > 0" class="mb-4">
              <div v-for="achievement in achievementsUnlocked" :key="achievement.id" 
                   class="flex items-center space-x-3 p-3 bg-purple-800/20 rounded-lg mb-2">
                <div class="text-2xl">🏅</div>
                <div>
                  <p class="font-bold text-purple-300">{{ achievement.name }}</p>
                  <p class="text-sm text-purple-200">{{ achievement.description }}</p>
                </div>
              </div>
            </div>

            <!-- NFT Rewards -->
            <div v-if="nftRewards.length > 0">
              <h4 class="text-md font-bold text-pink-300 mb-2">🎨 NFT Rewards:</h4>
              <div class="grid grid-cols-2 gap-2">
                <div v-for="nft in nftRewards" :key="nft.id" 
                     class="bg-pink-800/20 rounded-lg p-3 text-center">
                  <div class="text-3xl mb-2">🖼️</div>
                  <p class="text-sm font-bold text-pink-300">{{ nft.name }}</p>
                  <p class="text-xs text-pink-200">Token #{{ nft.tokenId }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="bg-gray-800 p-4 flex justify-center">
          <UButton
            @click="$emit('close')"
            class="bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-3 px-8 rounded-lg shadow-lg transition-transform transform hover:scale-105"
          >
            Continue Racing
          </UButton>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { computed } from 'vue'

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

// Methods
const getShipColor = (contractShipId: number) => {
  const contractToShipColor = [
    '#34d399', // Contract ID 0 = Comet (green)
    '#f87171', // Contract ID 1 = Juggernaut (red)  
    '#a78bfa', // Contract ID 2 = Shadow (purple)
    '#60a5fa', // Contract ID 3 = Phantom (blue)
    '#facc15', // Contract ID 4 = Phoenix (yellow)
    '#f3f4f6', // Contract ID 5 = Vanguard (gray)
    '#fb923c', // Contract ID 6 = Wildcard (orange)
    '#ec4899'  // Contract ID 7 = Apex (pink)
  ]
  
  return contractToShipColor[contractShipId] || '#ffffff'
}

const getShipName = (contractShipId: number) => {
  const contractToShipName = [
    'The Comet',      // Contract ID 0 = Comet
    'The Juggernaut', // Contract ID 1 = Juggernaut  
    'The Shadow',     // Contract ID 2 = Shadow
    'The Phantom',    // Contract ID 3 = Phantom
    'The Phoenix',    // Contract ID 4 = Phoenix
    'The Vanguard',   // Contract ID 5 = Vanguard
    'The Wildcard',   // Contract ID 6 = Wildcard
    'The Apex'        // Contract ID 7 = Apex
  ]
  
  return contractToShipName[contractShipId] || 'Unknown'
}

const getPlaceText = (place: number) => {
  const suffixes = ['st', 'nd', 'rd', 'th', 'th', 'th', 'th', 'th']
  return `${place}${suffixes[Math.min(place - 1, 7)]}`
}

const getPlaceEmoji = (place: number) => {
  const emojis = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣']
  return emojis[place - 1] || '🏁'
}
</script>
