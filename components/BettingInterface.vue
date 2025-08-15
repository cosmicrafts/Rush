<template>
  <div class="card-responsive component-fit-width relative">
    <!-- Content -->
    <div class="relative z-10">
      <!-- Connected User Interface -->
      <div class="layout-flex-col space-responsive-sm">
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
                class="layout-relative p-responsive-sm rounded-lg border-2 transition-all duration-200 cursor-pointer bg-gray-800/50"
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

                <!-- Ship Image - Centered on desktop, with text on mobile -->
                <div class="flex justify-center items-center">
                  <img
                    :src="`/ships/${getShipImageName(ship.name)}.webp`"
                    :alt="ship.name"
                    class="w-14 h-14 md:w-16 md:h-16 object-contain"
                  />
                </div>

                <!-- Ship Info - Only visible on mobile -->
                <div class="md:hidden text-center mt-1">
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
                  <button
                    class="btn-inline-secondary text-responsive-xs px-2 py-1"
                    @click="setBetAmount(minBet)"
                  >
                    Min
                  </button>
                  <button
                    class="btn-inline-secondary text-responsive-xs px-2 py-1"
                    @click="setBetAmount(maxBet)"
                  >
                    Max
                  </button>
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
              />

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
              <button
                :disabled="!canPlaceBet"
                :class="[
                  'component-fit-width flex items-center justify-center space-x-2 font-bold',
                  needsApproval && !approvalPending
                    ? 'btn-inline-approval'
                    : 'btn-inline-primary',
                ]"
                @click="handlePlaceBet"
              >
                <div v-if="placingBet || approving" class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>{{ getButtonText() }}</span>
              </button>

              <p v-if="!canPlaceBet" class="text-responsive-sm text-red-400 text-center">
                {{ betError }}
              </p>

              <p
                v-if="needsApproval && !approvalPending && canPlaceBet"
                class="text-responsive-xs text-orange-400 text-center"
              >
                ⚠️ First time betting?
              </p>

              <p
                v-if="approvalPending && canPlaceBet"
                class="text-responsive-sm text-emerald-400 text-center"
              >
                ✅ Tokens approved! Click the button above to place your bet.
              </p>
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
              />
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
              />
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
              />
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
  import { onMounted, watch, nextTick, computed, defineAsyncComponent } from 'vue'
  import { useBetting } from '~/composables/useBetting'
  import { useShips } from '~/composables/useShips'
  import { useNotifications } from '~/composables/useNotifications'
  import type { Ship } from '~/composables/useGame'
  import SpiralToken from './SpiralToken.vue'

  // Lazy load modals and non-critical components
  const UsernameRegistrationModal = defineAsyncComponent({
    loader: () => import('./UsernameRegistrationModal.vue'),
    delay: 0,
    timeout: 5000,
  })

  // Props
  interface Props {
    persistentBettingData?: { selectedShip: Ship | null; betAmount: string }
  }

  const props = withDefaults(defineProps<Props>(), {
    persistentBettingData: () => ({ selectedShip: null, betAmount: '' }),
  })

  // Define emits
  const emit = defineEmits<{
    raceCompleted: [
      {
        raceResult: {
          winner: number
          placements: number[]
          turnEvents: Array<{
            turn: number
            shipId: number
            moveAmount: number
            distance: number
            chaosEventType: number
            targetShipId: number
          }>
          totalEvents: number
        }
        playerShip: number
        betAmount: string
        actualPayout: string
        jackpotTier: number
        jackpotAmount: string
      },
    ]
    showShipInfo: [ship: Ship]
    hideShipInfo: []
    showPayoutInfo: []
    hidePayoutInfo: []
    'update:persistentBettingData': [data: { selectedShip: Ship | null; betAmount: string }]
  }>()

  // Use the unified ships composable
  const { getShipImageName } = useShips()

  // Initialize notification system
  const { showError, showInfo, showAllowanceNotification, showApprovalNotification } = useNotifications()

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
  const openShipInfo = (ship: Ship) => {
    emit('showShipInfo', ship)
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
      emit('update:persistentBettingData', {
        ...props.persistentBettingData,
        selectedShip: newShip,
      })
    }
  })

  watch(betAmount, newAmount => {
    if (newAmount) {
      emit('update:persistentBettingData', {
        ...props.persistentBettingData,
        betAmount: newAmount,
      })
    }
  })

  // Get the singleton useWeb3 instance
  const web3 = useWeb3()
  const web3ConnectionState = computed(() => web3.connectionState.value)



  // Handle place bet and emit race result
  const handlePlaceBet = async () => {
    // If approval is needed, handle it first
    if (needsApproval.value && !approvalPending.value) {
      showApprovalNotification('Approving tokens for betting...')
      const approved = await approveTokens()
      if (!approved) {
        showError('Approval cancelled')
        return
      }

      // Show allowance success notification with transaction hash
      if (approved.success && approved.txHash) {
        // Show transaction success notification (delayed by 1 second)
        setTimeout(() => {
          showAllowanceNotification(approved.txHash, 'success')
        }, 1000) // 1 second delay
      }
    }

    // Place the bet
    const shipName = selectedShip.value?.name || 'Unknown Ship'
    showInfo(`Placing bet on ${shipName} for ${betAmount.value} SPIRAL...`)
    const result = await placeBet()
    if (result) {
      emit('raceCompleted', result)
    } else {
      // Check if the error is a user rejection
      if (error.value && error.value.includes('Transaction was rejected by user')) {
        showError('Transaction cancelled')
      } else {
        showError('Bet cancelled')
      }
    }
  }

  // Performance: Optimized initialization with proper timing
  onMounted(() => {
    // Wait for next tick to ensure reactive state is ready
    nextTick(() => {
      if (web3ConnectionState.value === 'ready') {
        // Defer heavy blockchain operations to improve perceived performance
        setTimeout(() => {
          initializeBettingData()
        }, 100)
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
        }, 200)
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
