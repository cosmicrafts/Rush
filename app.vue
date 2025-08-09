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
            
            <!-- Admin Controls -->
            <div v-if="isConnected" class="mt-4 flex space-x-4">
              <UButton
                @click="startNewRace"
                :loading="startingRace"
                class="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-6 rounded-lg shadow-lg"
              >
                {{ startingRace ? 'Starting Race...' : 'Start New Race (Owner)' }}
              </UButton>
              <UButton
                @click="finishCurrentRace"
                :loading="finishingRace"
                :disabled="!canFinishRace"
                class="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-6 rounded-lg shadow-lg"
              >
                {{ finishingRace ? 'Finishing Race...' : 'Finish Race (Owner)' }}
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
          <BettingInterface @race-completed="onRaceCompleted" />
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
const { 
  isConnected, 
  isCorrectNetwork, 
  currentRaceId,
  startNewRace: web3StartNewRace, 
  finishRace: web3FinishRace,
  getCurrentRaceInfo,
  getShipBets,
  getDebugRaceSimulation,
  reconstructRaceFromBlockchain,
  animateRaceProgression
} = useWeb3()
const winnerDisplay = ref('')
const chaosEvents = ref<{ [key: number]: string }>({})
const placeIndicators = ref<{ [key: number]: string }>({})

// Admin state
const startingRace = ref(false)
const finishingRace = ref(false)
const canFinishRace = ref(false)
const raceInfo = ref<any>(null)

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

const startRace = async () => {
  if (gameStore.raceInProgress) return
  
  if (isConnected.value) {
    // Use blockchain race reconstruction
    await startBlockchainRace()
  } else {
    // Fall back to local simulation
    const simulationResult = gameStore.runRaceSimulation()
    visualizeRace(simulationResult)
  }
}

const startBlockchainRace = async () => {
  try {
    gameStore.setRaceInProgress(true)
    winnerDisplay.value = ''
    gameStore.addRaceLogEntry('<span class="font-bold text-cyan-400">🚀 Running blockchain race simulation...</span>')
    chaosEvents.value = {}
    placeIndicators.value = {}

    // Get race simulation from blockchain
    const contractResult = await getDebugRaceSimulation()
    if (!contractResult) {
      throw new Error('Failed to get race simulation from blockchain')
    }

    // Reconstruct race data for frontend
    const raceData = reconstructRaceFromBlockchain(contractResult)
    
    gameStore.addRaceLogEntry(`<span class="font-bold text-green-400">✅ Race simulation loaded from blockchain!</span>`)
    gameStore.addRaceLogEntry(`<span class="font-bold text-yellow-400">🏁 Winner: ${raceData.winner.name}!</span>`)

    // Animate the race progression
    await animateRaceProgression(raceData, (turn, states, events) => {
      // Update current race state
      gameStore.state.currentRace = states
      
      // Update place indicators for finished ships
      let placeCounter = 1
      for (const ship of states) {
        if (ship.distance >= 1000 && !placeIndicators.value[ship.id]) {
          placeIndicators.value[ship.id] = getPlaceText(placeCounter)
          placeCounter++
        }
      }
      
      // Show chaos events
      for (const event of events) {
        const targetShip = states.find(s => s.id === event.targetId)
        chaosEvents.value[event.targetId || 0] = event.text
        
        gameStore.addRaceLogEntry(
          `<span class="font-bold text-purple-400">⚡ CHAOS: ${event.text}</span>`
        )
        
        // Clear chaos event after delay
        setTimeout(() => {
          if (chaosEvents.value[event.targetId || 0] === event.text) {
            chaosEvents.value[event.targetId || 0] = ''
          }
        }, 1500)
      }
      
      gameStore.addRaceLogEntry(`<span class="font-bold text-cyan-400">Turn ${turn} completed</span>`)
    })

    // Show final results
    winnerDisplay.value = `Winner: ${raceData.winner.name}!`
    
    // Show final standings
    const shipNames = ['Comet', 'Juggernaut', 'Shadow', 'Phantom', 'Phoenix', 'Vanguard', 'Wildcard', 'Apex']
    const standings = ['🥇 1st', '🥈 2nd', '🥉 3rd', '4th', '5th', '6th', '7th', '8th']
    
    gameStore.addRaceLogEntry(`<span class="font-bold text-yellow-400">🏆 FINAL STANDINGS:</span>`)
    raceData.placements.forEach((shipId: number, index: number) => {
      gameStore.addRaceLogEntry(`<span class="ml-4">${standings[index]}: ${shipNames[shipId]}</span>`)
    })

  } catch (error: any) {
    gameStore.addRaceLogEntry(`<span class="font-bold text-red-400">❌ Blockchain race failed: ${error.message}</span>`)
    
    // Fall back to local simulation
    gameStore.addRaceLogEntry('<span class="font-bold text-blue-400">🔄 Falling back to local simulation...</span>')
    const simulationResult = gameStore.runRaceSimulation()
    visualizeRace(simulationResult)
  } finally {
    gameStore.setRaceInProgress(false)
  }
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

// Admin functions
const startNewRace = async () => {
  if (startingRace.value) return
  
  startingRace.value = true
  try {
    await web3StartNewRace()
    gameStore.addRaceLogEntry('<span class="font-bold text-green-400">✅ New race started on blockchain!</span>')
    canFinishRace.value = true
    
    // Load updated race info
    await loadRaceInfo()
  } catch (error: any) {
    gameStore.addRaceLogEntry(`<span class="font-bold text-red-400">❌ Failed to start race: ${error.message}</span>`)
  } finally {
    startingRace.value = false
  }
}

const finishCurrentRace = async () => {
  if (finishingRace.value || !canFinishRace.value) return
  
  finishingRace.value = true
  try {
    // Run a quick simulation to determine winner
    const simulationResult = gameStore.runRaceSimulation()
    const winnerId = simulationResult.winner.id
    
    // Finish race on blockchain with the winner
    await web3FinishRace(winnerId)
    
    gameStore.addRaceLogEntry(`<span class="font-bold text-green-400">✅ Race finished! Winner: ${simulationResult.winner.name} (Ship ${winnerId})</span>`)
    canFinishRace.value = false
    
    // Show winner
    winnerDisplay.value = `Winner: ${simulationResult.winner.name}!`
    
    // Load updated race info
    await loadRaceInfo()
  } catch (error: any) {
    gameStore.addRaceLogEntry(`<span class="font-bold text-red-400">❌ Failed to finish race: ${error.message}</span>`)
  } finally {
    finishingRace.value = false
  }
}

// Handle race completion from betting
const onRaceCompleted = async (data: { raceResult: any, playerShip: number, betAmount: string }) => {
  console.log('🎬 Race completed from bet! Starting animation...', data)
  
  try {
    // Reconstruct race data for animation
    const raceData = reconstructRaceFromBlockchain(data.raceResult)
    
    // Show bet result info
    const shipNames = ['Comet', 'Juggernaut', 'Shadow', 'Phantom', 'Phoenix', 'Vanguard', 'Wildcard', 'Apex']
    const playerShipName = shipNames[data.playerShip]
    const winnerName = shipNames[data.raceResult.winner]
    
    gameStore.addRaceLogEntry(`<span class="font-bold text-cyan-400">🎰 BET PLACED: ${data.betAmount} SPIRAL on ${playerShipName}!</span>`)
    gameStore.addRaceLogEntry(`<span class="font-bold text-green-400">✅ Race simulation loaded from blockchain!</span>`)
    
    // Start the visualization
    await visualizeBettingRace(raceData, data.playerShip, data.betAmount)
    
  } catch (error: any) {
    gameStore.addRaceLogEntry(`<span class="font-bold text-red-400">❌ Failed to animate betting race: ${error.message}</span>`)
  }
}

// Visualize race from betting result
const visualizeBettingRace = async (raceData: any, playerShip: number, betAmount: string) => {
  gameStore.setRaceInProgress(true)
  winnerDisplay.value = ''
  chaosEvents.value = {}
  placeIndicators.value = {}
  
  const shipNames = ['Comet', 'Juggernaut', 'Shadow', 'Phantom', 'Phoenix', 'Vanguard', 'Wildcard', 'Apex']
  
  // Animate the race progression (same as blockchain race)
  await animateRaceProgression(raceData, (turn, states, events) => {
    // Update current race state
    gameStore.state.currentRace = states
    
    // Update place indicators for finished ships
    let placeCounter = 1
    for (const ship of states) {
      if (ship.distance >= 1000 && !placeIndicators.value[ship.id]) {
        placeIndicators.value[ship.id] = getPlaceText(placeCounter)
        placeCounter++
      }
    }
    
    // Show chaos events
    for (const event of events) {
      chaosEvents.value[event.targetId || 0] = event.text
      
      gameStore.addRaceLogEntry(
        `<span class="font-bold text-purple-400">⚡ CHAOS: ${event.text}</span>`
      )
      
      // Clear chaos event after delay
      setTimeout(() => {
        if (chaosEvents.value[event.targetId || 0] === event.text) {
          chaosEvents.value[event.targetId || 0] = ''
        }
      }, 1500)
    }
    
    gameStore.addRaceLogEntry(`<span class="font-bold text-cyan-400">Turn ${turn} completed</span>`)
  })

  // Show final results with betting context
  const winnerName = shipNames[raceData.winner.id]
  const playerShipName = shipNames[playerShip]
  const playerPlacement = raceData.placements.indexOf(playerShip) + 1
  
  winnerDisplay.value = `Winner: ${winnerName}!`
  
  // Show player's result
  if (playerShip === raceData.winner.id) {
    gameStore.addRaceLogEntry(`<span class="font-bold text-green-400">🎉 YOU WON! ${playerShipName} finished 1st! 💰</span>`)
  } else {
    gameStore.addRaceLogEntry(`<span class="font-bold text-yellow-400">📊 YOUR RESULT: ${playerShipName} finished ${getPlaceText(playerPlacement)}</span>`)
  }
  
  // Show final standings
  const standings = ['🥇 1st', '🥈 2nd', '🥉 3rd', '4th', '5th', '6th', '7th', '8th']
  
  gameStore.addRaceLogEntry(`<span class="font-bold text-yellow-400">🏆 FINAL STANDINGS:</span>`)
  raceData.placements.forEach((shipId: number, index: number) => {
    const isPlayerShip = shipId === playerShip
    const style = isPlayerShip ? 'color: #10B981; font-weight: bold;' : ''
    gameStore.addRaceLogEntry(`<span class="ml-4" style="${style}">${standings[index]}: ${shipNames[shipId]}${isPlayerShip ? ' (YOU)' : ''}</span>`)
  })

  gameStore.setRaceInProgress(false)
}

// Load race information from blockchain
const loadRaceInfo = async () => {
  if (!isConnected.value) return
  
  try {
    const info = await getCurrentRaceInfo()
    raceInfo.value = info
    
    if (info) {
      gameStore.addRaceLogEntry(`<span class="font-bold text-blue-400">📊 Race #${info.raceId}: Total Bets: ${info.totalBets} STT, Prize Pool: ${info.totalPrize} STT</span>`)
    }
  } catch (error) {
    console.error('Failed to load race info:', error)
  }
}

// Initialize
onMounted(() => {
  gameStore.startNewRace()
  
  // Load race info if already connected
  if (isConnected.value) {
    loadRaceInfo()
  }
})
</script> 