<template>
  <div class="card-responsive component-fit-width">
    
    <!-- Not Connected Message -->
    <div v-if="!web3IsConnected" class="layout-flex-center layout-flex-col py-responsive-xl">
      <div class="text-cyan-400 text-responsive-xl mb-responsive-sm font-bold">Welcome to RUSH!</div>
      <div class="text-gray-400 text-responsive-base">Connect your wallet to start racing!</div>
    </div>
    
    <!-- Connected User Interface -->
    <div v-else class="layout-flex-col space-responsive-sm">
      <!-- Row 1: Betting Interface Grid -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-responsive-sm">
          <!-- Left: Ship Selection -->
          <div class="layout-flex-col space-responsive-sm">
            <h4 class="font-semibold text-cyan-400 text-responsive-xl mb-responsive-xs">Select Ship</h4>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-responsive-xs">
              <div
                v-for="ship in ships"
                :key="ship.id"
                class="layout-relative p-responsive-sm rounded-lg border-2 transition-all duration-200 cursor-pointer transform hover:scale-102 bg-gray-800/50"
                :class="[
                  selectedShip?.id === ship.id 
                    ? 'border-cyan-400 bg-gradient-to-r from-cyan-400/20 to-pink-400/20 shadow-lg shadow-cyan-400/50' 
                    : 'border-gray-600 hover:border-pink-500 hover:bg-pink-500/10'
                ]"
                @click="selectShip(ship)"
              >
                <!-- Info Button - Positioned at top right -->
                <button
                  @click.stop="openShipInfo(ship)"
                  class="layout-absolute top-1 right-1 w-5 h-5 bg-sky-400 hover:bg-sky-500 text-white font-bold text-xs rounded layout-flex-center transition-colors z-10"
                  title="Ship Info"
                >
                  i
                </button>
                
                <!-- Horizontal Layout: Image + Info -->
                <div class="layout-flex items-center space-responsive-xs">
                  <!-- Ship Image - Left side, 1:1 ratio -->
                  <div class="flex-shrink-0">
                    <img 
                      :src="`/ships/${getShipImageName(ship.name)}.webp`"
                      :alt="ship.name"
                      class="w-14 h-14 md:w-16 md:h-16 object-contain"
                    />
                  </div>
                  
                  <!-- Ship Info - Right side -->
                  <div class="flex-1 min-w-0">
                    <h4 class="font-semibold text-gray-200 text-responsive-xl mb-responsive-xs truncate">{{ ship.name }}</h4>
                    <p class="text-responsive-xl text-gray-400 truncate">{{ ship.chaosFactor }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Right: Bet Amount & Actions -->
          <div class="layout-flex-col space-responsive-sm">
            <div class="layout-flex-between">
              <h4 class="font-semibold text-pink-400 text-responsive-xl">Place Bet</h4>
              <PayoutInfo 
                @show-payout-info="emit('showPayoutInfo')"
                @hide-payout-info="emit('hidePayoutInfo')"
              />
            </div>

            <!-- Bet Amount Input -->
            <div v-if="selectedShip" class="layout-flex-col space-responsive-sm">
              <div class="layout-flex gap-responsive-xs">
                <div class="layout-flex component-fit-width">
                  <label class="block text-responsive-xl font-medium text-gray-300 mb-responsive-xs">Bet Amount (SPIRAL)</label>
                  <UInput
                    v-model="betAmount"
                    type="number"
                    :min="minBet"
                    :max="maxBet"
                    step="0.001"
                    placeholder="Enter bet amount"
                    class="input-responsive component-fit-width bg-gray-800 border border-gray-600 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30"
                  />
                </div>
                <div class="layout-flex gap-responsive-xs">
                  <UButton
                    @click="setBetAmount(minBet)"
                    variant="outline"
                    size="sm"
                    class="btn-responsive-sm text-responsive-xl border-gray-600 hover:border-cyan-400 hover:text-cyan-400 transition-all duration-200"
                  >
                    Min
                  </UButton>
                  <UButton
                    @click="setBetAmount(maxBet)"
                    variant="outline"
                    size="sm"
                    class="btn-responsive-sm text-responsive-xl border-gray-600 hover:border-pink-400 hover:text-pink-400 transition-all duration-200"
                  >
                    Max
                  </UButton>
                </div>
              </div>

              <!-- Bet Preview -->
              <div class="bg-gradient-to-r from-gray-700 to-gray-800 p-responsive-sm rounded-lg border border-cyan-500/20">
                <h4 class="font-semibold text-cyan-400 mb-responsive-xs text-responsive-xl">Bet Preview</h4>
                <div class="space-y-1 text-responsive-xl">
                  <div class="layout-flex-between">
                    <span class="text-gray-400">Ship:</span>
                    <span class="text-gray-200">{{ selectedShip.name }}</span>
                  </div>
                  <div class="layout-flex-between">
                    <span class="text-gray-400">Amount:</span>
                    <SpiralToken :amount="betAmount" color="default" size="sm" />
                  </div>
                </div>
              </div>

              <!-- Place Bet Button -->
              <UButton
                @click="handlePlaceBet"
                :loading="placingBet || approving"
                :disabled="!canPlaceBet"
                :class="[
                  'component-fit-width btn-responsive font-bold transition-all duration-200 transform hover:scale-102',
                  needsApproval && !approvalPending 
                    ? 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white' 
                    : 'bg-gradient-to-r from-cyan-400 to-pink-500 hover:from-cyan-500 hover:to-pink-600 text-white shadow-lg shadow-cyan-400/25'
                ]"
              >
                {{ getButtonText() }}
              </UButton>

              <p v-if="!canPlaceBet" class="text-responsive-xl text-red-400 text-center">
                {{ betError }}
              </p>
              
              <p v-if="needsApproval && !approvalPending && canPlaceBet" class="text-responsive-xl text-orange-400 text-center">
                ⚠️ First time betting? You need to allow the contract to spend your SPIRAL tokens.
              </p>
              
              <p v-if="approvalPending && canPlaceBet" class="text-responsive-xl text-green-400 text-center">
                ✅ Tokens approved! Click the button above to place your bet.
              </p>

              <!-- Error Display -->
              <div v-if="error" class="mt-responsive-xs p-responsive-sm bg-red-900/50 border border-red-500 rounded-lg text-responsive-xl">
                <p class="text-red-400">{{ error }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Current Bets -->
        <div v-if="playerBets.length > 0" class="mt-responsive-sm">
          <h4 class="font-semibold text-pink-400 mb-responsive-xs text-responsive-xl">Your Current Bets</h4>
          <div class="space-y-1">
            <div
              v-for="(bet, index) in playerBets"
              :key="index"
              class="flex justify-between items-center p-1 bg-gradient-to-r from-gray-700 to-gray-800 rounded-sm text-xs border border-cyan-500/20"
            >
              <div>
                <span class="text-gray-300">{{ getShipNameById(index) }}</span>
                <span class="text-gray-400 ml-1">{{ bet }} SPIRAL</span>
              </div>
          </div>
        </div>
      </div>

      <!-- Row 2: Race Information & Jackpots -->
      <div class="bg-gradient-to-r from-gray-700 to-gray-800 p-responsive-sm rounded-sm border border-pink-500/20">
        
                <div class="flex justify-between items-center text-xs">
          <div class="text-center">
            <div class="text-gray-400 text-xs">Race ID</div>
            <div class="text-white font-semibold">#{{ currentRaceId }}</div>
          </div>
          <div class="text-center">
            <div class="text-gray-400 text-xs">Total Bets</div>
            <div class="text-cyan-400 font-semibold">
              <SpiralToken :amount="raceInfo?.totalBets ? ethers.utils.formatUnits(raceInfo.totalBets, 8) : '0'" color="cyan" size="sm" />
            </div>
          </div>
          <div class="text-center">
            <div class="text-gray-400 text-xs">Min/Max Bet</div>
            <div class="text-gray-300 font-semibold">
              <SpiralToken :amount="`${minBet}/${maxBet}`" color="default" size="sm" />
            </div>
          </div>
          <div class="text-center">
            <div class="flex items-center justify-center gap-1 mb-1">
              <img src="/mini-jackpot.webp" alt="Mini Jackpot" class="w-4 h-4 object-contain" />
              <span class="text-amber-400 font-semibold text-xs">Mini</span>
            </div>
            <div class="text-amber-300">
              <SpiralToken :amount="jackpotAmounts.mini" color="amber" size="sm" />
            </div>
          </div>
          <div class="text-center">
            <div class="flex items-center justify-center gap-1 mb-1">
              <img src="/mega-jackpot.webp" alt="Mega Jackpot" class="w-4 h-4 object-contain" />
              <span class="text-amber-400 font-semibold text-xs">Mega</span>
            </div>
            <div class="text-amber-200">
              <SpiralToken :amount="jackpotAmounts.mega" color="amber" size="sm" />
            </div>
          </div>
          <div class="text-center">
            <div class="flex items-center justify-center gap-1 mb-1">
              <img src="/super-jackpot.webp" alt="Super Jackpot" class="w-4 h-4 object-contain" />
              <span class="text-amber-400 font-semibold text-xs">Super</span>
            </div>
            <div class="text-amber-100">
              <SpiralToken :amount="jackpotAmounts.super" color="amber" size="sm" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Username Registration Modal -->
  <UsernameRegistrationModal
    :show="showUsernameModal"
    @register="handleRegisterUsername"
    @skip="skipUsernameRegistration"
    @close="showUsernameModal = false"
  />

  <!-- Achievement Tracker Modal -->
  <Transition
    enter-active-class="transition-all duration-300 ease-out"
    enter-from-class="opacity-0 scale-95"
    enter-to-class="opacity-100 scale-100"
    leave-active-class="transition-all duration-200 ease-in"
    leave-from-class="opacity-100 scale-100"
    leave-to-class="opacity-0 scale-95"
  >
    <div
      v-if="showAchievementTrackerModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
      @click.self="closeAchievementTracker"
    >
      <div class="bg-gray-900 border border-yellow-500/30 rounded-lg p-4 max-w-6xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div class="flex justify-between items-center mb-3">
          <h2 class="text-lg font-bold text-yellow-400">🏆 Achievement Tracker</h2>
          <button 
            @click="closeAchievementTracker" 
            class="text-gray-400 hover:text-white text-xl"
          >
            ×
          </button>
        </div>
        
        <AchievementTracker />
        
        <div class="flex justify-center mt-4">
          <button 
            @click="closeAchievementTracker" 
            class="bg-gray-700 hover:bg-gray-600 text-white px-responsive-sm py-responsive-xs rounded text-responsive-xl transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  </Transition>

</template>

<script setup lang="ts">
import { onMounted, watch, nextTick, ref } from 'vue'
import { useBetting } from '~/composables/useBetting'
import { useShips } from '~/composables/useShips'
import { ethers } from 'ethers'
import UsernameRegistrationModal from './UsernameRegistrationModal.vue'
import AchievementTracker from './AchievementTracker.vue'
import SpiralToken from './SpiralToken.vue'
import PayoutInfo from './PayoutInfo.vue'

// Props
interface Props {
  persistentBettingData?: { selectedShip: any, betAmount: string }
}

const props = withDefaults(defineProps<Props>(), {
  persistentBettingData: () => ({ selectedShip: null, betAmount: '' })
})

// Define emits
const emit = defineEmits<{
  raceCompleted: [{ raceResult: any, playerShip: number, betAmount: string, actualPayout: string, jackpotTier: number, jackpotAmount: string }]
  showShipInfo: [ship: any]
  hideShipInfo: []
  showPayoutInfo: []
  hidePayoutInfo: []
}>()

// Use the unified ships composable
const { getShipImageName } = useShips()

// Use the betting composable
const {
  // State
  betError,
  placingBet,
  error,
  selectedShip,
  betAmount,
  shipBets,
  playerBets,
  jackpotAmounts,
  approving,
  needsApproval,
  approvalPending,
  allowanceChecked,
  playerStats,
  achievementCount,
  raceInfo,
  showUsernameModal,
  playerUsername,
  hasUsername,
  playerAvatarId,
  usernameInput,
  registeringUsername,
  usernameError,
  showMatchHistoryModal,
  matchHistory,
  loadingMatchHistory,
  selectedPlayerForHistory,
  showLeaderboardsModal,
  leaderboardData,
  loadingLeaderboards,
  showPlayerStatisticsModal,
  loadingPlayerStatistics,
  showAchievementTrackerModal,
  ships,
  loadingStates,

  // Computed
  minBet,
  maxBet,
  totalCost,
  canPlaceBet,
  getButtonText,

  // Methods
  selectShip,
  setBetAmount,
  checkAllowanceIfReady,
  getShipNameById,
  approveTokens,
  placeBet,
  initializeBettingData,
  loadBettingData,
  loadPlayerData,
  loadJackpotData,
  checkFaucetStatus,
  openTwitterProfile,
  checkUsernameStatus,
  handleRegisterUsername,
  skipUsernameRegistration,
  openMatchHistory,
  closeMatchHistory,
  openLeaderboards,
  closeLeaderboards,
  openPlayerHistory,
  openPlayerStatistics,
  closePlayerStatistics,
  openAchievementTracker,
  closeAchievementTracker,
  formatAddress,
  formatDate,
  getPlacementText,
  getPlacementColor,

  // Web3 state
  isConnected,
  shortAddress,
  walletType,
  isCorrectNetwork,
  currentRaceId
} = useBetting()

// Function to open ship info modal
const openShipInfo = (ship: any) => {
  emit('showShipInfo', ship)
}

// Function to close ship info modal
const closeShipInfo = () => {
  emit('hideShipInfo')
}

// Sync persistent betting data with composable
watch(() => props.persistentBettingData.selectedShip, (newShip) => {
  if (newShip && !selectedShip.value) {
    selectedShip.value = newShip
  }
}, { immediate: true })

watch(() => props.persistentBettingData.betAmount, (newAmount) => {
  if (newAmount && !betAmount.value) {
    betAmount.value = newAmount
  }
}, { immediate: true })

// Sync composable data back to persistent storage
watch(selectedShip, (newShip) => {
  if (newShip) {
    props.persistentBettingData.selectedShip = newShip
  }
})

watch(betAmount, (newAmount) => {
  if (newAmount) {
    props.persistentBettingData.betAmount = newAmount
  }
})

// Get the singleton useWeb3 instance
const web3 = useWeb3()
const web3IsConnected = computed(() => web3.isConnected.value)
const web3ShortAddress = computed(() => web3.shortAddress.value)
const web3WalletType = computed(() => web3.walletType.value)
const web3ConnectionState = computed(() => web3.connectionState.value)
const web3FormattedSpiralBalance = computed(() => web3.formattedSpiralBalance.value)

// Handle place bet and emit race result
const handlePlaceBet = async () => {
  // If approval is needed, handle it first
  if (needsApproval.value && !approvalPending.value) {
    const approved = await approveTokens()
    if (!approved) {
      return
    }
    // After successful approval, wait a moment for state to update
    await new Promise(resolve => setTimeout(resolve, 1000))
  }
  
  // Place the bet
  const result = await placeBet()
  if (result) {
    emit('raceCompleted', result)
  }
}

// Performance: Optimized initialization with proper timing
onMounted(() => {
  // Wait for next tick to ensure reactive state is ready
  nextTick(() => {
    if (web3ConnectionState.value === 'ready') {
      initializeBettingData()
    }
  })
})

// Performance: Single optimized watcher for connection state changes
watch(web3ConnectionState, (newState, oldState) => {
  if (newState === 'ready' && oldState !== 'ready') {
    // Add a small delay to ensure everything is properly initialized
    setTimeout(() => {
      initializeBettingData()
    }, 500)
  }
}, { immediate: true })

// Performance: Optimized race ID watcher
watch(currentRaceId, () => {
  if (isConnected.value) {
    loadBettingData()
  }
})

// Performance: Optimized bet amount watcher
watch(betAmount, () => {
  if (allowanceChecked.value) {
    needsApproval.value = false
    approvalPending.value = false
    allowanceChecked.value = false
  }
})

// Performance: Optimized ship and bet amount watcher
watch([selectedShip, betAmount], () => {
  if (isConnected.value && selectedShip.value && betAmount.value) {
    // Small delay to ensure the values are set
    setTimeout(() => {
      checkAllowanceIfReady()
    }, 100)
  }
})
</script> 