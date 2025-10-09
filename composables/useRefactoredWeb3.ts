import { ethers } from 'ethers'
import { ref, computed } from 'vue'
import { useNetwork } from './useNetwork'

// Type interfaces (same as original useWeb3.ts)
interface EthereumProvider {
  request: (params: { method: string; params?: unknown[] }) => Promise<unknown>
  on: (event: string, callback: (params: unknown) => void) => void
  removeListener: (event: string, callback: (params: unknown) => void) => void
  isMetaMask?: boolean
  isCoinbaseWallet?: boolean
}

interface TurnEvent {
  turn: number
  shipId: number
  moveAmount: number
  distance: number
  chaosEventType: number
  targetShipId: number
}


// Contract ABIs for each refactored contract
const SPACESHIP_RACE_CORE_ABI = [
  'function placeBet(uint8 spaceship, uint256 amount) external returns (tuple(uint8 winner, uint8[8] placements, tuple(uint8 turn, uint8 shipId, uint256 moveAmount, uint256 distance, uint8 chaosEventType, uint8 targetShipId)[] turnEvents, uint256 totalEvents) raceResult)',
  'function getGameStats() external view returns (uint256 gameCurrentRace, uint256 gameTotalRaces, uint256 gameTotalVolume, uint256 gameMiniJackpot, uint256 gameMegaJackpot, uint256 gameSuperJackpot)',
  'function getJackpotAmounts() external view returns (uint256 mini, uint256 mega, uint256 superJackpotAmount)',
  'function getShipBets(uint256 raceId) external view returns (uint256[8] memory shipBetsArray)',
  'function getPlayerBets(address player, uint256 raceId) external view returns (uint8 spaceship, uint256 amount, bool claimed)',
  'function debugRaceSimulation() external view returns (tuple(uint8 winner, uint8[8] placements, tuple(uint8 turn, uint8 shipId, uint256 moveAmount, uint256 distance, uint8 chaosEventType, uint8 targetShipId)[] turnEvents, uint256 totalEvents) raceResult)',
  'function withdrawFees(uint256 amount) external',
  'function emergencyWithdraw() external'
]

const PLAYER_STATS_MANAGER_ABI = [
  'function getPlayerStats(address player) external view returns (uint256 playerTotalRaces, uint256 playerTotalWinnings, uint256 playerBiggestWin, uint8 playerHighestJackpotTier, uint256 playerAchievementRewards)',
  'function getSpaceshipStats(address player, uint8 spaceshipId) external view returns (uint256 wins, uint256 betCount, uint256 firstPlace, uint256 secondPlace, uint256 thirdPlace, uint256 fourthPlace)',
  'function spaceshipPlacementCount(address player, uint8 spaceshipId, uint8 placement) external view returns (uint256)',
  'function getTopPlayersByWinnings(uint256 limit) external view returns (address[] memory players, uint256[] memory winnings, uint256[] memory races)',
  'function getPlayerLeaderboardStats(address player) external view returns (uint256 rank, uint256 playerTotalWinnings, uint256 playerTotalRaces, uint256 percentile)',
  'function getLeaderboardStats() external view returns (tuple(uint256 totalPlayers, uint256 totalVolume, uint256 totalRaces, uint256 averageWinnings) stats)',
  'function totalJackpotsWon(address player) external view returns (uint256)',
  'function playerRank(address player) external view returns (uint256)',
  'function isRanked(address player) external view returns (bool)'
]

const PLAYER_PROFILE_MANAGER_ABI = [
  'function registerUsername(string calldata username, uint8 avatarId) external',
  'function getPlayerProfile(address player) external view returns (string memory username, uint8 avatarId, bool hasUsernameRegistered, bool hasAvatarSet, uint256 matchCount, uint256 playerRegistrationTime)',
  'function getUsername(address player) external view returns (string memory username)',
  'function getAddressByUsername(string calldata username) external view returns (address player)',
  'function playerHasUsername(address player) external view returns (bool hasRegistered)',
  'function getPlayerAvatar(address player) external view returns (uint8 avatarId)',
  'function playerHasAvatar(address player) external view returns (bool hasRegistered)',
  'function getRecentMatches(address player, uint256 count) external view returns (tuple(uint256 raceId, uint256 timestamp, uint8 spaceship, uint256 betAmount, uint8 placement, uint256 payout, uint8 jackpotTier, uint256 jackpotAmount)[] matches)',
  'function getPlayerMatchCount(address player) external view returns (uint256)'
]

const ACHIEVEMENT_MANAGER_ABI = [
  'function getPlayerAchievementsCount(address player) external view returns (uint256)',
  'function hasAchievement(address player, string calldata achievementName) external view returns (bool)',
  'function claimFaucet() external',
  'function hasClaimedFaucet(address user) external view returns (bool)',
  'function getFaucetAmount() external view returns (uint256)'
]

const SPIRAL_TOKEN_ABI = [
  'function balanceOf(address account) external view returns (uint256)',
  'function transfer(address to, uint256 amount) external returns (bool)',
  'function approve(address spender, uint256 amount) external returns (bool)',
  'function allowance(address owner, address spender) external view returns (uint256)',
  'function decimals() external view returns (uint8)',
  'function symbol() external view returns (string)',
  'function name() external view returns (string)'
]

export const useRefactoredWeb3 = () => {
  const { currentChainId } = useNetwork()
  
  // State
  const isConnected = ref(false)
  const userAddress = ref<string | null>(null)
  const provider = ref<ethers.providers.Web3Provider | null>(null)
  const signer = ref<ethers.Signer | null>(null)
  const currentRaceId = ref(1) // Add missing currentRaceId
  
  // Get refactored contract addresses from runtime config (moved inside composable)
  const getRefactoredContractAddresses = () => {
    try {
      const config = useRuntimeConfig()
      return {
        // Push Chain addresses
        '0xa4b5': {
          spaceshipRaceCore: config.public?.spaceshipRaceCoreAddress || '',
          playerStatsManager: config.public?.playerStatsManagerAddress || '',
          playerProfileManager: config.public?.playerProfileManagerAddress || '',
          achievementManager: config.public?.achievementManagerAddress || '',
          spiralToken: config.public?.spiralTokenAddress || '',
          achievementNFT: config.public?.achievementNFTAddress || ''
        },
        // Somnia addresses (fallback)
        '0xc478': {
          spaceshipRaceCore: config.public?.spaceshipRaceCoreAddress || '',
          playerStatsManager: config.public?.playerStatsManagerAddress || '',
          playerProfileManager: config.public?.playerProfileManagerAddress || '',
          achievementManager: config.public?.achievementManagerAddress || '',
          spiralToken: config.public?.spiralTokenAddress || '',
          achievementNFT: config.public?.achievementNFTAddress || ''
        },
        '0xc488': {
          spaceshipRaceCore: config.public?.spaceshipRaceCoreAddress || '',
          playerStatsManager: config.public?.playerStatsManagerAddress || '',
          playerProfileManager: config.public?.playerProfileManagerAddress || '',
          achievementManager: config.public?.achievementManagerAddress || '',
          spiralToken: config.public?.spiralTokenAddress || '',
          achievementNFT: config.public?.achievementNFTAddress || ''
        }
      }
    } catch (error) {
      console.warn('Could not load runtime config, using empty addresses:', error)
      return {
        '0xa4b5': {
          spaceshipRaceCore: '',
          playerStatsManager: '',
          playerProfileManager: '',
          achievementManager: '',
          spiralToken: '',
          achievementNFT: ''
        },
        '0xc478': {
          spaceshipRaceCore: '',
          playerStatsManager: '',
          playerProfileManager: '',
          achievementManager: '',
          spiralToken: '',
          achievementNFT: ''
        },
        '0xc488': {
          spaceshipRaceCore: '',
          playerStatsManager: '',
          playerProfileManager: '',
          achievementManager: '',
          spiralToken: '',
          achievementNFT: ''
        }
      }
    }
  }
  
  // Get current contract addresses based on chain
  const getContractAddresses = () => {
    const addresses = getRefactoredContractAddresses()
    const chainId = currentChainId.value || '0xa4b5' // Default to Push Chain
    return addresses[chainId as keyof typeof addresses] || addresses['0xa4b5']
  }
  
  // Initialize contracts
  const getContracts = () => {
    if (!signer.value) return null
    
    const addresses = getContractAddresses()
    
    return {
      spaceshipRaceCore: new ethers.Contract(addresses.spaceshipRaceCore, SPACESHIP_RACE_CORE_ABI, signer.value),
      playerStatsManager: new ethers.Contract(addresses.playerStatsManager, PLAYER_STATS_MANAGER_ABI, signer.value),
      playerProfileManager: new ethers.Contract(addresses.playerProfileManager, PLAYER_PROFILE_MANAGER_ABI, signer.value),
      achievementManager: new ethers.Contract(addresses.achievementManager, ACHIEVEMENT_MANAGER_ABI, signer.value),
      spiralToken: new ethers.Contract(addresses.spiralToken, SPIRAL_TOKEN_ABI, signer.value)
    }
  }
  
  // Connect wallet
  const connectWallet = async () => {
    if (!window.ethereum) {
      throw new Error('No wallet found')
    }
    
    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
      const web3Provider = new ethers.providers.Web3Provider(window.ethereum)
      const web3Signer = web3Provider.getSigner()
      
      provider.value = web3Provider
      signer.value = web3Signer
      userAddress.value = accounts[0]
      isConnected.value = true
      
      return accounts[0]
    } catch (error) {
      console.error('Failed to connect wallet:', error)
      throw error
    }
  }
  
  // Disconnect wallet
  const disconnectWallet = () => {
    provider.value = null
    signer.value = null
    userAddress.value = null
    isConnected.value = false
  }
  
  // Racing functions (SpaceshipRaceCore)
  const placeBet = async (shipId: number, amount: string) => {
    const contracts = getContracts()
    if (!contracts) throw new Error('Contracts not initialized')
    
    return await contracts.spaceshipRaceCore.placeBet(shipId, amount)
  }
  
  const getGameStats = async () => {
    const contracts = getContracts()
    if (!contracts) throw new Error('Contracts not initialized')
    
    return await contracts.spaceshipRaceCore.getGameStats()
  }
  
  const getJackpotAmounts = async () => {
    const contracts = getContracts()
    if (!contracts) throw new Error('Contracts not initialized')
    
    return await contracts.spaceshipRaceCore.getJackpotAmounts()
  }
  
  const getShipBets = async (raceId: number) => {
    const contracts = getContracts()
    if (!contracts) throw new Error('Contracts not initialized')
    
    return await contracts.spaceshipRaceCore.getShipBets(raceId)
  }
  
  const getPlayerBets = async (player: string, raceId: number) => {
    const contracts = getContracts()
    if (!contracts) throw new Error('Contracts not initialized')
    
    return await contracts.spaceshipRaceCore.getPlayerBets(player, raceId)
  }
  
  const debugRaceSimulation = async () => {
    const contracts = getContracts()
    if (!contracts) throw new Error('Contracts not initialized')
    
    return await contracts.spaceshipRaceCore.debugRaceSimulation()
  }
  
  // Stats functions (PlayerStatsManager)
  const getPlayerStats = async (player: string) => {
    const contracts = getContracts()
    if (!contracts) throw new Error('Contracts not initialized')
    
    return await contracts.playerStatsManager.getPlayerStats(player)
  }
  
  const getSpaceshipStats = async (player: string, spaceshipId: number) => {
    const contracts = getContracts()
    if (!contracts) throw new Error('Contracts not initialized')
    
    return await contracts.playerStatsManager.getSpaceshipStats(player, spaceshipId)
  }
  
  const getTopPlayersByWinnings = async (limit: number) => {
    const contracts = getContracts()
    if (!contracts) throw new Error('Contracts not initialized')
    
    return await contracts.playerStatsManager.getTopPlayersByWinnings(limit)
  }
  
  const getPlayerLeaderboardStats = async (player: string) => {
    const contracts = getContracts()
    if (!contracts) throw new Error('Contracts not initialized')
    
    return await contracts.playerStatsManager.getPlayerLeaderboardStats(player)
  }
  
  // Profile functions (PlayerProfileManager)
  const registerUsername = async (username: string, avatarId: number) => {
    const contracts = getContracts()
    if (!contracts) throw new Error('Contracts not initialized')
    
    return await contracts.playerProfileManager.registerUsername(username, avatarId)
  }
  
  const getPlayerProfile = async (player: string) => {
    const contracts = getContracts()
    if (!contracts) throw new Error('Contracts not initialized')
    
    return await contracts.playerProfileManager.getPlayerProfile(player)
  }
  
  const getUsername = async (player: string) => {
    const contracts = getContracts()
    if (!contracts) throw new Error('Contracts not initialized')
    
    return await contracts.playerProfileManager.getUsername(player)
  }
  
  const playerHasUsername = async (player: string) => {
    const contracts = getContracts()
    if (!contracts) throw new Error('Contracts not initialized')
    
    return await contracts.playerProfileManager.playerHasUsername(player)
  }
  
  const getRecentMatches = async (player: string, count: number) => {
    const contracts = getContracts()
    if (!contracts) throw new Error('Contracts not initialized')
    
    return await contracts.playerProfileManager.getRecentMatches(player, count)
  }
  
  // Achievement functions (AchievementManager)
  const getPlayerAchievementsCount = async (player: string) => {
    const contracts = getContracts()
    if (!contracts) throw new Error('Contracts not initialized')
    
    return await contracts.achievementManager.getPlayerAchievementsCount(player)
  }
  
  const claimFaucet = async () => {
    const contracts = getContracts()
    if (!contracts) throw new Error('Contracts not initialized')
    
    return await contracts.achievementManager.claimFaucet()
  }
  
  const hasClaimedFaucet = async (user: string) => {
    const contracts = getContracts()
    if (!contracts) throw new Error('Contracts not initialized')
    
    return await contracts.achievementManager.hasClaimedFaucet(user)
  }
  
  // Token functions (SpiralToken)
  const getSpiralBalance = async (address: string) => {
    const contracts = getContracts()
    if (!contracts) throw new Error('Contracts not initialized')
    
    return await contracts.spiralToken.balanceOf(address)
  }
  
  const approveSpiralToken = async (spender: string, amount: string) => {
    const contracts = getContracts()
    if (!contracts) throw new Error('Contracts not initialized')
    
    return await contracts.spiralToken.approve(spender, amount)
  }
  
  // Helper functions
  const isConnectionReady = () => {
    return isConnected.value && userAddress.value !== null && signer.value !== null
  }
  
  // Computed properties
  const contractAddresses = computed(() => getContractAddresses())
  
  return {
    // State
    isConnected,
    userAddress,
    provider,
    signer,
    contractAddresses,
    currentRaceId,
    
    // Helper functions
    isConnectionReady,
    
    // Connection
    connectWallet,
    disconnectWallet,
    
    // Racing functions (same interface as original useWeb3)
    placeBet,
    getGameStats,
    getJackpotAmounts,
    getShipBets,
    getPlayerBets,
    debugRaceSimulation,
    
    // Stats functions
    getPlayerStats,
    getSpaceshipStats,
    getTopPlayersByWinnings,
    getPlayerLeaderboardStats,
    
    // Profile functions
    registerUsername,
    getPlayerProfile,
    getUsername,
    playerHasUsername,
    getRecentMatches,
    
    // Achievement functions
    getPlayerAchievementsCount,
    claimFaucet,
    hasClaimedFaucet,
    
    // Token functions
    getSpiralBalance,
    approveSpiralToken
  }
}
