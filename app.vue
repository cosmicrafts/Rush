<template>
  <div class="layout-container layout-flex-col">
    <!-- Background Image with Transparency -->
    <div
      class="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-5"
      style="background-image: url('/bg.webp'); z-index: 0"
    />
        <!-- Cosmic header -->
        <div class="cosmic-header-accent component-fit-width" />

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
    <div class="cosmic-footer-accent component-fit-width" />
  </div>

  <!-- Race Results Panel -->
  <RaceResultsPanel
    :show="showResultsPanel"
    :race-results="raceResults"
    :player-earnings="playerEarnings"
    :achievements-unlocked="achievementsUnlocked"
    :nft-rewards="nftRewards"
    :panel-key="resultsPanelKey"
    :tx-hash="currentTxHash"
    @close="closeResultsPanel"
  />

  <!-- Ship Info Card Modal -->
  <ShipInfoCard :show="showShipInfoModal" :ship="selectedShipForInfo" @close="hideShipInfo" />

  <!-- Payout Info Modal -->
  <PayoutInfoModal :show="showPayoutInfoModal" @close="hidePayoutInfo" />

  <!-- Disclaimer Modal -->
  <DisclaimerModal />

  <!-- Global Toast Notifications -->
  <UToaster />
</template>

<script setup lang="ts">
  import { ref, onMounted, computed, defineAsyncComponent } from 'vue'
  import { useGame, type RaceState } from './composables/useGame'
  import { useWeb3 } from './composables/useWeb3'
  import { useNotifications } from './composables/useNotifications'
  
  // Eager load critical components (always needed)
  import Header from './components/Header.vue'
  
  // Lazy load RaceTrack to reduce initial bundle size
  const RaceTrack = defineAsyncComponent({
    loader: () => import('./components/RaceTrack.vue'),
    delay: 0,
    timeout: 5000
  })
  
  // Lazy load non-critical components (loaded only when needed)
  const RaceResultsPanel = defineAsyncComponent({
    loader: () => import('./components/RaceResultsPanel.vue'),
    delay: 0,
    timeout: 5000
  })
  
  const ShipInfoCard = defineAsyncComponent({
    loader: () => import('./components/ShipInfoCard.vue'),
    delay: 0,
    timeout: 5000
  })
  
  const PayoutInfoModal = defineAsyncComponent({
    loader: () => import('./components/PayoutInfoModal.vue'),
    delay: 0,
    timeout: 5000
  })
  
  const DisclaimerModal = defineAsyncComponent({
    loader: () => import('./components/DisclaimerModal.vue'),
    delay: 0,
    timeout: 5000
  })

  const gameStore = useGame()
  const {
    isConnected,
    currentRaceId,
    getCurrentRaceInfo,

    reconstructRaceFromBlockchain,
    animateRaceProgression,
    getShipName,
    getShipColor,
  } = useWeb3()

  // Initialize notification system
  const {
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showRaceNotification,
    showBettingNotification,
    showWalletNotification,
    showAchievementNotification,
    showTransactionNotification,
    showJackpotNotification
  } = useNotifications()

  // Header ref
  const headerRef = ref()
  const winnerDisplay = ref('')
  const chaosEvents = ref<{ [key: number]: string }>({})
  const placeIndicators = ref<{ [key: number]: string }>({})

  // Admin state
  const raceInfo = ref<unknown>(null)

  // Results panel state
  const showResultsPanel = ref(false)
  const raceResults = ref<unknown>(null)
  const playerEarnings = ref('0')
  const achievementsUnlocked = ref<Record<string, unknown>[]>([])
  const nftRewards = ref<Record<string, unknown>[]>([])
  const resultsPanelKey = ref(0)
  const currentTxHash = ref('')

  // Betting interface state
  const isRaceInProgress = ref(false)

  // Persistent betting data
  const persistentBettingData = ref({
    selectedShip: null as unknown,
    betAmount: '',
  })

  // Ship info modal state
  interface Ship {
    id: number
    name: string
    color: string
    stats: {
      initialSpeed: number
      acceleration: number
    }
  }

  const showShipInfoModal = ref(false)
  const selectedShipForInfo = ref<Ship | null>(null)

  // Payout info modal state
  const showPayoutInfoModal = ref(false)

  // Function to show ship info modal
  const showShipInfo = (ship: Ship) => {
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
  const currentRace = computed(() => gameStore.currentRace.value)

  // Methods
  // Ship name and color functions (using frontend IDs 1-8)
  const getPlaceText = (place: number) => {
    const suffixes = ['st', 'nd', 'rd', 'th', 'th', 'th', 'th', 'th']
    return `${place}${suffixes[Math.min(place - 1, 7)]}`
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
        showError('Balance Update Failed', 'Failed to refresh your SPIRAL balance')
      }
    }
  }

  // Handle race completion from betting
  const onRaceCompleted = async (data: {
    raceResult: unknown
    playerShip: number
    betAmount: string
    actualPayout: string
    jackpotTier: number
    jackpotAmount: string
    txHash: string
  }) => {
          // Set race in progress to hide betting interface
      isRaceInProgress.value = true
      
      // Store the transaction hash
      currentTxHash.value = data.txHash
      
      // Show transaction success notification with explorer link
      const shortHash = `${data.txHash.slice(0, 6)}...${data.txHash.slice(-4)}`
      const explorerUrl = `https://shannon-explorer.somnia.network/tx/${data.txHash}`
      
      // Create custom notification with clickable explorer icon
      const toast = useToast()
      toast.add({
        title: 'Transaction confirmed!',
        description: `Transaction successful ${shortHash}`,
        color: 'success',
        icon: 'i-heroicons-check-circle',
        duration: 3000,
        actions: [{
          label: 'View on Explorer',
          icon: 'i-heroicons-arrow-top-right-on-square',
          onClick: () => {
            window.open(explorerUrl, '_blank')
          }
        }]
      })

      try {
      // Reconstruct race data for animation
      const raceData = reconstructRaceFromBlockchain(data.raceResult)

      // Show bet result info immediately
      const playerShipName = getShipName(data.playerShip) // data.playerShip is already 0-7 ID

      gameStore.addRaceLogEntry(
        `<span class="font-bold text-cyan-400">🎰 BET PLACED: ${data.betAmount} SPIRAL on ${playerShipName}!</span>`
      )
      gameStore.addRaceLogEntry(
        `<span class="font-bold text-green-400">✅ Race loaded from blockchain!</span>`
      )

      // Start the visualization FIRST (this will run the full race animation)
      await visualizeBettingRace(raceData, data.playerShip, data.betAmount)

      // AFTER animation completes, prepare results data
      const playerPlacement = raceData.placements.indexOf(data.playerShip) + 1
      const realEarnings = data.actualPayout || '0' // Use actual payout from contract (includes jackpot)
      const betAmountFloat = parseFloat(data.betAmount)
      const payoutFloat = parseFloat(realEarnings)

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
        totalPayout: realEarnings,
      }

      playerEarnings.value = netEarnings.toString() // Net profit/loss

      // Show race result notification
      showSuccess(`${playerShipName} finished ${getPlaceText(playerPlacement)} place - Payout: ${realEarnings} SPIRAL`)

      // Show jackpot notification if won (staged)
      if (data.jackpotTier > 0 && data.jackpotAmount && parseFloat(data.jackpotAmount) > 0) {
        setTimeout(() => {
          showJackpotNotification(data.jackpotTier, data.jackpotAmount)
        }, 3500) // Show after race result notification
      }

      // Fetch actual achievements and NFTs from blockchain
      try {
        const { fetchAchievementsFromTx } = useWeb3()
        console.log('🔍 Fetching achievements from transaction...')
        const recentAchievements = await fetchAchievementsFromTx(data.txHash)
        console.log('📊 Recent achievements:', recentAchievements)

        if (recentAchievements && recentAchievements.length > 0) {
          console.log('🏆 Found achievements to unlock:', recentAchievements.length)

          achievementsUnlocked.value = recentAchievements.map(
            (achievement: Record<string, unknown>) => ({
              id: achievement.nftId,
              name: achievement.name,
              description: achievement.description,
              reward: achievement.tokenReward,
            })
          )

          // Convert achievements to NFT format for MetaMask addition
          nftRewards.value = recentAchievements.map((achievement: Record<string, unknown>) => ({
            id: achievement.nftId,
            tokenId: achievement.nftId,
            name: achievement.name,
            description: achievement.description,
            type: achievement.achievementType,
            shipId: achievement.spaceshipId,
            threshold: achievement.threshold,
          }))

          console.log('🎨 NFT rewards prepared:', nftRewards.value)

          // Note: NFT auto-addition is disabled - NFTs are automatically minted to wallet
          console.log('🎨 NFT rewards prepared:', nftRewards.value)

          // Log achievements in race log and show staged notifications
          for (let i = 0; i < achievementsUnlocked.value.length; i++) {
            const achievement = achievementsUnlocked.value[i]
            if (!achievement) continue
            
            gameStore.addRaceLogEntry(
              `<span class="font-bold text-purple-400">🏆 ACHIEVEMENT UNLOCKED: ${achievement.name as string} (+${achievement.reward as string} SPIRAL)</span>`
            )
            
            // Show achievement notification (staged)
            setTimeout(() => {
              showAchievementNotification(achievement.name as string, achievement.reward as string)
            }, 7000 + (i * 3500)) // Show after jackpot notification
            
            // Show NFT minted notification (staged)
            setTimeout(() => {
              showSuccess(`Achievement NFT #${achievement.id} minted!`)
            }, 10500 + (i * 3500)) // Show after achievement notification
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
    } catch (error: unknown) {
      console.error('🎬 Error in onRaceCompleted:', error)
      gameStore.addRaceLogEntry(
        `<span class="font-bold text-red-400">❌ Failed to animate betting race: ${(error as Error).message}</span>`
      )
      showError('Race Animation Failed', (error as Error).message)
    }
  }

  // Visualize race from betting result
  const visualizeBettingRace = async (
    raceData: unknown,
    playerShip: number,
    _betAmount: string
  ) => {
    gameStore.setRaceInProgress(true)
    winnerDisplay.value = ''
    chaosEvents.value = {}
    placeIndicators.value = {}

    // Animate the race progression (same as blockchain race)
    await animateRaceProgression(raceData, (turn, states, events) => {
      // Update current race state
      gameStore.currentRace.value = states as RaceState[]

      // Place indicators are already set from blockchain data above

      // Add turn header
      gameStore.addRaceLogEntry(`<span class="font-bold text-cyan-400">🔄 Turn ${turn}</span>`)

      // Show detailed ship movements for this turn
      const turnEvents = raceData.replayLog.filter((log: { turn: number }) => log.turn === turn)

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

      gameStore.addRaceLogEntry(
        `<span class="font-bold text-cyan-400">✅ Turn ${turn} completed</span>`
      )
    })

    // Show final results with betting context
    const winnerName = getShipName(raceData.winner.id) // raceData.winner.id is 0-7 ID
    const playerShipName = getShipName(playerShip) // playerShip is 0-7 ID
    const playerPlacement = raceData.placements.indexOf(playerShip) + 1

    winnerDisplay.value = `Winner: ${winnerName}!`

    // Show player's result
    if (playerShip === raceData.winner.id) {
      gameStore.addRaceLogEntry(
        `<span class="font-bold text-green-400">🎉 YOU WON! ${playerShipName} finished 1st! 💰</span>`
      )
    } else {
      gameStore.addRaceLogEntry(
        `<span class="font-bold text-yellow-400">📊 YOUR RESULT: ${playerShipName} finished ${getPlaceText(playerPlacement)}</span>`
      )
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
      }, 1500) // 1.5 second delay after race animation completes
    })
  }

  // Load race information from blockchain
  const loadRaceInfo = async () => {
    if (!isConnected.value) return

    try {
      const info = await getCurrentRaceInfo()
      raceInfo.value = info

      if (info) {
        gameStore.addRaceLogEntry(
          `<span class="font-bold text-blue-400">📊 Race #${info.raceId}: Total Bets: ${info.totalBets} SPIRAL</span>`
        )
      }
    } catch (error) {
      console.error('Failed to load race info:', error)
    }
  }

  // Wallet connection handlers
  const onWalletConnected = () => {
    // Load race info when wallet connects
    loadRaceInfo()
    showWalletNotification('Wallet connected!', 'success')
  }

  const onWalletDisconnected = () => {
    // Handle disconnection if needed
    showWalletNotification('Wallet disconnected', 'warning')
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
    background: linear-gradient(
      135deg,
      var(--cosmic-bg-darkest) 0%,
      var(--cosmic-bg-darker) 25%,
      var(--cosmic-bg-dark) 50%,
      var(--cosmic-bg-darker) 75%,
      var(--cosmic-bg-darkest) 100%
    );
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
      radial-gradient(circle at 20% 20%, rgba(15, 185, 253, 0.15) 0%, transparent 50%),
      radial-gradient(circle at 80% 80%, rgba(0, 225, 255, 0.116) 0%, transparent 50%),
      radial-gradient(circle at 40% 60%, rgba(255, 0, 255, 0.05) 0%, transparent 50%);
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
  }

  /* Cosmic Footer Accent */
  .cosmic-footer-accent {
    height: 0.05rem;
    background: linear-gradient(
      90deg,
      transparent 0%,
      var(--cosmic-blue) 25%,
      var(--cosmic-pink) 50%,
      var(--cosmic-blue) 75%,
      transparent 100%
    );
    box-shadow:
      0 0 0.625rem var(--cosmic-blue),
      0 0 1.25rem var(--cosmic-pink);
  }

  .cosmic-header-accent {
    height: 0.05rem;
    background: linear-gradient(
      90deg,
      transparent 0%,
      var(--cosmic-blue) 25%,
      var(--cosmic-pink) 50%,
      var(--cosmic-blue) 75%,
      transparent 100%
    );
    box-shadow:
      0 0 0.625rem var(--cosmic-blue),
      0 0 1.25rem var(--cosmic-pink);
  }

  /* Responsive adjustments for different screen sizes */
  /* Removed padding to allow RaceTrack to take full area */
</style>
