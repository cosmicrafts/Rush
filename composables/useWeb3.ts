import { ref, computed, readonly } from 'vue'
import { ethers } from 'ethers'

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
  '0x539': '0x959922bE3CAee4b8Cd9a407cc3ac1C251C2007B1',
  
  // Sepolia Testnet - Chain ID: 0xaa36a7 (11155111) 
  // Run: npx hardhat run scripts/deploy-modular.js --network sepolia
  '0xaa36a7': '', // TODO: Add Sepolia deployment address
  
  // Somnia Testnet - Chain ID: 0xc478 (50312)
  // Run: npx hardhat run scripts/deploy-modular.js --network somnia  
  '0xc478': ''  // TODO: Add Somnia deployment address
}

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
  
  // Constants
  'function MIN_BET() external view returns (uint256)',
  'function MAX_BET() external view returns (uint256)',
  'function TRACK_DISTANCE() external view returns (uint256)',
  'function RACE_TURNS() external view returns (uint256)',
  
  // Faucet functions
  'function claimFaucet() external',
  'function hasClaimedFaucet(address user) external view returns (bool)',
  
  // Betting interface functions
  'function getRaceInfo(uint256 raceId) external view returns (bool isActive, uint256 totalBets, uint256[8] shipBetsArray, uint256 prizePool)',
  'function getShipBets(uint256 raceId) external view returns (uint256[8] shipBetsArray)',
  'function getPlayerBets(address player, uint256 raceId) external view returns (uint8 spaceship, uint256 amount, bool claimed)',
  'function getCurrentRaceInfo() external view returns (bool isActive, uint256 totalBets, uint256[8] shipBetsArray, uint256 prizePool)',
  
  // Events  
  'event BetPlaced(address indexed player, uint8 spaceship, uint256 amount, uint8 winner, uint256 payout, uint8 jackpotTier)',
  'event AchievementUnlocked(address indexed player, string name, uint256 nftId, uint256 tokenReward)',
  'event JackpotHit(address indexed player, uint8 tier, uint256 amount)',
  'event FaucetClaimed(address indexed user, uint256 amount)'
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
      const [minBet, maxBet, trackDistance, raceTurns] = await Promise.all([
        contract.value.MIN_BET(),
        contract.value.MAX_BET(),
        contract.value.TRACK_DISTANCE(),
        contract.value.RACE_TURNS()
      ])
      
      contractInfo.value = {
        minBet: ethers.utils.formatUnits(minBet, 8), // SPIRAL has 8 decimals  
        maxBet: ethers.utils.formatUnits(maxBet, 8),
        trackDistance: Number(trackDistance),
        raceTurns: Number(raceTurns)
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
      const spiralTokenAddress = '0x9A676e781A523b5d0C0e43731313A708CB607508'
      
      // Use SIGNER to ensure we're checking from the right account context
      const signer = provider.value.getSigner()
      const spiralABI = [
        'function allowance(address owner, address spender) external view returns (uint256)'
      ]
      const spiralContract = new ethers.Contract(spiralTokenAddress, spiralABI, signer)
      
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
    if (!contract.value || !account.value) {
      throw new Error('Wallet not connected')
    }
    
    try {
      const amountUnits = ethers.utils.parseUnits(amount.toString(), 8) // SPIRAL has 8 decimals
      const signer = provider.value.getSigner()
      const contractAddress = getContractAddress(networkId.value!)
      const userAddress = await signer.getAddress()
      
      // Double-check allowance right before the transaction
      const spiralTokenAddress = '0x9A676e781A523b5d0C0e43731313A708CB607508'
      const spiralABI = [
        'function allowance(address owner, address spender) external view returns (uint256)'
      ]
      const spiralContract = new ethers.Contract(spiralTokenAddress, spiralABI, signer)
      const currentAllowance = await spiralContract.allowance(userAddress, contractAddress)
      
      console.log('🔍 Pre-transaction allowance check:')
      console.log('  User:', userAddress)
      console.log('  Contract:', contractAddress)
      console.log('  Allowance:', ethers.utils.formatUnits(currentAllowance, 8))
      console.log('  Required:', ethers.utils.formatUnits(amountUnits, 8))
      
      if (currentAllowance.lt(amountUnits)) {
        throw new Error(`Insufficient allowance: ${ethers.utils.formatUnits(currentAllowance, 8)} < ${ethers.utils.formatUnits(amountUnits, 8)}`)
      }
      
      // Create fresh contract instance to avoid proxy issues
      const freshContract = new ethers.Contract(contractAddress, CONTRACT_ABI, signer)
      
      // Place the bet (assumes approval was already done)
      const tx = await freshContract.placeBet(shipId, amountUnits)
      const receipt = await tx.wait()
      
      await updateBalance()
      await loadContractInfo()
      
      // The placeBet function returns race result, but we need to call it statically to get the result
      // Since the transaction is already mined, we can get the race result from events or call debugRaceSimulation
      console.log('Bet placed successfully:', receipt)
      
      // Get the latest race result using debugRaceSimulation (which gives us the full race data)
      const raceResult = await freshContract.debugRaceSimulation()
      console.log('Race result from blockchain:', raceResult)
      
      return {
        receipt,
        raceResult
      }
    } catch (error: any) {
      console.error('Failed to place bet:', error)
      throw new Error(error.reason || error.message || 'Failed to place bet')
    }
  }

  // Approve SPIRAL tokens for betting
  const approveSpiralTokens = async (amount?: string) => {
    if (!account.value || !provider.value) {
      throw new Error('Wallet not connected')
    }

    try {
      const signer = provider.value.getSigner()
      const spiralTokenAddress = '0x9A676e781A523b5d0C0e43731313A708CB607508' // From latest deployment
      
      // Create SPIRAL token contract instance
      const spiralABI = [
        'function approve(address spender, uint256 amount) external returns (bool)',
        'function allowance(address owner, address spender) external view returns (uint256)'
      ]
      
      const spiralContract = new ethers.Contract(spiralTokenAddress, spiralABI, signer)
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
      const spiralTokenAddress = '0x9A676e781A523b5d0C0e43731313A708CB607508'
      const spiralABI = [
        'function balanceOf(address owner) external view returns (uint256)'
      ]
      const signer = provider.value.getSigner()
      const spiralContract = new ethers.Contract(spiralTokenAddress, spiralABI, signer)
      
      const balance = await spiralContract.balanceOf(account.value)
      return ethers.utils.formatUnits(balance, 8)
    } catch (error) {
      console.error('Failed to get SPIRAL balance:', error)
      return '0'
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
    const shipNames = getShipNames()
    const shipColors = getShipColors()
    
    // Initialize race states for all ships
    const raceStates: any[] = []
    for (let i = 0; i < 8; i++) {
      raceStates.push({
        id: i,
        name: shipNames[i],
        color: shipColors[i],
        stats: { initialSpeed: 0, acceleration: 0 }, // Will be loaded separately
        chaosFactor: '',
        currentSpeed: 0,
        distance: 0,
        finalTurn: 0
      })
    }

    // Convert contract events into frontend format
    const replayLog: any[] = []
    const chaosEvents: any[] = []
    
    // Process turn events to reconstruct race progression
    for (let turn = 1; turn <= 10; turn++) {
      const turnEvents = contractRaceResult.turnEvents.filter((e: any) => Number(e.turn) === turn)
      
      for (const event of turnEvents) {
        const shipId = Number(event.shipId)
        const moveAmount = Number(event.moveAmount)
        const distance = Number(event.distance)
        const chaosEventType = Number(event.chaosEventType)
        const targetShipId = Number(event.targetShipId)

        // Update race state
        raceStates[shipId].distance = distance
        
        // Add to replay log
        replayLog.push({
          turn,
          shipId,
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

    // Set winner based on placements
    const winnerId = Number(contractRaceResult.winner)
    const winner = raceStates[winnerId]

    return {
      raceStates,
      winner,
      replayLog,
      chaosEvents,
      placements: contractRaceResult.placements.map((p: any) => Number(p))
    }
  }

  // Animate race progression for frontend
  const animateRaceProgression = async (raceData: any, onTurnUpdate: (turn: number, states: any[], events: any[]) => void) => {
    const { replayLog } = raceData
    const maxTurn = Math.max(...replayLog.map((log: any) => log.turn))
    
    for (let turn = 1; turn <= maxTurn; turn++) {
      const turnEvents = replayLog.filter((log: any) => log.turn === turn)
      const currentStates = raceData.raceStates.map((state: any) => ({ ...state }))
      
      // Update states based on turn events
      for (const event of turnEvents) {
        currentStates[event.shipId].distance = event.distance
      }
      
      // Extract chaos events for this turn
      const turnChaosEvents = turnEvents
        .filter((event: any) => event.event)
        .map((event: any) => event.event)
      
      // Call the update callback
      onTurnUpdate(turn, currentStates, turnChaosEvents)
      
      // Wait for animation timing (adjust as needed)
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
  }

  return {
    // State
    isConnected: readonly(isConnected),
    account: readonly(account),
    balance: readonly(balance),
    spiralBalance: readonly(spiralBalance),
    walletType: readonly(walletType),
    networkId: readonly(networkId),
    isCorrectNetwork: readonly(isCorrectNetwork),
    currentRaceId: readonly(currentRaceId),
    contractInfo: readonly(contractInfo),
    
    // Computed
    shortAddress,
    formattedBalance,
    formattedSpiralBalance,
    
    // Actions
    connectMetaMask,
    connectCoinbaseWallet,
    disconnect,
    placeBet,
    placeBetAndGetRace,
    checkApprovalNeeded,
    getCurrentRaceInfo,
    getShipBets,
    getPlayerBets,
    getPlayerStats,
    getPlayerAchievementCount,
    getSpiralBalance,
    updateBalance,
    claimWinnings,
    claimFaucet,
    hasClaimedFaucet,
    approveSpiralTokens,
    getShip,
    loadContractInfo,
    switchToLocalhost: () => switchToLocalhost(window.ethereum),
    switchToSepolia: () => switchToSepolia(window.ethereum),
    switchToSomniaTestnet: () => switchToSomniaTestnet(window.ethereum),
    startNewRace,
    finishRace,
    
    // Race reconstruction
    getDebugRaceSimulation,
    reconstructRaceFromBlockchain,
    animateRaceProgression,
    getShipNames,
    getShipColors,
    getChaosEventText
  }
} 