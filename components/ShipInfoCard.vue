<template>
  <Transition
    enter-active-class="duration-500 ease-out"
    enter-from-class="transform scale-95 opacity-0"
    enter-to-class="transform scale-100 opacity-100"
    leave-active-class="duration-300 ease-in"
    leave-from-class="transform scale-100 opacity-100"
    leave-to-class="transform scale-95 opacity-0"
  >
    <div
      v-if="show"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/25 backdrop-blur-sm px-4"
      @click.self="$emit('close')"
    >
      <!-- Enhanced animated background particles with COSMIC RUSH theme -->
      <div class="absolute inset-0 overflow-hidden pointer-events-none">
        <div class="absolute top-1/4 left-1/4 w-3 h-3 bg-cyan-400 rounded-full animate-pulse opacity-60 blur-sm shadow-lg shadow-cyan-400/50"></div>
        <div class="absolute top-3/4 right-1/4 w-2 h-2 bg-pink-500 rounded-full animate-ping opacity-50 shadow-lg shadow-pink-500/50"></div>
        <div class="absolute bottom-1/4 left-1/3 w-2 h-2 bg-cyan-400 rounded-full animate-bounce opacity-60 shadow-lg shadow-cyan-400/50"></div>
        <div class="absolute top-1/2 right-1/3 w-1 h-1 bg-pink-500 rounded-full animate-pulse opacity-40 shadow-lg shadow-pink-500/50"></div>
        <div class="absolute bottom-1/3 right-1/4 w-1.5 h-1.5 bg-cyan-400 rounded-full animate-ping opacity-30 shadow-lg shadow-cyan-400/50"></div>
        
        <!-- Circuit board lines -->
        <div class="absolute top-1/4 left-0 w-32 h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-30"></div>
        <div class="absolute bottom-1/4 right-0 w-32 h-px bg-gradient-to-l from-transparent via-pink-500 to-transparent opacity-30"></div>
        <div class="absolute top-0 left-1/3 w-px h-32 bg-gradient-to-b from-transparent via-cyan-400 to-transparent opacity-30"></div>
        <div class="absolute bottom-0 right-1/3 w-px h-32 bg-gradient-to-t from-transparent via-pink-500 to-transparent opacity-30"></div>
        
        <!-- Scattered plus signs -->
        <div class="absolute top-1/3 left-1/6 text-pink-500 text-xs animate-pulse">+</div>
        <div class="absolute bottom-1/3 right-1/6 text-cyan-400 text-xs animate-ping">+</div>
        <div class="absolute top-2/3 left-2/3 text-pink-500 text-xs animate-bounce">+</div>
      </div>

      <div class="relative w-full max-w-md mx-auto bg-gradient-to-tr from-gray-900 via-black to-gray-900 shadow-2xl border border-cyan-500/30 overflow-hidden backdrop-blur-sm">
        <!-- Enhanced glowing border effect with COSMIC RUSH colors -->
        <div class="absolute inset-0 bg-gradient-to-r from-cyan-500/20 via-pink-500/20 to-cyan-500/20 blur-2xl"></div>
        
        <!-- Header with COSMIC RUSH theme -->
        <div class="relative p-6 text-center border-b border-cyan-500/20">
          <h2 class="text-2xl font-extrabold bg-gradient-to-r from-cyan-400 to-pink-500 bg-clip-text text-transparent tracking-tight">
            🚀 Ship Details
          </h2>
          <button 
            @click="$emit('close')" 
            class="absolute top-4 right-4 text-gray-400 hover:text-white text-xl transition-colors"
          >
            ×
          </button>
        </div>
        
        <!-- Content -->
        <div class="relative p-6 space-y-6 max-h-[60vh] overflow-y-auto">
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
        </div>
        
        <!-- Footer with COSMIC RUSH themed button -->
        <div class="relative bg-gradient-to-t from-black/50 to-transparent p-6 border-t border-cyan-500/20">
          <div class="flex justify-center">
            <button 
              @click="$emit('close')" 
              class="bg-gradient-to-r from-cyan-400 to-pink-500 hover:from-cyan-500 hover:to-pink-600 text-white font-bold py-3 px-8 rounded-sm shadow-lg shadow-cyan-400/25 transition-all duration-200 transform hover:scale-102"
            >
              <span class="flex items-center justify-center space-x-2">
                <span>🚀</span>
                <span>Close</span>
              </span>
            </button>
          </div>
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
