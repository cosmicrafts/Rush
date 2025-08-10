import { ref, computed, watch } from 'vue'
import { useWeb3 } from './useWeb3'
import { useGameStore } from '~/stores/game'
import { SHIPS_ROSTER } from '~/data/ships'
import type { Ship } from '~/types/game'

export const useBetting = () => {
  const gameStore = useGameStore()
  
  const {
    isConnected,
    shortAddress,
    formattedBalance,
    formattedSpiralBalance,
    spiralBalance,
    walletType,
    isCorrectNetwork,
    currentRaceId,
    contractInfo,
    connectMetaMask,
    connectCoinbaseWallet,
    disconnect,
    placeBet: web3PlaceBet,
    getCurrentRaceInfo,
    getShipBets,
    getPlayerBets,
    getPlayerStats,
    getPlayerAchievementCount,
    updateBalance,
    switchToSomniaTestnet,
    claimFaucet,
    hasClaimedFaucet,
    approveSpiralTokens,
    checkApprovalNeeded,
    getJackpotAmounts,
    // Username functions
    registerUsername,
    getUsername,
    playerHasUsername,
    // Match history functions
    getPlayerMatchHistory,
    getRecentMatches,
    // Leaderboard functions
    getTopPlayersByWinnings,
    getPlayerLeaderboardStats,
    getShipNameByFrontendId
  } = useWeb3()

  // Game constants - now from contract
  const minBet = computed(() => contractInfo.value.minBet)
  const maxBet = computed(() => contractInfo.value.maxBet)

  // Get race log from game store
  const raceLog = computed(() => gameStore.raceLog)

  // State
  const betError = ref('')
  const showWalletOptions = ref(false)
  const connecting = ref(false)
  const placingBet = ref(false)
  const error = ref('')
  const selectedShip = ref<Ship | null>(null)
  const betAmount = ref('')
  const shipBets = ref<{ [key: number]: string }>({})
  const playerBets = ref<string[]>([])
  const jackpotAmounts = ref({ mini: '0', mega: '0', super: '0' })

  // Faucet state
  const claiming = ref(false)
  const hasClaimed = ref(false)

  // Approval state
  const approving = ref(false)
  const needsApproval = ref(false)
  const approvalPending = ref(false)
  const allowanceChecked = ref(false)

  // Player statistics
  const playerStats = ref<any>(null)
  const achievementCount = ref(0)
  const raceInfo = ref<any>(null)

  // Username state
  const showUsernameModal = ref(false)
  const playerUsername = ref('')
  const hasUsername = ref(false)
  const usernameInput = ref('')
  const registeringUsername = ref(false)
  const usernameError = ref('')

  // Match History state
  interface MatchRecord {
    raceId: string
    timestamp: Date
    shipBet: number
    betAmount: number
    placement: number
    payout: number
    jackpotTier: number
    jackpotAmount: number
  }

  const showMatchHistoryModal = ref(false)
  const matchHistory = ref<MatchRecord[]>([])
  const loadingMatchHistory = ref(false)
  const selectedPlayerForHistory = ref('')

  // Leaderboards state
  const showLeaderboardsModal = ref(false)
  const leaderboardData = ref({
    players: [],
    usernames: [],
    winnings: []
  })
  const loadingLeaderboards = ref(false)

  // Player Statistics state
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
    const spiralBalanceNum = spiralBalance.value ? parseFloat(spiralBalance.value) : 0
    const total = parseFloat(totalCost.value)
    
    if (amount < min) {
      betError.value = `Bet must be at least ${minBet.value} SPIRAL`
      return false
    }
    if (amount > max) {
      betError.value = `Bet cannot exceed ${maxBet.value} SPIRAL`
      return false
    }
    if (total > spiralBalanceNum) {
      betError.value = `Insufficient SPIRAL balance (have ${spiralBalanceNum.toFixed(4)} SPIRAL)`
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
    console.log('🔍 checkAllowanceIfReady called:', {
      selectedShip: selectedShip.value?.name,
      betAmount: betAmount.value,
      isConnected: isConnected.value
    })
    
    if (!selectedShip.value || !betAmount.value || !isConnected.value) {
      console.log('❌ checkAllowanceIfReady: Missing required data')
      needsApproval.value = false
      return
    }
    
    try {
      allowanceChecked.value = true
      console.log('🔍 Checking allowance for amount:', betAmount.value)
      const needsApprovalCheck = await checkApprovalNeeded(betAmount.value)
      needsApproval.value = needsApprovalCheck
      console.log('🔍 Allowance check result:', needsApprovalCheck)
    } catch (err) {
      console.error('Failed to check allowance:', err)
      needsApproval.value = false
    }
  }

  // Convert frontend ship ID to contract ship ID (0-based)
  const frontendToContractShipId = (frontendId: number) => {
    const mapping: { [key: number]: number } = {
      1: 0, // Comet: frontend ID 1 -> contract ID 0
      2: 1, // Juggernaut: frontend ID 2 -> contract ID 1
      3: 2, // Shadow: frontend ID 3 -> contract ID 2
      4: 3, // Phantom: frontend ID 4 -> contract ID 3
      5: 4, // Phoenix: frontend ID 5 -> contract ID 4
      6: 5, // Vanguard: frontend ID 6 -> contract ID 5
      7: 6, // Wildcard: frontend ID 7 -> contract ID 6
      8: 7  // Apex: frontend ID 8 -> contract ID 7
    }
    return mapping[frontendId] ?? frontendId
  }

  const getShipName = (shipId: number) => {
    return getShipNameByFrontendId(shipId)
  }

  const connectMetaMaskHandler = async () => {
    connecting.value = true
    error.value = ''
    
    try {
      await connectMetaMask()
      await loadBettingData()
      await checkUsernameStatus()
      showWalletOptions.value = false
    } catch (err: any) {
      error.value = err.message || 'Failed to connect MetaMask'
    } finally {
      connecting.value = false
    }
  }

  const connectCoinbaseHandler = async () => {
    connecting.value = true
    error.value = ''
    
    try {
      await connectCoinbaseWallet()
      await loadBettingData()
      await checkUsernameStatus()
      showWalletOptions.value = false
    } catch (err: any) {
      error.value = err.message || 'Failed to connect Coinbase Wallet'
    } finally {
      connecting.value = false
    }
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
      const contractShipId = frontendToContractShipId(selectedShip.value.id)
      console.log('🚀 Betting on ship:', selectedShip.value.name, 'Frontend ID:', selectedShip.value.id, '-> Contract ID:', contractShipId)
      const betResult = await web3PlaceBet(contractShipId, betAmount.value)
      
      const playerShipId = contractShipId
      const playerBetAmount = betAmount.value
      
      // Reset form and states
      selectedShip.value = null
      betAmount.value = ''
      needsApproval.value = false
      approvalPending.value = false
      
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
      await switchToSomniaTestnet()
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
      
      console.log('Betting data loaded:', { shipBets: shipBets.value, playerBets: playerBets.value })
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
        hasClaimed.value = await hasClaimedFaucet()
      } catch (err) {
        console.error('Failed to check faucet status:', err)
      }
    }
  }

  const checkUsernameStatus = async () => {
    if (isConnected.value) {
      try {
        hasUsername.value = await playerHasUsername()
        console.log('🔍 Username check result - hasUsername:', hasUsername.value)
        
        if (hasUsername.value) {
          playerUsername.value = await getUsername()
          console.log('✅ Player username found:', playerUsername.value)
          showUsernameModal.value = false
        } else {
          console.log('❌ Player has no username - showing registration modal')
          showUsernameModal.value = true
        }
      } catch (err) {
        console.error('Failed to check username status:', err)
      }
    }
  }

  const handleRegisterUsername = async () => {
    if (!usernameInput.value.trim()) {
      usernameError.value = 'Username cannot be empty'
      return
    }
    
    if (usernameInput.value.length > 20) {
      usernameError.value = 'Username must be 20 characters or less'
      return
    }
    
    registeringUsername.value = true
    usernameError.value = ''
    
    try {
      await registerUsername(usernameInput.value.trim())
      
      hasUsername.value = true
      playerUsername.value = usernameInput.value.trim()
      showUsernameModal.value = false
      usernameInput.value = ''
      
      console.log('Username registered successfully:', playerUsername.value)
    } catch (err: any) {
      usernameError.value = err.message || 'Failed to register username'
      console.error('Username registration failed:', err)
    } finally {
      registeringUsername.value = false
    }
  }

  const skipUsernameRegistration = () => {
    showUsernameModal.value = false
    console.log('Username registration skipped')
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

  // Helper functions
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

  return {
    // State
    betError,
    showWalletOptions,
    connecting,
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
    usernameInput,
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
    frontendToContractShipId,
    getShipName,
    connectMetaMaskHandler,
    connectCoinbaseHandler,
    placeBet,
    handleSwitchNetwork,
    openSomniaNetwork,
    loadBettingData,
    loadPlayerData,
    loadJackpotData,
    claimFaucetHandler,
    checkFaucetStatus,
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
    currentRaceId,
    disconnect
  }
}
