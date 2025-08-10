<template>
  <div class="min-h-screen bg-gray-900 text-white p-4">
    <!-- Header -->
    <div class="max-w-none mb-6">
      <div class="flex justify-between items-center">
        <div>
          <h1 class="text-2xl font-bold text-cyan-400">Cosmic Rush</h1>
        </div>
        
        <!-- Network Status -->
        <div v-if="!isCorrectNetwork" class="p-3 bg-red-900/50 border border-red-500 rounded-lg">
          <p class="text-red-400 text-sm">
            ⚠️ Please connect to Somnia Testnet to play
          </p>
        </div>
      </div>
    </div>

    <!-- Main Game Area -->
    <div class="space-y-6">
      <!-- Race Track - Full Width -->
      <div class="w-full">
        <RaceTrack 
          :ships="currentRace" 
          :chaos-events="chaosEvents"
          :place-indicators="placeIndicators"
          :show-reopen-button="showResultsPanel"
          @reopen-results="showResultsPanel = true"
        />
      </div>

      <!-- Betting Interface - Full Width Below -->
      <div class="w-full">
        <BettingInterface @race-completed="onRaceCompleted" />
      </div>
    </div>

    <!-- Race Results Panel -->
    <RaceResultsPanel
      :show="showResultsPanel"
      :race-results="raceResults"
      :player-earnings="playerEarnings"
      :achievements-unlocked="achievementsUnlocked"
      :nft-rewards="nftRewards"
      :panel-key="resultsPanelKey"
      @close="closeResultsPanel"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useGameStore } from './stores/game'
import { useWeb3 } from './composables/useWeb3'
import { SHIPS_ROSTER } from './data/ships'
import RaceTrack from './components/RaceTrack.vue'
import BettingInterface from './components/BettingInterface.vue'
import RaceResultsPanel from './components/RaceResultsPanel.vue'
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
  animateRaceProgression,
  getShipNameByFrontendId,
  getShipColorByFrontendId
} = useWeb3()
const winnerDisplay = ref('')
const chaosEvents = ref<{ [key: number]: string }>({})
const placeIndicators = ref<{ [key: number]: string }>({})

// Admin state
const startingRace = ref(false)
const finishingRace = ref(false)
const canFinishRace = ref(false)
const raceInfo = ref<any>(null)

// Results panel state
const showResultsPanel = ref(false)
const raceResults = ref<any>(null)
const playerEarnings = ref('0')
const achievementsUnlocked = ref<any[]>([])
const nftRewards = ref<any[]>([])
const resultsPanelKey = ref(0)

// Computed properties
const currentRace = computed(() => gameStore.currentRace)
const raceInProgress = computed(() => gameStore.raceInProgress)

// Methods
// Ship name and color functions (using frontend IDs 1-8)
const getShipName = (frontendShipId: number) => {
  return getShipNameByFrontendId(frontendShipId)
}

const getShipColor = (frontendShipId: number) => {
  return getShipColorByFrontendId(frontendShipId)
}

const getPlaceText = (place: number) => {
  const suffixes = ['st', 'nd', 'rd', 'th', 'th', 'th', 'th', 'th']
  return `${place}${suffixes[Math.min(place - 1, 7)]}`
}

const getPlaceEmoji = (place: number) => {
  const emojis = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣']
  return emojis[place - 1] || '🏁'
}

// Close results panel
const closeResultsPanel = async () => {
  showResultsPanel.value = false
  
  // Update SPIRAL balance after race completion
  if (isConnected.value) {
    try {
      const { updateBalance } = useWeb3()
      await updateBalance()
    } catch (error) {
      console.error('Failed to update balance:', error)
    }
  }
}

const startRace = async () => {
  if (gameStore.raceInProgress) return
  
  if (isConnected.value) {
    // Use blockchain race reconstruction
    await startBlockchainRace()
  } else {
    gameStore.addRaceLogEntry('<span class="font-bold text-red-400">❌ Please connect to blockchain to start a race</span>')
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
    
    gameStore.addRaceLogEntry(`<span class="font-bold text-green-400">✅ Race loaded from blockchain!</span>`)
    gameStore.addRaceLogEntry(`<span class="font-bold text-yellow-400">🏁 Winner: ${raceData.winner.name}!</span>`)

    // Set place indicators based on final blockchain race results
    placeIndicators.value = {}
    raceData.placements.forEach((shipId: number, index: number) => {
      placeIndicators.value[shipId] = getPlaceText(index + 1)
    })

    // Animate the race progression
    await animateRaceProgression(raceData, (turn, states, events) => {
      // Update current race state
      gameStore.state.currentRace = states
      
      // Place indicators are already set from blockchain data above
      
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
    
    // Final standings are now shown in RaceResultsPanel.vue instead of race log

  } catch (error: any) {
    gameStore.addRaceLogEntry(`<span class="font-bold text-red-400">❌ Blockchain race failed: ${error.message}</span>`)
  } finally {
    gameStore.setRaceInProgress(false)
  }
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
    // Get current race info from blockchain to determine winner
    const raceInfo = await getCurrentRaceInfo()
    if (!raceInfo) {
      throw new Error('No active race found on blockchain')
    }
    
    // For now, we'll need to get the winner from the blockchain
    // This would require additional blockchain calls to get the actual winner
    gameStore.addRaceLogEntry(`<span class="font-bold text-red-400">❌ Finishing races requires blockchain winner determination</span>`)
    canFinishRace.value = false
    
  } catch (error: any) {
    gameStore.addRaceLogEntry(`<span class="font-bold text-red-400">❌ Failed to finish race: ${error.message}</span>`)
  } finally {
    finishingRace.value = false
  }
}

// Handle race completion from betting
const onRaceCompleted = async (data: { raceResult: any, playerShip: number, betAmount: string, actualPayout: string, jackpotTier: number, jackpotAmount: string }) => {
  console.log('🎬 Race completed from bet! Starting animation...', data)
  
  try {
    console.log('🎬 Step 1: Reconstructing race data...')
    // Reconstruct race data for animation
    const raceData = reconstructRaceFromBlockchain(data.raceResult)
    console.log('🎬 Step 1: Race data reconstructed:', raceData)
    
    console.log('🎬 Step 2: Getting ship names...')
    // Show bet result info immediately
    const playerShipName = getShipName(data.playerShip) // data.playerShip is already frontend ID
    const winnerName = getShipName(raceData.winner.id) // raceData.winner.id is frontend ID
    console.log('🎬 Step 2: Ship names retrieved:', { playerShipName, winnerName })
    
    console.log('🎬 Step 3: Adding log entries...')
    gameStore.addRaceLogEntry(`<span class="font-bold text-cyan-400">🎰 BET PLACED: ${data.betAmount} SPIRAL on ${playerShipName}!</span>`)
    gameStore.addRaceLogEntry(`<span class="font-bold text-green-400">✅ Race simulation loaded from blockchain!</span>`)
    console.log('🎬 Step 3: Log entries added')
    
    console.log('🎬 Step 4: Starting race visualization...')
    // Start the visualization FIRST (this will run the full race animation)
    await visualizeBettingRace(raceData, data.playerShip, data.betAmount)
    console.log('🎬 Step 4: Race visualization completed')
    
    console.log('🎬 Step 5: Preparing results data...')
    // AFTER animation completes, prepare results data
    const playerPlacement = raceData.placements.indexOf(data.playerShip) + 1
    const realEarnings = data.actualPayout || '0' // Use actual payout from contract (includes jackpot)
    const betAmountFloat = parseFloat(data.betAmount)
    const payoutFloat = parseFloat(realEarnings)
    const jackpotAmountFloat = parseFloat(data.jackpotAmount || '0')
    
    // Calculate net earnings (total payout - bet amount)
    const netEarnings = payoutFloat - betAmountFloat
    
    // Get the current race ID from the blockchain to ensure accuracy
    let raceId: number | string = currentRaceId.value
    if (!raceId || raceId === 0) {
      try {
        const { getCurrentRaceInfo } = useWeb3()
        const raceInfo = await getCurrentRaceInfo()
        raceId = raceInfo?.raceId || currentRaceId.value || 'Unknown'
      } catch (error) {
        console.warn('Failed to get current race ID, using fallback:', error)
        raceId = currentRaceId.value || 'Unknown'
      }
    }
    
    // Prepare results data (this happens AFTER the race animation)
    raceResults.value = {
      raceId: raceId,
      playerShip: data.playerShip, // Frontend ID
      betAmount: data.betAmount,
      placement: playerPlacement,
      placements: raceData.placements, // Frontend IDs
      winner: raceData.winner.id, // Frontend ID
      jackpotTier: data.jackpotTier,
      jackpotAmount: data.jackpotAmount || '0',
      totalPayout: realEarnings
    }
    
    playerEarnings.value = netEarnings.toString() // Net profit/loss
    
    // TODO: Fetch actual achievements and NFTs from blockchain
    achievementsUnlocked.value = []
    nftRewards.value = []
    
    console.log('🎬 Step 5: Results data prepared')
    
  } catch (error: any) {
    console.error('🎬 Error in onRaceCompleted:', error)
    gameStore.addRaceLogEntry(`<span class="font-bold text-red-400">❌ Failed to animate betting race: ${error.message}</span>`)
  }
}

// Visualize race from betting result
const visualizeBettingRace = async (raceData: any, playerShip: number, betAmount: string) => {
  console.log('🎬 Starting race visualization with data:', raceData)
  console.log('🎬 Race states:', raceData.raceStates)
  console.log('🎬 Replay log:', raceData.replayLog)
  console.log('🎬 Winner:', raceData.winner)
  console.log('🎬 Placements:', raceData.placements)
  
  gameStore.setRaceInProgress(true)
  winnerDisplay.value = ''
  chaosEvents.value = {}
  placeIndicators.value = {}
  
  // Set place indicators based on final blockchain race results (not animation finish order)
  placeIndicators.value = {}
  raceData.placements.forEach((shipId: number, index: number) => {
    placeIndicators.value[shipId] = getPlaceText(index + 1)
  })
  console.log('🎬 Place indicators set:', placeIndicators.value)
  
  // Animate the race progression (same as blockchain race)
  console.log('🎬 Starting animateRaceProgression...')
  await animateRaceProgression(raceData, (turn, states, events) => {
    console.log(`🔄 Turn ${turn} - Updating race states:`, states)
    console.log(`🔄 Turn ${turn} - Events:`, events)
    console.log(`🔄 Turn ${turn} - Current gameStore.currentRace before update:`, gameStore.currentRace)
    
    // Update current race state
    gameStore.state.currentRace = states
    
    console.log(`🔄 Turn ${turn} - gameStore.currentRace after update:`, gameStore.currentRace)
    console.log(`🔄 Turn ${turn} - gameStore.state.currentRace:`, gameStore.state.currentRace)
    
    // Place indicators are already set from blockchain data above
    
    // Add turn header
    gameStore.addRaceLogEntry(`<span class="font-bold text-cyan-400">🔄 Turn ${turn}</span>`)
    
    // Show detailed ship movements for this turn
    const turnEvents = raceData.replayLog.filter((log: any) => log.turn === turn)
    console.log(`🔄 Turn ${turn} - Turn events:`, turnEvents)
    
    for (const event of turnEvents) {
      const shipName = getShipName(event.shipId) // event.shipId is frontend ID
      const shipColor = getShipColor(event.shipId) // event.shipId is frontend ID
      
      console.log(`🔄 Turn ${turn} - Ship ${event.shipId} (${shipName}) moved ${event.moveAmount} units to distance ${event.distance}`)
      
      // Show ship movement
      gameStore.addRaceLogEntry(
        `<span class="ml-4" style="color: ${shipColor}">${shipName} moved ${Math.round(event.moveAmount)} units. (Total: ${Math.round(event.distance)})</span>`
      )
    }
    
    // Show chaos events
    for (const event of events) {
      chaosEvents.value[event.targetId || 0] = event.text
      
      gameStore.addRaceLogEntry(
        `<span class="font-bold text-purple-400 ml-4">⚡ CHAOS: ${event.text}</span>`
      )
      
      // Clear chaos event after delay
      setTimeout(() => {
        if (chaosEvents.value[event.targetId || 0] === event.text) {
          chaosEvents.value[event.targetId || 0] = ''
        }
      }, 1500)
    }
    
    gameStore.addRaceLogEntry(`<span class="font-bold text-cyan-400">✅ Turn ${turn} completed</span>`)
  })

  console.log('🎬 Race animation completed, showing final results...')

  // Show final results with betting context
  const winnerName = getShipName(raceData.winner.id) // raceData.winner.id is frontend ID
  const playerShipName = getShipName(playerShip) // playerShip is frontend ID
  const playerPlacement = raceData.placements.indexOf(playerShip) + 1
  
  winnerDisplay.value = `Winner: ${winnerName}!`
  
  // Show player's result
  if (playerShip === raceData.winner.id) {
    gameStore.addRaceLogEntry(`<span class="font-bold text-green-400">🎉 YOU WON! ${playerShipName} finished 1st! 💰</span>`)
  } else {
    gameStore.addRaceLogEntry(`<span class="font-bold text-yellow-400">📊 YOUR RESULT: ${playerShipName} finished ${getPlaceText(playerPlacement)}</span>`)
  }
  
  // Final standings are now shown in RaceResultsPanel.vue instead of race log

  gameStore.setRaceInProgress(false)
  console.log('🎬 Race visualization completed, setting raceInProgress to false')
  
  // Wait 1 second after race completes for better UX
  return new Promise(resolve => {
    setTimeout(() => {
      console.log('🎬 Showing results panel...')
      showResultsPanel.value = true
      resultsPanelKey.value += 1
      resolve(true)
    }, 1000) // 1 second delay after race animation completes
  })
}

// Load race information from blockchain
const loadRaceInfo = async () => {
  if (!isConnected.value) return
  
  try {
    const info = await getCurrentRaceInfo()
    raceInfo.value = info
    
    if (info) {
      gameStore.addRaceLogEntry(`<span class="font-bold text-blue-400">📊 Race #${info.raceId}: Total Bets: ${info.totalBets} SPIRAL</span>`)
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