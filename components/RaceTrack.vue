<template>
  <div ref="trackContainer" class="relative w-full h-[450px] bg-gray-900 rounded-lg p-4 border-2 border-gray-700 overflow-hidden track">
    <!-- Debug info -->
    <div class="absolute top-2 left-2 text-xs text-yellow-400 z-10">
      Ships: {{ ships.length }}
    </div>
    
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
    
    <!-- Ships -->
    <div 
      v-for="(ship, index) in ships" 
      :key="ship.id"
      :id="`ship-${ship.id}`"
      class="absolute w-4 h-4 rounded-full ship-dot flex items-center justify-center"
      :style="{
        backgroundColor: ship.color,
        top: `${index * (450 / ships.length) + (450 / ships.length / 2) - 8}px`,
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
  </div>
</template>

<script setup lang="ts">
import type { RaceState } from '../types/game'
import { TRACK_DISTANCE } from '../data/ships'
import { ref, watch } from 'vue'

interface Props {
  ships: RaceState[]
  chaosEvents?: { [key: number]: string }
  placeIndicators?: { [key: number]: string }
  showReopenButton?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  chaosEvents: () => ({}),
  placeIndicators: () => ({}),
  showReopenButton: false
})

// Emits
const emit = defineEmits<{
  'reopen-results': []
}>()

const trackContainer = ref<HTMLElement>()

// Watch for changes in ships prop
watch(() => props.ships, (newShips, oldShips) => {
  // Ships prop changed
}, { deep: true })

// Watch for changes in chaos events
watch(() => props.chaosEvents, (newEvents, oldEvents) => {
  // Chaos events changed
}, { deep: true })

// Watch for changes in place indicators
watch(() => props.placeIndicators, (newIndicators, oldIndicators) => {
  // Place indicators changed
}, { deep: true })

const getShipPosition = (ship: RaceState) => {
  // Calculate the available track width (from start position to finish line)
  // The finish line is at right-8 (8px from right edge)
  const containerWidth = trackContainer.value?.clientWidth || 800
  const startPosition = 10 // Starting position from left
  const finishPosition = containerWidth - 32 // 8px from right + ship width (16px) + some margin
  const availableTrackWidth = finishPosition - startPosition
  
  const progress = ship.distance / TRACK_DISTANCE
  const newLeft = startPosition + (progress * availableTrackWidth)
  const finalPosition = Math.min(newLeft, finishPosition)
  
  return finalPosition
}
</script> 