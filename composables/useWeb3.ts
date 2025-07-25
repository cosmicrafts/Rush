import { ref, computed, readonly } from 'vue'
import { ethers } from 'ethers'

// Extend Window interface for ethereum
declare global {
  interface Window {
    ethereum?: any
    coinbaseWalletExtension?: any
  }
}

// Contract address from deployment
const CONTRACT_ADDRESS = '0x28c91484b55b6991d8f5e4fe2ff313024532537e'

// Contract ABI (simplified for the functions we need)
const CONTRACT_ABI = [
  // Betting functions
  'function placeBet(uint8 shipId) external payable',
  'function claimWinnings(uint256 raceId) external',
  
  // Race management (owner only)
  'function startNewRace() external',
  'function finishRace(uint8 winner) external',
  
  // View functions
  'function getRaceInfo(uint256 raceId) external view returns (uint8 winner, uint256 totalBets, uint256 totalPrize, bool finished)',
  'function getShipBets(uint256 raceId, uint8 shipId) external view returns (uint256)',
  'function getPlayerBets(uint256 raceId, address player) external view returns (tuple(address player, uint8 shipId, uint256 amount, bool claimed)[])',
  'function getShip(uint8 shipId) external view returns (tuple(uint8 id, string name, uint16 initialSpeed, uint8 acceleration, string chaosFactor, uint8 chaosChance))',
  'function currentRaceId() external view returns (uint256)',
  'function houseFee() external view returns (uint256)',
  'function MIN_BET() external view returns (uint256)',
  'function MAX_BET() external view returns (uint256)',
  
  // Events
  'event BetPlaced(address indexed player, uint8 shipId, uint256 amount)',
  'event RaceStarted(uint256 raceId)',
  'event RaceFinished(uint256 raceId, uint8 winner, uint256 totalPrize)',
  'event WinningsClaimed(address indexed player, uint256 amount)'
]

export const useWeb3 = () => {
  const isConnected = ref(false)
  const account = ref<string | null>(null)
  const balance = ref<string>('0')
  const walletType = ref<'metamask' | 'coinbase' | null>(null)
  const provider = ref<any>(null)
  const contract = ref<any>(null)
  const networkId = ref<string | null>(null)
  const isCorrectNetwork = ref(false)
  const currentRaceId = ref<number>(0)
  const contractInfo = ref<{
    minBet: string
    maxBet: string
    houseFee: number
  }>({
    minBet: '0.001',
    maxBet: '1',
    houseFee: 5
  })

  // Computed properties
  const shortAddress = computed(() => {
    if (!account.value) return ''
    return `${account.value.slice(0, 6)}...${account.value.slice(-4)}`
  })

  const formattedBalance = computed(() => {
    if (!balance.value) return '0 STT'
    return `${parseFloat(ethers.utils.formatEther(balance.value)).toFixed(4)} STT`
  })

  // Check if we're on the correct network
  const checkNetwork = async (ethereum: any) => {
    try {
      const chainId = await ethereum.request({ method: 'eth_chainId' })
      networkId.value = chainId
      // Somnia Testnet chain ID: 0xc478 (50312 in decimal)
      isCorrectNetwork.value = chainId === '0xc478'
      return isCorrectNetwork.value
    } catch (error) {
      console.error('Failed to check network:', error)
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
          if (addError.code === 4001) {
            // User rejected adding the network
            throw new Error('You must approve adding the Somnia Testnet in MetaMask to use this dApp.')
          }
          // Fallback: open the official add page in a new tab
          window.open('https://testnet.somnia.network/', '_blank')
          throw new Error('Could not add Somnia Testnet automatically. Please add it manually in the new tab.')
        }
      }
      if (switchError.code === 4001) {
        // User rejected switching the network
        throw new Error('You must approve switching to the Somnia Testnet in MetaMask to use this dApp.')
      }
      // Fallback: open the official add page in a new tab
      window.open('https://testnet.somnia.network/', '_blank')
      throw new Error('Could not switch to Somnia Testnet automatically. Please add it manually in the new tab.')
    }
  }

  // Initialize provider and contract
  const initializeProvider = async (ethereum: any) => {
    try {
      const web3Provider = new ethers.providers.Web3Provider(ethereum)
      const contractInstance = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, web3Provider)
      
      provider.value = web3Provider
      contract.value = contractInstance
      
      // Load contract info
      await loadContractInfo()
      
      console.log('Provider and contract initialized successfully')
    } catch (error) {
      console.error('Failed to initialize provider:', error)
      throw new Error('Failed to initialize blockchain connection')
    }
  }

  // Load contract information
  const loadContractInfo = async () => {
    if (!contract.value) return
    
    try {
      const [minBet, maxBet, houseFee] = await Promise.all([
        contract.value.MIN_BET(),
        contract.value.MAX_BET(),
        contract.value.houseFee()
      ])
      
      contractInfo.value = {
        minBet: ethers.utils.formatEther(minBet),
        maxBet: ethers.utils.formatEther(maxBet),
        houseFee: Number(houseFee)
      }
      
      // Load current race ID
      const raceId = await contract.value.currentRaceId()
      currentRaceId.value = Number(raceId)
      
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
    } catch (error) {
      console.error('Failed to update balance:', error)
      balance.value = '0'
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

      // Check and switch network if needed
      const isOnCorrectNetwork = await checkNetwork(window.ethereum)
      if (!isOnCorrectNetwork) {
        await switchToSomniaTestnet(window.ethereum)
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

  // Place a bet on a ship
  const placeBet = async (shipId: number, amount: string) => {
    if (!contract.value || !account.value) {
      throw new Error('Wallet not connected')
    }
    
    try {
      const amountWei = ethers.utils.parseEther(amount)
      const signer = provider.value.getSigner()
      const contractWithSigner = contract.value.connect(signer)
      
      const tx = await contractWithSigner.placeBet(shipId, { value: amountWei })
      const receipt = await tx.wait()
      
      await updateBalance()
      await loadContractInfo()
      
      console.log('Bet placed successfully:', receipt)
      return receipt
    } catch (error: any) {
      console.error('Failed to place bet:', error)
      throw new Error(error.reason || error.message || 'Failed to place bet')
    }
  }

  // Get current race information
  const getCurrentRaceInfo = async () => {
    if (!contract.value) return null
    
    try {
      const raceInfo = await contract.value.getRaceInfo(currentRaceId.value)
      return {
        raceId: currentRaceId.value.toString(),
        winner: Number(raceInfo[0]),
        totalBets: ethers.utils.formatEther(raceInfo[1]),
        totalPrize: ethers.utils.formatEther(raceInfo[2]),
        finished: raceInfo[3]
      }
    } catch (error) {
      console.error('Failed to get race info:', error)
      return null
    }
  }

  // Get ship betting totals
  const getShipBets = async (raceId: number, shipId: number) => {
    if (!contract.value) return '0'
    
    try {
      const bets = await contract.value.getShipBets(raceId, shipId)
      return ethers.utils.formatEther(bets)
    } catch (error) {
      console.error('Failed to get ship bets:', error)
      return '0'
    }
  }

  // Get player's bets for a race
  const getPlayerBets = async (raceId: number) => {
    if (!contract.value || !account.value) return []
    
    try {
      const bets = await contract.value.getPlayerBets(raceId, account.value)
      return bets.map((bet: any) => ({
        shipId: Number(bet.shipId),
        amount: ethers.utils.formatEther(bet.amount),
        claimed: bet.claimed
      }))
    } catch (error) {
      console.error('Failed to get player bets:', error)
      return []
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

  return {
    // State
    isConnected: readonly(isConnected),
    account: readonly(account),
    balance: readonly(balance),
    walletType: readonly(walletType),
    networkId: readonly(networkId),
    isCorrectNetwork: readonly(isCorrectNetwork),
    currentRaceId: readonly(currentRaceId),
    contractInfo: readonly(contractInfo),
    
    // Computed
    shortAddress,
    formattedBalance,
    
    // Actions
    connectMetaMask,
    connectCoinbaseWallet,
    disconnect,
    placeBet,
    getCurrentRaceInfo,
    getShipBets,
    getPlayerBets,
    claimWinnings,
    getShip,
    loadContractInfo,
    switchToSomniaTestnet: () => switchToSomniaTestnet(window.ethereum),
    startNewRace,
    finishRace
  }
} 