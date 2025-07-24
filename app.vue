<template>
  <div class="flex flex-col items-center justify-center min-h-screen p-4">
    <div class="w-full max-w-6xl bg-gray-800 p-6 rounded-xl shadow-2xl border border-gray-700">
      <h1 class="text-3xl font-bold text-center mb-2 text-cyan-400">Cosmicrafts Rush</h1>
      <p class="text-center text-gray-400 mb-6">Bet on AI spaceships, watch chaos unfold, and claim your winnings on-chain!</p>
      
      <!-- Network Status -->
      <div v-if="isConnected && !isCorrectNetwork" class="mb-4 p-3 bg-red-900/50 border border-red-500 rounded-lg text-center">
        <p class="text-red-400 text-sm">
          ⚠️ Wrong network detected. Please switch to Somnia Testnet to place bets.
        </p>
      </div>

      <!-- Main Content Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Race Track and Controls -->
        <div class="lg:col-span-2">
          <!-- Race Track -->
          <RaceTrack :ships="currentRace" :chaos-events="chaosEvents" :place-indicators="placeIndicators" />

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
                <div v-for="result in sortedBulkResults" :key="result.shipId">
                  <span :style="{ color: getShipColor(result.shipId), fontWeight: '600' }">
                    {{ getShipName(result.shipId) }}:
                  </span>
                  {{ result.count }} wins ({{ (result.count / 10).toFixed(1) }}%)
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Betting Interface -->
        <div class="lg:col-span-1">
          <BettingInterface />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useGameStore } from './stores/game'
import { useWeb3 } from './composables/useWeb3'
import { SHIPS_ROSTER } from './data/ships'
import RaceTrack from './components/RaceTrack.vue'
import BettingInterface from './components/BettingInterface.vue'
import type { RaceState } from './types/game'

const gameStore = useGameStore()
const { isConnected, isCorrectNetwork } = useWeb3()
const winnerDisplay = ref('')
const chaosEvents = ref<{ [key: number]: string }>({})
const placeIndicators = ref<{ [key: number]: string }>({})

// Computed properties
const currentRace = computed(() => gameStore.currentRace)
const raceInProgress = computed(() => gameStore.raceInProgress)
const raceLog = computed(() => gameStore.raceLog)
const bulkResults = computed(() => gameStore.bulkResults)

const sortedBulkResults = computed(() => {
  const results = Object.entries(gameStore.bulkResults)
    .map(([shipId, count]) => ({ shipId: Number(shipId), count }))
    .sort((a, b) => b.count - a.count)
  return results
})

// Methods
const getShipColor = (shipId: number) => {
  const ship = SHIPS_ROSTER.find(s => s.id === shipId)
  return ship?.color || '#ffffff'
}

const getShipName = (shipId: number) => {
  const ship = SHIPS_ROSTER.find(s => s.id === shipId)
  return ship?.name || 'Unknown'
}

const getPlaceText = (place: number) => {
  const suffixes = ['st', 'nd', 'rd', 'th', 'th', 'th', 'th', 'th']
  return `${place}${suffixes[Math.min(place - 1, 7)]}`
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
  placeIndicators.value = {}

  let currentTurn = 1
  const interval = setInterval(() => {
    if (currentTurn > 10) {
      clearInterval(interval)
      
      // Assign places to all ships that didn't finish
      const finishedShips = Object.keys(placeIndicators.value).map(id => Number(id))
      const unfinishedShips = SHIPS_ROSTER.filter(ship => !finishedShips.includes(ship.id))
      
      // Sort unfinished ships by their final distance
      const sortedUnfinished = unfinishedShips
        .map(ship => {
          const shipEvent = simulationResult.replayLog
            .filter((e: any) => e.shipId === ship.id)
            .sort((a: any, b: any) => b.turn - a.turn)[0]
          return { ship, distance: shipEvent?.distance || 0 }
        })
        .sort((a, b) => b.distance - a.distance)
      
      // Assign remaining places
      let remainingPlace = finishedShips.length + 1
      for (const { ship } of sortedUnfinished) {
        placeIndicators.value[ship.id] = getPlaceText(remainingPlace)
        remainingPlace++
      }
      
      winnerDisplay.value = `Winner: ${simulationResult.winner.name}!`
      gameStore.setRaceInProgress(false)
      return
    }

    const turnEvents = simulationResult.replayLog.filter((e: any) => e.turn === currentTurn)
    gameStore.addRaceLogEntry(`<span class="font-bold text-cyan-400">Turn ${currentTurn}:</span>`)

    // Update ship positions for this turn
    const updatedRace = [...gameStore.currentRace]
    let placeCounter = Object.keys(placeIndicators.value).length + 1
    
    for (const event of turnEvents) {
      const shipIndex = updatedRace.findIndex(s => s.id === event.shipId)
      if (shipIndex !== -1) {
        updatedRace[shipIndex] = {
          ...updatedRace[shipIndex],
          distance: event.distance
        } as RaceState
        
        // Check if ship just finished the race
        if (event.distance >= 1000 && !placeIndicators.value[event.shipId]) {
          const placeText = getPlaceText(placeCounter)
          placeIndicators.value[event.shipId] = placeText
          placeCounter++
        }
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