import { ethers } from 'ethers'
import { ref, computed } from 'vue'
import { SHIPS_ROSTER } from './useShips'
import { useNetwork } from './useNetwork'

// Type interfaces
interface EthereumProvider {
  request: (params: { method: string; params?: unknown[] }) => Promise<unknown>
  on: (event: string, callback: (params: unknown) => void) => void
  removeListener: (event: string, callback: (params: unknown) => void) => void
  isMetaMask?: boolean
  isCoinbaseWallet?: boolean
}

// Unused interfaces (kept for future use)
// interface ContractInfo {
//   minBet: string
//   maxBet: string
//   trackDistance: number
//   maxTurns: number
//   jackpotThresholds: {
//     mini: number
//     mega: number
//     super: number
//   }
// }

// interface RaceResult {
//   winner: number
//   placements: number[]
//   turnEvents: TurnEvent[]
//   totalEvents: number
// }

interface TurnEvent {
  turn: number
  shipId: number
  moveAmount: number
  distance: number
  chaosEventType: number
  targetShipId: number
}

// interface PlayerMatch {
//   raceId: number
//   timestamp: number
//   shipBet: number
//   betAmount: string
//   placement: number
//   payout: string
//   jackpotTier: number
//   jackpotAmount: string
// }

// interface PlayerStats {
//   totalRaces: number
//   totalWinnings: string
//   biggestWin: string
//   highestJackpotTier: number
//   achievementRewards: string
// }

// interface LeaderboardPlayer {
//   address: string
//   username: string
//   avatar: number
//   winnings: string
// }

// Type declaration for window.ethereum
declare global {
  interface Window {
    ethereum?: EthereumProvider
  }
}

// Get contract addresses from runtime config
const getContractAddresses = () => {
  const config = useRuntimeConfig()
  return {
    '0xc478': config.public.spaceshipRaceAddress || '', // Somnia Testnet (documentation)
    '0xc488': config.public.spaceshipRaceAddress || '', // Somnia Testnet (actual RPC)
  }
}

const getSpiralTokenAddress = () => {
  const config = useRuntimeConfig()
  return config.public.spiralTokenAddress || ''
}

const CONTRACT_ABI = [
  'function getGameStats() external view returns (uint256 gameCurrentRace, uint256 gameTotalRaces, uint256 gameTotalVolume, uint256 gameMiniJackpot, uint256 gameMegaJackpot, uint256 gameSuperJackpot)',
  'function placeBet(uint8 shipId, uint256 amount) external returns (uint8 winner, uint8[] placements, uint256 totalEvents, tuple(uint8 turn, uint8 shipId, uint256 moveAmount, uint256 distance, uint8 chaosEventType, uint8 targetShipId)[] turnEvents)',
  'function getShipBets(uint256 raceId) external view returns (uint256[8])',
  'function getPlayerBets(address player, uint256 raceId) external view returns (uint8 spaceship, uint256 amount, bool claimed)',
  'function claimWinnings(uint256 raceId) external',
  'function getPlayerStats(address player) external view returns (uint256 playerTotalRaces, uint256 playerTotalWinnings, uint256 playerBiggestWin, uint8 playerHighestJackpotTier, uint256 playerAchievementRewards)',
  'function getPlayerAchievementsCount(address player) external view returns (uint256)',
  'function getJackpotAmounts() external view returns (uint256 mini, uint256 mega, uint256 super)',
  'function claimFaucet() external',
  'function hasClaimedFaucet(address player) external view returns (bool)',
  'function getShip(uint8 shipId) external view returns (uint8 id, string name, uint256 initialSpeed, uint256 acceleration, string chaosFactor, uint256 chaosChance)',
  'function startNewRace() external',
  'function finishRace(uint8 winnerId) external',
  'function debugRaceSimulation() external view returns (tuple(uint8 winner, uint8[8] placements, tuple(uint8 turn, uint8 shipId, uint256 moveAmount, uint256 distance, uint8 chaosEventType, uint8 targetShipId)[] turnEvents, uint256 totalEvents) raceResult)',
  'event BetPlaced(address indexed player, uint8 spaceship, uint256 amount, uint8 winner, uint256 payout, uint8 jackpotTier)',
  'event JackpotHit(address indexed player, uint8 tier, uint256 amount)',
  'event RaceCompleted(address indexed player, uint8 winner, uint8[8] placements, uint256 totalEvents)',
  'event UsernameRegistered(address indexed player, string username, uint8 avatarId)',
  'function registerUsername(string calldata username, uint8 avatarId) external',
  'function getUsername(address player) external view returns (string memory)',
  'function playerHasUsername(address player) external view returns (bool)',
  'function getAddressByUsername(string calldata username) external view returns (address)',
  'function getPlayerAvatar(address player) external view returns (uint8 avatarId)',
  'function getPlayerProfile(address player) external view returns (string memory username, uint8 avatarId, bool hasUsernameSet, bool hasAvatarSet)',
  'function getPlayerMatchHistory(address player, uint256 offset, uint256 limit) external view returns (tuple(uint256 raceId, uint256 timestamp, uint8 shipBet, uint256 betAmount, uint8 placement, uint256 payout, uint8 jackpotTier, uint256 jackpotAmount)[] matches, uint256 totalMatches)',
  'function getRecentMatches(address player, uint256 count) external view returns (tuple(uint256 raceId, uint256 timestamp, uint8 shipBet, uint256 betAmount, uint8 placement, uint256 payout, uint8 jackpotTier, uint256 jackpotAmount)[] matches)',
  'function getTopPlayersByWinnings(uint256 limit) external view returns (address[] players, string[] usernames, uint8[] avatars, uint256[] winnings)',
  'function getPlayerLeaderboardStats(address player) external view returns (uint256 totalWinningsRank, uint256 firstPlaceCount, uint256 secondPlaceCount, uint256 thirdPlaceCount, uint256 fourthPlaceCount, uint256 totalJackpots, uint256 totalAchievements)',
  'function getLeaderboardStats() external view returns (uint256 totalPlayers, uint256 gameTotalVolume, uint256 totalJackpotsPaid)',
  'function getPlayerComprehensiveStats(address player) external view returns (string memory username, uint8 avatarId, uint256 totalRaces, uint256 totalWinnings, uint256 biggestWin, uint256 firstPlace, uint256 secondPlace, uint256 thirdPlace, uint256 fourthPlace)',
  'function spaceshipBetCount(address player, uint256 shipId) external view returns (uint256)',
  'function spaceshipPlacementCount(address player, uint8 spaceshipId, uint8 placement) external view returns (uint256)',
]

// Helper function to get contract address
const getContractAddress = (chainId: string) => {
  const contractAddresses = getContractAddresses()
  return contractAddresses[chainId as keyof typeof contractAddresses] || null
}

// Global state to ensure all components use the same instance
let globalWeb3Instance: ReturnType<typeof createWeb3Composable> | null = null

// Performance: Global caching system
const callCache = new Map<string, { timestamp: number; data: unknown }>()
const CACHE_TTL = 30000 // 30 seconds

// Performance: Request queue to prevent overlapping calls
const requestQueue = new Map<string, Promise<unknown>>()

// Performance: Memoized contract instance
let contractInstance: ethers.Contract | null = null
let lastNetworkId: string | null = null

// Create the actual composable function
const createWeb3Composable = () => {
  // Network composable
  const network = useNetwork()

  // Connection state management
  const connectionState = ref<'disconnected' | 'connecting' | 'connected' | 'ready'>('disconnected')
  const isConnected = ref(false)
  const account = ref<string | null>(null)
  const balance = ref<string>('0')
  const spiralBalance = ref<string>('0')
  const walletType = ref<'metamask' | 'coinbase' | null>(null)
  const provider = ref<ethers.providers.Web3Provider | null>(null)
  const contract = ref<ethers.Contract | null>(null)
  const currentRaceId = ref<number>(0)
  const contractInfo = ref<{
    minBet: string
    maxBet: string
    trackDistance: number
    raceTurns: number
  }>({
    minBet: '10', // 10 SPIRAL
    maxBet: '1000', // 1000 SPIRAL
    trackDistance: 1000,
    raceTurns: 10,
  })

  // Persistent login state
  const PERSISTENCE_KEY = 'cosmic-rush-wallet-connection'

  // Performance: Caching utilities
  const getCachedData = (key: string) => {
    const cached = callCache.get(key)
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.data
    }
    return null
  }

  const setCachedData = (key: string, data: unknown) => {
    callCache.set(key, { timestamp: Date.now(), data })
  }

  const clearCache = () => {
    callCache.clear()
    requestQueue.clear()
  }

  // Performance: Cached contract call
  const cachedContractCall = async (method: string, ...args: unknown[]) => {
    const cacheKey = `${method}-${JSON.stringify(args)}`

    // Check cache first
    const cached = getCachedData(cacheKey)
    if (cached) {
      return cached
    }

    // Make fresh call
    const safeContract = getSafeContract()
    if (!safeContract) {
      throw new Error('Contract not available')
    }

    const data = await safeContract[method](...args)
    setCachedData(cacheKey, data)
    return data
  }

  // Performance: Queued contract call with caching
  const queuedContractCall = async (method: string, ...args: unknown[]) => {
    const queueKey = `${method}-${JSON.stringify(args)}`

    // If this request is already in progress, return its promise
    if (requestQueue.has(queueKey)) {
      return requestQueue.get(queueKey)
    }

    const promise = cachedContractCall(method, ...args).finally(() => requestQueue.delete(queueKey))

    requestQueue.set(queueKey, promise)
    return promise
  }

  // Performance: Memoized contract getter
  const getMemoizedContract = () => {
    if (!network.currentChainId.value || !provider.value) return null

    const contractAddress = getContractAddress(network.currentChainId.value)
    if (!contractAddress) return null

    return new ethers.Contract(contractAddress, CONTRACT_ABI, provider.value)
  }

  // Performance: Optimized contract getter
  const getOptimizedContract = () => {
    if (network.currentChainId.value === lastNetworkId && contractInstance) {
      return contractInstance
    }

    contractInstance = getMemoizedContract()
    lastNetworkId = network.currentChainId.value
    return contractInstance
  }

  // Performance: Debounce utility
  const debounce = <T extends (...args: unknown[]) => unknown>(
    func: T,
    wait: number
  ): ((...args: Parameters<T>) => void) => {
    let timeout: NodeJS.Timeout
    return (...args: Parameters<T>) => {
      clearTimeout(timeout)
      timeout = setTimeout(() => func(...args), wait)
    }
  }

  // Performance: Network-specific optimizations
  const getNetworkConfig = (chainId: string) => {
    const configs = {
      '0xc478': {
        // Somnia Testnet (documentation)
        pollingInterval: 3000,
        gasPriceMultiplier: 1.1,
        cacheTTL: 30000,
      },
      '0xc488': {
        // Somnia Testnet (actual RPC)
        pollingInterval: 3000,
        gasPriceMultiplier: 1.1,
        cacheTTL: 30000,
      },
    }

    return configs[chainId as keyof typeof configs] || configs['0xc488'] // Default to actual RPC chain ID
  }

  // Performance: Error handling with retry logic
  const withRetry = async <T>(fn: () => Promise<T>, maxRetries = 3, delay = 1000): Promise<T> => {
    let lastError: unknown = null

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await fn()
      } catch (error) {
        lastError = error
        if (attempt < maxRetries) {
          await new Promise(r => setTimeout(r, delay * attempt))
        }
      }
    }

    throw lastError
  }

  // Save connection state to localStorage
  const saveConnectionState = () => {
    if (typeof window === 'undefined') return

    const state = {
      walletType: walletType.value,
      account: account.value,
      networkId: network.currentChainId.value,
      timestamp: Date.now(),
    }

    localStorage.setItem(PERSISTENCE_KEY, JSON.stringify(state))
  }

  // Load connection state from localStorage
  const loadConnectionState = () => {
    if (typeof window === 'undefined') return null

    try {
      const saved = localStorage.getItem(PERSISTENCE_KEY)
      if (!saved) return null

      const state = JSON.parse(saved)

      // Check if the saved state is not too old (24 hours)
      const isExpired = Date.now() - state.timestamp > 24 * 60 * 60 * 1000
      if (isExpired) {
        localStorage.removeItem(PERSISTENCE_KEY)
        return null
      }

      return state
    } catch (error) {
      console.error('Failed to load connection state:', error)
      localStorage.removeItem(PERSISTENCE_KEY)
      return null
    }
  }

  // Clear connection state from localStorage
  const clearConnectionState = () => {
    if (typeof window === 'undefined') return

    localStorage.removeItem(PERSISTENCE_KEY)
  }

  // Guard functions for safe contract access
  const isProviderReady = () => {
    return provider.value !== null && provider.value !== undefined
  }

  const isContractReady = () => {
    return contract.value !== null && contract.value !== undefined
  }

  const isSignerReady = () => {
    return isProviderReady() && provider.value.getSigner !== undefined
  }

  const isConnectionReady = () => {
    return connectionState.value === 'ready' && isConnected.value && account.value !== null
  }

  const getSafeProvider = () => {
    if (!isProviderReady()) {
      console.warn('Provider not ready')
      return null
    }
    return provider.value
  }

  const getSafeContract = () => {
    if (!isContractReady()) {
      console.warn('Contract not ready')
      return null
    }
    return contract.value
  }

  const getSafeSigner = () => {
    if (!isSignerReady()) {
      console.warn('Signer not ready')
      return null
    }
    try {
      return provider.value.getSigner()
    } catch (error) {
      console.warn('Failed to get signer:', error)
      return null
    }
  }

  // Computed properties
  const shortAddress = computed(() => {
    if (!account.value) return ''
    return `${account.value.slice(0, 6)}...${account.value.slice(-4)}`
  })

  const formattedBalance = computed(() => {
    if (!balance.value) return '0 STT'
    return `${parseFloat(ethers.utils.formatEther(balance.value)).toFixed(4)} STT`
  })

  const formattedSpiralBalance = computed(() => {
    if (!spiralBalance.value) return '0 SPIRAL'
    return `${parseFloat(spiralBalance.value).toFixed(4)} SPIRAL`
  })

  // Network functions now handled by useNetwork composable

  // Initialize provider and contract with proper state management
  const initializeProvider = async (ethereum: EthereumProvider) => {
    try {
      connectionState.value = 'connecting'

      // Simple, clean MetaMask provider setup
      const web3Provider = new ethers.providers.Web3Provider(ethereum, 'any')

      // Get current network and contract address
      const chainId = await ethereum.request({ method: 'eth_chainId' })
      network.currentChainId.value = chainId
      const contractAddress = getContractAddress(chainId)

      if (!contractAddress) {
        throw new Error(
          `Contract not deployed on network ${chainId}. Please switch to Somnia Testnet.`
        )
      }

      // Create contract instance
      const contractInstance = new ethers.Contract(contractAddress, CONTRACT_ABI, web3Provider)

      provider.value = web3Provider
      contract.value = contractInstance

      // Load contract info with error handling
      try {
        await loadContractInfo()
      } catch (loadError) {
        console.warn('Failed to load contract info initially:', loadError)
      }

      connectionState.value = 'connected'
    } catch (error) {
      connectionState.value = 'disconnected'
      console.error('Failed to initialize provider:', error)
      throw new Error('Failed to initialize blockchain connection')
    }
  }

  // Load contract information with safety checks
  const loadContractInfo = async () => {
    const safeContract = getSafeContract()
    if (!safeContract) return

    try {
      // Use hardcoded values since constants are not in ABI
      contractInfo.value = {
        minBet: '10', // 10 SPIRAL
        maxBet: '1000', // 1000 SPIRAL
        trackDistance: 1000,
        raceTurns: 10,
      }

      // Load game stats including current race
      const gameStats = await safeContract.getGameStats()
      currentRaceId.value = Number(gameStats.gameCurrentRace)
    } catch (error) {
      console.error('Failed to load contract info:', error)
    }
  }

  // Performance: Batched balance update
  const updateAllBalances = async () => {
    if (!account.value || !isProviderReady()) return

    try {
      const safeProvider = getSafeProvider()
      if (!safeProvider) return

      // Batch both balance calls
      const [balanceWei, spiralBal] = await Promise.all([
        safeProvider.getBalance(account.value),
        getSpiralBalance(),
      ])

      balance.value = balanceWei.toString()
      spiralBalance.value = spiralBal
    } catch (error) {
      console.error('Failed to update balances:', error)
      balance.value = '0'
      spiralBalance.value = '0'
    }
  }

  // Update balance with safety checks (legacy for compatibility)
  const updateBalance = async () => {
    await updateAllBalances()
  }

  // Connect MetaMask wallet with proper state management
  const connectMetaMask = async () => {
    try {
      connectionState.value = 'connecting'

      if (typeof window.ethereum === 'undefined') {
        throw new Error('MetaMask not installed')
      }

      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })

      if (accounts.length === 0) {
        throw new Error('No accounts found')
      }

      // Force switch to Somnia testnet (primary network)
      const isOnCorrectNetwork = await network.checkNetwork(window.ethereum)
      if (!isOnCorrectNetwork) {
        // Always try to switch to Somnia testnet first
        const somniaSuccess = await network.switchToSomniaTestnet(window.ethereum)
        if (!somniaSuccess) {
          throw new Error('Please manually switch to Somnia Testnet in MetaMask')
        }
      }

      account.value = accounts[0]
      walletType.value = 'metamask'
      isConnected.value = true

      await initializeProvider(window.ethereum)
      await updateBalance()

      // Set up event listeners
      setupEventListeners(window.ethereum)

      // Save connection state for persistence
      saveConnectionState()

      // Mark as ready after everything is initialized
      connectionState.value = 'ready'

      return true
    } catch (error: unknown) {
      connectionState.value = 'disconnected'
      console.error('Failed to connect MetaMask:', error)
      disconnect()
      throw error
    }
  }

  // Connect Coinbase Wallet
  const connectCoinbaseWallet = async () => {
    try {
      connectionState.value = 'connecting'

      if (typeof window.ethereum === 'undefined' || !window.ethereum.isCoinbaseWallet) {
        throw new Error('Coinbase Wallet not detected')
      }

      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })

      if (accounts.length === 0) {
        throw new Error('No accounts found')
      }

      const isOnCorrectNetwork = await network.checkNetwork(window.ethereum)
      if (!isOnCorrectNetwork) {
        // Force switch to Somnia testnet
        const somniaSuccess = await network.switchToSomniaTestnet(window.ethereum)
        if (!somniaSuccess) {
          throw new Error('Please manually switch to Somnia Testnet in MetaMask')
        }
      }

      account.value = accounts[0]
      walletType.value = 'coinbase'
      isConnected.value = true

      await initializeProvider(window.ethereum)
      await updateBalance()

      setupEventListeners(window.ethereum)

      // Save connection state for persistence
      saveConnectionState()

      // Mark as ready after everything is initialized
      connectionState.value = 'ready'

      return true
    } catch (error: unknown) {
      connectionState.value = 'disconnected'
      console.error('Failed to connect Coinbase Wallet:', error)
      disconnect()
      throw error
    }
  }

  // Performance: Debounced event handlers
  const debouncedAccountsChanged = debounce((accounts: string[]) => {
    if (accounts.length === 0) {
      disconnect()
    } else {
      account.value = accounts[0] || null
      updateAllBalances()
      saveConnectionState()
    }
  }, 300)

  const debouncedChainChanged = debounce((chainId: string) => {
    network.currentChainId.value = chainId
    network.isCorrectNetwork.value = chainId === '0xc478' || chainId === '0xc4a8'
    if (network.isCorrectNetwork.value) {
      updateAllBalances()
      loadContractInfo()
      saveConnectionState()
    }
  }, 300)

  // Set up wallet event listeners
  const setupEventListeners = (ethereum: EthereumProvider) => {
    ethereum.on('accountsChanged', debouncedAccountsChanged)
    ethereum.on('chainChanged', debouncedChainChanged)
    ethereum.on('disconnect', disconnect)
  }

  // Disconnect wallet with proper state cleanup
  const disconnect = () => {
    connectionState.value = 'disconnected'
    isConnected.value = false
    account.value = null
    balance.value = '0'
    walletType.value = null
    provider.value = null
    contract.value = null
    network.currentChainId.value = null
    network.isCorrectNetwork.value = false
    currentRaceId.value = 0

    // Clear persistent connection state
    clearConnectionState()

    if (typeof window.ethereum !== 'undefined') {
      window.ethereum.removeAllListeners()
    }
  }

  // Auto-reconnect from saved state
  const autoReconnect = async () => {
    try {
      const savedState = loadConnectionState()
      if (!savedState) {
        return false
      }

      // Check if MetaMask is available
      if (typeof window.ethereum === 'undefined') {
        return false
      }

      // Check if the saved account is still connected
      const accounts = await window.ethereum.request({ method: 'eth_accounts' })
      if (accounts.length === 0) {
        clearConnectionState()
        return false
      }

      // Check if the saved account is still the active one
      if (accounts[0].toLowerCase() !== savedState.account?.toLowerCase()) {
        clearConnectionState()
        return false
      }

      // Check network
      const currentChainId = await window.ethereum.request({ method: 'eth_chainId' })
      if (currentChainId !== savedState.networkId) {
        clearConnectionState()
        return false
      }

      // Auto-reconnect based on wallet type
      if (savedState.walletType === 'metamask') {
        account.value = accounts[0]
        walletType.value = 'metamask'
        isConnected.value = true

        await initializeProvider(window.ethereum)
        await updateBalance()
        setupEventListeners(window.ethereum)

        connectionState.value = 'ready'
        return true
      } else if (savedState.walletType === 'coinbase') {
        account.value = accounts[0]
        walletType.value = 'coinbase'
        isConnected.value = true

        await initializeProvider(window.ethereum)
        await updateBalance()
        setupEventListeners(window.ethereum)

        connectionState.value = 'ready'
        return true
      }

      return false
    } catch (error) {
      console.error('❌ Auto-reconnect failed:', error)
      clearConnectionState()
      return false
    }
  }

  // Place a bet on a ship and get race result
  // Check if approval is needed for betting - check for any allowance
  const checkApprovalNeeded = async (_amount: string) => {
    if (!account.value) {
      throw new Error('Wallet not connected')
    }

    try {
      const contractAddress = getContractAddress(network.currentChainId.value!)

      // Use SIGNER to ensure we're checking from the right account context
      const signer = getSafeSigner()
      if (!signer) {
        throw new Error('Signer not available')
      }
      const spiralABI = [
        'function allowance(address owner, address spender) external view returns (uint256)',
      ]
      const spiralContract = new ethers.Contract(getSpiralTokenAddress(), spiralABI, signer)

      const allowance = await spiralContract.allowance(account.value, contractAddress)

      // Check if we have any allowance at all (unlimited approval)
      const needsApproval = allowance.isZero()
      return needsApproval
    } catch (error) {
      console.error('Error checking approval:', error)
      // If we can't check, assume we need approval
      return true
    }
  }

  const placeBetAndGetRace = async (shipId: number, amount: string) => {
    if (!isConnectionReady()) {
      throw new Error('Wallet not connected')
    }

    const signer = getSafeSigner()
    if (!signer) {
      throw new Error('Signer not available')
    }
    const contractAddress = getSafeContract()?.address
    if (!contractAddress) {
      throw new Error('Contract address not available')
    }
    const amountUnits = ethers.utils.parseUnits(String(amount), 8) // Convert to wei (8 decimals)

    // Retry logic for RPC errors
    const maxRetries = 3
    let lastError: unknown = null

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        // Small delay before first attempt to avoid network congestion
        if (attempt === 1) {
          await new Promise(resolve => setTimeout(resolve, 500))
        }

        // Create fresh contract instance to avoid proxy issues
        const freshContract = new ethers.Contract(contractAddress, CONTRACT_ABI, signer)

        // Estimate gas and add buffer to prevent gas estimation failures
        let gasEstimate
        try {
          if (freshContract.estimateGas && freshContract.estimateGas.placeBet) {
            gasEstimate = await freshContract.estimateGas.placeBet(shipId, amountUnits)
            // Add 20% buffer for safety
            gasEstimate = gasEstimate.mul(120).div(100)
          } else {
            throw new Error('Gas estimation not available')
          }
        } catch {
          gasEstimate = ethers.BigNumber.from('500000') // Default gas limit
        }

        // Get current gas price and add small premium for faster processing
        const gasPrice = await getSafeProvider()?.getGasPrice()
        const adjustedGasPrice = gasPrice?.mul(110).div(100) // 10% premium

        // Place the bet with optimized parameters
        const tx = await freshContract.placeBet(shipId, amountUnits, {
          gasLimit: gasEstimate,
          gasPrice: adjustedGasPrice,
        })
        const receipt = await tx.wait()

        // Extract the real race result from the transaction logs
        // The placeBet function returns the race result, but since it's a transaction,
        // we need to parse the return value from the transaction

        // Parse events to get the real payout and race result information
        let actualPayout = '0'
        let jackpotTier = 0
        let jackpotAmount = '0'
        let raceResult = null

        if (receipt.events) {
          // Get payout from BetPlaced event
          const betPlacedEvent = receipt.events.find(
            (event: { event: string; args?: unknown }) => event.event === 'BetPlaced'
          )
          if (betPlacedEvent && betPlacedEvent.args) {
            actualPayout = ethers.utils.formatUnits(betPlacedEvent.args.payout, 8) // Convert from wei to SPIRAL
            jackpotTier = betPlacedEvent.args.jackpotTier
          }

          // Get jackpot amount from JackpotHit event (if any)
          const jackpotHitEvent = receipt.events.find(
            (event: { event: string; args?: unknown }) => event.event === 'JackpotHit'
          )
          if (jackpotHitEvent && jackpotHitEvent.args) {
            jackpotAmount = ethers.utils.formatUnits(jackpotHitEvent.args.amount, 8)
            // Add jackpot amount to payout for total earnings
            const currentPayout = parseFloat(actualPayout)
            const jackpotValue = parseFloat(jackpotAmount)
            actualPayout = (currentPayout + jackpotValue).toString()
          }

          // Get race result from RaceCompleted event
          const raceCompletedEvent = receipt.events.find(
            (event: { event: string; args?: unknown }) => event.event === 'RaceCompleted'
          )
          if (raceCompletedEvent && raceCompletedEvent.args) {
            raceResult = {
              winner: raceCompletedEvent.args.winner,
              placements: raceCompletedEvent.args.placements,
              totalEvents: raceCompletedEvent.args.totalEvents,
              turnEvents: [] as TurnEvent[], // We don't emit turn events in the event (too much data)
            }
            // Try to get turn events from debugRaceSimulation first
            try {
              const debugResult = await getSafeContract()?.debugRaceSimulation()
              if (debugResult && debugResult.turnEvents && debugResult.turnEvents.length > 0) {
                raceResult.turnEvents = debugResult.turnEvents
              } else {
                // Generate simulated race result based on placements
                const simulatedResult = generateSimulatedRaceResult(
                  Number(raceResult.winner),
                  raceResult.placements.map((p: unknown) => Number(p))
                )
                raceResult.turnEvents = simulatedResult.turnEvents
              }
            } catch {
              // Generate simulated race result based on placements
              const simulatedResult = generateSimulatedRaceResult(
                Number(raceResult.winner),
                raceResult.placements.map((p: unknown) => Number(p))
              )
              raceResult.turnEvents = simulatedResult.turnEvents
            }
          }
        }

        // If we didn't get race result from events, we can't reconstruct it
        // The race result should be available in the transaction events
        if (!raceResult) {
          // Create a minimal race result from the events we have
          raceResult = {
            winner: 0,
            placements: [0, 1, 2, 3, 4, 5, 6, 7],
            totalEvents: 0,
            turnEvents: [] as TurnEvent[],
          }
        }

        await updateBalance()
        await loadContractInfo()

        return {
          receipt,
          raceResult,
          actualPayout,
          jackpotTier,
          jackpotAmount,
        }
      } catch (error: unknown) {
        lastError = error
        console.error(`❌ Attempt ${attempt} failed:`, error)

        // Check if it's a retryable error
        const isRetryableError =
          error.code === -32603 || // Internal JSON-RPC error
          error.message?.includes('Internal JSON-RPC error') ||
          error.message?.includes('network') ||
          error.message?.includes('timeout') ||
          error.message?.includes('connection')

        if (attempt < maxRetries && isRetryableError) {
          await new Promise(resolve => setTimeout(resolve, attempt * 2000)) // Exponential backoff
          continue
        } else {
          // Don't retry for non-retryable errors or if we've exhausted retries
          break
        }
      }
    }

    // If we get here, all retries failed
    console.error('Failed to place bet after all retries:', lastError)

    // Provide more helpful error messages
    if (lastError?.code === -32603) {
      throw new Error('Network error occurred. Please check your connection and try again.')
    } else if (lastError?.message?.includes('insufficient funds')) {
      throw new Error('Insufficient funds for transaction. Please check your balance.')
    } else if (lastError?.message?.includes('user rejected')) {
      throw new Error('Transaction was rejected by user.')
    } else {
      throw new Error(lastError?.reason || lastError?.message || 'Failed to place bet')
    }
  }

  // Approve SPIRAL tokens for betting
  const approveSpiralTokens = async (amount?: string) => {
    if (!isConnectionReady()) {
      throw new Error('Wallet not connected')
    }

    try {
      const signer = getSafeSigner()
      if (!signer) {
        throw new Error('Signer not available')
      }

      // Create SPIRAL token contract instance
      const spiralABI = [
        'function approve(address spender, uint256 amount) external returns (bool)',
        'function allowance(address owner, address spender) external view returns (uint256)',
      ]

      const spiralContract = new ethers.Contract(getSpiralTokenAddress(), spiralABI, signer)
      const contractAddress = getContractAddress(network.currentChainId.value!)

      // Approve unlimited or specific amount
      const approveAmount = amount
        ? ethers.utils.parseUnits(amount, 8)
        : ethers.constants.MaxUint256

      const tx = await spiralContract.approve(contractAddress, approveAmount)
      const receipt = await tx.wait()

      return receipt
    } catch (error: unknown) {
      console.error('Failed to approve tokens:', error)
      const errorObj = error as { reason?: string; message?: string }
      throw new Error(errorObj.reason || errorObj.message || 'Failed to approve tokens')
    }
  }

  // Performance: Optimized race info with caching
  const getCurrentRaceInfo = async () => {
    try {
      const gameStats = await queuedContractCall('getGameStats')
      return {
        raceId: gameStats.gameCurrentRace?.toString() || '0',
        totalBets: gameStats.gameTotalVolume?.toString() || '0',
        totalRaces: gameStats.gameTotalRaces?.toString() || '0',
        isActive: true, // Assume always active for now
      }
    } catch (error) {
      console.error('Failed to get race info:', error)
      return null
    }
  }

  // Get ship betting totals
  const getShipBets = async (raceId: number) => {
    const safeContract = getSafeContract()
    if (!safeContract) return Array(8).fill('0')

    try {
      const bets = await safeContract.getShipBets(raceId)
      if (!bets || !Array.isArray(bets)) {
        return Array(8).fill('0')
      }
      return bets.map((bet: unknown) => ethers.utils.formatUnits(bet as ethers.BigNumber, 8))
    } catch (error) {
      console.error('Failed to get ship bets:', error)
      return Array(8).fill('0')
    }
  }

  // Get player's bet for a race
  const getPlayerBets = async (raceId: number) => {
    const safeContract = getSafeContract()
    if (!safeContract || !account.value) return null

    try {
      const bet = await safeContract.getPlayerBets(account.value, raceId)
      if (bet.amount && Number(bet.amount) > 0) {
        return {
          spaceship: Number(bet.spaceship),
          amount: ethers.utils.formatUnits(bet.amount, 8),
          claimed: bet.claimed,
        }
      }
      return null
    } catch (error) {
      console.error('Failed to get player bets:', error)
      return null
    }
  }

  // Claim winnings for a race
  const claimWinnings = async (raceId: number) => {
    if (!isConnectionReady()) {
      throw new Error('Wallet not connected')
    }

    try {
      const signer = getSafeSigner()
      if (!signer) {
        throw new Error('Signer not available')
      }
      const contractWithSigner = getSafeContract()?.connect(signer)

      const tx = await contractWithSigner?.claimWinnings(raceId)
      const receipt = await tx?.wait()

      await updateBalance()

      return receipt
    } catch (error: unknown) {
      console.error('Failed to claim winnings:', error)
      const errorObj = error as { reason?: string; message?: string }
      throw new Error(errorObj.reason || errorObj.message || 'Failed to claim winnings')
    }
  }

  // Performance: Optimized player stats with caching
  const getPlayerStats = async (playerAddress?: string) => {
    const address = playerAddress || account.value
    if (!address) return null

    try {
      const stats = await queuedContractCall('getPlayerStats', address)
      return {
        totalRaces: stats.playerTotalRaces?.toString() || '0',
        totalWinnings: ethers.utils.formatUnits(stats.playerTotalWinnings || '0', 8),
        biggestWin: ethers.utils.formatUnits(stats.playerBiggestWin || '0', 8),
        highestJackpotTier: stats.playerHighestJackpotTier?.toString() || '0',
        achievementRewards: ethers.utils.formatUnits(stats.playerAchievementRewards || '0', 8),
        spaceshipWins: stats.playerSpaceshipWins || Array(8).fill('0'),
      }
    } catch (error) {
      console.error('Failed to get player stats:', error)
      return null
    }
  }

  // Get player achievement count
  const getPlayerAchievementCount = async (playerAddress?: string) => {
    const safeContract = getSafeContract()
    const address = playerAddress || account.value
    if (!safeContract || !address) return 0

    try {
      const count = await safeContract.getPlayerAchievementsCount(address)
      return Number(count)
    } catch (error) {
      console.error('Failed to get achievement count:', error)
      return 0
    }
  }

  // Get spaceship placement count for player
  const spaceshipPlacementCount = async (
    playerAddress: string,
    spaceshipId: number,
    placement: number
  ) => {
    const safeContract = getSafeContract()
    if (!safeContract) return 0

    try {
      const count = await safeContract.spaceshipPlacementCount(
        playerAddress,
        spaceshipId,
        placement
      )
      return Number(count)
    } catch (error) {
      console.error('Failed to get spaceship placement count:', error)
      return 0
    }
  }

  // Get spaceship bet count for player
  const getSpaceshipBetCount = async (playerAddress: string, spaceshipId: number) => {
    const safeContract = getSafeContract()
    if (!safeContract) return 0

    try {
      // Ensure the address is properly formatted
      const formattedAddress = ethers.utils.getAddress(playerAddress)

      // Ensure spaceshipId is within bounds
      if (spaceshipId < 0 || spaceshipId >= 8) {
        console.warn('Invalid spaceshipId:', spaceshipId)
        return 0
      }

      // Call the function with both address and shipId
      const betCount = await safeContract.spaceshipBetCount(formattedAddress, spaceshipId)
      return Number(betCount)
    } catch (error) {
      console.error('Failed to get spaceship bet count:', error)
      return 0
    }
  }

  // Get SPIRAL token balance with safety checks
  const getSpiralBalance = async (playerAddress?: string) => {
    const address = playerAddress || account.value
    if (!address) return '0'

    try {
      // For own balance, use signer. For other addresses, use provider
      if (playerAddress) {
        const safeProvider = getSafeProvider()
        if (!safeProvider) return '0'

        const spiralABI = ['function balanceOf(address owner) external view returns (uint256)']
        const spiralContract = new ethers.Contract(getSpiralTokenAddress(), spiralABI, safeProvider)
        const balance = await spiralContract.balanceOf(address)
        return ethers.utils.formatUnits(balance, 8)
      } else {
        // For own balance, use signer
        if (!isSignerReady()) return '0'
        const safeSigner = getSafeSigner()
        if (!safeSigner) return '0'

        const spiralABI = ['function balanceOf(address owner) external view returns (uint256)']
        const spiralContract = new ethers.Contract(getSpiralTokenAddress(), spiralABI, safeSigner)
        const balance = await spiralContract.balanceOf(address)
        return ethers.utils.formatUnits(balance, 8)
      }
    } catch (error) {
      console.error('Failed to get SPIRAL balance:', error)
      return '0'
    }
  }



  // Performance: Optimized jackpot amounts with caching
  const getJackpotAmounts = async () => {
    try {
      const [mini, mega, superJackpotAmount] = await queuedContractCall('getJackpotAmounts')

      return {
        mini: ethers.utils.formatUnits(mini, 8),
        mega: ethers.utils.formatUnits(mega, 8),
        super: ethers.utils.formatUnits(superJackpotAmount, 8),
      }
    } catch (error) {
      console.error('Error getting jackpot amounts:', error)
      return { mini: '0', mega: '0', super: '0' }
    }
  }

  // SPIRAL Token Faucet Functions with safety checks
  const claimFaucet = async () => {
    if (!isConnectionReady()) {
      throw new Error('Wallet not connected')
    }

    try {
      const signer = getSafeSigner()
      if (!signer) {
        throw new Error('Signer not available')
      }

      const contractAddress = getContractAddress(network.currentChainId.value!)
      if (!contractAddress) {
        throw new Error('Contract address not found for current network')
      }

      // Create a fresh contract instance to avoid proxy issues
      const freshContract = new ethers.Contract(contractAddress, CONTRACT_ABI, signer)

      const tx = await freshContract.claimFaucet()
      const receipt = await tx.wait()

      // Update balance after a delay
      setTimeout(() => updateBalance(), 2000)

      return receipt
    } catch (error: unknown) {
      console.error('Failed to claim faucet:', error)
      const errorObj = error as { reason?: string; message?: string }
      throw new Error(errorObj.reason || errorObj.message || 'Failed to claim faucet')
    }
  }

  const hasClaimedFaucet = async (address?: string) => {
    const safeContract = getSafeContract()
    if (!safeContract) {
      return false
    }

    try {
      const addressToCheck = address || account.value
      if (!addressToCheck) {
        return false
      }

      const claimed = await safeContract.hasClaimedFaucet(addressToCheck)
      return claimed
    } catch (error) {
      console.error('Failed to check faucet status:', error)
      return false
    }
  }

  // Get ship information
  const getShip = async (shipId: number) => {
    const safeContract = getSafeContract()
    if (!safeContract) return null

    try {
      const ship = await safeContract.getShip(shipId)
      return {
        id: Number(ship.id),
        name: ship.name,
        initialSpeed: Number(ship.initialSpeed),
        acceleration: Number(ship.acceleration),
        chaosFactor: ship.chaosFactor,
        chaosChance: Number(ship.chaosChance),
      }
    } catch (error) {
      console.error('Failed to get ship info:', error)
      return null
    }
  }

  // Owner functions
  const startNewRace = async () => {
    if (!isConnectionReady()) {
      throw new Error('Wallet not connected')
    }

    try {
      const signer = getSafeSigner()
      if (!signer) {
        throw new Error('Signer not available')
      }
      const contractWithSigner = getSafeContract()?.connect(signer)

      const tx = await contractWithSigner?.startNewRace()
      const receipt = await tx?.wait()

      await loadContractInfo()

      return receipt
    } catch (error: unknown) {
      console.error('Failed to start new race:', error)
      const errorObj = error as { reason?: string; message?: string }
      throw new Error(errorObj.reason || errorObj.message || 'Failed to start new race')
    }
  }

  const finishRace = async (winnerId: number) => {
    if (!isConnectionReady()) {
      throw new Error('Wallet not connected')
    }

    try {
      const signer = getSafeSigner()
      if (!signer) {
        throw new Error('Signer not available')
      }
      const contractWithSigner = getSafeContract()?.connect(signer)

      const tx = await contractWithSigner?.finishRace(winnerId)
      const receipt = await tx?.wait()

      await loadContractInfo()

      return receipt
    } catch (error: unknown) {
      console.error('Failed to finish race:', error)
      const errorObj = error as { reason?: string; message?: string }
      throw new Error(errorObj.reason || errorObj.message || 'Failed to finish race')
    }
  }

  // Race reconstruction functions
  const getShipNames = () => [
    'Comet',
    'Juggernaut',
    'Shadow',
    'Phantom',
    'Phoenix',
    'Vanguard',
    'Wildcard',
    'Apex',
  ]

  const getChaosEventText = (eventType: number, shipId: number, targetId?: number) => {
    const shipNames = getShipNames()

    switch (eventType) {
      case 1:
        return `🔥 ${shipNames[shipId]} activates Overdrive!`
      case 2:
        return `⚡ ${shipNames[shipId]}'s Unstable Engine surges!`
      case 3:
        return `💨 ${shipNames[shipId]} catches a Slipstream!`
      case 4:
        return `🌀 ${shipNames[shipId]} uses Quantum Tunneling!`
      case 5:
        return `🚀 ${shipNames[shipId]} activates Last Stand Protocol!`
      case 6:
        return `⚡ ${shipNames[shipId]}'s Micro-warp Engine activates!`
      case 7:
        return `🤖 ${shipNames[shipId]}'s Rogue AI takes control!`
      case 8:
        return `🛑 ${shipNames[shipId]} uses Graviton Brake on ${shipNames[targetId || 0]}!`
      case 9:
        return `💥 ${shipNames[shipId]} was slowed by Graviton Brake!`
      default:
        return ''
    }
  }

  // Get a debug race simulation
  const getDebugRaceSimulation = async () => {
    const safeContract = getSafeContract()
    if (!safeContract) return null

    try {
      const result = await safeContract.debugRaceSimulation()
      return result
    } catch (error) {
      console.error('Failed to get debug race simulation:', error)
      return null
    }
  }

  // Generate a simulated race result when contract doesn't have turn events
  const generateSimulatedRaceResult = (winner: number, placements: number[]) => {
    const turnEvents: unknown[] = []
    const trackDistance = 1000
    const raceTurns = 10

    // Create ship states with final positions based on placements
    const shipStates = placements.map((shipId, index) => ({
      shipId,
      finalDistance: trackDistance - index, // 1st = 1000, 2nd = 999, etc.
      finalTurn: Math.min(raceTurns, 8 + index), // Earlier finishers finish in earlier turns
    }))

    // Generate turn events for each ship
    for (let turn = 1; turn <= raceTurns; turn++) {
      for (let shipIndex = 0; shipIndex < 8; shipIndex++) {
        const shipState = shipStates[shipIndex]
        if (!shipState) continue

        const shipId = shipState.shipId

        // Calculate progress for this turn
        const progressPerTurn = shipState.finalDistance / shipState.finalTurn
        const currentDistance = Math.min(shipState.finalDistance, progressPerTurn * turn)
        const moveAmount =
          turn === 1 ? currentDistance : currentDistance - progressPerTurn * (turn - 1)

        // Add some randomness to make it more interesting
        const randomFactor = 0.8 + Math.random() * 0.4 // 0.8 to 1.2
        const adjustedMoveAmount = Math.floor(moveAmount * randomFactor)
        const adjustedDistance = Math.min(
          shipState.finalDistance,
          turn === 1 ? adjustedMoveAmount : progressPerTurn * (turn - 1) + adjustedMoveAmount
        )

        // Add chaos events randomly (10% chance per turn per ship)
        const chaosEventType = Math.random() < 0.1 ? Math.floor(Math.random() * 9) + 1 : 0
        const targetShipId = chaosEventType === 8 ? Math.floor(Math.random() * 8) : 0

        turnEvents.push({
          turn,
          shipId,
          moveAmount: adjustedMoveAmount,
          distance: adjustedDistance,
          chaosEventType,
          targetShipId,
        })
      }
    }

    return {
      winner,
      placements,
      turnEvents,
      totalEvents: turnEvents.length,
    }
  }

  // Reconstruct race from blockchain turnEvents data
  const reconstructRaceFromBlockchain = (contractRaceResult: unknown) => {
    // Import SHIPS_ROSTER to get the proper ship data
    // SHIPS_ROSTER is already imported at the top of the file

    // Initialize race states for all ships (using 0-7 IDs)
    const raceStates: unknown[] = []
    for (let shipId = 0; shipId <= 7; shipId++) {
      const shipData = SHIPS_ROSTER.find((ship: unknown) => (ship as { id: number }).id === shipId)
      raceStates.push({
        id: shipId, // 0-7 IDs
        name: shipData?.name || 'Unknown',
        color: shipData?.color || '#ffffff',
        stats: shipData?.stats || { initialSpeed: 0, acceleration: 0 },
        chaosFactor: shipData?.chaosFactor || '',
        currentSpeed: 0,
        distance: 0,
        finalTurn: 0,
      })
    }

    // Process turn events from blockchain
    const replayLog: unknown[] = []
    const chaosEvents: unknown[] = []

    // Group events by turn
    const turnEvents = (contractRaceResult as { turnEvents?: unknown[] }).turnEvents || []
    const maxTurn =
      turnEvents.length > 0
        ? Math.max(...turnEvents.map((e: unknown) => (e as { turn: number }).turn))
        : 0

    // Track final positions for each ship
    const finalPositions: { [shipId: number]: number } = {}

    for (let turn = 1; turn <= maxTurn; turn++) {
      const turnEvents = (contractRaceResult as { turnEvents: unknown[] }).turnEvents.filter(
        (e: unknown) => (e as { turn: number }).turn === turn
      )

      for (const event of turnEvents) {
        const shipId = Number(event.shipId) // Already 0-7
        const moveAmount = Number(event.moveAmount)
        const distance = Number(event.distance)
        const chaosEventType = Number(event.chaosEventType)
        const targetShipId = Number(event.targetShipId)

        // Track the final position for each ship
        finalPositions[shipId] = distance

        // Add to replay log (using 0-7 IDs)
        replayLog.push({
          turn,
          shipId: shipId, // 0-7 ID
          moveAmount,
          distance,
          event:
            chaosEventType > 0
              ? {
                  type: chaosEventType.toString(),
                  text: getChaosEventText(chaosEventType, shipId, targetShipId),
                  targetId: targetShipId > 0 ? targetShipId : undefined,
                }
              : undefined,
        })

        // Add chaos events
        if (chaosEventType > 0) {
          chaosEvents.push({
            type: chaosEventType.toString(),
            text: getChaosEventText(chaosEventType, shipId, targetShipId),
            targetId: targetShipId > 0 ? targetShipId : undefined,
          })
        }
      }
    }

    // Update race states with final blockchain positions
    for (let shipId = 0; shipId <= 7; shipId++) {
      raceStates[shipId].distance = finalPositions[shipId] || 0
    }

    // Set winner based on placements (already 0-7 IDs)
    const winnerId = Number(contractRaceResult.winner)
    const winner = raceStates[winnerId] // Array is 0-indexed

    // Convert placements (already 0-7 IDs)
    const placements = (contractRaceResult as { placements: unknown[] }).placements.map(
      (p: unknown) => Number(p)
    )

    // CRITICAL FIX: Update final positions based on actual blockchain results
    // The placements array shows the order they finished, so we need to set distances accordingly
    const trackDistance = 1000
    placements.forEach((shipId: number, index: number) => {
      // Calculate final distance based on placement
      // 1st place = 1000, 2nd place = 999, 3rd place = 998, etc.
      const finalDistance = trackDistance - index
      raceStates[shipId].distance = finalDistance
    })

    return {
      raceStates,
      winner,
      replayLog,
      chaosEvents,
      placements,
    }
  }

  // Animate race progression for frontend - PURE BLOCKCHAIN REPLAY
  const animateRaceProgression = async (
    raceData: unknown,
    onTurnUpdate: (turn: number, states: unknown[], events: unknown[]) => void
  ) => {
    const { replayLog, raceStates } = raceData as { replayLog: unknown[]; raceStates: unknown[] }
    const maxTurn = Math.max(...replayLog.map((log: unknown) => (log as { turn: number }).turn))

    // CRITICAL FIX: Start all ships from distance 0 for proper animation
    const initialStates = raceStates.map((state: unknown) => ({
      ...(state as object),
      distance: 0,
    }))

    // Track current positions throughout animation
    const currentPositions = initialStates.map((state: unknown) => ({ ...(state as object) }))

    for (let turn = 1; turn <= maxTurn; turn++) {
      const turnEvents = replayLog.filter((log: unknown) => (log as { turn: number }).turn === turn)
      const turnChaosEvents: unknown[] = []

      for (const event of turnEvents) {
        const shipId = event.shipId // Already 0-7 ID

        // Update the ship's position to the EXACT blockchain position
        if (shipId >= 0 && shipId < currentPositions.length) {
          currentPositions[shipId].distance = event.distance
        }

        // Add chaos event if present, including the shipId that triggered it
        if (event.event) {
          turnChaosEvents.push({
            ...event.event,
            shipId: shipId, // Add the ship ID that triggered this event
          })
        }
      }
      onTurnUpdate(turn, currentPositions, turnChaosEvents)
      await new Promise(resolve => setTimeout(resolve, 800))
    }
  }

  // ==================== USERNAME FUNCTIONS ====================

  const registerUsername = async (username: string, avatarId: number = 0) => {
    if (!isConnectionReady()) {
      throw new Error('Wallet not connected')
    }

    try {
      const signer = getSafeSigner()
      if (!signer) {
        throw new Error('Signer not available')
      }
      const contractAddress = getContractAddress(network.currentChainId.value!)
      if (!contractAddress) {
        throw new Error('Contract not found on current network')
      }
      const contractWithSigner = new ethers.Contract(contractAddress, CONTRACT_ABI, signer)
      const tx = await contractWithSigner.registerUsername(username, avatarId)
      await tx.wait()
      return tx
    } catch (error: unknown) {
      console.error('Failed to register username:', error)
      const errorObj = error as { reason?: string; message?: string }
      throw new Error(errorObj.reason || errorObj.message || 'Failed to register username')
    }
  }

  const getUsername = async (playerAddress?: string) => {
    const safeProvider = getSafeProvider()
    if (!safeProvider) {
      console.warn('Provider not ready for getUsername')
      return ''
    }

    try {
      if (!network.currentChainId.value) {
        throw new Error('Network ID not available')
      }
      const contractAddress = getContractAddress(network.currentChainId.value)
      if (!contractAddress) {
        throw new Error('Contract not found on current network')
      }

      const contract = new ethers.Contract(contractAddress, CONTRACT_ABI, safeProvider)
      const address = playerAddress || account.value
      if (!address) throw new Error('No address provided')

      const username = await contract.getUsername(address)
      return username
    } catch (error: unknown) {
      console.error('Failed to get username:', error)
      return ''
    }
  }

  const playerHasUsername = async (playerAddress?: string) => {
    const safeProvider = getSafeProvider()
    if (!safeProvider) {
      return false
    }

    if (!network.currentChainId.value) {
      return false
    }
    const contractAddress = getContractAddress(network.currentChainId.value)
    if (!contractAddress) {
      return false
    }

    const contract = new ethers.Contract(contractAddress, CONTRACT_ABI, safeProvider)

    const address = playerAddress || account.value
    if (!address) {
      return false
    }

    const hasUsername = await contract.playerHasUsername(address)
    return hasUsername
  }

  const getAddressByUsername = async (username: string) => {
    try {
      const safeProvider = getSafeProvider()
      if (!safeProvider) {
        return '0x0000000000000000000000000000000000000000'
      }

      if (!network.currentChainId.value) {
        return '0x0000000000000000000000000000000000000000'
      }

      const contractAddress = getContractAddress(network.currentChainId.value)
      if (!contractAddress) {
        return '0x0000000000000000000000000000000000000000'
      }

      const contract = new ethers.Contract(contractAddress, CONTRACT_ABI, safeProvider)
      const address = await contract.getAddressByUsername(username)
      return address
    } catch (error: unknown) {
      console.error('Failed to get address by username:', error)
      return '0x0000000000000000000000000000000000000000'
    }
  }

  const getPlayerAvatar = async (playerAddress?: string) => {
    try {
      const safeProvider = getSafeProvider()
      if (!safeProvider) {
        return 255
      }

      if (!network.currentChainId.value) {
        return 255
      }

      const contractAddress = getContractAddress(network.currentChainId.value)
      if (!contractAddress) {
        return 255
      }

      const contract = new ethers.Contract(contractAddress, CONTRACT_ABI, safeProvider)
      const address = playerAddress || account.value
      if (!address) return 255

      const avatarId = await contract.getPlayerAvatar(address)
      // uint8 returns as a number directly, no need for .toNumber()
      return Number(avatarId)
    } catch (error: unknown) {
      console.error('Failed to get player avatar:', error)
      return 255
    }
  }

  // ==================== MATCH HISTORY FUNCTIONS ====================

  const getPlayerMatchHistory = async (playerAddress?: string, offset = 0, limit = 10) => {
    try {
      const safeProvider = getSafeProvider()
      if (!safeProvider) {
        return { matches: [], totalMatches: 0 }
      }

      if (!network.currentChainId.value) {
        return { matches: [], totalMatches: 0 }
      }

      const contractAddress = getContractAddress(network.currentChainId.value)
      if (!contractAddress) {
        return { matches: [], totalMatches: 0 }
      }

      const contract = new ethers.Contract(contractAddress, CONTRACT_ABI, safeProvider)
      const address = playerAddress || account.value
      if (!address) throw new Error('No address provided')

      const [matches, totalMatches] = await contract.getPlayerMatchHistory(address, offset, limit)

      // Format the matches data
      const formattedMatches = matches.map((match: unknown) => ({
        raceId: (match as { raceId: { toString(): string } }).raceId.toString(),
        timestamp: new Date(
          (match as { timestamp: { toNumber(): number } }).timestamp.toNumber() * 1000
        ),
        shipBet: (match as { shipBet: number }).shipBet,
        betAmount: ethers.utils.formatUnits(
          (match as { betAmount: ethers.BigNumber }).betAmount,
          8
        ),
        placement: (match as { placement: number }).placement,
        payout: ethers.utils.formatUnits((match as { payout: ethers.BigNumber }).payout, 8),
        jackpotTier: (match as { jackpotTier: number }).jackpotTier,
        jackpotAmount: ethers.utils.formatUnits(
          (match as { jackpotAmount: ethers.BigNumber }).jackpotAmount,
          8
        ),
      }))

      return {
        matches: formattedMatches,
        totalMatches: totalMatches.toNumber(),
      }
    } catch (error: unknown) {
      console.error('Failed to get match history:', error)
      return { matches: [], totalMatches: 0 }
    }
  }

  const getRecentMatches = async (playerAddress?: string, count = 5) => {
    try {
      const safeProvider = getSafeProvider()
      if (!safeProvider) {
        return []
      }

      if (!network.currentChainId.value) {
        return []
      }

      const contractAddress = getContractAddress(network.currentChainId.value)
      if (!contractAddress) {
        return []
      }

      const contract = new ethers.Contract(contractAddress, CONTRACT_ABI, safeProvider)
      const address = playerAddress || account.value
      if (!address) throw new Error('No address provided')

      const matches = await contract.getRecentMatches(address, count)

      // Format the matches data
      const formattedMatches = matches.map((match: unknown) => ({
        raceId: (match as { raceId: { toString(): string } }).raceId.toString(),
        timestamp: new Date(
          (match as { timestamp: { toNumber(): number } }).timestamp.toNumber() * 1000
        ),
        shipBet: (match as { shipBet: number }).shipBet,
        betAmount: ethers.utils.formatUnits(
          (match as { betAmount: ethers.BigNumber }).betAmount,
          8
        ),
        placement: (match as { placement: number }).placement,
        payout: ethers.utils.formatUnits((match as { payout: ethers.BigNumber }).payout, 8),
        jackpotTier: (match as { jackpotTier: number }).jackpotTier,
        jackpotAmount: ethers.utils.formatUnits(
          (match as { jackpotAmount: ethers.BigNumber }).jackpotAmount,
          8
        ),
      }))

      return formattedMatches
    } catch (error: unknown) {
      console.error('Failed to get recent matches:', error)
      return []
    }
  }

  // ==================== LEADERBOARD FUNCTIONS ====================

  const getTopPlayersByWinnings = async (limit = 10) => {
    try {
      const safeProvider = getSafeProvider()
      if (!safeProvider) {
        return { players: [], usernames: [], avatars: [], winnings: [] }
      }

      if (!network.currentChainId.value) {
        return { players: [], usernames: [], avatars: [], winnings: [] }
      }

      const contractAddress = getContractAddress(network.currentChainId.value)
      if (!contractAddress) {
        return { players: [], usernames: [], avatars: [], winnings: [] }
      }

      const contract = new ethers.Contract(contractAddress, CONTRACT_ABI, safeProvider)
      const [players, usernames, avatars, winnings] = await contract.getTopPlayersByWinnings(limit)

      return {
        players,
        usernames,
        avatars: avatars.map((a: unknown) => Number(a)), // uint8 returns as number, not BigNumber
        winnings: winnings.map((w: unknown) => ethers.utils.formatUnits(w as ethers.BigNumber, 8)),
      }
    } catch (error: unknown) {
      console.error('Failed to get top players:', error)
      return { players: [], usernames: [], avatars: [], winnings: [] }
    }
  }

  const getPlayerLeaderboardStats = async (playerAddress?: string) => {
    try {
      const safeProvider = getSafeProvider()
      if (!safeProvider) {
        return {
          totalWinningsRank: 0,
          firstPlaceCount: 0,
          secondPlaceCount: 0,
          thirdPlaceCount: 0,
          fourthPlaceCount: 0,
          totalJackpots: '0',
          totalAchievements: 0,
        }
      }

      if (!network.currentChainId.value) {
        return {
          totalWinningsRank: 0,
          firstPlaceCount: 0,
          secondPlaceCount: 0,
          thirdPlaceCount: 0,
          fourthPlaceCount: 0,
          totalJackpots: '0',
          totalAchievements: 0,
        }
      }

      const contractAddress = getContractAddress(network.currentChainId.value)
      if (!contractAddress) {
        return {
          totalWinningsRank: 0,
          firstPlaceCount: 0,
          secondPlaceCount: 0,
          thirdPlaceCount: 0,
          fourthPlaceCount: 0,
          totalJackpots: '0',
          totalAchievements: 0,
        }
      }

      const contract = new ethers.Contract(contractAddress, CONTRACT_ABI, safeProvider)
      const address = playerAddress || account.value
      if (!address) throw new Error('No address provided')

      const [
        totalWinningsRank,
        firstPlaceCount,
        secondPlaceCount,
        thirdPlaceCount,
        fourthPlaceCount,
        totalJackpots,
        totalAchievements,
      ] = await contract.getPlayerLeaderboardStats(address)

      return {
        totalWinningsRank: totalWinningsRank.toNumber(),
        firstPlaceCount: firstPlaceCount.toNumber(),
        secondPlaceCount: secondPlaceCount.toNumber(),
        thirdPlaceCount: thirdPlaceCount.toNumber(),
        fourthPlaceCount: fourthPlaceCount.toNumber(),
        totalJackpots: ethers.utils.formatUnits(totalJackpots, 8),
        totalAchievements: totalAchievements.toNumber(),
      }
    } catch (error: unknown) {
      console.error('Failed to get leaderboard stats:', error)
      return {
        totalWinningsRank: 0,
        firstPlaceCount: 0,
        secondPlaceCount: 0,
        thirdPlaceCount: 0,
        fourthPlaceCount: 0,
        totalJackpots: '0',
        totalAchievements: 0,
      }
    }
  }

  const getLeaderboardStats = async () => {
    try {
      const safeProvider = getSafeProvider()
      if (!safeProvider) {
        return null
      }

      if (!network.currentChainId.value) {
        return null
      }

      const contractAddress = getContractAddress(network.currentChainId.value)
      if (!contractAddress) {
        return null
      }

      const contract = new ethers.Contract(contractAddress, CONTRACT_ABI, safeProvider)

      const [totalPlayers, totalVolume, totalJackpots] = await contract.getLeaderboardStats()

      return {
        totalPlayers: totalPlayers.toNumber(),
        totalVolume: ethers.utils.formatUnits(totalVolume, 8),
        totalJackpots: ethers.utils.formatUnits(totalJackpots, 8),
      }
    } catch (error: unknown) {
      console.error('Failed to get leaderboard stats:', error)
      return null
    }
  }

  const getPlayerComprehensiveStats = async (playerAddress?: string) => {
    try {
      const safeProvider = getSafeProvider()
      if (!safeProvider) {
        return null
      }

      if (!network.currentChainId.value) {
        return null
      }

      const contractAddress = getContractAddress(network.currentChainId.value)
      if (!contractAddress) {
        return null
      }

      const contract = new ethers.Contract(contractAddress, CONTRACT_ABI, safeProvider)
      const address = playerAddress || account.value
      if (!address) throw new Error('No address provided')

      const [
        username,
        avatarId,
        totalRaces,
        totalWinnings,
        biggestWin,
        firstPlace,
        secondPlace,
        thirdPlace,
        fourthPlace,
      ] = await contract.getPlayerComprehensiveStats(address)

      // Get current balance
      const balance = await getSpiralBalance()

      return {
        address,
        username: username || '',
        avatarId: avatarId.toNumber(),
        totalRaces: totalRaces.toNumber(),
        totalWinnings: ethers.utils.formatUnits(totalWinnings, 8),
        biggestWin: ethers.utils.formatUnits(biggestWin, 8),
        firstPlace: firstPlace.toNumber(),
        secondPlace: secondPlace.toNumber(),
        thirdPlace: thirdPlace.toNumber(),
        fourthPlace: fourthPlace.toNumber(),
        balance: balance,
        spaceshipWins: {}, // This would need to be implemented separately
        achievementCount: 0, // This would need to be implemented separately
      }
    } catch (error: unknown) {
      console.error('Failed to get comprehensive stats:', error)
      return null
    }
  }

  // Fetch recent achievements from blockchain events
  const fetchRecentAchievements = async () => {
    if (!isConnectionReady() || !account.value) {
      console.log('❌ Connection not ready or no account')
      return []
    }

    try {
      console.log('🔍 Starting achievement fetch for account:', account.value)
      const provider = getSafeProvider()
      const contract = getSafeContract()

      if (!provider || !contract) {
        console.log('❌ Provider or contract not available')
        return []
      }

      // Get the current block number
      const currentBlock = await provider.getBlockNumber()
      console.log('📦 Current block:', currentBlock)

      // Look for AchievementUnlocked events in the last 10 blocks
      const fromBlock = Math.max(0, currentBlock - 10)
      const toBlock = currentBlock
      console.log('🔍 Searching blocks', fromBlock, 'to', toBlock)

      // Filter for AchievementUnlocked events for the current player
      // Use hardcoded event topic hash for AchievementUnlocked(address,string,uint256,uint256)
      // This is keccak256('AchievementUnlocked(address,string,uint256,uint256)')
      const eventTopic = '0x823dc3993642dec723bae46e3cf7ae0c6f1d8816150b42e50822919873c4de5a'

      const filter = {
        address: contract.address,
        topics: [
          eventTopic,
          '0x' + account.value.toLowerCase().slice(2).padStart(64, '0'), // Player address padded to 32 bytes
        ],
        fromBlock,
        toBlock,
      }

      console.log('🔍 Filter created:', filter)
      const logs = await provider.getLogs(filter)
      console.log('📊 Found', logs.length, 'achievement logs')

      // Parse the events
      const achievements = []
      console.log('🔍 Parsing', logs.length, 'achievement logs...')
      for (const log of logs) {
        try {
          console.log('🔍 Parsing log:', log)

          // Simple approach: extract NFT ID and token reward from the log data
          // Skip the problematic string field for now
          const ethers = await import('ethers')

          // Extract data from AchievementUnlocked event
          // Event structure: AchievementUnlocked(address indexed player, string name, uint256 nftId, uint256 tokenReward)
          // Data structure: [string_offset][string_length][string_data][nftId][tokenReward]

          // Get the string offset (first 32 bytes)
          const stringOffset = ethers.BigNumber.from(log.data.slice(0, 32))
          console.log('🔍 String offset:', stringOffset.toString())

          // Get the string length (next 32 bytes after string offset)
          const stringLength = ethers.BigNumber.from(
            log.data.slice(stringOffset.toNumber(), stringOffset.toNumber() + 32)
          )
          console.log('🔍 String length:', stringLength.toString())

          // Calculate NFT ID position: after string offset + 32 (length) + string data
          const nftIdOffset = stringOffset.toNumber() + 32 + stringLength.toNumber()
          const tokenRewardOffset = nftIdOffset + 32

          console.log('🔍 NFT ID offset:', nftIdOffset, 'Token reward offset:', tokenRewardOffset)

          const nftId = ethers.BigNumber.from(log.data.slice(nftIdOffset, nftIdOffset + 32))
          const tokenReward = ethers.BigNumber.from(
            log.data.slice(tokenRewardOffset, tokenRewardOffset + 32)
          )
          const player = '0x' + log.topics[1].slice(26) // Extract address from topics[1]

          // Use a placeholder name - we'll get the real name from the NFT contract
          const name = `Achievement #${nftId.toString()}`

          console.log('✅ Extracted data:', {
            player,
            name,
            nftId: nftId.toString(),
            tokenReward: tokenReward.toString(),
          })

          // Get additional NFT info from the AchievementNFT contract
          const config = useRuntimeConfig()
          const nftContract = new ethers.Contract(
            config.public.achievementNFTAddress,
            [
              'function getAchievementInfo(uint256 tokenId) external view returns (string memory name, string memory description, string memory achievementType, uint8 spaceshipId, uint256 threshold)',
            ],
            provider
          )

          // Only try to get achievement info if NFT ID is valid (greater than 0)
          if (nftId.gt(0)) {
            try {
              const [nftName, description, achievementType, spaceshipId, threshold] =
                await nftContract.getAchievementInfo(nftId)

              achievements.push({
                nftId: nftId.toString(),
                name: nftName,
                description,
                achievementType,
                spaceshipId: spaceshipId.toString(),
                threshold: threshold.toString(),
                tokenReward: tokenReward.toString(),
              })
            } catch {
              console.log(
                '⚠️ Could not get achievement info for NFT ID',
                nftId.toString(),
                '- using placeholder data'
              )
              achievements.push({
                nftId: nftId.toString(),
                name: `Achievement #${nftId.toString()}`,
                description: 'Achievement details not available',
                achievementType: 'Unknown',
                spaceshipId: '0',
                threshold: '0',
                tokenReward: tokenReward.toString(),
              })
            }
          } else {
            console.log('⚠️ NFT ID is 0 - achievement may not have been minted properly')
            achievements.push({
              nftId: nftId.toString(),
              name: 'Achievement (NFT not minted)',
              description: 'Achievement was unlocked but NFT minting failed',
              achievementType: 'Unknown',
              spaceshipId: '0',
              threshold: '0',
              tokenReward: tokenReward.toString(),
            })
          }
        } catch {
          console.warn('Failed to parse achievement event')
          // Continue with next log instead of breaking
        }
      }

      console.log('🏆 Returning', achievements.length, 'achievements:', achievements)
      return achievements
    } catch {
      console.error('❌ Error fetching recent achievements')
      return []
    }
  }

  // ==================== ID MAPPING FUNCTIONS ====================

  // Remove all ID mapping functions - we now use 0-7 IDs consistently
  // const frontendToContractId = (frontendId: number) => {
  //   // No longer needed - frontend uses 0-7 IDs
  //   return frontendId
  // }

  // const contractToFrontendId = (contractId: number) => {
  //   // No longer needed - frontend uses 0-7 IDs
  //   return contractId
  // }

  // const getShipNameByFrontendId = (frontendId: number) => {
  //   // No longer needed - use getShipName directly
  //   return getShipName(frontendId)
  // }

  // const getShipNameByContractId = (contractId: number) => {
  //   // No longer needed - use getShipName directly
  //   return getShipName(contractId)
  // }

  // Helper function to get ship name by ID (0-7)
  const getShipName = (shipId: number) => {
    const ship = SHIPS_ROSTER.find(s => s.id === shipId)
    return ship?.name || 'Unknown'
  }

  // Helper function to get ship color by ID (0-7)
  const getShipColor = (shipId: number) => {
    const ship = SHIPS_ROSTER.find(s => s.id === shipId)
    return ship?.color || '#ffffff'
  }

  return {
    // Connection state
    connectionState,
    isConnected,
    account,
    network,
    currentRaceId,
    shortAddress,
    formattedBalance,
    formattedSpiralBalance,
    walletType,

    // Persistent login
    saveConnectionState,
    loadConnectionState,
    clearConnectionState,
    autoReconnect,

    // Guard functions
    isProviderReady,
    isContractReady,
    isSignerReady,
    isConnectionReady,
    getSafeProvider,
    getSafeContract,
    getSafeSigner,

    // Connection methods
    connectMetaMask,
    connectCoinbaseWallet,
    disconnect,
    updateBalance,
    updateAllBalances,

    // Performance utilities
    clearCache,
    getCachedData,
    setCachedData,
    cachedContractCall,
    queuedContractCall,
    getOptimizedContract,
    getNetworkConfig,
    withRetry,

    // Race functions
    startNewRace,
    finishRace,
    placeBetAndGetRace,
    getCurrentRaceInfo,
    getShipBets,
    getPlayerBets,
    getDebugRaceSimulation,
    reconstructRaceFromBlockchain,
    animateRaceProgression,
    getShipName,
    getShipColor,
    // Additional functions needed by useBetting
    getPlayerStats,
    getPlayerAchievementCount,
    spaceshipPlacementCount,
    getSpaceshipBetCount,
    getSpiralBalance,
    getJackpotAmounts,
    claimWinnings,
    claimFaucet,
    hasClaimedFaucet,
    approveSpiralTokens,
    getShip,
    loadContractInfo,
    registerUsername,
    getUsername,
    playerHasUsername,
    getPlayerAvatar,
    getAddressByUsername,
    getPlayerMatchHistory,
    getRecentMatches,
    getTopPlayersByWinnings,
    getPlayerLeaderboardStats,
    getLeaderboardStats,
    getPlayerComprehensiveStats,
    fetchRecentAchievements,
    checkApprovalNeeded,
    generateSimulatedRaceResult,
  }
}

// Export the singleton function
export const useWeb3 = () => {
  if (!globalWeb3Instance) {
    globalWeb3Instance = createWeb3Composable()
  }
  return globalWeb3Instance
}
