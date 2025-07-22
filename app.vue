<template>
  <div class="flex flex-col items-center justify-center min-h-screen p-4">
    <div class="w-full max-w-4xl bg-gray-800 p-6 rounded-xl shadow-2xl border border-gray-700">
      <h1 class="text-3xl font-bold text-center mb-2 text-cyan-400">Cosmicrafts Rush</h1>
      <p class="text-center text-gray-400 mb-6">Bet on AI spaceships, watch chaos unfold, and claim your winnings on-chain!</p>

      <!-- Race Track -->
      <RaceTrack :ships="currentRace" :chaos-events="chaosEvents" />

      <!-- Controls -->
      <div class="mt-6 flex flex-col items-center">
        <div class="flex space-x-4">
          <UButton
            id="start-race-btn"
            :disabled="raceInProgress"
            @click="startRace"
            class="bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-3 px-8 rounded-lg shadow-lg transition-transform transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-cyan-300"
          >
            {{ raceInProgress ? 'Race in Progress...' : 'Start New Race' }}
          </UButton>
          <UButton
            id="run-1000-sims-btn"
            :disabled="raceInProgress"
            @click="runBulkSimulations"
            class="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-3 px-8 rounded-lg shadow-lg transition-transform transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-indigo-300"
          >
            Run 1000 Simulations
          </UButton>
        </div>
        <div id="winner-display" class="mt-4 text-2xl font-bold text-yellow-400 h-8">
          {{ winnerDisplay }}
        </div>
      </div>
      
      <!-- Logs -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <div class="p-4 bg-gray-900 rounded-lg max-h-48 overflow-y-auto border border-gray-700 race-log">
          <h3 class="text-lg font-semibold text-gray-300 mb-2">Race Log</h3>
          <div class="text-sm text-gray-400 space-y-1">
            <div v-for="(entry, index) in raceLog" :key="index" v-html="entry"></div>
          </div>
        </div>
        <div class="p-4 bg-gray-900 rounded-lg max-h-48 overflow-y-auto border border-gray-700 race-log">
          <h3 class="text-lg font-semibold text-gray-300 mb-2">Bulk Simulation Results</h3>
          <div class="text-sm text-gray-400 space-y-1">
            <div v-for="(count, shipId) in bulkResults" :key="shipId">
              <span :style="{ color: getShipColor(Number(shipId)), fontWeight: '600' }">
                {{ getShipName(Number(shipId)) }}:
              </span>
              {{ count }} wins ({{ (count / 10).toFixed(1) }}%)
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useGameStore } from './stores/game'
import { SHIPS_ROSTER } from './data/ships'
import RaceTrack from './components/RaceTrack.vue'
import type { RaceState } from './types/game'

const gameStore = useGameStore()
const winnerDisplay = ref('')
const chaosEvents = ref<{ [key: number]: string }>({})

// Computed properties
const currentRace = computed(() => gameStore.currentRace)
const raceInProgress = computed(() => gameStore.raceInProgress)
const raceLog = computed(() => gameStore.raceLog)
const bulkResults = computed(() => gameStore.bulkResults)

// Methods
const getShipColor = (shipId: number) => {
  const ship = SHIPS_ROSTER.find(s => s.id === shipId)
  return ship?.color || '#ffffff'
}

const getShipName = (shipId: number) => {
  const ship = SHIPS_ROSTER.find(s => s.id === shipId)
  return ship?.name || 'Unknown'
}

const startRace = () => {
  if (gameStore.raceInProgress) return
  
  const simulationResult = gameStore.runRaceSimulation()
  visualizeRace(simulationResult)
}

const visualizeRace = (simulationResult: any) => {
  gameStore.setRaceInProgress(true)
  winnerDisplay.value = ''
  gameStore.addRaceLogEntry('')
  chaosEvents.value = {}

  let currentTurn = 1
  const interval = setInterval(() => {
    if (currentTurn > 10) {
      clearInterval(interval)
      winnerDisplay.value = `Winner: ${simulationResult.winner.name}!`
      gameStore.setRaceInProgress(false)
      return
    }

    const turnEvents = simulationResult.replayLog.filter((e: any) => e.turn === currentTurn)
    gameStore.addRaceLogEntry(`<span class="font-bold text-cyan-400">Turn ${currentTurn}:</span>`)

    // Update ship positions for this turn
    const updatedRace = [...gameStore.currentRace]
    for (const event of turnEvents) {
      const shipIndex = updatedRace.findIndex(s => s.id === event.shipId)
      if (shipIndex !== -1) {
        updatedRace[shipIndex] = {
          ...updatedRace[shipIndex],
          distance: event.distance
        } as RaceState
      }
      
      const shipData = SHIPS_ROSTER.find(s => s.id === event.shipId)
      
      gameStore.addRaceLogEntry(
        `<p class="ml-4">${shipData?.name} moved ${Math.round(event.moveAmount)} units. (Total: ${Math.round(event.distance)})</p>`
      )

      if (event.event) {
        // Add chaos flash animation
        chaosEvents.value[event.shipId] = event.event.text
        setTimeout(() => {
          chaosEvents.value[event.shipId] = ''
        }, 700)
        
        gameStore.addRaceLogEntry(
          `<p class="ml-4 font-semibold" style="color: ${shipData?.color}">CHAOS: ${shipData?.name} triggered ${event.event.text}</p>`
        )
      }
    }
    
    // Update the race state in the store
    gameStore.state.currentRace = updatedRace
    
    currentTurn++
  }, 800)
}

const runBulkSimulations = () => {
  if (gameStore.raceInProgress) return
  
  gameStore.runBulkSimulations()
}

// Initialize
onMounted(() => {
  gameStore.startNewRace()
})
</script> 