<template>
  <div
    ref="trackContainer"
    class="w-full h-full layout-relative container-overflow-hidden bg-transparent"
  >
    <!-- View Results Button - Only show after race is finished -->
    <div v-if="isRaceFinished" class="viewport-bottom viewport-center-x m-responsive-md">
      <button
        class="btn-inline-secondary flex items-center space-x-2 px-4 py-2 text-responsive-lg font-bold"
        @click="$emit('reopen-results')"
      >
        <Icon name="heroicons:flag-16-solid" class="w-5 h-5" />
        <span>View Results</span>
      </button>
    </div>

    <!-- Ships - Only show during actual races, not during betting -->
    <div
      v-for="(ship, index) in ships"
      :id="`ship-${ship.id}`"
      :key="ship.id"
      class="layout-absolute layout-flex-center z-10 ship-container"
      :class="{
        hidden: showBettingInterface,
        'player-ship': isPlayerShip(ship),
      }"
      :style="{
        top: `${getShipVerticalPosition(index)}vh`,
        left: `${getShipPosition(ship)}vw`,
      }"
    >


      <!-- Player Ship Glow Ring -->
      <div v-if="isPlayerShip(ship)" class="layout-absolute player-glow-ring" />

      <img
        :src="`/ships/${getShipImageName(ship.name)}.webp`"
        :alt="ship.name"
        class="object-contain transform rotate-90 cursor-pointer hover:scale-110 transition-transform duration-400"
        style="
          width: 5vw;
          height: 5vw;
          min-width: 4rem;
          min-height: 4rem;
          max-width: 8rem;
          max-height: 8rem;
        "
        @click="openShipInfo(ship)"
      />
      
      <!-- Ship Nameplate -->
      <div
        :id="`nameplate-${ship.id}`"
        class="layout-absolute ship-nameplate"
        :style="{ 
          top: 'calc(100% + -6rem)',
          left: '50%',
          transform: 'translateX(-50%)'
        }"
      >
        <div class="nameplate-container">
          <span class="nameplate-text" :style="{ color: ship.color }">
            {{ ship.name }}
          </span>
        </div>
      </div>
      
      <div
        :id="`chaos-flash-${ship.id}`"
        class="layout-absolute text-center text-responsive-base font-bold"
        :class="{ 'chaos-flash': chaosEvents[ship.id] }"
        :style="{ color: ship.color, left: '-20vw', top: '50%', transform: 'translateY(-50%)' }"
      >
        {{ chaosEvents[ship.id] || '' }}
      </div>
      <div
        v-if="placeIndicators[ship.id]"
        :id="`place-indicator-${ship.id}`"
        class="layout-absolute text-center text-responsive-2xl font-bold"
        :class="{ 'chaos-flash': placeIndicators[ship.id] }"
        :style="{ color: ship.color, left: '-4vw', top: '50%', transform: 'translateY(-50%)' }"
      >
        {{ placeIndicators[ship.id] }}
      </div>
    </div>

    <!-- Betting Interface - Centered overlay -->
    <Transition
      enter-active-class="duration-500 ease-out"
      enter-from-class="transform scale-95 opacity-0"
      enter-to-class="transform scale-100 opacity-100"
      leave-active-class="duration-300 ease-in"
      leave-from-class="transform scale-100 opacity-100"
      leave-to-class="transform scale-95 opacity-0"
    >
      <div
        v-if="showBettingInterface && web3IsConnected"
        class="viewport-center layout-flex-center z-0 p-responsive-md"
        style="max-height: 60vh; max-width: 75vw"
      >
        <div class="layout-relative w-full max-w-6xl betting-interface-scaled">
          <!-- Enhanced glowing border effect with COSMIC RUSH colors -->
          <div
            class="layout-absolute component-fit bg-gradient-to-r from-cyan-500/20 via-pink-500/20 to-cyan-500/20 blur-2xl"
          />

          <div
            class="layout-relative p-responsive-md container-overflow-auto custom-scrollbar"
            style="max-height: 60vh"
          >
            <BettingInterface
              :persistent-betting-data="persistentBettingData"
              @raceCompleted="onRaceCompleted"
              @show-ship-info="$emit('showShipInfo', $event)"
              @hide-ship-info="$emit('hideShipInfo')"
              @show-payout-info="$emit('showPayoutInfo')"
              @hide-payout-info="$emit('hidePayoutInfo')"
            />
          </div>
        </div>
      </div>
    </Transition>

    <!-- Ship Info Card Modal -->
    <ShipInfoCard :show="showShipInfoModal" :ship="selectedShipForInfo" @close="closeShipInfo" />
  </div>
</template>

<script setup lang="ts">
  import type { RaceState, Ship } from '~/composables/useGame'
  import { TRACK_DISTANCE, useShips } from '~/composables/useShips'
  import { ref, computed, defineAsyncComponent } from 'vue'
  import { useWeb3 } from '~/composables/useWeb3'
  import { useBetting } from '~/composables/useBetting'

  // Lazy load heavy components with optimized loading
  const BettingInterface = defineAsyncComponent({
    loader: () => import('./BettingInterface.vue'),
    delay: 100, // Small delay to prioritize main component
    timeout: 8000,
    loadingComponent: {
      template: `
        <div class="text-center py-4">
          <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-cyan-400 mx-auto" />
          <p class="text-gray-400 mt-2 text-sm">Loading betting interface...</p>
        </div>
      `
    }
  })

  const ShipInfoCard = defineAsyncComponent({
    loader: () => import('./ShipInfoCard.vue'),
    delay: 50,
    timeout: 5000,
  })

  interface Props {
    ships: RaceState[]
    chaosEvents?: { [key: number]: string }
    placeIndicators?: { [key: number]: string }
    showReopenButton?: boolean
    showBettingInterface?: boolean
    persistentBettingData?: { selectedShip: Ship | null; betAmount: string }
  }

  const props = withDefaults(defineProps<Props>(), {
    chaosEvents: () => ({}),
    placeIndicators: () => ({}),
    showReopenButton: false,
    showBettingInterface: true,
    persistentBettingData: () => ({ selectedShip: null, betAmount: '' }),
  })

  // Get web3 connection state
  const web3 = useWeb3()
  const web3IsConnected = computed(() => web3.isConnected.value)

  // Emits
  const emit = defineEmits<{
    'reopen-results': []
    'race-completed': [
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
        txHash: string
      },
    ]
    showShipInfo: [ship: Ship]
    hideShipInfo: []
    showPayoutInfo: []
    hidePayoutInfo: []
  }>()

  // Track container ref
  const trackContainer = ref<HTMLElement>()

  // Ship info modal state
  const showShipInfoModal = ref(false)
  const selectedShipForInfo = ref<Ship | null>(null)

  // Use the unified ships composable
  const { getShipImageName } = useShips()

  // Use the betting composable to get current selected ship
  const { selectedShip } = useBetting()

  // Computed properties
  const isRaceFinished = computed(() => props.showReopenButton)

  // Check if a ship is the player's selected ship
  const isPlayerShip = (ship: RaceState) => {
    // Check both persistent data and current betting state
    const persistentSelectedShip = props.persistentBettingData?.selectedShip
    const currentSelectedShip = selectedShip.value
    
    // Check if ship matches either the persistent data or current betting state
    const isPersistentMatch = persistentSelectedShip && ship.id === persistentSelectedShip.id
    const isCurrentMatch = currentSelectedShip && ship.id === currentSelectedShip.id
    
    return isPersistentMatch || isCurrentMatch
  }

  // Function to open ship info modal
  const openShipInfo = (ship: Ship) => {
    selectedShipForInfo.value = ship
    showShipInfoModal.value = true
  }

  // Function to close ship info modal
  const closeShipInfo = () => {
    showShipInfoModal.value = false
    selectedShipForInfo.value = null
  }

  // Methods
  const getShipPosition = (ship: RaceState) => {
    // Convert pixel-based position to viewport width percentage
    const maxPosition = TRACK_DISTANCE
    const currentPosition = ship.distance || 0
    const percentage = (currentPosition / maxPosition) * 100
    // Add minimum starting position to prevent ships from being cut off
    const minStartingPosition = 2 // Start at 8vw to ensure ships are fully visible
    const adjustedPercentage = Math.max(percentage, minStartingPosition)
    // Constrain to viewport width, leaving some margin
    return Math.min(adjustedPercentage, 90) // Max 90vw to leave margin
  }

  const getShipVerticalPosition = (index: number) => {
    // Convert pixel-based vertical position to viewport height percentage
    const baseSpacing = 10 // 10vh spacing between ships (increased from 8)
    const startPosition = 4 // Start at 6vh from top (reduced from 10)
    return startPosition + index * baseSpacing
  }

  const onRaceCompleted = (data: {
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
    txHash: string
  }) => {
    emit('race-completed', data)
  }
</script>

<style scoped>
  .ship-container {
    transition:
      left 0.3s ease-out,
      top 0.3s ease-out;
  }

  .ship-container img {
    filter: drop-shadow(0 0 4px rgba(0, 238, 255, 0.37));
  }

  /* Player ship container styling */
  .player-ship {
    z-index: 15;
  }

  /* Player ship glow ring */
  .player-glow-ring {
    width: 6vw;
    height: 6vw;
    min-width: 5rem;
    min-height: 5rem;
    max-width: 10rem;
    max-height: 10rem;
    border: 2px solid rgba(59, 130, 246, 0.6);
    border-radius: 50%;
    background: radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, transparent 70%);
    box-shadow:
      0 0 20px rgba(59, 130, 246, 0.4),
      inset 0 0 20px rgba(59, 130, 246, 0.1);
    animation: glow-pulse 3s ease-in-out infinite;
    z-index: 1;
  }

  @keyframes glow-pulse {
    0%,
    100% {
      opacity: 0.6;
      transform: scale(1);
    }
    50% {
      opacity: 1;
      transform: scale(1.05);
    }
  }

  .chaos-flash {
    animation: flash 3s ease-in-out;
  }

  @keyframes flash {
    0%,
    100% {
      opacity: 0;
      transform: scale(0.8);
    }
    50% {
      opacity: 1;
      transform: scale(1.2);
    }
  }

  /* Responsive scaling for betting interface */
  .betting-interface-scaled {
    transform-origin: center;
  }

  /* Large screens (lg and up) - 1.25x scale */
  @media (min-width: 1024px) {
    .betting-interface-scaled {
      transform: scale(1.25);
    }
  }

  /* Medium screens (md to lg) - 1.25x scale */
  @media (min-width: 768px) and (max-width: 1023px) {
    .betting-interface-scaled {
      transform: scale(1.25);
    }
  }

  /* Small screens and mobile (below md) - no scaling */
  @media (max-width: 767px) {
    .betting-interface-scaled {
      transform: scale(1);
    }
  }

  /* Ship Nameplate Styles */
  .ship-nameplate {
    pointer-events: none;
    z-index: 50;
  }

  .nameplate-container {
    background: linear-gradient(135deg, rgba(28, 43, 63, 0.274), rgba(87, 14, 97, 0.267));
    border: .1rem solid rgba(0, 238, 255, 0.404);
    border-radius: .75rem;
    white-space: nowrap;
    min-width: max-content;
    padding: .1rem 0.5rem;
  }

  .nameplate-text {
    font-size: var(--font-size-xs);
    font-weight: 700;
  }

  /* Player ship nameplate enhancement */
  .player-ship .nameplate-container {
    background: linear-gradient(135deg, rgba(6, 182, 212, 0.2), rgba(236, 72, 153, 0.1));
    border-color: rgba(6, 182, 212, 0.5);
    box-shadow: 
      0 4px 12px -2px rgba(6, 182, 212, 0.3),
      0 0 0 1px rgba(6, 182, 212, 0.2);
  }

  /* Hide scrollbars */
  .scrollbar-hide {
    -ms-overflow-style: none; /* Internet Explorer 10+ */
    scrollbar-width: none; /* Firefox */
  }

  .scrollbar-hide::-webkit-scrollbar {
    display: none; /* Safari and Chrome */
  }
</style>
