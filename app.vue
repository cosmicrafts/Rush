<template>
  <div class="layout-container layout-flex-col">
    <!-- Header -->
    <Header 
      ref="headerRef"
      class="layout-relative z-20 component-fit-width"
      @connected="onWalletConnected"
      @disconnected="onWalletDisconnected"
    />

    <!-- Main Game Area - Race Track takes full remaining height -->
    <div class="layout-flex component-fit layout-relative z-10">
      <RaceTrack 
        :ships="currentRace" 
        :chaos-events="chaosEvents"
        :place-indicators="placeIndicators"
        :show-reopen-button="showResultsPanel"
        :show-betting-interface="!showResultsPanel && !isRaceInProgress"
        :persistent-betting-data="persistentBettingData"
        @reopen-results="showResultsPanel = true"
        @race-completed="onRaceCompleted"
        @show-ship-info="showShipInfo"
        @hide-ship-info="hideShipInfo"
        @show-payout-info="showPayoutInfo"
        @hide-payout-info="hidePayoutInfo"
      />
    </div>

    <!-- Cosmic Footer -->
    <div class="cosmic-footer-accent component-fit-width"></div>
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

  <!-- Ship Info Card Modal -->
  <ShipInfoCard
    :show="showShipInfoModal"
    :ship="selectedShipForInfo"
    @close="hideShipInfo"
  />

  <!-- Payout Info Modal -->
  <PayoutInfoModal
    :show="showPayoutInfoModal"
    @close="hidePayoutInfo"
  />

  <!-- Disclaimer Modal -->
  <DisclaimerModal />
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useGameStore } from './stores/game'
import { useWeb3 } from './composables/useWeb3'
import { useNFTs } from './composables/useNFTs'
import { SHIPS_ROSTER } from './data/ships'
import RaceTrack from './components/RaceTrack.vue'
import RaceResultsPanel from './components/RaceResultsPanel.vue'
import Header from './components/Header.vue'
import ShipInfoCard from './components/ShipInfoCard.vue'
import PayoutInfoModal from './components/PayoutInfoModal.vue'
import DisclaimerModal from './components/DisclaimerModal.vue'
import type { RaceState } from './types/game'

const gameStore = useGameStore()
const { 
  isConnected, 
  shortAddress,
  isCorrectNetwork, 
  currentRaceId,
  disconnect,
  startNewRace: web3StartNewRace, 
  finishRace: web3FinishRace,
  getCurrentRaceInfo,
  getShipBets,
  getDebugRaceSimulation,
  reconstructRaceFromBlockchain,
  animateRaceProgression,
  getShipName,
  getShipColor
} = useWeb3()

// Header ref
const headerRef = ref()
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

// Betting interface state
const isRaceInProgress = ref(false)

// Persistent betting data
const persistentBettingData = ref({
  selectedShip: null as any,
  betAmount: ''
})

// Ship info modal state
const showShipInfoModal = ref(false)
const selectedShipForInfo = ref<any>(null)

// Payout info modal state
const showPayoutInfoModal = ref(false)

// Function to show ship info modal
const showShipInfo = (ship: any) => {
  selectedShipForInfo.value = ship
  showShipInfoModal.value = true
}

// Function to hide ship info modal
const hideShipInfo = () => {
  showShipInfoModal.value = false
  selectedShipForInfo.value = null
}

// Function to show payout info modal
const showPayoutInfo = () => {
  showPayoutInfoModal.value = true
}

// Function to hide payout info modal
const hidePayoutInfo = () => {
  showPayoutInfoModal.value = false
}

// Computed properties
const currentRace = computed(() => gameStore.currentRace)
const raceInProgress = computed(() => gameStore.raceInProgress)

// Methods
// Ship name and color functions (using frontend IDs 1-8)
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
  isRaceInProgress.value = false // Show betting interface again
  
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
    
    // Set place indicators AFTER race animation completes
    placeIndicators.value = {}
    raceData.placements.forEach((shipId: number, index: number) => {
      placeIndicators.value[shipId] = getPlaceText(index + 1)
    })
    
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
  // Set race in progress to hide betting interface
  isRaceInProgress.value = true
  
  try {
    // Reconstruct race data for animation
    const raceData = reconstructRaceFromBlockchain(data.raceResult)
    
    // Show bet result info immediately
    const playerShipName = getShipName(data.playerShip) // data.playerShip is already 0-7 ID
    const winnerName = getShipName(raceData.winner.id) // raceData.winner.id is 0-7 ID
    
    gameStore.addRaceLogEntry(`<span class="font-bold text-cyan-400">🎰 BET PLACED: ${data.betAmount} SPIRAL on ${playerShipName}!</span>`)
    gameStore.addRaceLogEntry(`<span class="font-bold text-green-400">✅ Race loaded from blockchain!</span>`)
    
    // Start the visualization FIRST (this will run the full race animation)
    await visualizeBettingRace(raceData, data.playerShip, data.betAmount)
    
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
    
    // Fetch actual achievements and NFTs from blockchain
    try {
      const { fetchRecentAchievements } = useWeb3()
      console.log('🔍 Fetching recent achievements...')
      const recentAchievements = await fetchRecentAchievements()
      console.log('📊 Recent achievements:', recentAchievements)
      
      if (recentAchievements && recentAchievements.length > 0) {
        console.log('🏆 Found achievements to unlock:', recentAchievements.length)
        
        achievementsUnlocked.value = recentAchievements.map((achievement: any) => ({
          id: achievement.nftId,
          name: achievement.name,
          description: achievement.description,
          reward: achievement.tokenReward
        }))
        
        // Convert achievements to NFT format for MetaMask addition
        nftRewards.value = recentAchievements.map((achievement: any) => ({
          id: achievement.nftId,
          tokenId: achievement.nftId,
          name: achievement.name,
          description: achievement.description,
          type: achievement.achievementType,
          shipId: achievement.spaceshipId,
          threshold: achievement.threshold
        }))
        
        console.log('🎨 NFT rewards prepared:', nftRewards.value)
        
        // Automatically add new NFTs to MetaMask (only valid ones)
        if (isConnected.value && window.ethereum) {
          const { addNFTToMetaMask } = useNFTs()
          for (const nft of nftRewards.value) {
            // Skip invalid NFTs (ID 0)
            if (nft.tokenId === '0' || nft.tokenId === 0) {
              console.log(`⚠️ Skipping auto-add for invalid NFT ID: ${nft.tokenId}`)
              continue
            }
            
            try {
              await addNFTToMetaMask(nft)
              console.log(`✅ Automatically added NFT ${nft.tokenId} to MetaMask`)
            } catch (error) {
              console.warn(`Failed to auto-add NFT ${nft.tokenId} to MetaMask:`, error)
            }
          }
        }
        
        // Log achievements in race log
        for (const achievement of achievementsUnlocked.value) {
          gameStore.addRaceLogEntry(`<span class="font-bold text-purple-400">🏆 ACHIEVEMENT UNLOCKED: ${achievement.name} (+${achievement.reward} SPIRAL)</span>`)
        }
      } else {
        console.log('📭 No achievements found')
        achievementsUnlocked.value = []
        nftRewards.value = []
      }
    } catch (error) {
      console.error('❌ Failed to fetch achievements:', error)
      achievementsUnlocked.value = []
      nftRewards.value = []
    }
    
  } catch (error: any) {
    console.error('🎬 Error in onRaceCompleted:', error)
    gameStore.addRaceLogEntry(`<span class="font-bold text-red-400">❌ Failed to animate betting race: ${error.message}</span>`)
  }
}

// Visualize race from betting result
const visualizeBettingRace = async (raceData: any, playerShip: number, betAmount: string) => {
  gameStore.setRaceInProgress(true)
  winnerDisplay.value = ''
  chaosEvents.value = {}
  placeIndicators.value = {}
  
  // Animate the race progression (same as blockchain race)
  await animateRaceProgression(raceData, (turn, states, events) => {
    // Update current race state
    gameStore.state.currentRace = states
    
    // Place indicators are already set from blockchain data above
    
    // Add turn header
    gameStore.addRaceLogEntry(`<span class="font-bold text-cyan-400">🔄 Turn ${turn}</span>`)
    
    // Show detailed ship movements for this turn
    const turnEvents = raceData.replayLog.filter((log: any) => log.turn === turn)
    
    for (const event of turnEvents) {
      const shipName = getShipName(event.shipId) // event.shipId is 0-7 ID
      const shipColor = getShipColor(event.shipId) // event.shipId is 0-7 ID
      
      // Show ship movement
      gameStore.addRaceLogEntry(
        `<span class="ml-4" style="color: ${shipColor}">${shipName} moved ${Math.round(event.moveAmount)} units. (Total: ${Math.round(event.distance)})</span>`
      )
    }
    
    // Show chaos events
    for (const event of events) {
      // Use the ship ID that triggered the chaos event
      const shipId = event.shipId || 0 // The ship that triggered the event
      chaosEvents.value[shipId] = event.text
      
      gameStore.addRaceLogEntry(
        `<span class="font-bold text-purple-400 ml-4">⚡ CHAOS: ${event.text}</span>`
      )
      
      // Clear chaos event after delay
      setTimeout(() => {
        if (chaosEvents.value[shipId] === event.text) {
          chaosEvents.value[shipId] = ''
        }
      }, 1500)
    }
    
    gameStore.addRaceLogEntry(`<span class="font-bold text-cyan-400">✅ Turn ${turn} completed</span>`)
  })

  // Show final results with betting context
  const winnerName = getShipName(raceData.winner.id) // raceData.winner.id is 0-7 ID
  const playerShipName = getShipName(playerShip) // playerShip is 0-7 ID
  const playerPlacement = raceData.placements.indexOf(playerShip) + 1
  
  winnerDisplay.value = `Winner: ${winnerName}!`
  
  // Show player's result
  if (playerShip === raceData.winner.id) {
    gameStore.addRaceLogEntry(`<span class="font-bold text-green-400">🎉 YOU WON! ${playerShipName} finished 1st! 💰</span>`)
  } else {
    gameStore.addRaceLogEntry(`<span class="font-bold text-yellow-400">📊 YOUR RESULT: ${playerShipName} finished ${getPlaceText(playerPlacement)}</span>`)
  }
  
  // Final standings are now shown in RaceResultsPanel.vue instead of race log

  // Set place indicators AFTER race animation completes
  placeIndicators.value = {}
  raceData.placements.forEach((shipId: number, index: number) => {
    placeIndicators.value[shipId] = getPlaceText(index + 1)
  })

  gameStore.setRaceInProgress(false)
  
  // Wait 1 second after race completes for better UX
  return new Promise(resolve => {
    setTimeout(() => {
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

// Wallet connection handlers
const onWalletConnected = () => {
  // Load race info when wallet connects
  loadRaceInfo()
}

const onWalletDisconnected = () => {
  // Handle disconnection if needed
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

<style scoped>
/* Layout Container */
.layout-container {
  height: 100vh;
  color: white;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, 
    var(--cosmic-bg-darkest) 0%, 
    var(--cosmic-bg-darker) 25%, 
    var(--cosmic-bg-dark) 50%, 
    var(--cosmic-bg-darker) 75%, 
    var(--cosmic-bg-darkest) 100%);
  position: relative;
  overflow: hidden;
  font-size: var(--font-size-base);
}

.layout-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: 
    radial-gradient(circle at 20% 20%, rgba(15, 185, 253, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 80% 80%, rgba(255, 145, 0, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 40% 60%, rgba(157, 53, 191, 0.05) 0%, transparent 50%);
  pointer-events: none;
  z-index: 0;
}

.layout-container::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: 
    linear-gradient(90deg, transparent 98%, rgba(15, 185, 253, 0.1) 100%),
    linear-gradient(0deg, transparent 98%, rgba(15, 185, 253, 0.1) 100%);
  background-size: 50px 50px;
  pointer-events: none;
  z-index: 0;
  opacity: 0.3;
}

/* Main Content Area */
.layout-flex.component-fit {
  flex: 1;
  position: relative;
  min-height: 0;
  z-index: 1;
  padding: var(--space-md);
}

/* Cosmic Footer Accent */
.cosmic-footer-accent {
  height: 0.25rem;
  background: linear-gradient(90deg, 
    transparent 0%, 
    var(--cosmic-blue) 25%, 
    var(--cosmic-orange) 50%, 
    var(--cosmic-blue) 75%, 
    transparent 100%);
  box-shadow: 
    0 0 0.625rem var(--cosmic-blue),
    0 0 1.25rem var(--cosmic-orange);
  animation: cosmicFooterGlow 3s ease-in-out infinite alternate;
}

@keyframes cosmicFooterGlow {
  0% {
    opacity: 0.7;
    box-shadow: 
      0 0 0.625rem var(--cosmic-blue),
      0 0 1.25rem var(--cosmic-orange);
  }
  100% {
    opacity: 1;
    box-shadow: 
      0 0 0.9375rem var(--cosmic-blue),
      0 0 1.875rem var(--cosmic-orange);
  }
}

/* Responsive adjustments for different screen sizes */
@media (min-width: 640px) {
  .layout-flex.component-fit {
    padding: var(--space-lg);
  }
}

@media (min-width: 1024px) {
  .layout-flex.component-fit {
    padding: var(--space-xl);
  }
}

@media (min-width: 1440px) {
  .layout-flex.component-fit {
    padding: var(--space-2xl);
  }
}
</style> 