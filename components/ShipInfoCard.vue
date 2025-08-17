<template>
  <Transition
    enter-active-class="modal-enter-active"
    enter-from-class="modal-enter-from"
    enter-to-class="modal-enter-to"
    leave-active-class="modal-leave-active"
    leave-from-class="modal-leave-from"
    leave-to-class="modal-leave-to"
  >
    <div
      v-if="show"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/25 backdrop-blur-sm px-4"
      @click.self="$emit('close')"
    >
      <!-- Enhanced animated background particles with COSMIC RUSH theme -->
      <div class="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          class="absolute top-1/4 left-1/4 w-3 h-3 bg-cyan-400 rounded-full animate-pulse opacity-60 blur-sm shadow-lg shadow-cyan-400/50"
        />
        <div
          class="absolute top-3/4 right-1/4 w-2 h-2 bg-pink-500 rounded-full animate-ping opacity-50 shadow-lg shadow-pink-500/50"
        />
        <div
          class="absolute bottom-1/4 left-1/3 w-2 h-2 bg-cyan-400 rounded-full animate-bounce opacity-60 shadow-lg shadow-cyan-400/50"
        />
        <div
          class="absolute top-1/2 right-1/3 w-1 h-1 bg-pink-500 rounded-full animate-pulse opacity-40 shadow-lg shadow-pink-500/50"
        />
        <div
          class="absolute bottom-1/3 right-1/4 w-1.5 h-1.5 bg-cyan-400 rounded-full animate-ping opacity-30 shadow-lg shadow-cyan-400/50"
        />

        <!-- Circuit board lines -->
        <div
          class="absolute top-1/4 left-0 w-32 h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-30"
        />
        <div
          class="absolute bottom-1/4 right-0 w-32 h-px bg-gradient-to-l from-transparent via-pink-500 to-transparent opacity-30"
        />
        <div
          class="absolute top-0 left-1/3 w-px h-32 bg-gradient-to-b from-transparent via-cyan-400 to-transparent opacity-30"
        />
        <div
          class="absolute bottom-0 right-1/3 w-px h-32 bg-gradient-to-t from-transparent via-pink-500 to-transparent opacity-30"
        />

        <!-- Scattered plus signs -->
        <div class="absolute top-1/3 left-1/6 text-pink-500 text-xs animate-pulse">+</div>
        <div class="absolute bottom-1/3 right-1/6 text-cyan-400 text-xs animate-ping">+</div>
        <div class="absolute top-2/3 left-2/3 text-pink-500 text-xs animate-bounce">+</div>
      </div>

      <div class="modal-container modal-container-sm flex flex-col">
        <!-- Enhanced glowing border effect with COSMIC RUSH colors -->
        <div
          class="absolute inset-0 bg-gradient-to-r from-cyan-500/20 via-pink-500/20 to-cyan-500/20 blur-2xl"
        />

        <!-- Modal Header -->
        <div class="modal-header flex-shrink-0">
          <div class="modal-header-container">
            <div class="modal-header-title">
              <Icon name="simple-icons:starship" class="modal-header-icon" />
              <h2 class="modal-header-text-gradient">Ship Details</h2>
            </div>
            <button class="modal-close-btn" @click="$emit('close')">
              ×
            </button>
          </div>
        </div>

        <!-- Modal Content -->
        <div class="modal-content custom-scrollbar flex-1">
          <div v-if="ship" class="p-2 space-y-2">
            <!-- Ship Header Section -->
            <div class="text-center space-y-1">
              <nuxt-img
                :src="`/ships/${getShipImageName(ship.name)}.webp`"
                :alt="ship.name"
                class="w-32 h-32 object-contain mx-auto"
                width="128"
                height="128"
                format="webp"
                quality="85"
                sizes="128px"
              />
              <h3 class="text-md font-bold text-white tracking-wide">{{ ship.name }}</h3>
            </div>

            <!-- Unified Ship Details Section -->
            <div class="bg-gray-800/80 border border-gray-700 rounded-xl p-4 backdrop-blur-sm space-y-4">
              <!-- Chaos Factor Row -->
              <div class="flex items-start space-x-4">
                <!-- Large Chaos Factor Image -->
                <div class="flex-shrink-0">
                  <nuxt-img
                    :src="`/chaos/${getChaosFactorImage(ship.chaosFactor)}.webp`"
                    :alt="ship.chaosFactor"
                    class="w-24 h-24 object-contain"
                    width="96"
                    height="96"
                    format="webp"
                    quality="85"
                    sizes="96px"
                  />
                </div>
                
                <!-- Chaos Factor Details -->
                <div class="flex-1 space-y-2">
                  <div class="flex items-center space-x-3">
                    <span class="text-lg font-bold text-cyan-400">{{ ship.chaosFactor }}</span>
                  </div>
                  
                  <p class="text-gray-300 text-xs leading-relaxed">
                    {{ getChaosFactorDescription(ship.chaosFactor) }}
                  </p>
                  
                  <div class="bg-gray-700/50 rounded-lg p-2 border border-gray-600">
                    <div class="flex items-center justify-between">
                      <span class="text-amber-400 font-semibold text-xs">Activation Chance</span>
                      <span class="text-white font-bold text-base">{{ getChaosFactorChance(ship.chaosFactor) }}%</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Statistics Row -->
              <div class="grid grid-cols-2 gap-4 pt-3 border-t border-gray-600">
                <div class="text-center space-y-1">
                  <div class="text-gray-400 text-xs font-medium">Initial Speed</div>
                  <div class="text-cyan-400 font-bold text-lg">{{ ship.stats.initialSpeed }}</div>
                  <div class="w-12 h-0.5 bg-cyan-400/30 rounded-full mx-auto"></div>
                </div>
                <div class="text-center space-y-1">
                  <div class="text-gray-400 text-xs font-medium">Acceleration</div>
                  <div class="text-pink-400 font-bold text-lg">{{ ship.stats.acceleration }}</div>
                  <div class="w-12 h-0.5 bg-pink-400/30 rounded-full mx-auto"></div>
                </div>
              </div>

              <!-- Description Row -->
              <div class="pt-3 border-t border-gray-600">
                <p class="text-gray-300 text-xs leading-relaxed">
                  {{ getShipDescription(ship.name) }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Modal Footer -->
        <div class="modal-footer flex-shrink-0">
          <div class="flex justify-center">
            <button
              class="btn btn-primary btn-sm flex items-center space-x-2"
              @click="$emit('close')"
            >
              <Icon name="simple-icons:starship" class="w-4 h-4" />
              <span>Close</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
  import type { Ship } from '~/composables/useGame'

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
      'The Apex': 'apex',
    }
    return shipNameMap[shipName] || 'comet'
  }

  // Function to get chaos factor image name
  const getChaosFactorImage = (chaosFactor: string): string => {
    const chaosFactorMap: { [key: string]: string } = {
      Overdrive: 'overdrive',
      'Unstable Engine': 'ue',
      Slipstreamer: 'slipstreamer',
      'Quantum Tunneling': 'qt',
      'Last Stand Protocol': 'lsp',
      'Micro-warp Engine': 'mwe',
      'Rogue AI': 'rogueai',
      'Graviton Brake': 'gb',
    }
    return chaosFactorMap[chaosFactor] || 'overdrive'
  }

  // Function to get chaos factor description
  const getChaosFactorDescription = (chaosFactor: string): string => {
    const descriptions: { [key: string]: string } = {
      Overdrive: '10% chance to double speed for one turn',
      'Unstable Engine': '35% chance to triple acceleration for one turn',
      Slipstreamer: '40% chance to gain +50 speed when trailing (not in 1st or 2nd place)',
      'Quantum Tunneling': '40% chance to teleport 25% of track distance',
      'Last Stand Protocol': '10% chance to quadruple speed in final 4 turns of the race',
      'Micro-warp Engine': '55% chance to double acceleration for one turn',
      'Rogue AI': '20% chance for random effect: x2 speed, /2 speed, x2 accel, or 0 accel',
      'Graviton Brake': '77% chance to slow 2nd place ship by 50% when in 1st place',
    }
    return descriptions[chaosFactor] || 'Unknown chaos factor'
  }

  // Function to get chaos factor chance
  const getChaosFactorChance = (chaosFactor: string): number => {
    const chances: { [key: string]: number } = {
      Overdrive: 10,
      'Unstable Engine': 35,
      Slipstreamer: 40,
      'Quantum Tunneling': 40,
      'Last Stand Protocol': 10,
      'Micro-warp Engine': 55,
      'Rogue AI': 20,
      'Graviton Brake': 77,
    }
    return chances[chaosFactor] || 0
  }

  // Function to get ship description
  const getShipDescription = (shipName: string): string => {
    const descriptions: { [key: string]: string } = {
      'The Comet':
        'A sleek and agile ship designed for speed. The Comet excels at maintaining high velocities and can activate Overdrive for explosive bursts of acceleration.',
      'The Juggernaut':
        "A massive, heavily armored vessel built for endurance. The Juggernaut's Unstable Engine provides unpredictable but powerful acceleration boosts.",
      'The Shadow':
        'A stealthy ship that thrives in the wake of others. The Shadow uses Slipstreamer technology to gain speed when trailing behind competitors.',
      'The Phantom':
        'A mysterious ship capable of quantum manipulation. The Phantom can teleport across significant portions of the track using Quantum Tunneling.',
      'The Phoenix':
        'A legendary ship that grows stronger when all seems lost. The Phoenix activates Last Stand Protocol in the final moments of the race.',
      'The Vanguard':
        "A cutting-edge ship with advanced propulsion systems. The Vanguard's Micro-warp Engine provides frequent acceleration boosts.",
      'The Wildcard':
        "An experimental ship with unpredictable AI systems. The Wildcard's Rogue AI can provide massive benefits or crippling drawbacks.",
      'The Apex':
        'The ultimate racing machine with gravitational manipulation technology. The Apex uses Graviton Brake to slow down competitors when in the lead.',
    }
    return descriptions[shipName] || 'A mysterious ship with unknown capabilities.'
  }
</script>
