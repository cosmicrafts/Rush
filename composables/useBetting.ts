import { ref, computed, watch, onMounted, shallowRef } from 'vue'
import { useWeb3 } from './useWeb3'
import { useGameStore } from '~/stores/game'
import { SHIPS_ROSTER } from '~/data/ships'
import type { Ship } from '~/types/game'

// Performance optimization: Cache for expensive operations
const contractCache = new Map()
const CACHE_DURATION = 30000 // 30 seconds

// Debounce utility for performance
const debounce = (func: Function, wait: number) => {
  let timeout: NodeJS.Timeout
  return function executedFunction(...args: any[]) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

export const useBetting = () => {
  const gameStore = useGameStore()
  
  const {
    // Web3 state
    isConnected,
    account,
    shortAddress,
    formattedBalance,
    formattedSpiralBalance,
    walletType,
    isCorrectNetwork,
    currentRaceId,
    connectionState,
    
    // Guard functions
    isProviderReady,
    isContractReady,
    isSignerReady,
    isConnectionReady,
    getSafeProvider,
    getSafeContract,
    getSafeSigner,
    
    // Web3 methods
    connectMetaMask,
    connectCoinbaseWallet,
    disconnect,
    placeBetAndGetRace,
    getCurrentRaceInfo,
    getShipBets,
    getPlayerBets,
    updateBalance,
    getDebugRaceSimulation,
    getShipName,
    getShipColor,
    getPlayerStats,
    getPlayerAchievementCount,
    getSpiralBalance,
    getJackpotAmounts,
    claimWinnings,
    claimFaucet,
    hasClaimedFaucet,
    approveSpiralTokens,
    getShip,
    loadContractInfo,
    switchToLocalhost,
    switchToSepolia,
    switchToSomniaTestnet,
    registerUsername,
    getUsername,
    playerHasUsername,
    getPlayerAvatar,
    getAddressByUsername,
    getPlayerMatchHistory,
    getRecentMatches,
    getTopPlayersByWinnings,
    getPlayerLeaderboardStats,
    checkApprovalNeeded
  } = useWeb3()

  // Game constants - now from contract
  const minBet = computed(() => {
    // Use hardcoded values since contractInfo is not available
    return '10'
  })

  const maxBet = computed(() => {
    // Use hardcoded values since contractInfo is not available
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
  const playerStats = shallowRef<any>(null)
  const achievementCount = ref(0)
  const raceInfo = shallowRef<any>(null)
  const showUsernameModal = ref(false)
  const showMatchHistoryModal = ref(false)
  const matchHistory = shallowRef<any[]>([])
  const loadingMatchHistory = ref(false)
  const selectedPlayerForHistory = ref('')
  const showLeaderboardsModal = ref(false)
  const leaderboardData = shallowRef({ players: [], usernames: [], winnings: [] })
  const loadingLeaderboards = ref(false)
  const showPlayerStatisticsModal = ref(false)
  const loadingPlayerStatistics = ref(false)
  const showAchievementTrackerModal = ref(false)
  const showRaceLogModal = ref(false)
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
    faucet: false
  })

  // Performance: Cache management
  const getCachedData = (key: string) => {
    const cached = contractCache.get(key)
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.data
    }
    return null
  }

  const setCachedData = (key: string, data: any) => {
    contractCache.set(key, {
      data,
      timestamp: Date.now()
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

  // Performance: Optimized allowance check with caching
  const checkAllowanceIfReady = debounce(async () => {
    if (!isConnectionReady() || !selectedShip.value || !betAmount.value) return
    
    try {
      const betAmountString = String(betAmount.value)
      const cacheKey = `allowance-${account.value}-${betAmountString}`
      const cached = getCachedData(cacheKey)
      
      if (cached) {
        needsApproval.value = cached.needsApproval
        approvalPending.value = cached.approvalPending
        allowanceChecked.value = true
        return
      }

      const [needsApprovalResult, isPending] = await Promise.all([
        checkApprovalNeeded(betAmountString),
        Promise.resolve(false) // Simplified for performance
      ])
      
      needsApproval.value = needsApprovalResult
      approvalPending.value = isPending
      allowanceChecked.value = true
      
      setCachedData(cacheKey, { needsApproval: needsApprovalResult, approvalPending: isPending })
    } catch (error) {
      console.error('Allowance check failed:', error)
    }
  }, 300)

  const getShipNameById = (shipId: number) => {
    const ship = SHIPS_ROSTER.find(s => s.id === shipId)
    return ship ? ship.name : `Ship ${shipId}`
  }

  const placeBet = async () => {
    if (!isConnectionReady() || !selectedShip.value || !betAmount.value) {
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
          jackpotAmount: result.jackpotAmount
        }
      }
    } catch (error: any) {
      console.error('Bet placement failed:', error)
      error.value = error.message || 'Failed to place bet'
    } finally {
      placingBet.value = false
    }
    
    return null
  }

  const handleSwitchNetwork = async () => {
    try {
      await switchToSomniaTestnet(window.ethereum)
    } catch (err: any) {
      error.value = err.message || 'Failed to switch network'
    }
  }

  const openSomniaNetwork = () => {
    window.open('https://testnet.somnia.network/', '_blank')
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
        getShipBets(Number(currentRaceId.value))
      ])
      
      raceInfo.value = raceInfoResult
      shipBets.value = shipBetsResult.reduce((acc: any, bet: string, index: number) => {
        acc[index] = bet
        return acc
      }, {})
      
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
        getPlayerAchievementCount()
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
      claiming.value = true
      const receipt = await claimFaucet()
      
      // Update balances and clear cache
      await Promise.all([
        updateBalance(),
        checkFaucetStatus()
      ])
      clearCache()
    } catch (error: any) {
      console.error('Failed to claim faucet:', error)
      error.value = error.message || 'Failed to claim faucet'
    } finally {
      claiming.value = false
    }
  }

  const checkFaucetStatus = async () => {
    if (!isConnectionReady()) return
    
    try {
      loadingStates.value.faucet = true
      
      const cacheKey = `faucetStatus-${account.value}`
      const cached = getCachedData(cacheKey)
      
      if (cached) {
        hasClaimed.value = cached
        return
      }

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

  const handleRegisterUsername = async (username: string, avatarId: number) => {
    // This function is now handled by the header component
    console.log('🔍 Username registration moved to header component')
  }

  const skipUsernameRegistration = () => {
    // This function is now handled by the header component
    console.log('🔍 Username registration skip moved to header component')
  }

  // Performance: Optimized initialization with proper error handling
  const initializeBettingData = async () => {
    if (!isConnectionReady()) return
    
    try {
      loadingStates.value.initial = true
      
      // Load all data in parallel with proper error handling
      await Promise.allSettled([
        loadBettingData(),
        loadPlayerData(),
        loadJackpotData(),
        checkFaucetStatus()
      ])
    } catch (error) {
      console.error('Failed to initialize betting data:', error)
    } finally {
      loadingStates.value.initial = false
    }
  }

  // Performance: Optimized watchers with debouncing
  const debouncedInitialize = debounce(initializeBettingData, 500)
  const debouncedLoadBetting = debounce(loadBettingData, 300)

  // Initialize
  onMounted(() => {
    if (isConnectionReady()) {
      debouncedInitialize()
    }
  })

  // Performance: Single optimized watcher for connection changes
  watch([isConnected, connectionState], ([connected, state]) => {
    if (connected && state === 'ready') {
      debouncedInitialize()
    }
  }, { immediate: true })

  // Performance: Optimized race ID watcher
  watch(currentRaceId, () => {
    if (isConnected.value) {
      debouncedLoadBetting()
    }
  })

  // Performance: Optimized bet amount watcher
  watch(betAmount, () => {
    if (allowanceChecked.value) {
      needsApproval.value = false
      approvalPending.value = false
      allowanceChecked.value = false
    }
  })

  // Performance: Optimized ship and bet amount watcher
  watch([selectedShip, betAmount], () => {
    if (isConnected.value && selectedShip.value && betAmount.value) {
      checkAllowanceIfReady()
    }
  })

  // Performance: Optimized modal functions with caching
  const openMatchHistory = async (playerAddress?: string, displayName?: string) => {
    selectedPlayerForHistory.value = displayName || (playerAddress ? formatAddress(playerAddress) : 'Your History')
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
      leaderboardData.value = { players: [], usernames: [], winnings: [] }
    } finally {
      loadingLeaderboards.value = false
    }
  }

  const closeLeaderboards = () => {
    showLeaderboardsModal.value = false
    leaderboardData.value = { players: [], usernames: [], winnings: [] }
  }

  const openPlayerHistory = (playerAddress: string, username?: string) => {
    closeLeaderboards()
    const displayName = username || formatAddress(playerAddress)
    openMatchHistory(playerAddress, displayName)
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

  const openAchievementTracker = () => {
    showAchievementTrackerModal.value = true
  }

  const closeAchievementTracker = () => {
    showAchievementTrackerModal.value = false
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
      case 1: return 'text-yellow-400'
      case 2: return 'text-gray-300'
      case 3: return 'text-amber-600'
      case 4: return 'text-blue-400'
      default: return 'text-gray-400'
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
    showAchievementTrackerModal,
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
    getButtonText,

    // Methods
    selectShip,
    setBetAmount,
    checkAllowanceIfReady,
    getShipNameById,
    placeBet,
    initializeBettingData,
    loadBettingData,
    loadPlayerData,
    loadJackpotData,
    claimFaucetHandler,
    checkFaucetStatus,
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
    openPlayerStatistics,
    closePlayerStatistics,
    openAchievementTracker,
    closeAchievementTracker,
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
    isCorrectNetwork,
    currentRaceId
  }
}
