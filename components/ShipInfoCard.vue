<template>
  <Transition
    enter-active-class="transition-all duration-300 ease-out"
    enter-from-class="opacity-0 scale-95"
    enter-to-class="opacity-100 scale-100"
    leave-active-class="transition-all duration-200 ease-in"
    leave-from-class="opacity-100 scale-100"
    leave-to-class="opacity-0 scale-95"
  >
    <div
      v-if="show"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
      @click.self="$emit('close')"
    >
      <div class="bg-gray-900 border border-cyan-500/30 rounded-lg p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div class="flex justify-between items-start mb-4">
          <h2 class="text-xl font-bold text-cyan-400">🚀 Ship Details</h2>
          <button 
            @click="$emit('close')" 
            class="text-gray-400 hover:text-white text-xl"
          >
            ×
          </button>
        </div>
        
        <div v-if="ship" class="space-y-4">
          <!-- Ship Image and Name -->
          <div class="text-center">
            <img 
              :src="`/ships/${getShipImageName(ship.name)}.webp`"
              :alt="ship.name"
              class="w-24 h-24 object-contain mx-auto mb-3"
            />
            <h3 class="text-lg font-bold text-white">{{ ship.name }}</h3>
          </div>

          <!-- Stats -->
          <div class="bg-gray-800 border border-gray-700 rounded-lg p-4">
            <h4 class="text-sm font-bold text-purple-300 mb-3">📊 Ship Statistics</h4>
            <div class="grid grid-cols-2 gap-4 text-sm">
              <div class="text-center">
                <div class="text-gray-400 text-xs">Initial Speed</div>
                <div class="text-cyan-400 font-bold text-lg">{{ ship.stats.initialSpeed }}</div>
              </div>
              <div class="text-center">
                <div class="text-gray-400 text-xs">Acceleration</div>
                <div class="text-pink-400 font-bold text-lg">{{ ship.stats.acceleration }}</div>
              </div>
            </div>
          </div>

          <!-- Chaos Factor -->
          <div class="bg-gray-800 border border-gray-700 rounded-lg p-4">
            <h4 class="text-sm font-bold text-purple-300 mb-3 flex items-center gap-2">
              <img 
                :src="`/chaos/${getChaosFactorImage(ship.chaosFactor)}.webp`"
                :alt="ship.chaosFactor"
                class="w-5 h-5 object-contain"
              />
              Chaos Factor: {{ ship.chaosFactor }}
            </h4>
            <div class="text-gray-300 text-sm">
              <p class="mb-2">{{ getChaosFactorDescription(ship.chaosFactor) }}</p>
              <div class="bg-gray-700 rounded p-2 text-xs">
                <span class="text-amber-400 font-semibold">Chance:</span> 
                <span class="text-gray-300">{{ getChaosFactorChance(ship.chaosFactor) }}%</span>
              </div>
            </div>
          </div>

          <!-- Ship Description -->
          <div class="bg-gray-800 border border-gray-700 rounded-lg p-4">
            <h4 class="text-sm font-bold text-purple-300 mb-2">📝 Description</h4>
            <p class="text-gray-300 text-sm">
              {{ getShipDescription(ship.name) }}
            </p>
          </div>
        </div>
        
        <div class="flex justify-center mt-6">
          <button 
            @click="$emit('close')" 
            class="bg-gray-700 hover:bg-gray-600 text-white px-6 py-2 rounded text-sm transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import type { Ship } from '~/types/game'

interface Props {
  show: boolean
  ship: Ship | null
}

defineProps<Props>()

defineEmits<{
  close: []
}>()

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
  return shipNameMap[shipName] || 'comet'
}

// Function to get chaos factor image name
const getChaosFactorImage = (chaosFactor: string): string => {
  const chaosFactorMap: { [key: string]: string } = {
    'Overdrive': 'overdrive',
    'Unstable Engine': 'ue',
    'Slipstreamer': 'slipstreamer',
    'Quantum Tunneling': 'qt',
    'Last Stand Protocol': 'lsp',
    'Micro-warp Engine': 'mwe',
    'Rogue AI': 'rogueai',
    'Graviton Brake': 'gb'
  }
  return chaosFactorMap[chaosFactor] || 'overdrive'
}

// Function to get chaos factor description
const getChaosFactorDescription = (chaosFactor: string): string => {
  const descriptions: { [key: string]: string } = {
    'Overdrive': '10% chance to double speed for one turn',
    'Unstable Engine': '35% chance to triple acceleration for one turn',
    'Slipstreamer': '40% chance to gain +50 speed when trailing (not in 1st or 2nd place)',
    'Quantum Tunneling': '40% chance to teleport 25% of track distance',
    'Last Stand Protocol': '10% chance to quadruple speed in final 4 turns of the race',
    'Micro-warp Engine': '55% chance to double acceleration for one turn',
    'Rogue AI': '20% chance for random effect: x2 speed, /2 speed, x2 accel, or 0 accel',
    'Graviton Brake': '77% chance to slow 2nd place ship by 50% when in 1st place'
  }
  return descriptions[chaosFactor] || 'Unknown chaos factor'
}

// Function to get chaos factor chance
const getChaosFactorChance = (chaosFactor: string): number => {
  const chances: { [key: string]: number } = {
    'Overdrive': 10,
    'Unstable Engine': 35,
    'Slipstreamer': 40,
    'Quantum Tunneling': 40,
    'Last Stand Protocol': 10,
    'Micro-warp Engine': 55,
    'Rogue AI': 20,
    'Graviton Brake': 77
  }
  return chances[chaosFactor] || 0
}

// Function to get ship description
const getShipDescription = (shipName: string): string => {
  const descriptions: { [key: string]: string } = {
    'The Comet': 'A sleek and agile ship designed for speed. The Comet excels at maintaining high velocities and can activate Overdrive for explosive bursts of acceleration.',
    'The Juggernaut': 'A massive, heavily armored vessel built for endurance. The Juggernaut\'s Unstable Engine provides unpredictable but powerful acceleration boosts.',
    'The Shadow': 'A stealthy ship that thrives in the wake of others. The Shadow uses Slipstreamer technology to gain speed when trailing behind competitors.',
    'The Phantom': 'A mysterious ship capable of quantum manipulation. The Phantom can teleport across significant portions of the track using Quantum Tunneling.',
    'The Phoenix': 'A legendary ship that grows stronger when all seems lost. The Phoenix activates Last Stand Protocol in the final moments of the race.',
    'The Vanguard': 'A cutting-edge ship with advanced propulsion systems. The Vanguard\'s Micro-warp Engine provides frequent acceleration boosts.',
    'The Wildcard': 'An experimental ship with unpredictable AI systems. The Wildcard\'s Rogue AI can provide massive benefits or crippling drawbacks.',
    'The Apex': 'The ultimate racing machine with gravitational manipulation technology. The Apex uses Graviton Brake to slow down competitors when in the lead.'
  }
  return descriptions[shipName] || 'A mysterious ship with unknown capabilities.'
}
</script>
