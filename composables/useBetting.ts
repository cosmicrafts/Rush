import { ref, computed, watch, onMounted } from 'vue'
import { useWeb3 } from './useWeb3'
import { useGameStore } from '~/stores/game'
import { SHIPS_ROSTER } from '~/data/ships'
import type { Ship } from '~/types/game'

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

  // State
  const betError = ref('')
  const placingBet = ref(false)
  const error = ref('')
  const selectedShip = ref<Ship | null>(null)
  const betAmount = ref('')
  const shipBets = ref<{ [key: number]: string }>({})
  const playerBets = ref<string[]>([])
  const jackpotAmounts = ref({ mini: '0', mega: '0', super: '0' })
  const claiming = ref(false)
  const hasClaimed = ref(false)
  const approving = ref(false)
  const needsApproval = ref(false)
  const approvalPending = ref(false)
  const allowanceChecked = ref(false)
  const playerStats = ref<any>(null)
  const achievementCount = ref(0)
  const raceInfo = ref<any>(null)
  const showUsernameModal = ref(false)
  const showMatchHistoryModal = ref(false)
  const matchHistory = ref<any[]>([])
  const loadingMatchHistory = ref(false)
  const selectedPlayerForHistory = ref('')
  const showLeaderboardsModal = ref(false)
  const leaderboardData = ref({ players: [], usernames: [], winnings: [] })
  const loadingLeaderboards = ref(false)
  const showPlayerStatisticsModal = ref(false)
  const loadingPlayerStatistics = ref(false)
  const showAchievementTrackerModal = ref(false)

  // Race Log state
  const showRaceLogModal = ref(false)

  const ships = SHIPS_ROSTER

  // Computed properties
  const totalCost = computed(() => {
    if (!betAmount.value) return '0'
    const amount = parseFloat(betAmount.value)
    return amount.toFixed(4)
  })

  const canPlaceBet = computed(() => {
    if (!selectedShip.value || !betAmount.value) return false
    
    const amount = parseFloat(betAmount.value)
    const min = parseFloat(minBet.value)
    const max = parseFloat(maxBet.value)
    
    // Simple: extract number from formattedSpiralBalance
    const currentSpiralBalance = parseFloat(formattedSpiralBalance.value.replace(' SPIRAL', ''))
    const total = parseFloat(totalCost.value)
    
    if (amount < min) {
      betError.value = `Bet must be at least ${minBet.value} SPIRAL`
      return false
    }
    if (amount > max) {
      betError.value = `Bet cannot exceed ${maxBet.value} SPIRAL`
      return false
    }
    if (total > currentSpiralBalance) {
      betError.value = `Insufficient SPIRAL balance (have ${currentSpiralBalance.toFixed(4)} SPIRAL)`
      return false
    }
    
    betError.value = ''
    return true
  })

  const getButtonText = () => {
    if (approving.value) return 'Approving Tokens...'
    if (placingBet.value) return 'Placing Bet...'
    if (needsApproval.value && !approvalPending.value) return 'Allow SPIRAL Tokens'
    if (approvalPending.value) return `Click Again to Bet on ${selectedShip.value?.name || 'Ship'}`
    return `Place Bet on ${selectedShip.value?.name || 'Ship'}`
  }

  // Methods
  const selectShip = (ship: Ship) => {
    selectedShip.value = ship
    checkAllowanceIfReady()
  }

  const setBetAmount = (amount: string) => {
    betAmount.value = amount
    checkAllowanceIfReady()
  }

  // Check allowance when ship and amount are selected
  const checkAllowanceIfReady = async () => {
    
    if (!selectedShip.value || !betAmount.value || !isConnected.value) {
      needsApproval.value = false
      return
    }
    
    try {
      allowanceChecked.value = true
      const needsApprovalCheck = await checkApprovalNeeded(betAmount.value)
      needsApproval.value = needsApprovalCheck
    } catch (err) {
      console.error('Failed to check allowance:', err)
      needsApproval.value = false
    }
  }

  // Helper function to get ship name by ID (0-7)
  const getShipNameById = (shipId: number) => {
    return getShipName(shipId)
  }



  const placeBet = async () => {
    if (!selectedShip.value || !betAmount.value) return
    
    error.value = ''
    
    // If we need approval and haven't started the approval process yet
    if (needsApproval.value && !approvalPending.value) {
      needsApproval.value = true
      approving.value = true
      
      try {
        await approveSpiralTokens()
        
        console.log('🔄 Waiting for approval confirmation...')
        await new Promise(resolve => setTimeout(resolve, 2000))
        
        const verifyApproval = await checkApprovalNeeded(betAmount.value)
        if (verifyApproval) {
          throw new Error('Approval transaction may not have been confirmed yet. Please try again in a few seconds.')
        }
        
        approvalPending.value = true
        needsApproval.value = false
        console.log('✅ Approval confirmed! Click Place Bet again to proceed.')
      } catch (approveErr: any) {
        error.value = approveErr.message || 'Failed to approve tokens'
        needsApproval.value = false
      } finally {
        approving.value = false
      }
      return
    }
    
    try {
      console.log('🔍 Checking approval for amount:', betAmount.value)
      const needsApprovalCheck = await checkApprovalNeeded(betAmount.value)
      console.log('🔍 Needs approval:', needsApprovalCheck, 'Approval pending:', approvalPending.value)
      
      if (needsApprovalCheck && !approvalPending.value) {
        needsApproval.value = true
        approving.value = true
        
        try {
          await approveSpiralTokens()
          
          console.log('🔄 Waiting for approval confirmation...')
          await new Promise(resolve => setTimeout(resolve, 2000))
          
          const verifyApproval = await checkApprovalNeeded(betAmount.value)
          if (verifyApproval) {
            throw new Error('Approval transaction may not have been confirmed yet. Please try again in a few seconds.')
          }
          
          approvalPending.value = true
          needsApproval.value = false
          console.log('✅ Approval confirmed! Click Place Bet again to proceed.')
        } catch (approveErr: any) {
          error.value = approveErr.message || 'Failed to approve tokens'
          needsApproval.value = false
        } finally {
          approving.value = false
        }
        return
      }
      
      placingBet.value = true
      const contractShipId = selectedShip.value.id
      console.log('🚀 Betting on ship:', selectedShip.value.name, 'Frontend ID:', selectedShip.value.id, '-> Contract ID:', contractShipId)
      console.log('💰 Bet amount type:', typeof betAmount.value, 'value:', betAmount.value)
      const betResult = await placeBetAndGetRace(contractShipId, String(betAmount.value))
      
      const playerShipId = contractShipId
      const playerBetAmount = betAmount.value
      
      // Update balances after successful bet
      await updateBalance()
      
      // Reset form
      selectedShip.value = null
      betAmount.value = ''
      needsApproval.value = false
      approvalPending.value = false
      allowanceChecked.value = false
      
      // Reload data
      await Promise.all([
        updateBalance(),
        loadBettingData(),
        loadPlayerData(),
        loadJackpotData()
      ])
      
      console.log('🎬 Bet result received:', betResult)
      if (betResult && betResult.raceResult) {
        console.log('🎬 Emitting race result for animation:', betResult.raceResult)
        return {
          raceResult: betResult.raceResult,
          playerShip: playerShipId,
          betAmount: playerBetAmount,
          actualPayout: betResult.actualPayout,
          jackpotTier: betResult.jackpotTier,
          jackpotAmount: betResult.jackpotAmount
        }
      } else {
        console.log('❌ No race result in bet result:', betResult)
        return null
      }
      
    } catch (err: any) {
      error.value = err.message || 'Failed to place bet'
      return null
    } finally {
      placingBet.value = false
    }
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

  const loadBettingData = async () => {
    if (!isConnectionReady()) {
      console.log('🔍 Connection not ready, skipping betting data load')
      return
    }
    
    try {
      // Load race info
      raceInfo.value = await getCurrentRaceInfo()
      console.log('Current race info:', raceInfo.value)
      
      // Load ship bets for current race
      if (raceInfo.value?.raceId) {
        const bets = await getShipBets(Number(raceInfo.value.raceId))
        shipBets.value = bets.reduce((acc: any, bet: string, index: number) => {
          acc[index] = bet
          return acc
        }, {})
      }
      
             // Load player's bet for current race
       if (raceInfo.value?.raceId) {
         const playerBet = await getPlayerBets(Number(raceInfo.value.raceId))
         if (playerBet) {
           const ship = SHIPS_ROSTER[playerBet.spaceship]
           if (ship) {
             selectedShip.value = ship
             betAmount.value = playerBet.amount
           }
         }
       }
    } catch (error) {
      console.error('Failed to load betting data:', error)
    }
  }

  const loadPlayerData = async () => {
    if (!isConnectionReady()) {
      console.log('🔍 Connection not ready, skipping player data load')
      return
    }
    
    try {
      const stats = await getPlayerStats()
      playerStats.value = stats
      console.log('Player data loaded:', stats)
      
      const achievements = await getPlayerAchievementCount()
      achievementCount.value = achievements
    } catch (error) {
      console.error('Failed to load player data:', error)
      playerStats.value = null
      achievementCount.value = 0
    }
  }

  const loadJackpotData = async () => {
    if (!isConnectionReady()) {
      console.log('🔍 Connection not ready, skipping jackpot data load')
      return
    }
    
    try {
      const amounts = await getJackpotAmounts()
      jackpotAmounts.value = amounts
      console.log('Jackpot amounts loaded:', amounts)
    } catch (error) {
      console.error('Failed to load jackpot data:', error)
      jackpotAmounts.value = { mini: '0', mega: '0', super: '0' }
    }
  }

  const claimFaucetHandler = async () => {
    if (!isConnectionReady()) {
      console.log('🔍 Connection not ready, cannot claim faucet')
      return
    }
    
    try {
      claiming.value = true
      const receipt = await claimFaucet()
      console.log('Faucet claimed successfully:', receipt)
      
      // Update balances
      await updateBalance()
      await checkFaucetStatus()
    } catch (error: any) {
      console.error('Failed to claim faucet:', error)
      error.value = error.message || 'Failed to claim faucet'
    } finally {
      claiming.value = false
    }
  }

  const checkFaucetStatus = async () => {
    console.log('🔍 checkFaucetStatus called, isConnected:', isConnected.value)
    if (!isConnectionReady()) {
      console.log('🔍 Connection not ready, skipping faucet check')
      return
    }
    
    try {
      // Use the existing hasClaimedFaucet function
      hasClaimed.value = await hasClaimedFaucet()
      console.log('🔍 Faucet status check - Has claimed:', hasClaimed.value)
      
      // If contract call fails or returns false, check SPIRAL balance as backup
      if (!hasClaimed.value) {
        const spiralBalance = await getSpiralBalance()
        const balanceNumber = parseFloat(spiralBalance)
        if (balanceNumber > 0) {
          console.log('🔍 Faucet status backup - SPIRAL balance > 0, assuming claimed')
          hasClaimed.value = true
        }
      }
    } catch (err) {
      console.error('Failed to check faucet status:', err)
      // Fallback to balance check if contract call fails
      try {
        const spiralBalance = await getSpiralBalance()
        const balanceNumber = parseFloat(spiralBalance)
        hasClaimed.value = balanceNumber > 0
        console.log('🔍 Faucet status fallback - SPIRAL balance:', spiralBalance, 'Has claimed:', hasClaimed.value)
      } catch (fallbackErr) {
        console.error('Fallback faucet check also failed:', fallbackErr)
      }
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

  // Match History functions
  const openMatchHistory = async (playerAddress?: string, displayName?: string) => {
    selectedPlayerForHistory.value = displayName || (playerAddress ? formatAddress(playerAddress) : 'Your History')
    showMatchHistoryModal.value = true
    loadingMatchHistory.value = true
    
    try {
      const { matches } = await getPlayerMatchHistory(playerAddress, 0, 20)
      matchHistory.value = matches
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

  // Leaderboards functions
  const openLeaderboards = async () => {
    showLeaderboardsModal.value = true
    loadingLeaderboards.value = true
    
    try {
      const data = await getTopPlayersByWinnings(20)
      leaderboardData.value = data
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

  // Player Statistics functions
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

  // Race Log functions
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

  // Initialize betting data when wallet connects
  const initializeBettingData = async () => {
    if (!isConnectionReady()) {
      console.log('🔍 Connection not ready, deferring betting data initialization')
      return
    }
    
    try {
      console.log('🔍 Initializing betting data...')
      
      // Load all data in parallel
      await Promise.all([
        loadBettingData(),
        loadPlayerData(),
        loadJackpotData(),
        checkFaucetStatus()
      ])
      
      console.log('✅ Betting data initialized successfully')
    } catch (error) {
      console.error('Failed to initialize betting data:', error)
    }
  }

  // Initialize
  onMounted(() => {
    initializeBettingData()
  })

  // Watch for connection changes to reload all data
  watch(isConnected, () => {
    initializeBettingData()
  })

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
    ships,
    raceLog,

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
