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
  const playerUsername = ref('')
  const hasUsername = ref(false)
  const playerAvatarId = ref(255)
  const usernameInput = ref('')
  const selectedAvatarId = ref(0)
  const registeringUsername = ref(false)
  const usernameError = ref('')
  const showMatchHistoryModal = ref(false)
  const matchHistory = ref<any[]>([])
  const loadingMatchHistory = ref(false)
  const selectedPlayerForHistory = ref('')
  const showLeaderboardsModal = ref(false)
  const leaderboardData = ref({ players: [], usernames: [], winnings: [] })
  const loadingLeaderboards = ref(false)
  const showPlayerStatisticsModal = ref(false)
  const loadingPlayerStatistics = ref(false)

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
    if (!isConnected.value) return
    
    try {
      const currentRaceInfo = await getCurrentRaceInfo()
      if (currentRaceInfo) {
        console.log('Current race info:', currentRaceInfo)
        raceInfo.value = currentRaceInfo
      }
      
      const shipBetsData = await getShipBets(currentRaceId.value)
      if (shipBetsData && Array.isArray(shipBetsData)) {
        for (let i = 0; i < 8; i++) {
          shipBets.value[i + 1] = shipBetsData[i] || '0'
        }
      }
      
      const playerBetsData = await getPlayerBets(currentRaceId.value)
      if (playerBetsData) {
        playerBets.value = [playerBetsData.amount]
      } else {
        playerBets.value = []
      }
    } catch (err) {
      console.error('Failed to load betting data:', err)
    }
  }

  const loadPlayerData = async () => {
    if (!isConnected.value) return
    
    try {
      const [stats, achievements] = await Promise.all([
        getPlayerStats(),
        getPlayerAchievementCount()
      ])
      
      playerStats.value = stats
      achievementCount.value = achievements
      
      console.log('Player data loaded:', { stats, achievements })
    } catch (err) {
      console.error('Failed to load player data:', err)
    }
  }

  const loadJackpotData = async () => {
    if (!isConnected.value) return
    
    try {
      const jackpots = await getJackpotAmounts()
      jackpotAmounts.value = jackpots
      console.log('Jackpot amounts loaded:', jackpots)
    } catch (err) {
      console.error('Failed to load jackpot data:', err)
    }
  }

  const claimFaucetHandler = async () => {
    claiming.value = true
    error.value = ''
    
    try {
      await claimFaucet()
      hasClaimed.value = true
      setTimeout(async () => {
        if (isConnected.value) {
          await updateBalance()
          await loadBettingData()
          // Re-check faucet status based on new balance
          await checkFaucetStatus()
        }
      }, 2000)
    } catch (err: any) {
      error.value = err.message || 'Failed to claim faucet'
    } finally {
      claiming.value = false
    }
  }

  const checkFaucetStatus = async () => {
    if (isConnected.value) {
      try {
        // Use the existing hasClaimedFaucet function
        hasClaimed.value = await hasClaimedFaucet()
        console.log('🔍 Faucet status check - Has claimed:', hasClaimed.value)
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
    if (isConnected.value) {
      try {
        hasUsername.value = await playerHasUsername()
        
        if (hasUsername.value) {
          playerUsername.value = await getUsername()
          // Get avatar ID
          const avatarId = await getPlayerAvatar()
          playerAvatarId.value = avatarId
          showUsernameModal.value = false
        } else {
          showUsernameModal.value = true
        }
      } catch (err) {
        console.error('Failed to check username status:', err)
      }
    }
  }

  const handleRegisterUsername = async (username: string, avatarId: number) => {
    registeringUsername.value = true
    usernameError.value = ''
    
    try {
      await registerUsername(username, avatarId)
      
      hasUsername.value = true
      playerUsername.value = username
      playerAvatarId.value = avatarId
      showUsernameModal.value = false
      
    } catch (err: any) {
      usernameError.value = err.message || 'Failed to register username'
      console.error('Username registration failed:', err)
    } finally {
      registeringUsername.value = false
    }
  }

  const skipUsernameRegistration = () => {
    showUsernameModal.value = false
    hasUsername.value = true
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
    if (isConnected.value) {
      await Promise.all([
        loadBettingData(),
        loadPlayerData(),
        loadJackpotData(),
        checkFaucetStatus(),
        checkUsernameStatus()
      ])
      
      // Reset allowance state when connecting
      needsApproval.value = false
      approvalPending.value = false
      allowanceChecked.value = false
      
      // Check allowance if ship and amount are already selected
      if (selectedShip.value && betAmount.value) {
        checkAllowanceIfReady()
      }
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
    playerUsername,
    hasUsername,
    playerAvatarId,
    usernameInput,
    selectedAvatarId,
    registeringUsername,
    usernameError,
    showMatchHistoryModal,
    matchHistory,
    loadingMatchHistory,
    selectedPlayerForHistory,
    showLeaderboardsModal,
    leaderboardData,
    loadingLeaderboards,
    showPlayerStatisticsModal,
    loadingPlayerStatistics,
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
