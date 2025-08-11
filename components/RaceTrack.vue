<template>
  <div ref="trackContainer" class="relative w-full h-full overflow-hidden bg-transparent">

    <!-- View Results Button - Only show after race is finished -->
    <div v-if="isRaceFinished" class="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10">
      <button 
        @click="$emit('reopen-results')"
        class="bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-2 rounded text-sm font-bold transition-colors"
      >
        📊 View Results
      </button>
    </div>

    <!-- Ships -->
    <div 
      v-for="(ship, index) in ships" 
      :key="ship.id"
      :id="`ship-${ship.id}`"
      class="absolute ship-container flex items-center justify-center z-10"
      :style="{
        top: `${getShipVerticalPosition(index)}px`,
        left: `${getShipPosition(ship)}px`
      }"
    >
      <img 
        :src="`/ships/${getShipImageName(ship.name)}.webp`"
        :alt="ship.name"
        class="w-16 h-16 object-contain transform rotate-90"
      />
      <div v-if="!isRaceFinished" class="mr-20 text-xs whitespace-nowrap text-gray-300 font-semibold">{{ ship.name }}</div>
      <div 
        :id="`chaos-flash-${ship.id}`"
        class="absolute text-center text-sm font-bold"
        :class="{ 'chaos-flash': chaosEvents[ship.id] }"
        :style="{ color: ship.color, left: '-256px', top: '50%', transform: 'translateY(-50%)' }"
      >{{ chaosEvents[ship.id] || '' }}</div>
      <div 
        v-if="placeIndicators[ship.id]"
        :id="`place-indicator-${ship.id}`"
        class="absolute text-center text-lg font-bold"
        :class="{ 'chaos-flash': placeIndicators[ship.id] }"
        :style="{ color: ship.color, left: '-72px', top: '50%', transform: 'translateY(-50%)' }"
      >{{ placeIndicators[ship.id] }}</div>
    </div>

    <!-- No Ships Message -->
    <div v-if="ships.length === 0" class="absolute inset-0 flex items-center justify-center">
      <div class="text-center">
        <div class="text-gray-400 text-lg mb-2">🚀 Race Track Ready</div>
        <div class="text-gray-500 text-sm">Waiting for ships to load...</div>
      </div>
    </div>

    <!-- Betting Interface - Centered overlay -->
    <Transition
      enter-active-class="transition-all duration-500 ease-out"
      enter-from-class="opacity-0 scale-95"
      enter-to-class="opacity-100 scale-100"
      leave-active-class="transition-all duration-300 ease-in"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-0"
    >
      <div 
        v-if="showBettingInterface"
        class="absolute inset-0 flex items-center justify-center z-20"
      >
        <div class="backdrop-blur-sm rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
          <BettingInterface 
            :persistent-betting-data="persistentBettingData"
            @race-completed="onRaceCompleted"
            @show-ship-info="$emit('showShipInfo', $event)"
            @hide-ship-info="$emit('hideShipInfo')"
          />
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
}>()

const trackContainer = ref<HTMLElement>()

// Function to get ship image name from ship name
const getShipImageName = (shipName: string): string => {
  const shipNameMap: { [key: string]: string } = {
    'The Comet': 'comet',
    'The Juggernaut': 'juggernaut',
    'The Shadow': 'shadow',
    'The Phantom': 'phantom',
    'The Phoenix': 'phoenix',
    'The Vanguard': 'vanguard',
    'The Wildcard': 'wildcard',
    'The Apex': 'apex'
  }
  return shipNameMap[shipName] || 'comet' // fallback to comet if not found
}

// Simple betting interface visibility - just use the prop directly
const showBettingInterface = computed(() => {
  return props.showBettingInterface
})

// Check if race is finished (any ship has reached the finish line)
const isRaceFinished = computed(() => {
  return props.ships.some(ship => ship.distance >= TRACK_DISTANCE)
})

// Debug: Log ships when they change
watch(() => props.ships, (newShips) => {
  console.log('🚀 Ships updated in RaceTrack:', newShips)
}, { immediate: true })

const getShipVerticalPosition = (index: number) => {
  // Get the container height dynamically
  const containerHeight = trackContainer.value?.clientHeight || 600
  const shipHeight = 128 // w-16 h-16 = 64px
  
  // Use fixed spacing between ships for tighter positioning
  const fixedSpacing = 96 // 80px between each ship
  const totalShipArea = (props.ships.length - 1) * fixedSpacing + shipHeight
  
  // Center the entire ship group in the container
  const startY = (containerHeight - totalShipArea) / 2
  
  // Calculate position: start at center point + index * fixed spacing
  return startY + (index * fixedSpacing)
}

const getShipPosition = (ship: RaceState) => {
  // Calculate the available track width (from start position to finish line)
  // The finish line is at right-8 (8px from right edge)
  const containerWidth = trackContainer.value?.clientWidth || 800
  
  // CONFIGURABLE POSITIONING - Adjust these values to move ships and start line
  const LEFT_PADDING = 64 // Increase this to move ships further right
  const startPosition = LEFT_PADDING // Starting position from left
  const finishPosition = containerWidth - 48 // 8px from right + ship width (64px) + some margin
  const availableTrackWidth = finishPosition - startPosition
  
  const progress = ship.distance / TRACK_DISTANCE
  const newLeft = startPosition + (progress * availableTrackWidth)
  const finalPosition = Math.min(newLeft, finishPosition)
  
  // When ship hasn't moved (distance = 0), position it at the start line
  if (ship.distance === 0) {
    return LEFT_PADDING // Align with the start line
  }
  
  return finalPosition
}

// Handle race completion from betting interface
const onRaceCompleted = (data: { raceResult: any, playerShip: number, betAmount: string, actualPayout: string, jackpotTier: number, jackpotAmount: string }) => {
  emit('race-completed', data)
}
</script>

<style scoped>
.track {
  background: linear-gradient(90deg, 
    rgba(17, 24, 39, 0.8) 0%, 
    rgba(31, 41, 55, 0.6) 50%, 
    rgba(17, 24, 39, 0.8) 100%
  );
}

.ship-container {
  transition: left 0.3s ease-out;
}

.ship-container img {
  filter: drop-shadow(0 0 8px rgba(255, 255, 255, 0.4));
}

.chaos-flash {
  animation: flash 1.5s ease-in-out;
}

@keyframes flash {
  0%, 100% { opacity: 0; transform: scale(0.8); }
  50% { opacity: 1; transform: scale(1.2); }
}
</style> 