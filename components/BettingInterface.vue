<template>
  <div class="card-responsive component-fit-width relative">
    <!-- Background Image with Transparency -->
    <div
      class="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-2"
      style="background-image: url('/bg2.webp')"
    />

    <!-- Content -->
    <div class="relative z-10">
      <!-- Not Connected Message -->
      <div v-if="!web3IsConnected" class="layout-flex-center layout-flex-col py-responsive-xl">
        <div class="text-cyan-400 text-responsive-sm mb-responsive-sm font-bold">
          Welcome to RUSH!
        </div>
        <div class="text-gray-400 text-responsive-base">Connect your wallet to start racing!</div>
      </div>

      <!-- Connected User Interface -->
      <div v-else class="layout-flex-col space-responsive-sm">
        <!-- Row 1: Betting Interface Grid -->
        <div class="grid grid-cols-1 lg:grid-cols-6 gap-responsive-sm">
          <!-- Left: Ship Selection -->
          <div class="layout-flex-col space-responsive-sm lg:col-span-4">
            <h4 class="font-semibold text-cyan-400 text-responsive-sm mb-responsive-xs">
              Select Ship
            </h4>
            <div class="grid grid-cols-1 md:grid-cols-4 gap-responsive-xs">
              <div
                v-for="ship in ships"
                :key="ship.id"
                class="layout-relative p-responsive-sm rounded-lg border-2 transition-all duration-200 cursor-pointer transform hover:scale-102 bg-gray-800/50"
                :class="[
                  selectedShip?.id === ship.id
                    ? 'border-cyan-400 bg-gradient-to-r from-cyan-400/20 to-pink-400/20 shadow-lg shadow-cyan-400/50'
                    : 'border-gray-600 hover:border-pink-500 hover:bg-pink-500/10',
                ]"
                @click="selectShip(ship)"
              >
                <!-- Info Button - Positioned at top right -->
                <button
                  class="layout-absolute top-1 right-1 w-5 h-5 bg-sky-400 hover:bg-pink-500 text-white font-bold text-xs rounded layout-flex-center transition-colors z-10"
                  title="Ship Info"
                  @click.stop="openShipInfo(ship)"
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
                    >
                  </div>

                  <!-- Ship Info - Right side -->
                  <div class="flex-1 min-w-0 text-center md:hidden">
                    <h4
                      class="font-semibold text-white text-responsive-sm mb-responsive-xs truncate"
                    >
                      {{ ship.name }}
                    </h4>
                    <p class="text-responsive-xs text-gray-400">{{ ship.chaosFactor }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Right: Bet Amount & Actions -->
          <div class="layout-flex-col space-responsive-sm lg:col-span-2">
            <div class="flex items-center gap-1">
              <h4 class="font-semibold text-pink-400 text-responsive-sm">Place Bet</h4>
              <button
                class="w-4 h-4 bg-sky-400 hover:bg-pink-500 text-white font-bold text-xs rounded flex items-center justify-center transition-colors"
                title="Payout Info"
                @click="emit('showPayoutInfo')"
              >
                i
              </button>
            </div>

            <!-- Bet Amount Input -->
            <div v-if="selectedShip" class="layout-flex-col space-responsive-xs">
              <!-- Row 1: Label and Min/Max buttons -->
              <div class="layout-flex-between items-center">
                <label class="text-responsive-xs font-medium text-gray-300">Bet Amount</label>
                <div class="layout-flex gap-1">
                  <UButton
                    variant="outline"
                    size="sm"
                    class="text-responsive-xs px-2 py-1 border-gray-600 hover:border-cyan-400 hover:text-cyan-400 transition-all duration-200"
                    @click="setBetAmount(minBet)"
                  >
                    Min
                  </UButton>
                  <UButton
                    variant="outline"
                    size="sm"
                    class="text-responsive-xs px-2 py-1 border-gray-600 hover:border-pink-400 hover:text-pink-400 transition-all duration-200"
                    @click="setBetAmount(maxBet)"
                  >
                    Max
                  </UButton>
                </div>
              </div>

              <!-- Row 2: Input box full width -->
              <input
                v-model="betAmount"
                type="number"
                :min="minBet"
                :max="maxBet"
                step="10"
                placeholder="Enter bet amount"
                class="w-full px-3 py-1 bg-gray-900 border border-gray-500 focus:border-pink-400 focus:ring-2 focus:ring-pink-400/30 rounded text-white text-responsive-sm"
              >

              <!-- Validation Warning -->
              <div v-if="betValidationWarning" class="text-responsive-xs text-red-400 text-center">
                ⚠️ {{ betValidationWarning }}
              </div>

              <!-- Bet Preview -->
              <div
                class="bg-gradient-to-r from-gray-700 to-gray-800 py-2 px-responsive-xs rounded-lg border border-cyan-500/20"
              >
                <div class="space-y-1 text-responsive-xs px-2">
                  <div class="layout-flex-between items-center">
                    <span class="text-gray-400">Ship:</span>
                    <div class="flex items-center gap-1">
                      <span class="text-gray-200">{{ selectedShip.name }}</span>
                      <button
                        class="w-4 h-4 bg-sky-400 hover:bg-pink-500 text-white font-bold text-xs rounded flex items-center justify-center transition-colors"
                        title="Ship Info"
                        @click="openShipInfo(selectedShip)"
                      >
                        i
                      </button>
                    </div>
                  </div>
                  <div class="layout-flex-between">
                    <span class="text-gray-400">Amount:</span>
                    <SpiralToken :amount="betAmount" color="default" size="sm" />
                  </div>
                </div>
              </div>

              <!-- Place Bet Button -->
              <UButton
                :loading="placingBet || approving"
                :disabled="!canPlaceBet"
                :class="[
                  'component-fit-width btn-responsive font-bold transition-all duration-100 transform hover:scale-101',
                  needsApproval && !approvalPending
                    ? 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white'
                    : 'bg-gradient-to-b from-blue-400 to-cyan-500 hover:from-pink-500 hover:to-pink-600 text-white',
                ]"
                @click="handlePlaceBet"
              >
                {{ getButtonText() }}
              </UButton>

              <p v-if="!canPlaceBet" class="text-responsive-sm text-red-400 text-center">
                {{ betError }}
              </p>

              <p
                v-if="needsApproval && !approvalPending && canPlaceBet"
                class="text-responsive-sm text-orange-400 text-center"
              >
                ⚠️ First time betting? You need to allow the contract to spend your SPIRAL tokens.
              </p>

              <p
                v-if="approvalPending && canPlaceBet"
                class="text-responsive-sm text-green-400 text-center"
              >
                ✅ Tokens approved! Click the button above to place your bet.
              </p>

              <!-- Error Display -->
              <div
                v-if="error"
                class="mt-responsive-xs p-responsive-sm bg-red-900/50 border border-red-500 rounded-lg text-responsive-sm"
              >
                <p class="text-red-400">{{ error }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Current Bets -->
        <div v-if="playerBets.length > 0" class="mt-responsive-sm">
          <h4 class="font-semibold text-pink-400 mb-responsive-xs text-responsive-sm">
            Your Current Bets
          </h4>
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
        <div
          class="bg-gradient-to-r from-gray-700 to-gray-800 py-2 px-responsive-sm rounded-sm border border-pink-500/20"
        >
          <div class="grid grid-cols-3 gap-4 items-center text-xs">
            <div class="flex items-center gap-2">
              <img
                src="/mini-jackpot.webp"
                alt="Mini Jackpot"
                class="w-10 h-10 object-contain flex-shrink-0"
              >
              <div>
                <div class="text-amber-400 font-semibold text-xs">Mini Jackpot</div>
                <div class="text-amber-300">
                  <SpiralToken :amount="jackpotAmounts.mini" size="sm" />
                </div>
              </div>
            </div>

            <div class="flex items-center gap-2">
              <img
                src="/mega-jackpot.webp"
                alt="Mega Jackpot"
                class="w-10 h-10 object-contain flex-shrink-0"
              >
              <div>
                <div class="text-amber-400 font-semibold text-xs">Mega Jackpot</div>
                <div class="text-amber-200">
                  <SpiralToken :amount="jackpotAmounts.mega" size="sm" />
                </div>
              </div>
            </div>

            <div class="flex items-center gap-2">
              <img
                src="/super-jackpot.webp"
                alt="Super Jackpot"
                class="w-10 h-10 object-contain flex-shrink-0"
              >
              <div>
                <div class="text-amber-400 font-semibold text-xs">Super Jackpot</div>
                <div class="text-amber-100">
                  <SpiralToken :amount="jackpotAmounts.super" size="sm" />
                </div>
              </div>
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
</template>

<script setup lang="ts">
  import { onMounted, watch, nextTick, ref, computed } from 'vue'
  import { useBetting } from '~/composables/useBetting'
  import { useShips } from '~/composables/useShips'
  import { ethers } from 'ethers'
  import UsernameRegistrationModal from './UsernameRegistrationModal.vue'

  import SpiralToken from './SpiralToken.vue'

  // Props
  interface Props {
    persistentBettingData?: { selectedShip: any; betAmount: string }
  }

  const props = withDefaults(defineProps<Props>(), {
    persistentBettingData: () => ({ selectedShip: null, betAmount: '' }),
  })

  // Define emits
  const emit = defineEmits<{
    raceCompleted: [
      {
        raceResult: any
        playerShip: number
        betAmount: string
        actualPayout: string
        jackpotTier: number
        jackpotAmount: string
      },
    ]
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
    playerBets,
    jackpotAmounts,
    approving,
    needsApproval,
    approvalPending,
    allowanceChecked,
    raceInfo,
    showUsernameModal,

    ships,

    // Computed
    minBet,
    maxBet,
    canPlaceBet,
    betValidationWarning,
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
    handleRegisterUsername,
    skipUsernameRegistration,

    // Web3 state
    isConnected,
    currentRaceId,
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
  watch(
    () => props.persistentBettingData.selectedShip,
    newShip => {
      if (newShip && !selectedShip.value) {
        selectedShip.value = newShip
      }
    },
    { immediate: true }
  )

  watch(
    () => props.persistentBettingData.betAmount,
    newAmount => {
      if (newAmount && !betAmount.value) {
        betAmount.value = newAmount
      }
    },
    { immediate: true }
  )

  // Sync composable data back to persistent storage
  watch(selectedShip, newShip => {
    if (newShip) {
      props.persistentBettingData.selectedShip = newShip
    }
  })

  watch(betAmount, newAmount => {
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
  watch(
    web3ConnectionState,
    (newState, oldState) => {
      if (newState === 'ready' && oldState !== 'ready') {
        // Add a small delay to ensure everything is properly initialized
        setTimeout(() => {
          initializeBettingData()
        }, 500)
      }
    },
    { immediate: true }
  )

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
