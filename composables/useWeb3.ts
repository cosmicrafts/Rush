import { ethers } from 'ethers'
import { ref, computed, watch } from 'vue'
import { SHIPS_ROSTER } from '../data/ships'

// Extend Window interface for ethereum
declare global {
  interface Window {
    ethereum?: any
    coinbaseWalletExtension?: any
  }
}

// Contract addresses for different networks
// Update these when deploying to new networks
const CONTRACT_ADDRESSES = {
  // Localhost (Hardhat) - Chain ID: 0x539 (1337) - Latest deployment with 8 decimals
  '0x539': '0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9',
  
  // Sepolia Testnet - Chain ID: 0xaa36a7 (11155111) 
  // Run: npx hardhat run scripts/deploy-modular.js --network sepolia
  '0xaa36a7': '', // TODO: Add Sepolia deployment address
  
  // Somnia Testnet - Chain ID: 0xc478 (50312)
  // Run: npx hardhat run scripts/deploy-modular.js --network somnia  
  '0xc478': ''  // TODO: Add Somnia deployment address
}

// SPIRAL Token contract address (same across all networks)
const SPIRAL_TOKEN_ADDRESS = '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0'

// Get contract address for current network
const getContractAddress = (chainId: string) => {
  return CONTRACT_ADDRESSES[chainId as keyof typeof CONTRACT_ADDRESSES] || CONTRACT_ADDRESSES['0x539'] // Default to localhost
}

// Contract ABI (updated for new modular contracts)
const CONTRACT_ABI = [
  // Betting functions - Updated for SPIRAL token  
  'function placeBet(uint8 spaceship, uint256 amount) external returns (tuple(uint8 winner, uint8[8] placements, tuple(uint8 turn, uint8 shipId, uint256 moveAmount, uint256 distance, uint8 chaosEventType, uint8 targetShipId)[] turnEvents, uint256 totalEvents) raceResult)',
  
  // Race simulation and debugging
  'function debugRaceSimulation() external view returns (tuple(uint8 winner, uint8[8] placements, tuple(uint8 turn, uint8 shipId, uint256 moveAmount, uint256 distance, uint8 chaosEventType, uint8 targetShipId)[] turnEvents, uint256 totalEvents) raceResult)',
  
  // Ship configuration
  'function getSpaceshipInfo(uint8 spaceshipId) external view returns (uint256 initialSpeed, uint256 acceleration, uint8 chaosFactor, uint8 chaosChance)',
  
  // Game statistics
  'function getGameStats() external view returns (uint256 gameCurrentRace, uint256 gameTotalRaces, uint256 gameTotalVolume, uint256 gameMiniJackpot, uint256 gameMegaJackpot, uint256 gameSuperJackpot)',
  'function getPlayerStats(address player) external view returns (uint256 playerTotalRaces, uint256 playerTotalWinnings, uint256 playerBiggestWin, uint8 playerHighestJackpotTier, uint256 playerAchievementRewards, uint256[8] playerSpaceshipWins)',
  
  // Achievement tracking
  'function getPlayerAchievementsCount(address player) external view returns (uint256)',
  'function spaceshipPlacementCount(address player, uint8 spaceshipId, uint8 placement) external view returns (uint256)',
  
  // Constants (hardcoded values from contract)
  // MIN_BET = 10 * 10^8, MAX_BET = 1000 * 10^8, TRACK_DISTANCE = 1000, RACE_TURNS = 10
  
  // Faucet functions
  'function claimFaucet() external',
  'function hasClaimedFaucet(address user) external view returns (bool)',
  
  // Betting interface functions
  'function getRaceInfo(uint256 raceId) external view returns (bool isActive, uint256 totalBets, uint256[8] shipBetsArray, uint256 prizePool)',
  'function getShipBets(uint256 raceId) external view returns (uint256[8] shipBetsArray)',
  'function getPlayerBets(address player, uint256 raceId) external view returns (uint8 spaceship, uint256 amount, bool claimed)',
  'function getCurrentRaceInfo() external view returns (bool isActive, uint256 totalBets, uint256[8] shipBetsArray, uint256 prizePool)',
  
  // Jackpot functions
  'function getJackpotAmounts() external view returns (uint256 mini, uint256 mega, uint256 superJackpotAmount)',
  
  // Events  
  'event BetPlaced(address indexed player, uint8 spaceship, uint256 amount, uint8 winner, uint256 payout, uint8 jackpotTier)',
  'event RaceCompleted(address indexed player, uint8 winner, uint8[8] placements, uint256 totalEvents)',
  'event AchievementUnlocked(address indexed player, string name, uint256 nftId, uint256 tokenReward)',
  'event JackpotHit(address indexed player, uint8 tier, uint256 amount)',
  'event FaucetClaimed(address indexed player, uint256 amount)',
  'event UsernameRegistered(address indexed player, string username)',
  'event MatchRecorded(address indexed player, uint256 raceId, uint8 placement, uint256 payout)',
  
  // Username functions
  'function registerUsername(string calldata username) external',
  'function getUsername(address player) external view returns (string memory username)',
  'function getAddressByUsername(string calldata username) external view returns (address player)',
  'function playerHasUsername(address player) external view returns (bool hasRegistered)',
  
  // Match history functions
  'function getPlayerMatchHistory(address player, uint256 offset, uint256 limit) external view returns (tuple(uint256 raceId, uint256 timestamp, uint8 shipBet, uint256 betAmount, uint8 placement, uint256 payout, uint8 jackpotTier, uint256 jackpotAmount)[] matches, uint256 totalMatches)',
  'function getRecentMatches(address player, uint256 count) external view returns (tuple(uint256 raceId, uint256 timestamp, uint8 shipBet, uint256 betAmount, uint8 placement, uint256 payout, uint8 jackpotTier, uint256 jackpotAmount)[] matches)',
  
  // Leaderboard functions
  'function getTopPlayersByWinnings(uint256 limit) external view returns (address[] players, string[] usernames, uint256[] winnings)',
  'function getPlayerLeaderboardStats(address player) external view returns (uint256 totalWinningsRank, uint256 firstPlaceCount, uint256 secondPlaceCount, uint256 thirdPlaceCount, uint256 fourthPlaceCount, uint256 totalJackpots, uint256 totalAchievements)'
]

export const useWeb3 = () => {
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
      // Supported networks: Localhost (0x539), Sepolia (0xaa36a7), Somnia (0xc478)
      isCorrectNetwork.value = chainId === '0x539' || chainId === '0xaa36a7' || chainId === '0xc478'
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
              turnEvents: [] // We don't emit turn events in the event (too much data)
            }
            console.log('🏁 Real race result from contract (event only):', raceResult)
            console.log('🔍 Player bet on ship:', shipId, 'got placement:', 
              raceResult.placements.findIndex((ship: any) => ship.toString() === shipId.toString()) + 1)
            
            // Get full turn events for animation using debugRaceSimulation
            console.log('🎬 Getting full race data with turn events for animation...')
            try {
              const fullRaceData = await freshContract.debugRaceSimulation()
              if (fullRaceData && fullRaceData.turnEvents && fullRaceData.turnEvents.length > 0) {
                raceResult.turnEvents = fullRaceData.turnEvents
                console.log('✅ Got', fullRaceData.turnEvents.length, 'turn events for animation')
              } else {
                console.log('⚠️ debugRaceSimulation returned no turn events')
              }
            } catch (error) {
              console.log('❌ Failed to get turn events:', error)
            }
          }
        }
        
        // If we didn't get race result from events, fall back to debugRaceSimulation
        // (but this should not happen with the new RaceCompleted event)
        if (!raceResult) {
          console.log('⚠️ No RaceCompleted event found, falling back to debugRaceSimulation')
          raceResult = await freshContract.debugRaceSimulation()
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
    if (!contract.value) return false
    
    try {
      const addressToCheck = address || account.value
      if (!addressToCheck) return false
      
      const claimed = await contract.value.hasClaimedFaucet(addressToCheck)
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

  // Reconstruct race from blockchain turnEvents data
  const reconstructRaceFromBlockchain = (contractRaceResult: any) => {
    console.log('🔍 Reconstructing race from blockchain data:', contractRaceResult)
    
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

    // Process turn events from blockchain
    const replayLog: any[] = []
    const chaosEvents: any[] = []
    
    // Group events by turn
    const turnEvents = contractRaceResult.turnEvents || []
    const maxTurn = turnEvents.length > 0 ? Math.max(...turnEvents.map((e: any) => e.turn)) : 0
    
    for (let turn = 1; turn <= maxTurn; turn++) {
      const turnEvents = contractRaceResult.turnEvents.filter((e: any) => e.turn === turn)
      
      for (const event of turnEvents) {
        const shipId = Number(event.shipId) // Already 0-7
        const moveAmount = Number(event.moveAmount)
        const distance = Number(event.distance)
        const chaosEventType = Number(event.chaosEventType)
        const targetShipId = Number(event.targetShipId)

        // Update race state (using 0-7 IDs)
        const stateIndex = shipId // Array is 0-indexed
        raceStates[stateIndex].distance = distance

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

    // Set winner based on placements (already 0-7 IDs)
    const winnerId = Number(contractRaceResult.winner)
    const winner = raceStates[winnerId] // Array is 0-indexed

    // Convert placements (already 0-7 IDs)
    const placements = contractRaceResult.placements.map((p: any) => Number(p))

    return {
      raceStates,
      winner,
      replayLog,
      chaosEvents,
      placements
    }
  }

  // Animate race progression for frontend
  const animateRaceProgression = async (raceData: any, onTurnUpdate: (turn: number, states: any[], events: any[]) => void) => {
    const { replayLog } = raceData
    const maxTurn = Math.max(...replayLog.map((log: any) => log.turn))

    // Initialize cumulative state tracking (using 0-7 IDs)
    const cumulativeStates = raceData.raceStates.map((state: any) => ({ ...state, distance: 0 }))

    for (let turn = 1; turn <= maxTurn; turn++) {
      const turnEvents = replayLog.filter((log: any) => log.turn === turn)

      // Update cumulative states based on turn events
      for (const event of turnEvents) {
        const stateIndex = event.shipId // Already 0-7 ID, array is 0-indexed
        if (stateIndex >= 0 && stateIndex < cumulativeStates.length) {
          cumulativeStates[stateIndex].distance = event.distance
        }
      }

      // Create current turn states (copy of cumulative states)
      const currentStates = cumulativeStates.map((state: any) => ({ ...state }))

      // Extract chaos events for this turn
      const turnChaosEvents = turnEvents
        .filter((event: any) => event.event)
        .map((event: any) => event.event)

      // Call the update callback
      onTurnUpdate(turn, currentStates, turnChaosEvents)

      // Wait for animation frame
      await new Promise(resolve => setTimeout(resolve, 800))
    }
  }

  // ==================== USERNAME FUNCTIONS ====================
  
  const registerUsername = async (username: string) => {
    if (!account.value || !provider.value) {
      throw new Error('Wallet not connected')
    }
    
    try {
      const signer = provider.value.getSigner()
      const contractWithSigner = new ethers.Contract(
        getContractAddress(networkId.value!),
        CONTRACT_ABI,
        signer
      )
      const tx = await contractWithSigner.registerUsername(username)
      await tx.wait()
      return tx
    } catch (error: any) {
      console.error('Failed to register username:', error)
      throw new Error(error.reason || error.message || 'Failed to register username')
    }
  }
  
  const getUsername = async (playerAddress?: string) => {
    try {
      if (!provider.value) throw new Error('Provider not available')
      
      const contract = new ethers.Contract(
        getContractAddress(networkId.value!),
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
      if (!provider.value) return false
      
      const contract = new ethers.Contract(
        getContractAddress(networkId.value!),
        CONTRACT_ABI,
        provider.value
      )
      const address = playerAddress || account.value
      if (!address) return false
      
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
      if (!provider.value) return { players: [], usernames: [], winnings: [] }
      
      const contract = new ethers.Contract(
        getContractAddress(networkId.value!),
        CONTRACT_ABI,
        provider.value
      )
      const [players, usernames, winnings] = await contract.getTopPlayersByWinnings(limit)
      
      return {
        players,
        usernames,
        winnings: winnings.map((w: any) => ethers.utils.formatUnits(w, 8))
      }
    } catch (error: any) {
      console.error('Failed to get top players:', error)
      return { players: [], usernames: [], winnings: [] }
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
    getAddressByUsername,
    getPlayerMatchHistory,
    getRecentMatches,
    getTopPlayersByWinnings,
    getPlayerLeaderboardStats,
    checkApprovalNeeded
  }
} 