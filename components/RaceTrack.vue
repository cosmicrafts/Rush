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
       class="absolute w-12 h-12 transition-all duration-200 z-20"
       :style="{
         top: `${index * (450 / ships.length) + (450 / ships.length / 2) - 24}px`,
         left: `${getShipPosition(ship)}px`
       }"
     >
       <!-- Ship image -->
       <img 
         :src="`/ships/${getShipImageName(ship.id)}.webp`" 
         :alt="getShipName(ship.id)"
         :data-ship-id="ship.id"
         class="w-full h-full object-cover rounded-sm"
         @error="handleShipImageError"
         @load="handleShipImageLoad"
       />
       
       <!-- Fallback if image fails -->
       <div v-if="!shipImageLoaded[ship.id]" class="w-full h-full bg-gradient-to-r from-cyan-400 to-pink-500 rounded-sm flex items-center justify-center">
         <span class="text-xs font-bold text-white">{{ ship.id }}</span>
       </div>
     </div>
     
     <!-- Nameplates -->
     <div 
       v-for="(ship, index) in ships" 
       :key="`nameplate-${ship.id}`"
       class="absolute text-xs text-white font-medium bg-black/30 px-2 py-1 rounded-sm z-30 backdrop-blur-sm"
       :style="{
         top: `${index * (450 / ships.length) + (450 / ships.length / 2) - 32}px`,
         left: `${getShipPosition(ship) + 6}px`,
         transform: 'translateX(-50%)'
       }"
     >
       {{ getShipName(ship.id) }}
     </div>
     
     <!-- Chaos events -->
     <div 
       v-for="(ship, index) in ships" 
       :key="`chaos-${ship.id}`"
       :id="`chaos-flash-${ship.id}`"
       class="absolute text-center text-sm font-bold bg-black/50 px-2 py-1 rounded-sm z-30"
       :class="{ 'chaos-flash': chaosEvents[ship.id] }"
       :style="{ 
         color: ship.color,
         top: `${index * (450 / ships.length) + (450 / ships.length / 2) + 8}px`,
         left: `${getShipPosition(ship)}px`,
         transform: 'translateX(-50%)'
       }"
     >{{ chaosEvents[ship.id] || '' }}</div>
     
     <!-- Place indicators -->
     <div 
       v-for="(ship, index) in ships" 
       :key="`place-${ship.id}`"
       :id="`place-indicator-${ship.id}`"
       class="absolute text-center text-lg font-bold bg-gradient-to-r from-cyan-400 to-pink-500 bg-clip-text text-transparent z-30"
       :class="{ 'chaos-flash': placeIndicators[ship.id] }"
       :style="{ 
         top: `${index * (450 / ships.length) + (450 / ships.length / 2) - 8}px`,
         left: `${getShipPosition(ship) - 50}px`
       }"
     >{{ placeIndicators[ship.id] || '' }}</div>
  </div>
</template>

<script setup lang="ts">
import type { RaceState } from '../types/game'
import { TRACK_DISTANCE } from '../data/ships'
import { ref, watch } from 'vue'
import { useWeb3 } from '~/composables/useWeb3'

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
const { getShipName } = useWeb3()

// State to track if ship images have loaded
const shipImageLoaded = ref<Record<number, boolean>>({})

// Ship name to image mapping
const shipImageMapping = {
  'The Comet': 'comet',
  'The Juggernaut': 'juggernaut', 
  'The Shadow': 'shadow',
  'The Phantom': 'phantom',
  'The Phoenix': 'phoenix',
  'The Vanguard': 'vanguard',
  'The Wildcard': 'wildcard',
  'The Apex': 'apex',
  // Fallback mappings without "The" prefix
  'Comet': 'comet',
  'Juggernaut': 'juggernaut', 
  'Shadow': 'shadow',
  'Phantom': 'phantom',
  'Phoenix': 'phoenix',
  'Vanguard': 'vanguard',
  'Wildcard': 'wildcard',
  'Apex': 'apex'
}

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

const getShipImageName = (shipId: number) => {
  const shipName = getShipName(shipId)
  const imageName = shipImageMapping[shipName as keyof typeof shipImageMapping] || 'default'
  return imageName
}

const handleShipImageError = (event: Event) => {
  const img = event.target as HTMLImageElement
  const shipId = parseInt(img.dataset.shipId || '0')
  shipImageLoaded.value[shipId] = false // Mark as failed to load
}

const handleShipImageLoad = (event: Event) => {
  const img = event.target as HTMLImageElement
  const shipId = parseInt(img.dataset.shipId || '0')
  shipImageLoaded.value[shipId] = true // Mark as loaded successfully
}
</script> 