<template>
  <div ref="trackContainer" class="relative w-full h-full bg-gray-900 overflow-hidden track border-2 border-gray-700">

    <!-- Reopen Results Button (always show for debugging) -->
    <div class="absolute bottom-2 left-2 z-10">
      <button 
        @click="$emit('reopen-results')"
        class="bg-cyan-600 hover:bg-cyan-700 text-white px-3 py-1 rounded text-xs font-bold transition-colors"
      >
        📊 View Results
      </button>
    </div>
    
    <!-- Finish Line -->
    <div class="absolute top-0 right-8 w-1 h-full bg-red-500/50"></div>
    <div class="absolute top-2 right-1 text-xs text-red-400 transform -rotate-90 origin-top-left">FINISH</div>
    
    <!-- Start Line -->
    <div class="absolute top-0 left-10 w-1 h-full bg-green-500/50"></div>
    <div class="absolute top-2 left-3 text-xs text-green-400 transform -rotate-90 origin-top-left">START</div>
    
    <!-- Ships -->
    <div 
      v-for="(ship, index) in ships" 
      :key="ship.id"
      :id="`ship-${ship.id}`"
      class="absolute w-4 h-4 rounded-full ship-dot flex items-center justify-center"
      :style="{
        backgroundColor: ship.color,
        top: `${getShipVerticalPosition(index)}px`,
        left: `${getShipPosition(ship)}px`
      }"
    >
      <span class="text-xs font-bold text-black">{{ ship.id }}</span>
      <div class="absolute -top-5 text-xs whitespace-nowrap text-gray-300">{{ ship.name }}</div>
      <div 
        :id="`chaos-flash-${ship.id}`"
        class="absolute text-center text-sm font-bold"
        :class="{ 'chaos-flash': chaosEvents[ship.id] }"
        :style="{ color: ship.color }"
      >{{ chaosEvents[ship.id] || '' }}</div>
      <div 
        :id="`place-indicator-${ship.id}`"
        class="absolute text-center text-lg font-bold"
        :class="{ 'chaos-flash': placeIndicators[ship.id] }"
        :style="{ color: ship.color, left: '-40px', top: '0px' }"
      >{{ placeIndicators[ship.id] || '' }}</div>
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
        <div class="bg-black/80 backdrop-blur-sm rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
          <BettingInterface 
            :persistent-betting-data="persistentBettingData"
            @race-completed="onRaceCompleted" 
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
}>()

const trackContainer = ref<HTMLElement>()

// Simple betting interface visibility - just use the prop directly
const showBettingInterface = computed(() => {
  return props.showBettingInterface
})

const getShipVerticalPosition = (index: number) => {
  // Get the container height dynamically
  const containerHeight = trackContainer.value?.clientHeight || 600
  const shipHeight = 16 // 4 * 4 (w-4 h-4)
  
  // Distribute ships evenly across the full height
  // Leave some padding at top and bottom (50px each)
  const usableHeight = containerHeight - 100 // 50px padding top and bottom
  const spacing = usableHeight / (props.ships.length - 1) // Even spacing between ships
  
  // Calculate position: start at 50px (top padding) + index * spacing
  return 50 + (index * spacing)
}

const getShipPosition = (ship: RaceState) => {
  // Calculate the available track width (from start position to finish line)
  // The finish line is at right-8 (8px from right edge)
  const containerWidth = trackContainer.value?.clientWidth || 800
  
  // CONFIGURABLE POSITIONING - Adjust these values to move ships and start line
  const LEFT_PADDING = 64 // Increase this to move ships further right
  const startPosition = LEFT_PADDING // Starting position from left
  const finishPosition = containerWidth - 32 // 8px from right + ship width (16px) + some margin
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

.ship-dot {
  transition: left 0.3s ease-out;
  box-shadow: 0 0 10px rgba(255, 255, 255, 0.3);
}

.chaos-flash {
  animation: flash 1.5s ease-in-out;
}

@keyframes flash {
  0%, 100% { opacity: 0; transform: scale(0.8); }
  50% { opacity: 1; transform: scale(1.2); }
}
</style> 