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
      <h3>About Cosmic Rush</h3>
      <p><strong>How does Cosmic Rush work?</strong><br>
      Cosmic Rush is a spaceship racing game: pick an AI ship, place your SPIRAL bet, and watch the race live. Winnings are credited instantly to your ledger balance.</p>

      <p><strong>Do I need a wallet or crypto?</strong><br>
      No. You sign in with WOU-ID (anonymous, email or social login), receive SPIRAL from the in-game faucet, and play. No wallets, no external chains, no gas.</p>

      <p><strong>Where do my balance and achievements live?</strong><br>
      Your SPIRAL balance lives in the Ionic-Swap ledger tied to your WOU-ID account, and your achievements become collectible cards in the Cosmic Rush series on nftropoly.</p>

      <p><strong>What is SPIRAL?</strong><br>
      SPIRAL is the in-game credit of Cosmic Rush. Bet it on races, win it back instantly, and top it up from the faucet whenever you run low.</p>
    </section>

    <section>
      <h3>Betting & Earning</h3>
      <p><strong>How do you bet on races?</strong><br>
      Simply select your favorite AI spaceship in Cosmicrafts Rush, place your SPIRAL bet, and watch the race live—winnings are paid out automatically after each race.</p>

      <p><strong>How much can you win?</strong><br>
      A winning bet pays 6x your stake instantly to your ledger balance, plus a chance at one of three jackpots. Top it up anytime from the faucet.</p>

      <p><strong>What do achievements give you?</strong><br>
      Each achievement mints a collectible card in the Cosmic Rush series on nftropoly. Winning your first race also unlocks The Apex on the starting grid.</p>
    </section>

    <section>
      <h3>AI, Gameplay, and Winning Strategies</h3>
      <p><strong>How do racing games AI work?</strong><br>
      In Cosmicrafts Rush, AI-powered spaceships make real-time racing decisions based on randomness and programmed strategies. Every race outcome is unpredictable and fair.</p>

      <p><strong>How can AI be used to gamble?</strong><br>
      AI adds unpredictability and excitement to racing and betting. In our game, you bet on the AI ship you believe will win—outcome is based on fair, random logic, not pre-programmed results.</p>

      <p><strong>How to win the AI race?</strong><br>
      Study stats, follow your intuition, and use your knowledge of AI ship patterns. Luck plays a big part, but smart analysis can increase your odds.</p>
    </section>

    <section>
      <h3>Getting Started & Additional Info</h3>
      <p><strong>How do I get more SPIRAL?</strong><br>
      Use the in-game faucet: it tops your balance back up to 1,000 SPIRAL whenever you run low. Winnings are credited instantly to your ledger balance.</p>

      <p><strong>How to play spaceship racing games?</strong><br>
      Cosmicrafts Rush is easy: sign in, pick your racer, and place your bet. No deposits, no wallets.</p>

      <p><strong>What makes Cosmicrafts Rush unique?</strong><br>
      AI-driven spaceship races with chaos events, instant payouts, and collectible achievement cards — running on Cosmicrafts' own infrastructure, no external chains.</p>
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
      Yes. The frontend code is completely open source and auditable. Each ship has a balanced win rate, and race outcomes use fair randomness. It's your luck and choices that determine the results, not any hidden mechanics.</p>

      <p><strong>How do I know the races aren't rigged?</strong><br>
      Race outcomes use fair randomness and every result is recorded in your match history. The game code is open source — you can verify it yourself.</p>

      <p><strong>Can I really withdraw my winnings?</strong><br>
      Yes, you can withdraw your winnings at any moment! Simply unlock an achievement by playing a ship 5 times or complete other easy achievements designed to prevent economy exploitation. You also get free tokens upon signup, so it's completely safe to try. If you enjoy the game, you can acquire more tokens to continue playing.</p>

      <p><strong>What makes Cosmicrafts Rush better than other crypto racing games?</strong><br>
      This is a game you can play right now - we don't pre-sell or create hype before having a working product. You're not funding a scam or ponzi scheme. We give you everything you need to get started for free, including tokens upon signup. Cosmicrafts Rush combines provably fair mechanics, instant payouts, AI-driven chaos events, and a complete, playable experience from day one.</p>
    </section>

    <section>
      <h3>General Web3 Racing & Betting</h3>
      <p>Popular search terms: spaceship racing game, ai racing game, free browser racing game, spaceship betting game, cosmicrafts rush, crypto arcade game, race to earn, nft spaceship racing.</p>
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

  <!-- Disclaimer Modal (never auto-shows; opens only on explicit request) -->
  <DisclaimerModal 
    :show-when-no-session="false"
    :has-session="autoReconnectAttempted && autoReconnectSuccessful"
    :is-session-checked="autoReconnectAttempted"
  />

  <!-- Funnel: welcome hero for first-run (returning players skip it) -->
  <WelcomeHero
    :show="funnel.phase.value === 'hero' || funnel.phase.value === 'provisioning'"
    :busy="funnel.phase.value === 'provisioning'"
    @start="startFunnelPlay"
  />

  <!-- Funnel: skippable 3-step tutorial over the live betting panel -->
  <TutorialOverlay
    :step="funnel.tutorialStep.value"
    @next="funnel.nextTutorialStep()"
    @skip="funnel.skipTutorial()"
  />

  <!-- Funnel: discovery tour after the first race -->
  <DiscoveryTour
    :show="funnel.showTour.value"
    :done="{ ...funnel.store.value.tourDone, ...tourDone }"
    @go="tourGo"
    @close="funnel.closeTour()"
  />

  <!-- Funnel: save progress (OTP register + existing-account choice) -->
  <SaveProgressModal
    :show="funnel.showSave.value"
    @close="funnel.showSave.value = false"
    @switched="onIdentitySwitched"
  />



  <!-- Global Toast Notifications -->
  <UToaster />
</template>

<script setup lang="ts">
  import { ref, onMounted, onUnmounted, computed, defineAsyncComponent } from 'vue'
  import { useGame, type RaceState } from './composables/useGame'
  import { useWeb3 } from './composables/useBackend'
  import { useNotifications } from './composables/useNotifications'
  import { useCache } from './composables/useCache'
  import { useFunnel } from './composables/useFunnel'
  import { useRushI18n, initRushI18n, ordinal, langTag } from './composables/useRushI18n'

  const { t, locale } = useRushI18n()
  const funnel = useFunnel()

  useHead({
    title: () => t('seo.title'),
    meta: [{ name: 'description', content: () => t('seo.description') }],
    htmlAttrs: { lang: () => langTag(locale.value) },
  })

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

  // Funnel overlays (lazy: only first-run / post-race moments need them)
  const WelcomeHero = defineAsyncComponent({
    loader: () => import('./components/WelcomeHero.vue'),
    delay: 0,
    timeout: 5000,
  })
  const TutorialOverlay = defineAsyncComponent({
    loader: () => import('./components/TutorialOverlay.vue'),
    delay: 0,
    timeout: 5000,
  })
  const DiscoveryTour = defineAsyncComponent({
    loader: () => import('./components/DiscoveryTour.vue'),
    delay: 0,
    timeout: 5000,
  })
  const SaveProgressModal = defineAsyncComponent({
    loader: () => import('./components/SaveProgressModal.vue'),
    delay: 0,
    timeout: 5000,
  })

  const gameStore = useGame()
  const {
    isConnected,
    account,
    currentRaceId,
    getCurrentRaceInfo,
    formattedSpiralBalance,
    playerHasUsername,
    getPlayerAvatar,
    claimFaucet,
    hasClaimedFaucet,

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
    funnel.resolveEntry(false)
  }

  // Funnel: one tap provisions everything silently (login + faucet).
  const startFunnelPlay = async () => {
    funnel.startPlaying()
    try {
      const web3 = useWeb3()
      await web3.connectMetaMask()
      await web3.updateBalance().catch(() => {})
      // Silent faucet top-up: new players must never hunt for a Claim button.
      try {
        if (!(await hasClaimedFaucet())) await claimFaucet()
      } catch {
        /* offline fallback inside claimFaucet; never blocks play */
      }
      onWalletConnected()
      funnel.provisioningDone()
    } catch (error) {
      console.error('Funnel provisioning failed:', error)
      funnel.phase.value = 'hero'
    }
  }

  // Funnel: discovery-tour checks (nickname / avatar / balance).
  const tourDone = ref<Record<string, boolean>>({})
  const refreshTourChecks = async () => {
    try {
      const [hasName, avatarId] = await Promise.all([
        playerHasUsername().catch(() => false),
        getPlayerAvatar().catch(() => 0),
      ])
      const bal = parseFloat((formattedSpiralBalance.value || '0').replace(' SPIRAL', '')) || 0
      tourDone.value = {
        nickname: !!hasName,
        avatar: Number(avatarId) !== 0,
        topup: bal >= 10,
      }
      if (hasName) funnel.markTourItem('nickname')
      if (Number(avatarId) !== 0) funnel.markTourItem('avatar')
      if (bal >= 10) funnel.markTourItem('topup')
    } catch {
      /* tour checks never block play */
    }
  }

  // Funnel: tour "Go" navigation (Header listens and opens real UI).
  const tourGo = (id: string) => {
    if (id === 'nickname' || id === 'avatar') {
      window.dispatchEvent(new CustomEvent('rush:open-profile-tab', { detail: { tab: 'profile' } }))
    } else if (id === 'board') {
      window.dispatchEvent(new CustomEvent('rush:open-leaderboard'))
      funnel.markTourItem('board')
    } else if (id === 'cards') {
      window.dispatchEvent(new CustomEvent('rush:open-profile-tab', { detail: { tab: 'nfts' } }))
      funnel.markTourItem('cards')
    } else if (id === 'topup') {
      window.dispatchEvent(new CustomEvent('rush:claim-faucet'))
      setTimeout(() => refreshTourChecks(), 2500)
    }
  }

  const onIdentitySwitched = () => {
    refreshTourChecks()
    if (account.value) {
      setWalletAddress(account.value)
      initializeWalletCache()
    }
    loadRaceInfo()
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
    return ordinal(place)
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
        showError(t('feed.balance_failed_title'), t('feed.balance_failed_body'))
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
    // Racing graduates the tutorial however it ends.
    funnel.completeTutorial()

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
        `<span class="font-bold text-cyan-400">${t('feed.bet_placed', { amount: data.betAmount, ship: playerShipName })}</span>`
      )
      gameStore.addRaceLogEntry(
        `<span class="font-bold text-emerald-400">${t('feed.race_ready')}</span>`
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
              `<span class="font-bold text-purple-400">${t('feed.ach_unlocked', { name: achievement.name as string, reward: achievement.reward as string })}</span>`
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
      // First race graduates into the discovery tour.
      funnel.recordRace()
      refreshTourChecks()
    } catch (error: unknown) {
      console.error('🎬 Error in onRaceCompleted:', error)
      gameStore.addRaceLogEntry(
        `<span class="font-bold text-red-400">${t('feed.anim_failed', { error: (error as Error).message })}</span>`
      )
      showError(t('feed.anim_failed_title'), (error as Error).message)
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
      gameStore.addRaceLogEntry(`<span class="font-bold text-cyan-400">${t('feed.turn', { turn })}</span>`)

      // Show detailed ship movements for this turn
      const turnEvents = raceData.replayLog.filter((log: { turn: number }) => log.turn === turn)

      for (const event of turnEvents) {
        const shipName = getShipName(event.shipId) // event.shipId is 0-7 ID
        const shipColor = getShipColor(event.shipId) // event.shipId is 0-7 ID

        // Show ship movement
        gameStore.addRaceLogEntry(
          `<span class="ml-4" style="color: ${shipColor}">${t('feed.moved', { ship: shipName, move: Math.round(event.moveAmount), distance: Math.round(event.distance) })}</span>`
        )
      }

      // Show chaos events
      for (const event of events) {
        // Use the ship ID that triggered the chaos event
        const shipId = event.shipId || 0 // The ship that triggered the event
        chaosEvents.value[shipId] = event.text

        gameStore.addRaceLogEntry(
          `<span class="font-bold text-purple-400 ml-4">${t('feed.chaos', { event: event.text })}</span>`
        )

        // Clear chaos event after delay
        setTimeout(() => {
          if (chaosEvents.value[shipId] === event.text) {
            chaosEvents.value[shipId] = ''
          }
        }, 1500)
      }

      gameStore.addRaceLogEntry(
        `<span class="font-bold text-cyan-400">${t('feed.turn_done', { turn })}</span>`
      )
    })

    // Show final results with betting context
    const winnerName = getShipName(raceData.winner.id) // raceData.winner.id is 0-7 ID
    const playerShipName = getShipName(playerShip) // playerShip is 0-7 ID
    const playerPlacement = raceData.placements.indexOf(playerShip) + 1

    winnerDisplay.value = t('feed.winner', { winner: winnerName })

    // Show player's result
    if (playerShip === raceData.winner.id) {
      gameStore.addRaceLogEntry(
        `<span class="font-bold text-emerald-400">${t('feed.you_won', { ship: playerShipName })}</span>`
      )
    } else {
      gameStore.addRaceLogEntry(
        `<span class="font-bold text-yellow-400">${t('feed.your_result', { ship: playerShipName, place: getPlaceText(playerPlacement) })}</span>`
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
          `<span class="font-bold text-sky-400">${t('feed.race_summary', { id: info.raceId, total: info.totalBets })}</span>`
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
    // Returning players skip the hero straight to the track.
    funnel.resolveEntry(true)
    
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
    showWalletNotification(t('feed.wallet_disconnected'), 'warning')
  }

  // Initialize
  onMounted(() => {
    initRushI18n()
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

  // Funnel: refresh tour checks whenever the tour opens or the window
  // regains focus (player may have finished a quest in another modal).
  watch(
    () => funnel.showTour.value,
    open => {
      if (open) refreshTourChecks()
    }
  )

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

  onMounted(() => {
    window.addEventListener('focus', refreshTourChecks)
  })
  onUnmounted(() => {
    window.removeEventListener('focus', refreshTourChecks)
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
