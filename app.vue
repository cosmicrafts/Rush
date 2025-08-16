<template>
  <div class="layout-container layout-flex-col">

    <!-- Header -->
    <Header
      ref="headerRef"
      class="layout-relative z-20 component-fit-width"
      @connected="onWalletConnected"
      @disconnected="onWalletDisconnected"
      @auto-reconnect-failed="onAutoReconnectFailed"
    />

    <!-- Main Game Area - Race Track takes full remaining height -->
    <div class="layout-flex component-fit layout-relative z-10">
      <RaceTrack
        :ships="currentRace"
        :chaos-events="chaosEvents"
        :place-indicators="placeIndicators"
        :show-reopen-button="shouldShowResultsButton"
        :show-betting-interface="!showResultsPanel && !isRaceInProgress"
        :persistent-betting-data="persistentBettingData"
        @reopen-results="handleReopenResults"
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

  <!-- FAQ Section for SEO -->
  <div class="seo-faq-section">
    <h2>Frequently Asked Questions - Cosmicrafts Rush</h2>
    
    <section>
      <h3>About On-Chain & Web3 Racing</h3>
      <p><strong>What is Onchain gaming?</strong><br>
      Onchain gaming refers to games where all key actions—game logic, state, and rewards—are run directly on the blockchain. Every race, bet, and payout in Cosmicrafts Rush is provably fair, open, and instant thanks to decentralized, onchain execution.</p>

      <p><strong>Which is best, on-chain or off-chain?</strong><br>
      On-chain games (like Cosmicrafts Rush) offer unmatched transparency, instant crypto payouts, and true digital ownership. Off-chain games may be faster but lack fairness and crypto rewards. For betting and earning, on-chain gaming leads the industry.</p>

      <p><strong>What are blockchain games?</strong><br>
      Blockchain games use smart contracts to power gameplay, rewards, and digital assets. They enable play-to-earn mechanics where you can own, trade, or even bet on NFTs and win real crypto.</p>

      <p><strong>What is the Somnia network?</strong><br>
      Somnia is a next-generation, EVM-compatible blockchain network designed for high-speed blockchain games, NFT platforms, and Web3 betting applications. Cosmicrafts Rush runs on Somnia for ultra-fast races and instant settlements.</p>

      <p><strong>Does Somnia have a token?</strong><br>
      Yes. Somnia's token fuels the network and ecosystem. You can buy, hold, and use it for gaming, staking, and governance.</p>

      <p><strong>How does Onchain Arcade work?</strong><br>
      Onchain Arcades leverage smart contracts to enable true betting, P2E (play to earn), and verifiable racing outcomes—every move and payout is public and provably fair.</p>
    </section>

    <section>
      <h3>Betting & Earning With Web3 Racing Games</h3>
      <p><strong>How do you bet on races?</strong><br>
      Simply select your favorite AI spaceship in Cosmicrafts Rush, place your crypto bet, and watch the race live—winnings are paid out automatically after each race.</p>

      <p><strong>Can you make money with blockchain games?</strong><br>
      Yes. Games like Cosmicrafts Rush and popular NFT horse racing games allow players and bettors to win actual crypto. Top racers and successful bettors can cash out or reinvest instantly.</p>

      <p><strong>Which is the No. 1 car racing game?</strong><br>
      In the Web3 space, Cosmicrafts Rush, Zed Run, and similar NFT racing games lead the charts. For traditional gamers, titles like Gran Turismo and Forza remain on top.</p>

      <p><strong>Are blockchain games legit?</strong><br>
      Legitimate blockchain games are provably fair and secure through their open-source code and transparent smart contracts. Always check for projects with audited code and active communities.</p>

      <p><strong>Does the bitcoin blast game pay real money?</strong><br>
      Some games advertise payouts but always check user reviews and ensure the game is decentralized. With Cosmicrafts Rush, winnings are paid directly to your crypto wallet, instantly.</p>

      <p><strong>What crypto game pays the most?</strong><br>
      Top play-to-earn and betting games (like Cosmicrafts Rush or Zed Run) can pay hundreds or thousands in crypto to the most skillful or lucky players, depending on race pools and event frequency.</p>

      <p><strong>How much can you earn from NFT games?</strong><br>
      Earnings depend on game mechanics, skill, and luck—many earn small amounts, while top winners and racers in games with large community pools can win substantial rewards.</p>
    </section>

    <section>
      <h3>AI, Gameplay, and Winning Strategies</h3>
      <p><strong>How do racing games AI work?</strong><br>
      In Cosmicrafts Rush, AI-powered spaceships make real-time racing decisions based on randomness and programmed strategies. Every race outcome is unpredictable and fair, driven by verifiable smart contract code.</p>

      <p><strong>How can AI be used to gamble?</strong><br>
      AI adds unpredictability and excitement to racing and betting. In our game, you bet on the AI ship you believe will win—outcome is based on fair, random logic, not pre-programmed results.</p>

      <p><strong>How to win the AI race?</strong><br>
      Study stats, follow your intuition, and use your knowledge of AI ship patterns. Luck plays a big part, but smart analysis can increase your odds.</p>
    </section>

    <section>
      <h3>Getting Started & Additional Info</h3>
      <p><strong>How to buy somnia crypto?</strong><br>
      Check the official Somnia Network resources or partner exchanges. Always verify you're using a legitimate, safe platform.</p>

      <p><strong>How to play Rocket Gambling / Space Race games?</strong><br>
      Rocket gambling and spaceship racing games like Cosmicrafts Rush are easy: sign up, deposit crypto, pick your racer, and place your bet.</p>

      <p><strong>What makes Cosmicrafts Rush unique?</strong><br>
      It's the only provably fair, on-chain, Web3 spaceship racing game—combining instant payouts, AI-driven races, and support for both gamblers and traditional gamers. Think "Zed Run for space" with real crypto rewards and next-gen gameplay.</p>
    </section>

    <section>
      <h3>Competitive Comparisons & Trust</h3>
      <p><strong>Cosmicrafts Rush vs Zed Run: What's the difference?</strong><br>
      While Zed Run focuses on NFT horse racing with breeding mechanics, Cosmicrafts Rush offers spaceship racing with AI chaos events, instant payouts, and a more arcade-style experience. Both are provably fair, but Cosmicrafts Rush features faster races, unique chaos mechanics, and a sci-fi theme that appeals to both crypto enthusiasts and traditional gamers.</p>

      <p><strong>How does Cosmicrafts Rush compare to Photo Finish Live?</strong><br>
      Photo Finish Live offers realistic horse racing simulation, while Cosmicrafts Rush provides arcade-style spaceship racing with AI-driven chaos events. Our game focuses on quick, exciting races with instant crypto payouts, making it perfect for players who want fast-paced action rather than detailed horse management.</p>

      <p><strong>Cosmicrafts Rush vs Pegaxy: Which is better for earning?</strong><br>
      Both games offer P2E mechanics, but Cosmicrafts Rush features faster races with instant payouts and unique AI chaos events. While Pegaxy focuses on mechanical "Pegas" with breeding tournaments, Cosmicrafts Rush emphasizes quick, exciting races that can be completed in minutes with immediate crypto rewards.</p>

      <p><strong>How does Cosmicrafts Rush stack up against REVV Racing?</strong><br>
      REVV Racing offers NFT car racing with cross-game rewards, while Cosmicrafts Rush provides spaceship racing with AI chaos and instant payouts. Our game focuses on the unique combination of sci-fi racing, AI-driven unpredictability, and provably fair on-chain execution that sets it apart from traditional car racing games.</p>

      <p><strong>Is Cosmicrafts Rush legit and safe to play?</strong><br>
      Yes, Cosmicrafts Rush is 100% legitimate and safe. The code is completely open source and auditable - you can check the smart contracts yourself. Each ship has a balanced 8-16% win rate, and races use EVM randomness for fair outcomes. It's your luck and choices that determine the results, not any hidden mechanics.</p>

      <p><strong>How do I know the races aren't rigged?</strong><br>
      The game uses EVM randomness to determine race outcomes, making it completely fair and unpredictable. Each spaceship has a balanced 8-16% win rate, and all smart contracts are open source and auditable. You can verify the code yourself - there's no way to rig the races as everything runs on transparent blockchain technology.</p>

      <p><strong>Can I really withdraw my winnings?</strong><br>
      Yes, you can withdraw your winnings at any moment! Simply unlock an achievement by playing a ship 5 times or complete other easy achievements designed to prevent economy exploitation. You also get free tokens upon signup, so it's completely safe to try. If you enjoy the game, you can acquire more tokens to continue playing.</p>

      <p><strong>What makes Cosmicrafts Rush better than other crypto racing games?</strong><br>
      This is a game you can play right now - we don't pre-sell or create hype before having a working product. You're not funding a scam or ponzi scheme. We give you everything you need to get started for free, including tokens upon signup. Cosmicrafts Rush combines provably fair mechanics, instant payouts, AI-driven chaos events, and a complete, playable experience from day one.</p>
    </section>

    <section>
      <h3>General Web3 Racing & Betting</h3>
      <p>Popular search terms: web3 betting racing game free, crypto betting platform, zed run alternative, best web3 games 2025, virtual horse racing game, web3 games play-to-earn, best web3 casinos, crypto betting app, nft spaceship racing, instant crypto payouts, provably fair betting, onchain gaming, ai racing game, blockchain racing game, crypto horse racing, virtual horse race betting, top NFT racing game, win real crypto, race to earn, spaceship betting, crypto arcade game, cosmicrafts rush vs zed run, cosmicrafts rush vs pegaxy, cosmicrafts rush vs revv racing, is cosmicrafts rush legit, provably fair spaceship racing, crypto space racing game, NFT betting racing game.</p>
    </section>
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
  <DisclaimerModal 
    :show-when-no-session="true"
    :has-session="autoReconnectAttempted && autoReconnectSuccessful"
    :is-session-checked="autoReconnectAttempted"
  />



  <!-- Global Toast Notifications -->
  <UToaster />
</template>

<script setup lang="ts">
  import { ref, onMounted, computed, defineAsyncComponent } from 'vue'
  import { useGame, type RaceState } from './composables/useGame'
  import { useWeb3 } from './composables/useWeb3'
  import { useNotifications } from './composables/useNotifications'
  import { useCache } from './composables/useCache'

  // Eager load critical components (always needed)
  import Header from './components/Header.vue'

  // Lazy load RaceTrack to reduce initial bundle size
  const RaceTrack = defineAsyncComponent({
    loader: () => import('./components/RaceTrack.vue'),
    delay: 0,
    timeout: 5000,
  })

  // Lazy load non-critical components (loaded only when needed)
  const RaceResultsPanel = defineAsyncComponent({
    loader: () => import('./components/RaceResultsPanel.vue'),
    delay: 0,
    timeout: 5000,
  })

  const ShipInfoCard = defineAsyncComponent({
    loader: () => import('./components/ShipInfoCard.vue'),
    delay: 0,
    timeout: 5000,
  })

  const PayoutInfoModal = defineAsyncComponent({
    loader: () => import('./components/PayoutInfoModal.vue'),
    delay: 0,
    timeout: 5000,
  })

  const DisclaimerModal = defineAsyncComponent({
    loader: () => import('./components/DisclaimerModal.vue'),
    delay: 0,
    timeout: 5000,
  })

  const gameStore = useGame()
  const {
    isConnected,
    account,
    currentRaceId,
    getCurrentRaceInfo,

    reconstructRaceFromBlockchain,
    animateRaceProgression,
    getShipName,
    getShipColor,
  } = useWeb3()

  // Initialize cache system
  const {
    isCacheLoaded,
    saveRaceResults,
    loadRaceResults,
    setWalletAddress,
    initializeWalletCache,
    cleanupExpiredCache,
    getCacheStats,
  } = useCache()

  // Get session status from cache
  const cacheStats = computed(() => getCacheStats())
  const hasSession = computed(() => cacheStats.value?.hasSession || false)
  
  // Track auto-reconnect status
  const autoReconnectAttempted = ref(false)
  const autoReconnectSuccessful = ref(false)

  // Initialize notification system
  const {
    showError,
    showWalletNotification,
    showTransactionNotification,
    showRaceResultNotification,
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

  // Handle auto-reconnect failure
  const onAutoReconnectFailed = () => {
    autoReconnectAttempted.value = true
    autoReconnectSuccessful.value = false
  }

  // Computed properties
  const currentRace = computed(() => gameStore.currentRace.value)

  // Show results button logic:
  // 1. If there are race results available (from cache or current state)
  // 2. AND race is not currently in progress
  // 3. Then show the button
  const shouldShowResultsButton = computed(() => {
    const hasCurrentResults = raceResults.value !== null
    const hasCachedResults = isCacheLoaded.value && loadRaceResults() !== null

    // Debug logging
    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 Show Results Button Debug:', {
        hasCurrentResults,
        hasCachedResults,
        isCacheLoaded: isCacheLoaded.value,
        isRaceInProgress: isRaceInProgress.value,
        shouldShow: (hasCurrentResults || hasCachedResults) && !isRaceInProgress.value,
      })
    }

    return (hasCurrentResults || hasCachedResults) && !isRaceInProgress.value
  })

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

  // Load cached race results when reopening results panel
  const loadCachedRaceResults = () => {
    if (!isCacheLoaded.value) return

    const cachedResults = loadRaceResults()
    if (cachedResults && !raceResults.value) {
      raceResults.value = {
        raceId: cachedResults.raceId,
        playerShip: cachedResults.playerShip,
        betAmount: cachedResults.betAmount,
        placement: cachedResults.placement,
        placements: cachedResults.placements,
        winner: cachedResults.winner,
        jackpotTier: cachedResults.jackpotTier,
        jackpotAmount: cachedResults.jackpotAmount,
        totalPayout: cachedResults.totalPayout,
      }
      playerEarnings.value = cachedResults.playerEarnings
      achievementsUnlocked.value = cachedResults.achievementsUnlocked
      nftRewards.value = cachedResults.nftRewards
      currentTxHash.value = cachedResults.txHash
    }
  }

  // Handle reopening results panel with cached data
  const handleReopenResults = () => {
    loadCachedRaceResults()
    showResultsPanel.value = true
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

    // Show transaction success notification (delayed by 1 second)
    setTimeout(() => {
      showTransactionNotification(data.txHash, 'success')
    }, 1000) //  1 second delay

    try {
      // Reconstruct race data for animation
      const raceData = reconstructRaceFromBlockchain(data.raceResult)

      // Show bet result info immediately
      const playerShipName = getShipName(data.playerShip) // data.playerShip is already 0-7 ID

      gameStore.addRaceLogEntry(
        `<span class="font-bold text-cyan-400">🎰 BET PLACED: ${data.betAmount} SPIRAL on ${playerShipName}!</span>`
      )
      gameStore.addRaceLogEntry(
        `<span class="font-bold text-emerald-400">✅ Race loaded from blockchain!</span>`
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
      const resultsData = {
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

      raceResults.value = resultsData
      playerEarnings.value = netEarnings.toString() // Net profit/loss

      // Save race results to cache
      const cacheData = {
        ...resultsData,
        playerEarnings: netEarnings.toString(),
        achievementsUnlocked: achievementsUnlocked.value,
        nftRewards: nftRewards.value,
        txHash: data.txHash,
      }
      saveRaceResults(cacheData)

      // Show race result notification immediately when race completes
      showRaceResultNotification(playerShipName, getPlaceText(playerPlacement), realEarnings)

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

          // Log achievements in race log (notifications will be handled by RaceResultsPanel)
          for (let i = 0; i < achievementsUnlocked.value.length; i++) {
            const achievement = achievementsUnlocked.value[i]
            if (!achievement) continue

            gameStore.addRaceLogEntry(
              `<span class="font-bold text-purple-400">🏆 ACHIEVEMENT UNLOCKED: ${achievement.name as string} (+${achievement.reward as string} SPIRAL)</span>`
            )
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
        `<span class="font-bold text-emerald-400">🎉 YOU WON! ${playerShipName} finished 1st! 💰</span>`
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
          `<span class="font-bold text-sky-400">📊 Race #${info.raceId}: Total Bets: ${info.totalBets} SPIRAL</span>`
        )
      }
    } catch (error) {
      console.error('Failed to load race info:', error)
    }
  }

  // Wallet connection handlers
  const onWalletConnected = () => {
    // Set auto-reconnect status
    autoReconnectAttempted.value = true
    autoReconnectSuccessful.value = true
    
    // Set wallet address for cache
    if (account.value) {
      setWalletAddress(account.value)
      // Initialize cache for this wallet
      initializeWalletCache()
    }

    // Load race info when wallet connects
    loadRaceInfo()
  }

  const onWalletDisconnected = () => {
    // Handle disconnection if needed
    showWalletNotification('Wallet disconnected', 'warning')
  }

  // Initialize
  onMounted(() => {
    gameStore.startNewRace()

    // Initialize cache if wallet is already connected
    if (isConnected.value && account.value) {
      setWalletAddress(account.value)
      initializeWalletCache()

      // Load cached race results on mount
      setTimeout(() => {
        loadCachedRaceResults()
      }, 500) // Small delay to ensure cache is initialized
    }

    // Load race info if already connected
    if (isConnected.value) {
      loadRaceInfo()
    }

    // Clean up expired cache on app start
    cleanupExpiredCache()
  })

  // Watch for cache loading to restore race results
  watch(isCacheLoaded, loaded => {
    if (loaded && !raceResults.value) {
      loadCachedRaceResults()
    }
  })

  // Watch for account changes to initialize cache
  watch(account, newAccount => {
    if (newAccount) {
      setWalletAddress(newAccount)
      // Small delay to ensure wallet address is set before initializing cache
      setTimeout(() => {
        initializeWalletCache()
      }, 50)
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
    overflow-x: hidden;
    overflow-y: auto;
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
    display: flex;
  }

  /* Cosmic Footer Accent */
  .cosmic-footer-accent {
    height: 0.05rem;
    background: linear-gradient(
      90deg,
      transparent 0%,
      var(--cosmic-sky) 25%,
      var(--cosmic-pink) 50%,
      var(--cosmic-sky) 75%,
      transparent 100%
    );
    box-shadow:
      0 0 0.625rem var(--cosmic-sky),
      0 0 1.25rem var(--cosmic-pink);
  }

  .cosmic-header-accent {
    height: 0.05rem;
    background: linear-gradient(
      90deg,
      transparent 0%,
      var(--cosmic-sky) 25%,
      var(--cosmic-pink) 50%,
      var(--cosmic-sky) 75%,
      transparent 100%
    );
    box-shadow:
      0 0 0.625rem var(--cosmic-sky),
      0 0 1.25rem var(--cosmic-pink);
    flex-shrink: 0;
  }

  /* SEO-Friendly FAQ Section - visible to search engines and screen readers */
  .seo-faq-section {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }

  .seo-faq-section h2,
  .seo-faq-section h3,
  .seo-faq-section p,
  .seo-faq-section strong {
    color: #000;
    font-size: 16px;
    line-height: 1.5;
    margin: 0;
    padding: 0;
  }
</style>
