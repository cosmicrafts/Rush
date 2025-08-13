<template>
  <div ref="trackContainer" class="w-full h-full layout-relative container-overflow-hidden bg-transparent">

    <!-- View Results Button - Only show after race is finished -->
    <div v-if="isRaceFinished" class="viewport-bottom viewport-center-x m-responsive-md">
      <button 
        @click="$emit('reopen-results')"
        class="btn-responsive bg-cyan-600 hover:bg-cyan-700 text-white px-responsive-lg rounded text-responsive-xl font-bold transition-colors"
      >
        📊 View Results
      </button>
    </div>

    <!-- Ships - Only show during actual races, not during betting -->
    <div 
      v-for="(ship, index) in ships" 
      :key="ship.id"
      :id="`ship-${ship.id}`"
      class="layout-absolute layout-flex-center z-10"
      :class="{ 'hidden': showBettingInterface }"
      :style="{
        top: `${getShipVerticalPosition(index)}vh`,
        left: `${getShipPosition(ship)}vw`
      }"
    >
      <!-- Nameplate positioned below ship -->
      <div v-if="!isRaceFinished" class="layout-absolute text-center z-20" style="bottom: -1.25vw; left: 80%; transform: translateX(-50%);">
        <div class="nameplate-bg px-2 py-1 rounded">
          <span class="text-responsive-xs whitespace-nowrap text-white font-bold">{{ ship.name }}</span>
        </div>
      </div>
      
      <img 
        :src="`/ships/${getShipImageName(ship.name)}.webp`"
        :alt="ship.name"
        class="object-contain transform rotate-90"
        style="width: 4vw; height: 4vw; min-width: 4rem; min-height: 4rem; max-width: 8rem; max-height: 8rem;"
      />
      <div 
        :id="`chaos-flash-${ship.id}`"
        class="layout-absolute text-center text-responsive-base font-bold"
        :class="{ 'chaos-flash': chaosEvents[ship.id] }"
        :style="{ color: ship.color, left: '-20vw', top: '50%', transform: 'translateY(-50%)' }"
      >{{ chaosEvents[ship.id] || '' }}</div>
      <div 
        v-if="placeIndicators[ship.id]"
        :id="`place-indicator-${ship.id}`"
        class="layout-absolute text-center text-responsive-xl font-bold"
        :class="{ 'chaos-flash': placeIndicators[ship.id] }"
        :style="{ color: ship.color, left: '-6vw', top: '50%', transform: 'translateY(-50%)' }"
      >{{ placeIndicators[ship.id] }}</div>
    </div>

    <!-- No Ships Message -->
    <div v-if="ships.length === 0" class="viewport-center layout-flex-center">
      <div class="text-center">
        <div class="text-gray-400 text-responsive-xl mb-responsive-sm">🚀 Race Track Ready</div>
        <div class="text-gray-500 text-responsive-base">Waiting for ships to load...</div>
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
        v-if="showBettingInterface"
        class="viewport-center layout-flex-center z-0 p-responsive-md"
      >
        <div class="layout-relative component-fit-width container-constrained">
          <!-- Enhanced glowing border effect with COSMIC RUSH colors -->
          <div class="layout-absolute component-fit bg-gradient-to-r from-cyan-500/20 via-pink-500/20 to-cyan-500/20 blur-2xl"></div>
          
          <div class="layout-relative p-responsive-md container-fit-height container-overflow-auto">
          <BettingInterface 
            :persistent-betting-data="persistentBettingData"
            @race-completed="onRaceCompleted"
            @show-ship-info="$emit('showShipInfo', $event)"
            @hide-ship-info="$emit('hideShipInfo')"
            @show-payout-info="$emit('showPayoutInfo')"
            @hide-payout-info="$emit('hidePayoutInfo')"
          />
          </div>
        </div>
      </div>
    </Transition>


  </div>
</template>

<script setup lang="ts">
import type { RaceState } from '../types/game'
import { TRACK_DISTANCE } from '../data/ships'
import { ref, watch, computed } from 'vue'
import BettingInterface from './BettingInterface.vue'
import { useShips } from '~/composables/useShips'

interface Props {
  ships: RaceState[]
  chaosEvents?: { [key: number]: string }
  placeIndicators?: { [key: number]: string }
  showReopenButton?: boolean
  showBettingInterface?: boolean
  persistentBettingData?: { selectedShip: any, betAmount: string }
}

const props = withDefaults(defineProps<Props>(), {
  chaosEvents: () => ({}),
  placeIndicators: () => ({}),
  showReopenButton: false,
  showBettingInterface: true,
  persistentBettingData: () => ({ selectedShip: null, betAmount: '' })
})

// Emits
const emit = defineEmits<{
  'reopen-results': []
  'race-completed': [{ raceResult: any, playerShip: number, betAmount: string, actualPayout: string, jackpotTier: number, jackpotAmount: string }]
  'showShipInfo': [ship: any]
  'hideShipInfo': []
  'showPayoutInfo': []
  'hidePayoutInfo': []
}>()

// Track container ref
const trackContainer = ref<HTMLElement>()

// Use the unified ships composable
const { getShipImageName } = useShips()

// Computed properties
const isRaceFinished = computed(() => props.showReopenButton)

// Methods
const getShipPosition = (ship: RaceState) => {
  // Convert pixel-based position to viewport width percentage
  const maxPosition = TRACK_DISTANCE
  const currentPosition = ship.distance || 0
  const percentage = (currentPosition / maxPosition) * 100
  // Constrain to viewport width, leaving some margin
  return Math.min(percentage, 90) // Max 90vw to leave margin
}

const getShipVerticalPosition = (index: number) => {
  // Convert pixel-based vertical position to viewport height percentage
  const baseSpacing = 10 // 10vh spacing between ships (increased from 8)
  const startPosition = 4 // Start at 6vh from top (reduced from 10)
  return startPosition + (index * baseSpacing)
}

const onRaceCompleted = (data: any) => {
  emit('race-completed', data)
}
</script>

<style scoped>
.ship-container {
  transition: left 0.3s ease-out;
}

.ship-container img {
  filter: drop-shadow(0 0 8px rgba(255, 255, 255, 0.4));
}

.nameplate-bg {
  background: linear-gradient(135deg, rgba(0, 0, 0, 0.8), rgba(31, 41, 55, 0.9));
  border: 1px solid rgba(59, 130, 246, 0.3);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
}

.chaos-flash {
  animation: flash 1.5s ease-in-out;
}

@keyframes flash {
  0%, 100% { opacity: 0; transform: scale(0.8); }
  50% { opacity: 1; transform: scale(1.2); }
}
</style> 