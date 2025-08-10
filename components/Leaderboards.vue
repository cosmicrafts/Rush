<template>
  <div class="bg-gray-800 p-4 rounded-lg border border-gray-700">
    <div class="flex justify-between items-center mb-4">
      <h2 class="text-lg font-bold text-yellow-400">🏆 Leaderboards</h2>
      <div class="flex space-x-2">
        <UButton
          @click="refreshLeaderboards"
          :loading="loading"
          size="sm"
          class="bg-yellow-600 hover:bg-yellow-700 text-white text-xs"
        >
          {{ loading ? 'Loading...' : 'Refresh' }}
        </UButton>
        <UButton
          @click="openPlayerStatistics"
          size="sm"
          class="bg-purple-600 hover:bg-purple-700 text-white text-xs"
        >
          📈 My Stats
        </UButton>
      </div>
    </div>

    <!-- Leaderboard Statistics -->
    <div v-if="leaderboardStats" class="bg-gray-700 p-3 rounded-lg mb-4">
      <div class="grid grid-cols-3 gap-4 text-center">
        <div>
          <div class="text-gray-400 text-xs">Total Players</div>
          <div class="text-white font-bold text-lg">{{ leaderboardStats.totalPlayers }}</div>
        </div>
        <div>
          <div class="text-gray-400 text-xs">Total Volume</div>
          <div class="text-cyan-400 font-bold text-lg">
            <SpiralToken :amount="leaderboardStats.totalVolume" color="cyan" size="lg" />
          </div>
        </div>
        <div>
          <div class="text-gray-400 text-xs">Jackpots Paid</div>
          <div class="text-amber-400 font-bold text-lg">
            <SpiralToken :amount="leaderboardStats.totalJackpots" color="amber" size="lg" />
          </div>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-8">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400 mx-auto"></div>
      <p class="text-gray-400 mt-2 text-sm">Loading leaderboards...</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="leaderboardData.players.length === 0" class="text-center py-8">
      <p class="text-gray-400 text-sm">No leaderboard data available</p>
      <p class="text-gray-500 text-xs mt-1">Start racing to appear on the leaderboard!</p>
    </div>

    <!-- Leaderboard List -->
    <div v-else class="space-y-2">
      <div 
        v-for="(player, index) in leaderboardData.players" 
        :key="index"
        class="bg-gray-700 border border-gray-600 rounded-lg p-3 hover:bg-gray-650 cursor-pointer transition-colors"
        @click="openPlayerHistory(player, leaderboardData.usernames[index])"
      >
        <div class="flex justify-between items-center">
          <div class="flex items-center gap-3">
            <!-- Rank Badge -->
            <div class="flex-shrink-0">
              <div 
                class="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm"
                :class="getRankBadgeClass(index + 1)"
              >
                {{ index + 1 }}
              </div>
            </div>

            <!-- Player Info -->
            <div class="flex items-center gap-2">
              <!-- Avatar -->
              <div class="flex-shrink-0">
                <div 
                  class="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
                  :class="getAvatarClass(leaderboardData.avatars[index])"
                >
                  <img 
                    v-if="leaderboardData.avatars[index] < 255" 
                    :src="`/avatars/${leaderboardData.avatars[index]}.webp`" 
                    :alt="`Avatar ${leaderboardData.avatars[index]}`"
                    class="w-full h-full rounded-full object-cover"
                    @error="handleAvatarError"
                  />
                  <img 
                    v-else 
                    src="/avatars/null.webp" 
                    alt="No Avatar"
                    class="w-full h-full rounded-full object-cover"
                  />
                </div>
              </div>

              <!-- Username and Address -->
              <div>
                <div class="font-semibold text-cyan-400 text-sm">
                  {{ getDisplayName(leaderboardData.usernames[index], player) }}
                </div>
                <div class="text-gray-400 text-xs font-mono">
                  {{ formatAddress(player) }}
                </div>
              </div>
            </div>
          </div>

          <!-- Winnings -->
                        <div class="text-right">
                <div class="text-sm font-semibold text-green-400">
                  <SpiralToken :amount="formatNumber(leaderboardData.winnings[index])" color="green" size="sm" />
                </div>
                <div class="text-xs text-gray-400">Total Winnings</div>
              </div>
        </div>

        <!-- Player Stats (if available) -->
        <div v-if="playerStats[player]" class="mt-2 pt-2 border-t border-gray-600">
          <div class="grid grid-cols-4 gap-2 text-xs">
            <div class="text-center">
              <div class="text-gray-400">Races</div>
              <div class="text-white font-semibold">{{ playerStats[player].totalRaces }}</div>
            </div>
            <div class="text-center">
              <div class="text-gray-400">1st</div>
              <div class="text-yellow-400 font-semibold">{{ playerStats[player].firstPlace }}</div>
            </div>
            <div class="text-center">
              <div class="text-gray-400">2nd</div>
              <div class="text-gray-300 font-semibold">{{ playerStats[player].secondPlace }}</div>
            </div>
            <div class="text-center">
              <div class="text-gray-400">3rd</div>
              <div class="text-amber-600 font-semibold">{{ playerStats[player].thirdPlace }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

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
          
          <div v-else-if="!currentPlayerStats" class="text-center py-6">
            <p class="text-gray-400 text-sm">No player statistics available</p>
          </div>
          
          <div v-else class="space-y-4">
            <!-- Player Info -->
            <div class="bg-gray-800 border border-gray-700 rounded-lg p-3">
              <h3 class="text-sm font-bold text-purple-300 mb-2">👤 Player Information</h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div>
                  <span class="text-gray-400">Address:</span>
                  <span class="text-cyan-400 font-mono ml-1">{{ formatAddress(currentPlayerStats.address) }}</span>
                </div>
                <div v-if="currentPlayerStats.username">
                  <span class="text-gray-400">Username:</span>
                  <span class="text-purple-400 font-semibold ml-1">{{ currentPlayerStats.username }}</span>
                </div>
                <div v-else>
                  <span class="text-gray-400">Username:</span>
                  <span class="text-orange-400 ml-1">Anon</span>
                </div>
                              <div>
                <span class="text-gray-400">Current Balance:</span>
                <SpiralToken :amount="currentPlayerStats.balance" color="green" size="sm" />
              </div>
              </div>
            </div>

            <!-- Basic Statistics -->
            <div class="bg-gray-800 border border-gray-700 rounded-lg p-3">
              <h3 class="text-sm font-bold text-purple-300 mb-2">📊 Basic Statistics</h3>
              <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div class="text-center">
                  <div class="text-gray-400 text-xs">Total Races</div>
                  <div class="text-white font-bold text-lg">{{ currentPlayerStats.totalRaces }}</div>
                </div>
                <div class="text-center">
                  <div class="text-gray-400 text-xs">Total Winnings</div>
                  <div class="text-green-400 font-bold text-lg">
                    <SpiralToken :amount="currentPlayerStats.totalWinnings" color="green" size="lg" />
                  </div>
                </div>
                <div class="text-center">
                  <div class="text-gray-400 text-xs">Biggest Win</div>
                  <div class="text-yellow-400 font-bold text-lg">
                    <SpiralToken :amount="currentPlayerStats.biggestWin" color="yellow" size="lg" />
                  </div>
                </div>
                <div class="text-center">
                  <div class="text-gray-400 text-xs">Achievement Rewards</div>
                  <div class="text-purple-400 font-bold text-lg">
                    <SpiralToken :amount="currentPlayerStats.achievementRewards" color="purple" size="lg" />
                  </div>
                </div>
              </div>
            </div>

            <!-- Ship Performance -->
            <div class="bg-gray-800 border border-gray-700 rounded-lg p-3">
              <h3 class="text-sm font-bold text-purple-300 mb-2">🚀 Ship Performance</h3>
              <div class="grid grid-cols-2 md:grid-cols-4 gap-2">
                <div 
                  v-for="(wins, shipId) in currentPlayerStats.spaceshipWins" 
                  :key="shipId"
                  class="text-center p-2 bg-gray-700 rounded"
                >
                  <div class="text-gray-400 text-xs">{{ getShipNameById(parseInt(shipId.toString())) }}</div>
                  <div class="text-white font-bold text-sm">{{ wins }} wins</div>
                </div>
              </div>
            </div>

            <!-- Achievements -->
            <div v-if="currentPlayerStats.achievementCount > 0" class="bg-gray-800 border border-gray-700 rounded-lg p-3">
              <h3 class="text-sm font-bold text-purple-300 mb-2 flex items-center">
                🏆 Achievements
                <span class="ml-auto text-xs bg-yellow-600 text-yellow-100 px-2 py-1 rounded">
                  {{ currentPlayerStats.achievementCount }} Total
                </span>
              </h3>
              <p class="text-gray-400 text-xs">
                You have unlocked {{ currentPlayerStats.achievementCount }} achievements! Check your wallet for NFT rewards.
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
import { ref, onMounted, watch } from 'vue'
import { useWeb3 } from '~/composables/useWeb3'
import SpiralToken from './SpiralToken.vue'

// Props
const props = defineProps<{
  isConnected: boolean
}>()

// Emits
const emit = defineEmits<{
  openPlayerHistory: [playerAddress: string, displayName: string]
}>()

// Web3 composable
const {
  getTopPlayersByWinnings,
  getLeaderboardStats,
  getPlayerComprehensiveStats,
  getShipName,
  formatAddress
} = useWeb3()

// State
const loading = ref(false)
const leaderboardData = ref({ players: [], usernames: [], avatars: [], winnings: [] })
const leaderboardStats = ref<any>(null)
const playerStats = ref<{ [key: string]: any }>({})
const showPlayerStatisticsModal = ref(false)
const loadingPlayerStatistics = ref(false)
const currentPlayerStats = ref<any>(null)

// Methods
const refreshLeaderboards = async () => {
  if (!props.isConnected) return
  
  loading.value = true
  try {
    // Get leaderboard data
    const data = await getTopPlayersByWinnings(20)
    leaderboardData.value = data
    
    // Get leaderboard stats
    const stats = await getLeaderboardStats()
    leaderboardStats.value = stats
    
    // Load individual player stats for top players
    await loadPlayerStats()
    
  } catch (error) {
    console.error('Failed to load leaderboards:', error)
  } finally {
    loading.value = false
  }
}

const loadPlayerStats = async () => {
  const stats: { [key: string]: any } = {}
  
  for (const player of leaderboardData.value.players) {
    try {
      const playerStat = await getPlayerComprehensiveStats(player)
      stats[player] = playerStat
    } catch (error) {
      console.error(`Failed to load stats for ${player}:`, error)
    }
  }
  
  playerStats.value = stats
}

const openPlayerHistory = (playerAddress: string, username?: string) => {
  const displayName = username || formatAddress(playerAddress)
  emit('openPlayerHistory', playerAddress, displayName)
}

const openPlayerStatistics = async () => {
  showPlayerStatisticsModal.value = true
  loadingPlayerStatistics.value = true
  
  try {
    // Get current player's comprehensive stats
    const stats = await getPlayerComprehensiveStats()
    currentPlayerStats.value = stats
  } catch (error) {
    console.error('Failed to load player statistics:', error)
  } finally {
    loadingPlayerStatistics.value = false
  }
}

const closePlayerStatistics = () => {
  showPlayerStatisticsModal.value = false
  currentPlayerStats.value = null
}

const getDisplayName = (username: string, address: string) => {
  return username || 'Anon'
}

const getRankBadgeClass = (rank: number) => {
  switch (rank) {
    case 1: return 'bg-yellow-500'
    case 2: return 'bg-gray-400'
    case 3: return 'bg-amber-600'
    default: return 'bg-gray-600'
  }
}

const getAvatarClass = (avatarId: number) => {
  if (avatarId === 255) return 'bg-gray-600'
  return 'bg-gradient-to-br from-purple-400 to-blue-500'
}

const handleAvatarError = (event: Event) => {
  const img = event.target as HTMLImageElement
  img.style.display = 'none'
  img.nextElementSibling?.classList.remove('hidden')
}

const formatNumber = (value: string | number) => {
  const num = typeof value === 'string' ? parseFloat(value) : value
  return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const getShipNameById = (shipId: number) => {
  return getShipName(shipId)
}

// Initialize
onMounted(() => {
  if (props.isConnected) {
    refreshLeaderboards()
  }
})

// Watch for connection changes
watch(() => props.isConnected, (connected) => {
  if (connected) {
    refreshLeaderboards()
  }
})
</script>
