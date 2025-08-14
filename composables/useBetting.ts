import { ref, computed, watch, onMounted, shallowRef } from 'vue'
import { useWeb3 } from './useWeb3'
import { useGame } from '~/composables/useGame'
import { SHIPS_ROSTER } from '~/composables/useShips'
import type { Ship } from '~/composables/useGame'

// Performance optimization: Cache for expensive operations
const contractCache = new Map()
const CACHE_DURATION = 30000 // 30 seconds

// Debounce utility for performance
const debounce = <T extends (...args: unknown[]) => void>(func: T, wait: number) => {
  let timeout: NodeJS.Timeout
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

export const useBetting = () => {
  const gameStore = useGame()

  const {
    // Web3 state
    isConnected,
    account,
    shortAddress,
    formattedBalance,
    formattedSpiralBalance,
    walletType,
    currentRaceId,
    connectionState,

    // Guard functions
    isConnectionReady,

    // Web3 methods
    placeBetAndGetRace,
    getCurrentRaceInfo,
    getShipBets,
    updateBalance,
    getPlayerStats,
    getPlayerAchievementCount,
    getSpiralBalance,
    getJackpotAmounts,
    claimFaucet,
    hasClaimedFaucet,
    approveSpiralTokens,
    // registerUsername, // unused but kept for future use
    // getUsername, // unused but kept for future use
    // playerHasUsername, // unused but kept for future use
    // getPlayerAvatar, // unused but kept for future use
    // getAddressByUsername, // unused but kept for future use
    getPlayerMatchHistory,
    getTopPlayersByWinnings,
    checkApprovalNeeded,
  } = useWeb3()

  // Game constants - now from contract
  const minBet = computed(() => {
    // Use hardcoded values since contractInfo is not available
    return '10'
  })

  const maxBet = computed(() => {
    // Get the actual SPIRAL balance
    const balance = parseFloat(formattedSpiralBalance.value.replace(' SPIRAL', ''))

    // If balance is less than 1000, use the balance as max
    // If balance is 1000 or more, use 1000 as max
    if (balance < 1000) {
      return balance.toString()
    }

    return '1000'
  })

  // Get race log from game store
  const raceLog = computed(() => gameStore.raceLog)

  // State - using shallowRef for large objects
  const betError = ref('')
  const placingBet = ref(false)
  const error = ref('')
  const selectedShip = ref<Ship | null>(null)
  const betAmount = ref('')
  const shipBets = shallowRef<{ [key: number]: string }>({})
  const playerBets = ref<string[]>([])
  const jackpotAmounts = shallowRef({ mini: '0', mega: '0', super: '0' })
  const claiming = ref(false)
  const hasClaimed = ref(false)
  const approving = ref(false)
  const needsApproval = ref(false)
  const approvalPending = ref(false)
  const allowanceChecked = ref(false)
  const playerStats = shallowRef<{
    totalRaces: number
    totalWinnings: string
    biggestWin: string
    highestJackpotTier: number
    achievementRewards: string
    spaceshipWins: string[]
  } | null>(null)
  const achievementCount = ref(0)
  const raceInfo = shallowRef<{
    raceId: number
    totalBets: string
    totalRaces: number
    isActive: boolean
  } | null>(null)
  const showUsernameModal = ref(false)
  const showMatchHistoryModal = ref(false)
  const matchHistory = shallowRef<
    Array<{
      raceId: number
      timestamp: number
      shipBet: number
      betAmount: string
      placement: number
      payout: string
      jackpotTier: number
      jackpotAmount: string
    }>
  >([])
  const loadingMatchHistory = ref(false)
  const selectedPlayerForHistory = ref('')
  const showLeaderboardsModal = ref(false)
  const leaderboardData = shallowRef<{
    players: string[]
    usernames: string[]
    winnings: string[]
    avatars: number[]
  }>({ players: [], usernames: [], winnings: [], avatars: [] })
  const loadingLeaderboards = ref(false)
  const showPlayerStatisticsModal = ref(false)
  const loadingPlayerStatistics = ref(false)

  const showRaceLogModal = ref(false)
  const showUserProfileModal = ref(false)
  const targetUserAddress = ref<string>('')
  const playerUsername = ref('')
  const hasUsername = ref(false)
  const playerAvatarId = ref(0)
  const usernameInput = ref('')
  const registeringUsername = ref(false)
  const usernameError = ref('')
  const ships = ref(SHIPS_ROSTER)

  // Performance: Loading state manager
  const loadingStates = shallowRef({
    initial: false,
    betting: false,
    player: false,
    jackpot: false,
    faucet: false,
  })

  // Performance: Cache management
  const getCachedData = (key: string) => {
    const cached = contractCache.get(key)
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.data
    }
    return null
  }

  const setCachedData = (key: string, data: unknown) => {
    contractCache.set(key, {
      data,
      timestamp: Date.now(),
    })
  }

  const clearCache = () => {
    contractCache.clear()
  }

  // Computed properties
  const totalCost = computed(() => {
    if (!betAmount.value) return '0'
    return betAmount.value
  })

  const canPlaceBet = computed(() => {
    if (!selectedShip.value || !betAmount.value) return false

    const amount = parseFloat(betAmount.value)
    const min = parseFloat(minBet.value)
    const max = parseFloat(maxBet.value)

    return amount >= min && amount <= max && !placingBet.value
  })

  const betValidationWarning = computed(() => {
    if (!betAmount.value) return ''

    const amount = parseFloat(betAmount.value)
    const min = parseFloat(minBet.value)
    const max = parseFloat(maxBet.value)
    const balance = parseFloat(formattedSpiralBalance.value.replace(' SPIRAL', ''))

    if (amount < min) {
      return `Minimum bet amount is ${min} SPIRAL`
    }

    if (amount > max) {
      if (balance < 1000) {
        return `Max bet is ${max} SPIRAL`
      } else {
        return `Max bet is ${max} SPIRAL`
      }
    }

    if (amount > balance) {
      return `Insufficient balance. You have ${balance} SPIRAL`
    }

    return ''
  })

  const getButtonText = () => {
    if (placingBet.value) return 'Placing Bet...'
    if (approving.value) return 'Approving...'
    if (needsApproval.value && !approvalPending.value) return 'Approve SPIRAL'
    if (approvalPending.value) return 'Approval Pending...'
    return 'Place Bet'
  }

  // Methods
  const selectShip = (ship: Ship) => {
    selectedShip.value = ship
  }

  const setBetAmount = (amount: string | number) => {
    betAmount.value = String(amount)
  }

  // Performance: Optimized allowance check with caching - check once for unlimited approval
  const checkAllowanceIfReady = debounce(async () => {
    if (!isConnectionReady()) return

    try {
      const cacheKey = `allowance-${account.value}`
      const cached = getCachedData(cacheKey)

      if (cached) {
        needsApproval.value = cached.needsApproval
        approvalPending.value = cached.approvalPending
        allowanceChecked.value = true
        return
      }

      // Check if we have any allowance at all (unlimited approval)
      const needsApprovalResult = await checkApprovalNeeded('1') // Just check if any allowance exists

      needsApproval.value = needsApprovalResult
      approvalPending.value = false
      allowanceChecked.value = true

      setCachedData(cacheKey, { needsApproval: needsApprovalResult, approvalPending: false })
    } catch (error) {
      console.error('Allowance check failed:', error)
    }
  }, 300)

  const getShipNameById = (shipId: number) => {
    const ship = SHIPS_ROSTER.find(s => s.id === shipId)
    return ship ? ship.name : `Ship ${shipId}`
  }

  const approveTokens = async () => {
    if (!isConnectionReady()) {
      return false
    }

    try {
      approving.value = true
      error.value = ''

      // Approve unlimited tokens (no amount specified = unlimited)
      await approveSpiralTokens()

      // Clear allowance cache
      const cacheKey = `allowance-${account.value}`
      contractCache.delete(cacheKey)

      // Update approval status immediately
      needsApproval.value = false
      approvalPending.value = false
      allowanceChecked.value = true

      return true
    } catch (err: unknown) {
      console.error('Token approval failed:', err)
      const errorMessage = err instanceof Error ? err.message : 'Failed to approve tokens'
      error.value = errorMessage
      return false
    } finally {
      approving.value = false
    }
  }

  const placeBet = async () => {
    if (!isConnectionReady() || !selectedShip.value || !betAmount.value) {
      return null
    }

    // If approval is needed, don't proceed with betting
    if (needsApproval.value && !approvalPending.value) {
      error.value = 'Please approve tokens first'
      return null
    }

    try {
      placingBet.value = true
      betError.value = ''
      error.value = ''

      // Ensure bet amount is a string for ethers.js
      const betAmountString = String(betAmount.value)

      // Clear allowance cache when placing bet
      const cacheKey = `allowance-${account.value}-${betAmountString}`
      contractCache.delete(cacheKey)

      const result = await placeBetAndGetRace(selectedShip.value.id, betAmountString)

      if (result) {
        // Update balances and clear cache
        await updateBalance()
        clearCache()

        return {
          raceResult: result.raceResult,
          playerShip: selectedShip.value.id,
          betAmount: betAmount.value,
          actualPayout: result.actualPayout,
          jackpotTier: result.jackpotTier,
          jackpotAmount: result.jackpotAmount,
          txHash: result.txHash,
        }
      }
    } catch (err: unknown) {
      console.error('Bet placement failed:', err)
      const errorMessage = err instanceof Error ? err.message : 'Failed to place bet'
      
      // Use toast notification for user rejection messages instead of HTML display
      if (errorMessage.includes('Transaction was rejected by user')) {
        // Don't set error.value for user rejections - use toast instead
        // The toast will be handled by the calling component
      } else {
        error.value = errorMessage
      }
    } finally {
      placingBet.value = false
    }

    return null
  }

  // Performance: Optimized data loading with parallel execution
  const loadBettingData = async () => {
    if (!isConnectionReady()) return

    try {
      loadingStates.value.betting = true

      const cacheKey = `raceInfo-${currentRaceId.value}`
      const cached = getCachedData(cacheKey)

      if (cached) {
        raceInfo.value = cached.raceInfo
        shipBets.value = cached.shipBets
        return
      }

      const [raceInfoResult, shipBetsResult] = await Promise.all([
        getCurrentRaceInfo(),
        getShipBets(Number(currentRaceId.value)),
      ])

      raceInfo.value = raceInfoResult
      shipBets.value = shipBetsResult.reduce(
        (acc: Record<number, string>, bet: string, index: number) => {
          acc[index] = bet
          return acc
        },
        {}
      )

      setCachedData(cacheKey, { raceInfo: raceInfoResult, shipBets: shipBets.value })
    } catch (error) {
      console.error('Failed to load betting data:', error)
    } finally {
      loadingStates.value.betting = false
    }
  }

  const loadPlayerData = async () => {
    if (!isConnectionReady()) return

    try {
      loadingStates.value.player = true

      const cacheKey = `playerData-${account.value}`
      const cached = getCachedData(cacheKey)

      if (cached) {
        playerStats.value = cached.stats
        achievementCount.value = cached.achievements
        return
      }

      const [stats, achievements] = await Promise.all([
        getPlayerStats(),
        getPlayerAchievementCount(),
      ])

      playerStats.value = stats
      achievementCount.value = achievements

      setCachedData(cacheKey, { stats, achievements })
    } catch (error) {
      console.error('Failed to load player data:', error)
      playerStats.value = null
      achievementCount.value = 0
    } finally {
      loadingStates.value.player = false
    }
  }

  const loadJackpotData = async () => {
    if (!isConnectionReady()) return

    try {
      loadingStates.value.jackpot = true

      const cacheKey = 'jackpotAmounts'
      const cached = getCachedData(cacheKey)

      if (cached) {
        jackpotAmounts.value = cached
        return
      }

      const amounts = await getJackpotAmounts()
      jackpotAmounts.value = amounts
      setCachedData(cacheKey, amounts)
    } catch (error) {
      console.error('Failed to load jackpot data:', error)
      jackpotAmounts.value = { mini: '0', mega: '0', super: '0' }
    } finally {
      loadingStates.value.jackpot = false
    }
  }

  const claimFaucetHandler = async () => {
    if (!isConnectionReady()) return

    try {
      // Check faucet status first to avoid unnecessary transactions
      const alreadyClaimed = await hasClaimedFaucet()
      if (alreadyClaimed) {
        hasClaimed.value = true
        throw new Error('Already claimed faucet tokens')
      }
      
      // Call claimFaucet and return the transaction object
      const tx = await claimFaucet()
      
      // Clear cache first to ensure fresh data
      clearCache()
      
      return tx
    } catch (err: unknown) {
      console.error('Failed to claim faucet:', err)
      const errorMessage = err instanceof Error ? err.message : 'Failed to claim faucet'
      error.value = errorMessage
      throw err // Re-throw so the component can handle it
    }
  }

  const checkFaucetStatus = async () => {
    if (!isConnectionReady()) return

    try {
      loadingStates.value.faucet = true

      const cacheKey = `faucetStatus-${account.value}`
      
      // Clear any existing cache for this key to ensure fresh data
      contractCache.delete(cacheKey)
      
      // Get fresh data from blockchain
      hasClaimed.value = await hasClaimedFaucet()
      setCachedData(cacheKey, hasClaimed.value)
    } catch (err) {
      console.error('Failed to check faucet status:', err)
      // Fallback to balance check
      try {
        const spiralBalance = await getSpiralBalance()
        hasClaimed.value = parseFloat(spiralBalance) > 0
      } catch (fallbackErr) {
        console.error('Fallback faucet check failed:', fallbackErr)
      }
    } finally {
      loadingStates.value.faucet = false
    }
  }

  // Social engagement functions
  const openTwitterRequest = () => {
    const message = `Hey @cosmicrafts! 🚀 I'm racing spaceships in Rush and need more $SPIRAL tokens to keep the adventure going! @somniaGames_ \n\nMy wallet: ${account.value}\n\n #GetOnTheShip #Somnia`
    const encodedMessage = encodeURIComponent(message)
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodedMessage}`
    window.open(twitterUrl, '_blank')
  }

  const openDiscord = () => {
    window.open('https://discord.com/invite/cosmicrafts-884272584491941888', '_blank')
  }

  const openTwitterProfile = () => {
    window.open('https://x.com/cosmicrafts', '_blank')
  }

  const checkUsernameStatus = async () => {
    // This function is now handled by the header component
    console.log('🔍 Username status check moved to header component')
  }

  const handleRegisterUsername = async () => {
    // This function is now handled by the header component
    console.log('🔍 Username registration moved to header component')
  }

  const skipUsernameRegistration = () => {
    // This function is now handled by the header component
    console.log('🔍 Username registration skip moved to header component')
  }

  // Performance: Optimized initialization with progressive loading
  const initializeBettingData = async () => {
    if (!isConnectionReady()) return

    try {
      loadingStates.value.initial = true

      // Phase 1: Load essential data immediately (UI can render)
      await Promise.allSettled([
        loadBettingData(),
        loadJackpotData(),
      ])

      // Phase 2: Load player data after a short delay (non-critical for UI)
      setTimeout(async () => {
        await Promise.allSettled([
          loadPlayerData(),
          checkFaucetStatus(),
        ])
      }, 300)

    } catch (error) {
      console.error('Failed to initialize betting data:', error)
    } finally {
      loadingStates.value.initial = false
    }
  }

  // Performance: Optimized watchers with debouncing
  const debouncedInitialize = debounce(initializeBettingData, 200)
  const debouncedLoadBetting = debounce(loadBettingData, 200)

  // Initialize
  onMounted(() => {
    if (isConnectionReady()) {
      debouncedInitialize()
    }
  })

  // Performance: Single optimized watcher for connection changes
  watch(
    [isConnected, connectionState],
    ([connected, state]) => {
      if (connected && state === 'ready') {
        debouncedInitialize()
      }
    },
    { immediate: true }
  )

  // Performance: Optimized race ID watcher
  watch(currentRaceId, () => {
    if (isConnected.value) {
      debouncedLoadBetting()
    }
  })

  // Performance: Optimized connection watcher - check allowance once when connected
  watch(
    [isConnected, connectionState],
    ([connected, state]) => {
      if (connected && state === 'ready' && !allowanceChecked.value) {
        // Check allowance once when connection is ready
        setTimeout(() => {
          checkAllowanceIfReady()
        }, 500)
      }
    },
    { immediate: true }
  )

  // Performance: Optimized modal functions with caching
  const openMatchHistory = async (playerAddress?: string, displayName?: string) => {
    selectedPlayerForHistory.value =
      displayName || (playerAddress ? formatAddress(playerAddress) : 'Your History')
    showMatchHistoryModal.value = true
    loadingMatchHistory.value = true

    try {
      const cacheKey = `matchHistory-${playerAddress || account.value}`
      const cached = getCachedData(cacheKey)

      if (cached) {
        matchHistory.value = cached
        return
      }

      const { matches } = await getPlayerMatchHistory(playerAddress, 0, 20)
      matchHistory.value = matches
      setCachedData(cacheKey, matches)
    } catch (error) {
      console.error('Failed to load match history:', error)
      matchHistory.value = []
    } finally {
      loadingMatchHistory.value = false
    }
  }

  const closeMatchHistory = () => {
    showMatchHistoryModal.value = false
    matchHistory.value = []
    selectedPlayerForHistory.value = ''
  }

  const openLeaderboards = async () => {
    showLeaderboardsModal.value = true
    loadingLeaderboards.value = true

    try {
      const cacheKey = 'leaderboards'
      const cached = getCachedData(cacheKey)

      if (cached) {
        leaderboardData.value = cached
        return
      }

      const data = await getTopPlayersByWinnings(20)
      leaderboardData.value = data
      setCachedData(cacheKey, data)
    } catch (error) {
      console.error('Failed to load leaderboards:', error)
      leaderboardData.value = { players: [], usernames: [], winnings: [], avatars: [] }
    } finally {
      loadingLeaderboards.value = false
    }
  }

  const closeLeaderboards = () => {
    showLeaderboardsModal.value = false
    leaderboardData.value = { players: [], usernames: [], winnings: [], avatars: [] }
  }

  const openPlayerHistory = (playerAddress: string, username?: string) => {
    closeLeaderboards()
    // Open user profile modal instead of match history
    targetUserAddress.value = playerAddress
    showUserProfileModal.value = true
  }

  const openUserProfile = (playerAddress: string) => {
    console.log('Opening user profile for:', playerAddress)
    targetUserAddress.value = playerAddress
    showUserProfileModal.value = true
  }

  const closeUserProfile = () => {
    console.log('Closing user profile')
    showUserProfileModal.value = false
    targetUserAddress.value = ''
  }

  const openPlayerStatistics = async () => {
    showPlayerStatisticsModal.value = true
    loadingPlayerStatistics.value = true

    try {
      await loadPlayerData()
    } catch (error) {
      console.error('Failed to load player statistics:', error)
    } finally {
      loadingPlayerStatistics.value = false
    }
  }

  const closePlayerStatistics = () => {
    showPlayerStatisticsModal.value = false
  }

  const openRaceLog = () => {
    showRaceLogModal.value = true
  }

  const closeRaceLog = () => {
    showRaceLogModal.value = false
  }

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString()
  }

  const getPlacementText = (placement: number) => {
    const ordinals = ['', '1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th']
    return ordinals[placement] || `${placement}th`
  }

  const getPlacementColor = (placement: number) => {
    switch (placement) {
      case 1:
        return 'text-yellow-400'
      case 2:
        return 'text-gray-300'
      case 3:
        return 'text-amber-600'
      case 4:
        return 'text-blue-400'
      default:
        return 'text-gray-400'
    }
  }

  // Performance: Utility functions

  return {
    // State
    betError,
    placingBet,
    error,
    selectedShip,
    betAmount,
    shipBets,
    playerBets,
    jackpotAmounts,
    claiming,
    hasClaimed,
    approving,
    needsApproval,
    approvalPending,
    allowanceChecked,
    playerStats,
    achievementCount,
    raceInfo,
    showUsernameModal,
    showMatchHistoryModal,
    matchHistory,
    loadingMatchHistory,
    selectedPlayerForHistory,
    showLeaderboardsModal,
    leaderboardData,
    loadingLeaderboards,
    showPlayerStatisticsModal,
    loadingPlayerStatistics,
    showUserProfileModal,
    targetUserAddress,

    showRaceLogModal,
    playerUsername,
    hasUsername,
    playerAvatarId,
    usernameInput,
    registeringUsername,
    usernameError,
    ships,
    raceLog,
    loadingStates,

    // Computed
    minBet,
    maxBet,
    totalCost,
    canPlaceBet,
    betValidationWarning,
    getButtonText,

    // Methods
    selectShip,
    setBetAmount,
    checkAllowanceIfReady,
    getShipNameById,
    approveTokens,
    placeBet,
    initializeBettingData,
    loadBettingData,
    loadPlayerData,
    loadJackpotData,
    claimFaucetHandler,
    checkFaucetStatus,
    updateBalance,
    openTwitterRequest,
    openDiscord,
    openTwitterProfile,
    checkUsernameStatus,
    handleRegisterUsername,
    skipUsernameRegistration,
    openMatchHistory,
    closeMatchHistory,
    openLeaderboards,
    closeLeaderboards,
    openPlayerHistory,
    openUserProfile,
    closeUserProfile,
    openPlayerStatistics,
    closePlayerStatistics,

    openRaceLog,
    closeRaceLog,
    formatAddress,
    formatDate,
    getPlacementText,
    getPlacementColor,

    // Web3 state
    isConnected,
    shortAddress,
    formattedBalance,
    formattedSpiralBalance,
    walletType,
    currentRaceId,
  }
}
