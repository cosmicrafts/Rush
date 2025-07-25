<template>
  <div ref="trackContainer" class="relative w-full h-[450px] bg-gray-900 rounded-lg p-4 border-2 border-gray-700 overflow-hidden track">
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
import { ref } from 'vue'

interface Props {
  ships: RaceState[]
  chaosEvents?: { [key: number]: string }
  placeIndicators?: { [key: number]: string }
}

const props = withDefaults(defineProps<Props>(), {
  chaosEvents: () => ({}),
  placeIndicators: () => ({})
})

const trackContainer = ref<HTMLElement>()

const getShipPosition = (ship: RaceState) => {
  // Calculate the available track width (from start position to finish line)
  // The finish line is at right-8 (8px from right edge)
  const containerWidth = trackContainer.value?.clientWidth || 800
  const startPosition = 10 // Starting position from left
  const finishPosition = containerWidth - 32 // 8px from right + ship width (16px) + some margin
  const availableTrackWidth = finishPosition - startPosition
  
  const progress = ship.distance / TRACK_DISTANCE
  const newLeft = startPosition + (progress * availableTrackWidth)
  
  return Math.min(newLeft, finishPosition)
}
</script> 