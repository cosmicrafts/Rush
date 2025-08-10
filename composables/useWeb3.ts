import { ethers } from 'ethers'
import { ref, computed, watch, onMounted } from 'vue'
import { SHIPS_ROSTER } from '../data/ships'

// Type declaration for window.ethereum
declare global {
  interface Window {
    ethereum?: any
  }
}

// Contract addresses and ABI
const CONTRACT_ADDRESSES = {
  '0x539': '0x8A93d247134d91e0de6f96547cB0204e5BE8e5D8', // Localhost
  '0xaa36a7': '0x09635F643e140090A9A8Dcd712eD6285858ceBef', // Sepolia
  '0xc478': '0x09635F643e140090A9A8Dcd712eD6285858ceBef' // Somnia
}

const SPIRAL_TOKEN_ADDRESS = '0x2a810409872AfC346F9B5b26571Fd6eC42EA4849'

const CONTRACT_ABI = [
  'function getGameStats() external view returns (uint256 gameCurrentRace, uint256 gameTotalRaces, uint256 gameTotalVolume, uint256 gameMiniJackpot, uint256 gameMegaJackpot, uint256 gameSuperJackpot)',
  'function placeBet(uint8 shipId, uint256 amount) external returns (uint8 winner, uint8[] placements, uint256 totalEvents, tuple(uint8 turn, uint8 shipId, uint256 moveAmount, uint256 distance, uint8 chaosEventType, uint8 targetShipId)[] turnEvents)',
  'function getShipBets(uint256 raceId) external view returns (uint256[8])',
  'function getPlayerBets(address player, uint256 raceId) external view returns (uint8 spaceship, uint256 amount, bool claimed)',
  'function claimWinnings(uint256 raceId) external',
  'function getPlayerStats(address player) external view returns (uint256 playerTotalRaces, uint256 playerTotalWinnings, uint256 playerBiggestWin, uint8 playerHighestJackpotTier, uint256 playerAchievementRewards, uint256[8] playerSpaceshipWins)',
  'function getPlayerAchievementsCount(address player) external view returns (uint256)',
  'function getJackpotAmounts() external view returns (uint256 mini, uint256 mega, uint256 super)',
  'function claimFaucet() external',
  'function hasClaimedFaucet(address player) external view returns (bool)',
  'function getShip(uint8 shipId) external view returns (uint8 id, string name, uint256 initialSpeed, uint256 acceleration, string chaosFactor, uint256 chaosChance)',
  'function startNewRace() external',
  'function finishRace(uint8 winnerId) external',
  'function debugRaceSimulation() external view returns (tuple(uint8 winner, uint8[8] placements, tuple(uint8 turn, uint8 shipId, uint256 moveAmount, uint256 distance, uint8 chaosEventType, uint8 targetShipId)[] turnEvents, uint256 totalEvents) raceResult)',
  'event BetPlaced(address indexed player, uint8 shipId, uint256 amount, uint256 payout, uint8 jackpotTier)',
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
  'function getPlayerComprehensiveStats(address player) external view returns (string memory username, uint8 avatarId, uint256 totalRaces, uint256 totalWinnings, uint256 biggestWin, uint256 firstPlace, uint256 secondPlace, uint256 thirdPlace, uint256 fourthPlace)'
]

// Helper function to get contract address
const getContractAddress = (chainId: string) => {
  return CONTRACT_ADDRESSES[chainId as keyof typeof CONTRACT_ADDRESSES] || null
}

// Global state to ensure all components use the same instance
let globalWeb3Instance: ReturnType<typeof createWeb3Composable> | null = null

// Create the actual composable function
const createWeb3Composable = () => {
  const isConnected = ref(false)
  const account = ref<string | null>(null)
  const balance = ref<string>('0')
  const spiralBalance = ref<string>('0')
  const walletType = ref<'metamask' | 'coinbase' | null>(null)
  const provider = ref<any>(null)
  const contract = ref<any>(null)
  const networkId = ref<string | null>(null)
  const isCorrectNetwork = ref(false)
  const currentRaceId = ref<number>(0)
  const contractInfo = ref<{
    minBet: string
    maxBet: string
    trackDistance: number
    raceTurns: number
  }>({
    minBet: '10',      // 10 SPIRAL
    maxBet: '1000',    // 1000 SPIRAL  
    trackDistance: 1000,
    raceTurns: 10
  })

  // Computed properties
  const shortAddress = computed(() => {
    if (!account.value) return ''
    return `${account.value.slice(0, 6)}...${account.value.slice(-4)}`
  })

  const formattedBalance = computed(() => {
    if (!balance.value) return '0 ETH'
    return `${parseFloat(ethers.utils.formatEther(balance.value)).toFixed(4)} ETH`
  })

  const formattedSpiralBalance = computed(() => {
    if (!spiralBalance.value) return '0 SPIRAL'
    return `${parseFloat(spiralBalance.value).toFixed(4)} SPIRAL`
  })

  // Check if we're on the correct network
  const checkNetwork = async (ethereum: any) => {
    try {
      const chainId = await ethereum.request({ method: 'eth_chainId' })
      networkId.value = chainId
      // Only support Localhost for now
      isCorrectNetwork.value = chainId === '0x539'
      return isCorrectNetwork.value
    } catch (error) {
      console.error('Failed to check network:', error)
      return false
    }
  }

  // Switch to Localhost (Hardhat)
  const switchToLocalhost = async (ethereum: any) => {
    try {
      await ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x539' }] // 0x539 = 1337
      })
      return true
    } catch (switchError: any) {
      if (switchError.code === 4902) {
        // Chain not added, try to add it
        try {
          await ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: '0x539',
              chainName: 'Localhost 8545',
              nativeCurrency: {
                name: 'Ethereum',
                symbol: 'ETH',
                decimals: 18
              },
              rpcUrls: ['http://localhost:8545'],
              blockExplorerUrls: []
            }]
          })
          return true
        } catch (addError: any) {
          console.warn('Failed to add localhost network:', addError)
          return false
        }
      }
      console.warn('Failed to switch to localhost:', switchError)
      return false
    }
  }

  // Switch to Sepolia Testnet
  const switchToSepolia = async (ethereum: any) => {
    try {
      await ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0xaa36a7' }] // 0xaa36a7 = 11155111
      })
      return true
    } catch (switchError: any) {
      if (switchError.code === 4902) {
        // Chain not added, try to add it
        try {
          await ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: '0xaa36a7',
              chainName: 'Sepolia Testnet',
              nativeCurrency: {
                name: 'Ethereum',
                symbol: 'ETH',
                decimals: 18
              },
              rpcUrls: ['https://rpc.sepolia.org'],
              blockExplorerUrls: ['https://sepolia.etherscan.io']
            }]
          })
          return true
        } catch (addError: any) {
          console.warn('Failed to add Sepolia network:', addError)
          return false
        }
      }
      console.warn('Failed to switch to Sepolia:', switchError)
      return false
    }
  }

  // Switch to Somnia Testnet
  const switchToSomniaTestnet = async (ethereum: any) => {
    try {
      await ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0xc478' }] // 0xc478 = 50312
      })
      return true
    } catch (switchError: any) {
      if (switchError.code === 4902) {
        // Chain not added, try to add it
        try {
          await ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: '0xc478',
              chainName: 'Somnia Testnet',
              nativeCurrency: {
                name: 'Somnia Test Token',
                symbol: 'STT',
                decimals: 18
              },
              rpcUrls: ['https://dream-rpc.somnia.network/'],
              blockExplorerUrls: ['https://shannon-explorer.somnia.network/']
            }]
          })
          return true
        } catch (addError: any) {
          console.warn('Failed to add Somnia network:', addError)
          return false
        }
      }
      console.warn('Failed to switch to Somnia:', switchError)
      return false
    }
  }



  // Initialize provider and contract
  const initializeProvider = async (ethereum: any) => {
    try {
      // Simple, clean MetaMask provider setup
      const web3Provider = new ethers.providers.Web3Provider(ethereum, 'any')
      
      // Get current network and contract address
      const chainId = await ethereum.request({ method: 'eth_chainId' })
      networkId.value = chainId
      const contractAddress = getContractAddress(chainId)
      
      if (!contractAddress) {
        throw new Error(`Contract not deployed on network ${chainId}. Please switch to Localhost, Sepolia, or Somnia.`)
      }
      
      // Create contract instance
      const contractInstance = new ethers.Contract(contractAddress, CONTRACT_ABI, web3Provider)
      
      provider.value = web3Provider
      contract.value = contractInstance
      
      console.log(`Connected to contract: ${contractAddress} on network: ${chainId}`)
      
      // Load contract info with error handling
      try {
        await loadContractInfo()
        console.log('Provider and contract initialized successfully')
      } catch (loadError) {
        console.warn('Failed to load contract info initially:', loadError)
      }
    } catch (error) {
      console.error('Failed to initialize provider:', error)
      throw new Error('Failed to initialize blockchain connection')
    }
  }

  // Load contract information
  const loadContractInfo = async () => {
    if (!contract.value) return
    
    try {
      // Use hardcoded values since constants are not in ABI
      // MIN_BET = 10 * 10^8, MAX_BET = 1000 * 10^8, TRACK_DISTANCE = 1000, RACE_TURNS = 10
      contractInfo.value = {
        minBet: '10',      // 10 SPIRAL
        maxBet: '1000',    // 1000 SPIRAL
        trackDistance: 1000,
        raceTurns: 10
      }
      
      // Load game stats including current race
      const gameStats = await contract.value.getGameStats()
      currentRaceId.value = Number(gameStats.gameCurrentRace)
      
      console.log('Contract info loaded:', contractInfo.value)
    } catch (error) {
      console.error('Failed to load contract info:', error)
    }
  }

  // Update balance
  const updateBalance = async () => {
    if (!account.value || !provider.value) return
    
    try {
      const balanceWei = await provider.value.getBalance(account.value)
      balance.value = balanceWei.toString()
      
      // Also update SPIRAL balance
      const spiralBal = await getSpiralBalance()
      spiralBalance.value = spiralBal
    } catch (error) {
      console.error('Failed to update balance:', error)
      balance.value = '0'
      spiralBalance.value = '0'
    }
  }

  // Connect MetaMask wallet
  const connectMetaMask = async () => {
    try {
      if (typeof window.ethereum === 'undefined') {
        throw new Error('MetaMask not installed')
      }

      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
      
      if (accounts.length === 0) {
        throw new Error('No accounts found')
      }

      // Check network (allow localhost, Sepolia, and Somnia)
      const isOnCorrectNetwork = await checkNetwork(window.ethereum)
      if (!isOnCorrectNetwork) {
        // Try to switch to localhost first (for development)
        console.log('Switching to localhost network...')
        const localhostSuccess = await switchToLocalhost(window.ethereum)
        if (!localhostSuccess) {
          console.log('Localhost not available, user needs to manually select network')
          throw new Error('Please manually switch to Localhost 8545, Sepolia, or Somnia Testnet in MetaMask')
        }
      }

      account.value = accounts[0]
      walletType.value = 'metamask'
      isConnected.value = true
      console.log('🔗 useWeb3: isConnected set to true, account:', accounts[0])

      await initializeProvider(window.ethereum)
      await updateBalance()

      // Set up event listeners
      setupEventListeners(window.ethereum)

      return true
    } catch (error: any) {
      console.error('Failed to connect MetaMask:', error)
      disconnect()
      throw error
    }
  }

  // Connect Coinbase Wallet
  const connectCoinbaseWallet = async () => {
    try {
      if (typeof window.ethereum === 'undefined' || !window.ethereum.isCoinbaseWallet) {
        throw new Error('Coinbase Wallet not detected')
      }

      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
      
      if (accounts.length === 0) {
        throw new Error('No accounts found')
      }

      const isOnCorrectNetwork = await checkNetwork(window.ethereum)
      if (!isOnCorrectNetwork) {
        await switchToSomniaTestnet(window.ethereum)
      }

      account.value = accounts[0]
      walletType.value = 'coinbase'
      isConnected.value = true
      console.log('🔗 useWeb3: isConnected set to true (coinbase), account:', accounts[0])

      await initializeProvider(window.ethereum)
      await updateBalance()

      setupEventListeners(window.ethereum)

      return true
    } catch (error: any) {
      console.error('Failed to connect Coinbase Wallet:', error)
      disconnect()
      throw error
    }
  }

  // Set up wallet event listeners
  const setupEventListeners = (ethereum: any) => {
    ethereum.on('accountsChanged', (accounts: string[]) => {
      if (accounts.length === 0) {
        disconnect()
      } else {
        account.value = accounts[0] || null
        updateBalance()
      }
    })

    ethereum.on('chainChanged', (chainId: string) => {
      networkId.value = chainId
      isCorrectNetwork.value = chainId === '0xc478'
      if (isCorrectNetwork.value) {
        updateBalance()
        loadContractInfo()
      }
    })

    ethereum.on('disconnect', () => {
      disconnect()
    })
  }

  // Disconnect wallet
  const disconnect = () => {
    isConnected.value = false
    account.value = null
    balance.value = '0'
    walletType.value = null
    provider.value = null
    contract.value = null
    networkId.value = null
    isCorrectNetwork.value = false
    currentRaceId.value = 0
    
    if (typeof window.ethereum !== 'undefined') {
      window.ethereum.removeAllListeners()
    }
  }

  // Place a bet on a ship and get race result
  // Check if approval is needed for betting
  const checkApprovalNeeded = async (amount: string) => {
    if (!account.value) {
      throw new Error('Wallet not connected')
    }
    
    try {
      const amountUnits = ethers.utils.parseUnits(amount.toString(), 8)
      const contractAddress = getContractAddress(networkId.value!)
      
      // Use SIGNER to ensure we're checking from the right account context
      const signer = provider.value.getSigner()
      const spiralABI = [
        'function allowance(address owner, address spender) external view returns (uint256)'
      ]
      const spiralContract = new ethers.Contract(SPIRAL_TOKEN_ADDRESS, spiralABI, signer)
      
      const allowance = await spiralContract.allowance(account.value, contractAddress)
      console.log('🔍 Allowance check (with signer):', ethers.utils.formatUnits(allowance, 8), 'Required:', amount)
      
      const needsApproval = allowance.lt(amountUnits)
      console.log('🔍 Final decision - Needs approval:', needsApproval)
      return needsApproval
    } catch (error) {
      console.error('Error checking approval:', error)
      // If we can't check, assume we need approval
      return true
    }
  }

  const placeBetAndGetRace = async (shipId: number, amount: string) => {
    if (!account.value || !provider.value || !contract.value) {
      throw new Error('Wallet not connected')
    }

    const signer = provider.value.getSigner()
    const contractAddress = contract.value.address
    const amountUnits = ethers.utils.parseUnits(amount, 8) // Convert to wei (8 decimals)

    console.log('🔍 Pre-transaction allowance check:')
    console.log('User:', account.value)
    console.log('Contract:', contractAddress)
    
    // Check allowance before placing bet
    const spiralTokenContract = new ethers.Contract(SPIRAL_TOKEN_ADDRESS, [
      'function allowance(address owner, address spender) external view returns (uint256)'
    ], signer);
    const allowance = await spiralTokenContract.allowance(account.value, contractAddress)
    console.log('Allowance:', allowance ? ethers.utils.formatUnits(allowance, 8) : 'Unknown')
    console.log('Required:', amount)
    
    if (allowance && allowance.lt(amountUnits)) {
      throw new Error('Insufficient token allowance. Please approve tokens first.')
    }

    // Retry logic for RPC errors
    const maxRetries = 3
    let lastError: any = null

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        // Small delay before first attempt to avoid network congestion
        if (attempt === 1) {
          await new Promise(resolve => setTimeout(resolve, 500))
        }
        
        console.log(`🚀 Attempt ${attempt}/${maxRetries} to place bet...`)
        
        // Create fresh contract instance to avoid proxy issues
        const freshContract = new ethers.Contract(contractAddress, CONTRACT_ABI, signer)
        
        // Estimate gas and add buffer to prevent gas estimation failures
        let gasEstimate
        try {
          if (freshContract.estimateGas && freshContract.estimateGas.placeBet) {
            gasEstimate = await freshContract.estimateGas.placeBet(shipId, amountUnits)
            // Add 20% buffer for safety
            gasEstimate = gasEstimate.mul(120).div(100)
            console.log('⛽ Gas estimate:', gasEstimate.toString())
          } else {
            throw new Error('Gas estimation not available')
          }
        } catch (gasError) {
          console.log('⚠️ Gas estimation failed, using default:', gasError)
          gasEstimate = ethers.BigNumber.from('500000') // Default gas limit
        }
        
        // Get current gas price and add small premium for faster processing
        const gasPrice = await provider.value.getGasPrice()
        const adjustedGasPrice = gasPrice.mul(110).div(100) // 10% premium
        console.log('⛽ Gas price:', ethers.utils.formatUnits(gasPrice, 'gwei'), 'gwei')
        console.log('⛽ Adjusted gas price:', ethers.utils.formatUnits(adjustedGasPrice, 'gwei'), 'gwei')
        
        // Place the bet with optimized parameters
        const tx = await freshContract.placeBet(shipId, amountUnits, {
          gasLimit: gasEstimate,
          gasPrice: adjustedGasPrice
        })
        const receipt = await tx.wait()
        
        console.log('Bet placed successfully:', receipt)
        console.log('Receipt events:', receipt.events)
        
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
          const betPlacedEvent = receipt.events.find((event: any) => event.event === 'BetPlaced')
          if (betPlacedEvent && betPlacedEvent.args) {
            actualPayout = ethers.utils.formatUnits(betPlacedEvent.args.payout, 8) // Convert from wei to SPIRAL
            jackpotTier = betPlacedEvent.args.jackpotTier
            console.log('📊 Real payout from contract:', actualPayout, 'SPIRAL')
            console.log('🎰 Jackpot tier:', jackpotTier)
          }
          
          // Get jackpot amount from JackpotHit event (if any)
          const jackpotHitEvent = receipt.events.find((event: any) => event.event === 'JackpotHit')
          if (jackpotHitEvent && jackpotHitEvent.args) {
            jackpotAmount = ethers.utils.formatUnits(jackpotHitEvent.args.amount, 8)
            console.log('🎰 Jackpot amount won:', jackpotAmount, 'SPIRAL')
            // Add jackpot amount to payout for total earnings
            const currentPayout = parseFloat(actualPayout)
            const jackpotValue = parseFloat(jackpotAmount)
            actualPayout = (currentPayout + jackpotValue).toString()
            console.log('💰 Total payout including jackpot:', actualPayout, 'SPIRAL')
          }
          
          // Get race result from RaceCompleted event
          const raceCompletedEvent = receipt.events.find((event: any) => event.event === 'RaceCompleted')
          if (raceCompletedEvent && raceCompletedEvent.args) {
            raceResult = {
              winner: raceCompletedEvent.args.winner,
              placements: raceCompletedEvent.args.placements,
              totalEvents: raceCompletedEvent.args.totalEvents,
              turnEvents: [] as any[] // We don't emit turn events in the event (too much data)
            }
            console.log('🏁 Real race result from contract (event only):', raceResult)
            console.log('🔍 Player bet on ship:', shipId, 'got placement:', 
              raceResult.placements.findIndex((ship: any) => ship.toString() === shipId.toString()) + 1)
            
            // Try to get turn events from debugRaceSimulation first
            console.log('🎬 Trying to get turn events from debugRaceSimulation...')
            try {
              const debugResult = await freshContract.debugRaceSimulation()
              if (debugResult && debugResult.turnEvents && debugResult.turnEvents.length > 0) {
                raceResult.turnEvents = debugResult.turnEvents
                console.log('✅ Got', debugResult.turnEvents.length, 'turn events from debugRaceSimulation')
              } else {
                console.log('⚠️ debugRaceSimulation returned no turn events, generating simulated race...')
                // Generate simulated race result based on placements
                const simulatedResult = generateSimulatedRaceResult(
                  Number(raceResult.winner), 
                  raceResult.placements.map((p: any) => Number(p))
                )
                raceResult.turnEvents = simulatedResult.turnEvents
              }
            } catch (error) {
              console.log('❌ debugRaceSimulation failed, generating simulated race...', error)
              // Generate simulated race result based on placements
              const simulatedResult = generateSimulatedRaceResult(
                Number(raceResult.winner), 
                raceResult.placements.map((p: any) => Number(p))
              )
              raceResult.turnEvents = simulatedResult.turnEvents
            }
          }
        }
        
        // If we didn't get race result from events, we can't reconstruct it
        // The race result should be available in the transaction events
        if (!raceResult) {
          console.log('⚠️ No RaceCompleted event found in transaction')
          // Create a minimal race result from the events we have
          raceResult = {
            winner: 0,
            placements: [0, 1, 2, 3, 4, 5, 6, 7],
            totalEvents: 0,
            turnEvents: [] as any[]
          }
        }
        
        await updateBalance()
        await loadContractInfo()
        
        return {
          receipt,
          raceResult,
          actualPayout,
          jackpotTier,
          jackpotAmount
        }
        
      } catch (error: any) {
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
          console.log(`🔄 Retrying in ${attempt * 2} seconds...`)
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
    if (!account.value || !provider.value) {
      throw new Error('Wallet not connected')
    }

    try {
      const signer = provider.value.getSigner()
      
      // Create SPIRAL token contract instance
      const spiralABI = [
        'function approve(address spender, uint256 amount) external returns (bool)',
        'function allowance(address owner, address spender) external view returns (uint256)'
      ]
      
      const spiralContract = new ethers.Contract(SPIRAL_TOKEN_ADDRESS, spiralABI, signer)
      const contractAddress = getContractAddress(networkId.value!)
      
      // Approve unlimited or specific amount
      const approveAmount = amount 
        ? ethers.utils.parseUnits(amount, 8)
        : ethers.constants.MaxUint256
      
      const tx = await spiralContract.approve(contractAddress, approveAmount)
      const receipt = await tx.wait()
      
      console.log('SPIRAL tokens approved:', receipt)
      return receipt
    } catch (error: any) {
      console.error('Failed to approve tokens:', error)
      throw new Error(error.reason || error.message || 'Failed to approve tokens')
    }
  }

  // Legacy betting function for compatibility
  const placeBet = async (shipId: number, amount: string) => {
    return placeBetAndGetRace(shipId, amount)
  }

  // Get current race information (using available functions)
  const getCurrentRaceInfo = async () => {
    if (!contract.value) return null
    
    try {
      // Use getGameStats instead of getRaceInfo which doesn't exist
      const gameStats = await contract.value.getGameStats()
      return {
        raceId: gameStats.gameCurrentRace?.toString() || '0',
        totalBets: gameStats.gameTotalVolume?.toString() || '0',
        totalRaces: gameStats.gameTotalRaces?.toString() || '0',
        isActive: true // Assume always active for now
      }
    } catch (error) {
      console.error('Failed to get race info:', error)
      return null
    }
  }

  // Get ship betting totals
  const getShipBets = async (raceId: number) => {
    if (!contract.value) return Array(8).fill('0')
    
    try {
      const bets = await contract.value.getShipBets(raceId)
      if (!bets || !Array.isArray(bets)) {
        console.log('No bets found for race', raceId, 'returning default array')
        return Array(8).fill('0')
      }
      return bets.map((bet: any) => ethers.utils.formatUnits(bet, 8))
    } catch (error) {
      console.error('Failed to get ship bets:', error)
      return Array(8).fill('0')
    }
  }

  // Get player's bet for a race
  const getPlayerBets = async (raceId: number) => {
    if (!contract.value || !account.value) return null
    
    try {
      const bet = await contract.value.getPlayerBets(account.value, raceId)
      if (bet.amount && Number(bet.amount) > 0) {
        return {
          spaceship: Number(bet.spaceship),
          amount: ethers.utils.formatUnits(bet.amount, 8),
          claimed: bet.claimed
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
    if (!contract.value || !account.value) {
      throw new Error('Wallet not connected')
    }
    
    try {
      const signer = provider.value.getSigner()
      const contractWithSigner = contract.value.connect(signer)
      
      const tx = await contractWithSigner.claimWinnings(raceId)
      const receipt = await tx.wait()
      
      await updateBalance()
      
      console.log('Winnings claimed successfully:', receipt)
      return receipt
    } catch (error: any) {
      console.error('Failed to claim winnings:', error)
      throw new Error(error.reason || error.message || 'Failed to claim winnings')
    }
  }

  // Get player statistics
  const getPlayerStats = async () => {
    if (!contract.value || !account.value) return null
    
    try {
      const stats = await contract.value.getPlayerStats(account.value)
      return {
        totalRaces: stats.playerTotalRaces?.toString() || '0',
        totalWinnings: ethers.utils.formatUnits(stats.playerTotalWinnings || '0', 8),
        biggestWin: ethers.utils.formatUnits(stats.playerBiggestWin || '0', 8),
        highestJackpotTier: stats.playerHighestJackpotTier?.toString() || '0',
        achievementRewards: ethers.utils.formatUnits(stats.playerAchievementRewards || '0', 8),
        spaceshipWins: stats.playerSpaceshipWins || Array(8).fill('0')
      }
    } catch (error) {
      console.error('Failed to get player stats:', error)
      return null
    }
  }

  // Get player achievement count
  const getPlayerAchievementCount = async () => {
    if (!contract.value || !account.value) return 0
    
    try {
      const count = await contract.value.getPlayerAchievementsCount(account.value)
      return Number(count)
    } catch (error) {
      console.error('Failed to get achievement count:', error)
      return 0
    }
  }

  // Get SPIRAL token balance
  const getSpiralBalance = async () => {
    if (!account.value) return '0'
    
    try {
      const spiralABI = [
        'function balanceOf(address owner) external view returns (uint256)'
      ]
      const signer = provider.value.getSigner()
      const spiralContract = new ethers.Contract(SPIRAL_TOKEN_ADDRESS, spiralABI, signer)
      
      const balance = await spiralContract.balanceOf(account.value)
      return ethers.utils.formatUnits(balance, 8)
    } catch (error) {
      console.error('Failed to get SPIRAL balance:', error)
      return '0'
    }
  }

  const getJackpotAmounts = async () => {
    if (!contract.value) {
      return { mini: '0', mega: '0', super: '0' }
    }

    try {
      const [mini, mega, superJackpotAmount] = await contract.value.getJackpotAmounts()
      
      return {
        mini: ethers.utils.formatUnits(mini, 8),
        mega: ethers.utils.formatUnits(mega, 8), 
        super: ethers.utils.formatUnits(superJackpotAmount, 8)
      }
    } catch (error) {
      console.error('Error getting jackpot amounts:', error)
      return { mini: '0', mega: '0', super: '0' }
    }
  }

  // SPIRAL Token Faucet Functions
  const claimFaucet = async () => {
    if (!account.value || !provider.value) {
      throw new Error('Wallet not connected')
    }

    try {
      const signer = provider.value.getSigner()
      const contractAddress = getContractAddress(networkId.value!)
      if (!contractAddress) {
        throw new Error('Contract address not found for current network')
      }
      
      // Create a fresh contract instance to avoid proxy issues
      const freshContract = new ethers.Contract(contractAddress, CONTRACT_ABI, signer)
      
      const tx = await freshContract.claimFaucet()
      const receipt = await tx.wait()
      
      console.log('Faucet claimed successfully:', receipt)
      
      // Update balance after a delay
      setTimeout(() => updateBalance(), 2000)
      
      return receipt
    } catch (error: any) {
      console.error('Failed to claim faucet:', error)
      throw new Error(error.reason || error.message || 'Failed to claim faucet')
    }
  }

  const hasClaimedFaucet = async (address?: string) => {
    if (!contract.value) {
      console.log('❌ No contract available for faucet check')
      return false
    }
    
    try {
      const addressToCheck = address || account.value
      if (!addressToCheck) {
        console.log('❌ No address provided for faucet check')
        return false
      }
      
      console.log('🔍 Checking faucet for address:', addressToCheck)
      const claimed = await contract.value.hasClaimedFaucet(addressToCheck)
      console.log('🔍 Contract returned hasClaimedFaucet:', claimed)
      return claimed
    } catch (error) {
      console.error('Failed to check faucet status:', error)
      return false
    }
  }

  // Get ship information
  const getShip = async (shipId: number) => {
    if (!contract.value) return null
    
    try {
      const ship = await contract.value.getShip(shipId)
      return {
        id: Number(ship.id),
        name: ship.name,
        initialSpeed: Number(ship.initialSpeed),
        acceleration: Number(ship.acceleration),
        chaosFactor: ship.chaosFactor,
        chaosChance: Number(ship.chaosChance)
      }
    } catch (error) {
      console.error('Failed to get ship info:', error)
      return null
    }
  }

  // Owner functions
  const startNewRace = async () => {
    if (!contract.value || !account.value) {
      throw new Error('Wallet not connected')
    }
    
    try {
      const signer = provider.value.getSigner()
      const contractWithSigner = contract.value.connect(signer)
      
      const tx = await contractWithSigner.startNewRace()
      const receipt = await tx.wait()
      
      await loadContractInfo()
      
      console.log('New race started successfully:', receipt)
      return receipt
    } catch (error: any) {
      console.error('Failed to start new race:', error)
      throw new Error(error.reason || error.message || 'Failed to start new race')
    }
  }

  const finishRace = async (winnerId: number) => {
    if (!contract.value || !account.value) {
      throw new Error('Wallet not connected')
    }
    
    try {
      const signer = provider.value.getSigner()
      const contractWithSigner = contract.value.connect(signer)
      
      const tx = await contractWithSigner.finishRace(winnerId)
      const receipt = await tx.wait()
      
      await loadContractInfo()
      
      console.log('Race finished successfully:', receipt)
      return receipt
    } catch (error: any) {
      console.error('Failed to finish race:', error)
      throw new Error(error.reason || error.message || 'Failed to finish race')
    }
  }

  // Race reconstruction functions
  const getShipNames = () => [
    'Comet', 'Juggernaut', 'Shadow', 'Phantom', 
    'Phoenix', 'Vanguard', 'Wildcard', 'Apex'
  ]

  const getShipColors = () => [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
    '#FECA57', '#FF9FF3', '#54A0FF', '#5F27CD'
  ]

  const getChaosEventText = (eventType: number, shipId: number, targetId?: number) => {
    const shipNames = getShipNames()
    
    switch (eventType) {
      case 1: return `🔥 ${shipNames[shipId]} activates Overdrive!`
      case 2: return `⚡ ${shipNames[shipId]}'s Unstable Engine surges!`
      case 3: return `💨 ${shipNames[shipId]} catches a Slipstream!`
      case 4: return `🌀 ${shipNames[shipId]} uses Quantum Tunneling!`
      case 5: return `🚀 ${shipNames[shipId]} activates Last Stand Protocol!`
      case 6: return `⚡ ${shipNames[shipId]}'s Micro-warp Engine activates!`
      case 7: return `🤖 ${shipNames[shipId]}'s Rogue AI takes control!`
      case 8: return `🛑 ${shipNames[shipId]} uses Graviton Brake on ${shipNames[targetId || 0]}!`
      case 9: return `💥 ${shipNames[shipId]} was slowed by Graviton Brake!`
      default: return ''
    }
  }

  // Get a debug race simulation
  const getDebugRaceSimulation = async () => {
    if (!contract.value) return null
    
    try {
      const result = await contract.value.debugRaceSimulation()
      return result
    } catch (error) {
      console.error('Failed to get debug race simulation:', error)
      return null
    }
  }

  // Generate a simulated race result when contract doesn't have turn events
  const generateSimulatedRaceResult = (winner: number, placements: number[]) => {
    console.log('🎬 Generating simulated race result for animation...')
    
    const turnEvents: any[] = []
    const trackDistance = 1000
    const raceTurns = 10
    
    // Create ship states with final positions based on placements
    const shipStates = placements.map((shipId, index) => ({
      shipId,
      finalDistance: trackDistance - index, // 1st = 1000, 2nd = 999, etc.
      finalTurn: Math.min(raceTurns, 8 + index) // Earlier finishers finish in earlier turns
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
        const moveAmount = turn === 1 ? currentDistance : currentDistance - (progressPerTurn * (turn - 1))
        
        // Add some randomness to make it more interesting
        const randomFactor = 0.8 + Math.random() * 0.4 // 0.8 to 1.2
        const adjustedMoveAmount = Math.floor(moveAmount * randomFactor)
        const adjustedDistance = Math.min(shipState.finalDistance, 
          turn === 1 ? adjustedMoveAmount : 
          (progressPerTurn * (turn - 1)) + adjustedMoveAmount
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
          targetShipId
        })
      }
    }
    
    console.log('🎬 Generated', turnEvents.length, 'simulated turn events')
    
    return {
      winner,
      placements,
      turnEvents,
      totalEvents: turnEvents.length
    }
  }

  // Reconstruct race from blockchain turnEvents data
  const reconstructRaceFromBlockchain = (contractRaceResult: any) => {
    console.log('🔍 Reconstructing race from blockchain data:', contractRaceResult)
    console.log('🔍 Turn events from blockchain:', contractRaceResult.turnEvents)
    console.log('🔍 Winner from blockchain:', contractRaceResult.winner)
    console.log('🔍 Placements from blockchain:', contractRaceResult.placements)
    
    // Import SHIPS_ROSTER to get the proper ship data
    // SHIPS_ROSTER is already imported at the top of the file

    // Initialize race states for all ships (using 0-7 IDs)
    const raceStates: any[] = []
    for (let shipId = 0; shipId <= 7; shipId++) {
      const shipData = SHIPS_ROSTER.find((ship: any) => ship.id === shipId)
      raceStates.push({
        id: shipId, // 0-7 IDs
        name: shipData?.name || 'Unknown',
        color: shipData?.color || '#ffffff',
        stats: shipData?.stats || { initialSpeed: 0, acceleration: 0 },
        chaosFactor: shipData?.chaosFactor || '',
        currentSpeed: 0,
        distance: 0,
        finalTurn: 0
      })
    }

    console.log('🔍 Initial race states:', raceStates.map(s => ({ id: s.id, name: s.name })))

    // Process turn events from blockchain
    const replayLog: any[] = []
    const chaosEvents: any[] = []
    
    // Group events by turn
    const turnEvents = contractRaceResult.turnEvents || []
    const maxTurn = turnEvents.length > 0 ? Math.max(...turnEvents.map((e: any) => e.turn)) : 0
    
    console.log('🔍 Max turn from blockchain:', maxTurn)
    console.log('🔍 Total turn events:', turnEvents.length)
    
    // Track final positions for each ship
    const finalPositions: { [shipId: number]: number } = {}
    
    for (let turn = 1; turn <= maxTurn; turn++) {
      const turnEvents = contractRaceResult.turnEvents.filter((e: any) => e.turn === turn)
      console.log(`🔍 Turn ${turn} events:`, turnEvents)
      
      for (const event of turnEvents) {
        const shipId = Number(event.shipId) // Already 0-7
        const moveAmount = Number(event.moveAmount)
        const distance = Number(event.distance)
        const chaosEventType = Number(event.chaosEventType)
        const targetShipId = Number(event.targetShipId)

        console.log(`🔍 Processing event - Ship ${shipId} (${raceStates[shipId]?.name}): distance=${distance}, moveAmount=${moveAmount}, chaosEventType=${chaosEventType}`)

        // Track the final position for each ship
        finalPositions[shipId] = distance

        // Add to replay log (using 0-7 IDs)
        replayLog.push({
          turn,
          shipId: shipId, // 0-7 ID
          moveAmount,
          distance,
          event: chaosEventType > 0 ? {
            type: chaosEventType.toString(),
            text: getChaosEventText(chaosEventType, shipId, targetShipId),
            targetId: targetShipId > 0 ? targetShipId : undefined
          } : undefined
        })

        // Add chaos events
        if (chaosEventType > 0) {
          chaosEvents.push({
            type: chaosEventType.toString(),
            text: getChaosEventText(chaosEventType, shipId, targetShipId),
            targetId: targetShipId > 0 ? targetShipId : undefined
          })
        }
      }
    }

    // Update race states with final blockchain positions
    for (let shipId = 0; shipId <= 7; shipId++) {
      raceStates[shipId].distance = finalPositions[shipId] || 0
    }

    console.log('📊 Final blockchain positions:', finalPositions)
    console.log('🏁 Race states with final positions:', raceStates.map((s: any) => ({ id: s.id, name: s.name, distance: s.distance })))
    console.log('📋 Replay log summary:', replayLog.map((r: any) => ({ turn: r.turn, shipId: r.shipId, distance: r.distance })))

    // Set winner based on placements (already 0-7 IDs)
    const winnerId = Number(contractRaceResult.winner)
    const winner = raceStates[winnerId] // Array is 0-indexed

    // Convert placements (already 0-7 IDs)
    const placements = contractRaceResult.placements.map((p: any) => Number(p))

    console.log('🏆 Winner ID from blockchain:', winnerId, 'Winner name:', winner?.name)
    console.log('🏆 Placements from blockchain:', placements)
    console.log('🏆 Placements with names:', placements.map((p: number, i: number) => `${i+1}st: ${raceStates[p]?.name} (ID: ${p})`))

    // CRITICAL FIX: Update final positions based on actual blockchain results
    // The placements array shows the order they finished, so we need to set distances accordingly
    const trackDistance = 1000
    placements.forEach((shipId: number, index: number) => {
      // Calculate final distance based on placement
      // 1st place = 1000, 2nd place = 999, 3rd place = 998, etc.
      const finalDistance = trackDistance - index
      raceStates[shipId].distance = finalDistance
      console.log(`🏁 Setting ${raceStates[shipId].name} (ID: ${shipId}) to distance ${finalDistance} (${index + 1}st place)`)
    })

    console.log('🏁 FINAL Race states after placement correction:', raceStates.map((s: any) => ({ id: s.id, name: s.name, distance: s.distance })))

    return {
      raceStates,
      winner,
      replayLog,
      chaosEvents,
      placements
    }
  }

  // Animate race progression for frontend - PURE BLOCKCHAIN REPLAY
  const animateRaceProgression = async (raceData: any, onTurnUpdate: (turn: number, states: any[], events: any[]) => void) => {
    const { replayLog, raceStates } = raceData
    const maxTurn = Math.max(...replayLog.map((log: any) => log.turn))

    console.log('🎬 Starting pure blockchain replay with', replayLog.length, 'events across', maxTurn, 'turns')
    console.log('🎬 Initial race states:', raceStates.map((s: any) => ({ id: s.id, name: s.name, distance: s.distance })))

    // CRITICAL FIX: Start all ships from distance 0 for proper animation
    const initialStates = raceStates.map((state: any) => ({ ...state, distance: 0 }))
    console.log('🎬 Starting animation from distance 0:', initialStates.map((s: any) => ({ id: s.id, name: s.name, distance: s.distance })))

    // Track current positions throughout animation
    let currentPositions = initialStates.map((state: any) => ({ ...state }))

    for (let turn = 1; turn <= maxTurn; turn++) {
      const turnEvents = replayLog.filter((log: any) => log.turn === turn)
      console.log(`🔄 Turn ${turn}: Processing ${turnEvents.length} events`)

      const turnChaosEvents: any[] = []

      for (const event of turnEvents) {
        const shipId = event.shipId // Already 0-7 ID
        
        // Update the ship's position to the EXACT blockchain position
        if (shipId >= 0 && shipId < currentPositions.length) {
          const oldDistance = currentPositions[shipId].distance
          currentPositions[shipId].distance = event.distance
          console.log(`🚀 Ship ${shipId} (${currentPositions[shipId].name}) position: ${oldDistance} -> ${event.distance}`)
        }
        
        // Add chaos event if present, including the shipId that triggered it
        if (event.event) {
          turnChaosEvents.push({
            ...event.event,
            shipId: shipId // Add the ship ID that triggered this event
          })
          console.log(`⚡ Chaos event: ${event.event.text} on ship ${shipId}`)
        }
      }
      console.log(`🔄 Turn ${turn} final states:`, currentPositions.map((s: any) => ({ id: s.id, name: s.name, distance: s.distance })))
      onTurnUpdate(turn, currentPositions, turnChaosEvents)
      await new Promise(resolve => setTimeout(resolve, 800))
    }
    console.log('✅ Blockchain replay completed')
  }

  // ==================== USERNAME FUNCTIONS ====================
  
  const registerUsername = async (username: string, avatarId: number = 0) => {
    if (!account.value || !provider.value || !networkId.value) {
      throw new Error('Wallet not connected')
    }
    
    try {
      const signer = provider.value.getSigner()
      const contractAddress = getContractAddress(networkId.value)
      if (!contractAddress) {
        throw new Error('Contract not found on current network')
      }
      const contractWithSigner = new ethers.Contract(
        contractAddress,
        CONTRACT_ABI,
        signer
      )
      const tx = await contractWithSigner.registerUsername(username, avatarId)
      await tx.wait()
      return tx
    } catch (error: any) {
      console.error('Failed to register username:', error)
      throw new Error(error.reason || error.message || 'Failed to register username')
    }
  }
  
  const getUsername = async (playerAddress?: string) => {
    try {
      if (!provider.value || !networkId.value) throw new Error('Provider not available')
      
      const contractAddress = getContractAddress(networkId.value)
      if (!contractAddress) throw new Error('Contract not found on current network')
      
      const contract = new ethers.Contract(
        contractAddress,
        CONTRACT_ABI,
        provider.value
      )
      const address = playerAddress || account.value
      if (!address) throw new Error('No address provided')
      
      const username = await contract.getUsername(address)
      return username
    } catch (error: any) {
      console.error('Failed to get username:', error)
      return ''
    }
  }
  
  const playerHasUsername = async (playerAddress?: string) => {
    try {
      if (!provider.value) {
        console.log('❌ No provider available')
        return false
      }
      
      const contractAddress = getContractAddress(networkId.value!)
      if (!contractAddress) {
        console.log('❌ No contract address found for network:', networkId.value)
        return false
      }
      
      console.log('🔍 Creating contract with address:', contractAddress)
      console.log('🔍 Provider:', provider.value)
      console.log('🔍 ABI length:', CONTRACT_ABI.length)
      
      const contract = new ethers.Contract(
        contractAddress,
        CONTRACT_ABI,
        provider.value
      )
      
      const address = playerAddress || account.value
      if (!address) {
        console.log('❌ No address provided')
        return false
      }
      
      console.log('🔍 Checking username for address:', address)
      const hasUsername = await contract.playerHasUsername(address)
      console.log('🔍 Contract returned hasUsername:', hasUsername)
      return hasUsername
    } catch (error: any) {
      console.error('Failed to check username:', error)
      return false
    }
  }
  
  const getAddressByUsername = async (username: string) => {
    try {
      if (!provider.value) return '0x0000000000000000000000000000000000000000'
      
      const contract = new ethers.Contract(
        getContractAddress(networkId.value!),
        CONTRACT_ABI,
        provider.value
      )
      const address = await contract.getAddressByUsername(username)
      return address
    } catch (error: any) {
      console.error('Failed to get address by username:', error)
      return '0x0000000000000000000000000000000000000000'
    }
  }

  const getPlayerAvatar = async (playerAddress?: string) => {
    try {
      if (!provider.value) return 255
      
      const contract = new ethers.Contract(
        getContractAddress(networkId.value!),
        CONTRACT_ABI,
        provider.value
      )
      const address = playerAddress || account.value
      if (!address) return 255
      
      const avatarId = await contract.getPlayerAvatar(address)
      // uint8 returns as a number directly, no need for .toNumber()
      return Number(avatarId)
    } catch (error: any) {
      console.error('Failed to get player avatar:', error)
      return 255
    }
  }
  
  // ==================== MATCH HISTORY FUNCTIONS ====================
  
  const getPlayerMatchHistory = async (playerAddress?: string, offset = 0, limit = 10) => {
    try {
      if (!provider.value) return { matches: [], totalMatches: 0 }
      
      const contract = new ethers.Contract(
        getContractAddress(networkId.value!),
        CONTRACT_ABI,
        provider.value
      )
      const address = playerAddress || account.value
      if (!address) throw new Error('No address provided')
      
      const [matches, totalMatches] = await contract.getPlayerMatchHistory(address, offset, limit)
      
      // Format the matches data
      const formattedMatches = matches.map((match: any) => ({
        raceId: match.raceId.toString(),
        timestamp: new Date(match.timestamp.toNumber() * 1000),
        shipBet: match.shipBet,
        betAmount: ethers.utils.formatUnits(match.betAmount, 8),
        placement: match.placement,
        payout: ethers.utils.formatUnits(match.payout, 8),
        jackpotTier: match.jackpotTier,
        jackpotAmount: ethers.utils.formatUnits(match.jackpotAmount, 8)
      }))
      
      return {
        matches: formattedMatches,
        totalMatches: totalMatches.toNumber()
      }
    } catch (error: any) {
      console.error('Failed to get match history:', error)
      return { matches: [], totalMatches: 0 }
    }
  }
  
  const getRecentMatches = async (playerAddress?: string, count = 5) => {
    try {
      if (!provider.value) return []
      
      const contract = new ethers.Contract(
        getContractAddress(networkId.value!),
        CONTRACT_ABI,
        provider.value
      )
      const address = playerAddress || account.value
      if (!address) throw new Error('No address provided')
      
      const matches = await contract.getRecentMatches(address, count)
      
      // Format the matches data
      const formattedMatches = matches.map((match: any) => ({
        raceId: match.raceId.toString(),
        timestamp: new Date(match.timestamp.toNumber() * 1000),
        shipBet: match.shipBet,
        betAmount: ethers.utils.formatUnits(match.betAmount, 8),
        placement: match.placement,
        payout: ethers.utils.formatUnits(match.payout, 8),
        jackpotTier: match.jackpotTier,
        jackpotAmount: ethers.utils.formatUnits(match.jackpotAmount, 8)
      }))
      
      return formattedMatches
    } catch (error: any) {
      console.error('Failed to get recent matches:', error)
      return []
    }
  }
  
  // ==================== LEADERBOARD FUNCTIONS ====================
  
  const getTopPlayersByWinnings = async (limit = 10) => {
    try {
      if (!provider.value) return { players: [], usernames: [], avatars: [], winnings: [] }
      
      const contract = new ethers.Contract(
        getContractAddress(networkId.value!),
        CONTRACT_ABI,
        provider.value
      )
      const [players, usernames, avatars, winnings] = await contract.getTopPlayersByWinnings(limit)
      
      return {
        players,
        usernames,
        avatars: avatars.map((a: any) => Number(a)), // uint8 returns as number, not BigNumber
        winnings: winnings.map((w: any) => ethers.utils.formatUnits(w, 8))
      }
    } catch (error: any) {
      console.error('Failed to get top players:', error)
      return { players: [], usernames: [], avatars: [], winnings: [] }
    }
  }
  
  const getPlayerLeaderboardStats = async (playerAddress?: string) => {
    try {
      if (!provider.value) {
        return {
          totalWinningsRank: 0,
          firstPlaceCount: 0,
          secondPlaceCount: 0,
          thirdPlaceCount: 0,
          fourthPlaceCount: 0,
          totalJackpots: '0',
          totalAchievements: 0
        }
      }
      
      const contract = new ethers.Contract(
        getContractAddress(networkId.value!),
        CONTRACT_ABI,
        provider.value
      )
      const address = playerAddress || account.value
      if (!address) throw new Error('No address provided')
      
      const [
        totalWinningsRank,
        firstPlaceCount,
        secondPlaceCount,
        thirdPlaceCount,
        fourthPlaceCount,
        totalJackpots,
        totalAchievements
      ] = await contract.getPlayerLeaderboardStats(address)
      
      return {
        totalWinningsRank: totalWinningsRank.toNumber(),
        firstPlaceCount: firstPlaceCount.toNumber(),
        secondPlaceCount: secondPlaceCount.toNumber(),
        thirdPlaceCount: thirdPlaceCount.toNumber(),
        fourthPlaceCount: fourthPlaceCount.toNumber(),
        totalJackpots: ethers.utils.formatUnits(totalJackpots, 8),
        totalAchievements: totalAchievements.toNumber()
      }
    } catch (error: any) {
      console.error('Failed to get leaderboard stats:', error)
      return {
        totalWinningsRank: 0,
        firstPlaceCount: 0,
        secondPlaceCount: 0,
        thirdPlaceCount: 0,
        fourthPlaceCount: 0,
        totalJackpots: '0',
        totalAchievements: 0
      }
    }
  }

  const getLeaderboardStats = async () => {
    try {
      if (!provider.value) return null
      
      const contract = new ethers.Contract(
        getContractAddress(networkId.value!),
        CONTRACT_ABI,
        provider.value
      )
      
      const [totalPlayers, totalVolume, totalJackpots] = await contract.getLeaderboardStats()
      
      return {
        totalPlayers: totalPlayers.toNumber(),
        totalVolume: ethers.utils.formatUnits(totalVolume, 8),
        totalJackpots: ethers.utils.formatUnits(totalJackpots, 8)
      }
    } catch (error: any) {
      console.error('Failed to get leaderboard stats:', error)
      return null
    }
  }

  const getPlayerComprehensiveStats = async (playerAddress?: string) => {
    try {
      if (!provider.value) return null
      
      const contract = new ethers.Contract(
        getContractAddress(networkId.value!),
        CONTRACT_ABI,
        provider.value
      )
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
        fourthPlace
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
        achievementCount: 0 // This would need to be implemented separately
      }
    } catch (error: any) {
      console.error('Failed to get comprehensive stats:', error)
      return null
    }
  }

  // ==================== ID MAPPING FUNCTIONS ====================
  
  // Convert frontend ID (1-8) to contract ID (0-7)
  const frontendToContractId = (frontendId: number) => {
    return frontendId - 1
  }
  
  // Convert contract ID (0-7) to frontend ID (1-8)
  const contractToFrontendId = (contractId: number) => {
    return contractId + 1
  }
  
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
    isConnected,
    account,
    isCorrectNetwork,
    currentRaceId,
    shortAddress,
    formattedBalance,
    formattedSpiralBalance,
    walletType,
    connectMetaMask,
    connectCoinbaseWallet,
    disconnect,
    updateBalance,
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
    getLeaderboardStats,
    getPlayerComprehensiveStats,
    checkApprovalNeeded,
    generateSimulatedRaceResult
  }
}

// Export the singleton function
export const useWeb3 = () => {
  if (!globalWeb3Instance) {
    globalWeb3Instance = createWeb3Composable()
  }
  return globalWeb3Instance
} 