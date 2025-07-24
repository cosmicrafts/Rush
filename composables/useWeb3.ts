import { ref, computed, readonly, onMounted } from 'vue'
import { ethers } from 'ethers'

// Extend Window interface for ethereum
declare global {
  interface Window {
    ethereum?: any
    coinbaseWalletExtension?: any
  }
}

// Somnia Testnet configuration
const SOMNIA_TESTNET = {
  chainId: '50312', // Decimal chain ID
  chainName: 'Somnia Testnet',
  nativeCurrency: {
    name: 'Somnia Test Token',
    symbol: 'STT',
    decimals: 18
  },
  rpcUrls: ['https://dream-rpc.somnia.network/'],
  blockExplorerUrls: ['https://shannon-explorer.somnia.network/']
}

// Contract ABI (minimal for betting functions)
const CONTRACT_ABI = [
  'function placeBet(uint8 shipId) external payable',
  'function getRaceInfo(uint256 raceId) external view returns (uint8 winner, uint256 totalBets, uint256 totalPrize, bool finished)',
  'function getShipBets(uint256 raceId, uint8 shipId) external view returns (uint256)',
  'function getPlayerBets(uint256 raceId, address player) external view returns (tuple(address player, uint8 shipId, uint256 amount, bool claimed)[])',
  'function claimWinnings(uint256 raceId) external',
  'function currentRaceId() external view returns (uint256)',
  'event BetPlaced(address indexed player, uint8 shipId, uint256 amount)',
  'event RaceFinished(uint256 raceId, uint8 winner, uint256 totalPrize)'
]

export const useWeb3 = () => {
  const isConnected = ref(false)
  const account = ref<string | null>(null)
  const balance = ref<string>('0')
  const walletType = ref<'metamask' | 'coinbase' | null>(null)
  const provider = ref<ethers.BrowserProvider | null>(null)
  const contract = ref<ethers.Contract | null>(null)
  const networkId = ref<string | null>(null)
  const isCorrectNetwork = ref(false)

  // Get contract address from runtime config
  const config = useRuntimeConfig()
  const CONTRACT_ADDRESS = config.public.contractAddress as string

  // Computed properties
  const shortAddress = computed(() => {
    if (!account.value) return ''
    return `${account.value.slice(0, 6)}...${account.value.slice(-4)}`
  })

  const formattedBalance = computed(() => {
    if (!balance.value) return '0 STT'
    return `${parseFloat(ethers.formatEther(balance.value)).toFixed(4)} STT`
  })

  // Check if we're on the correct network
  const checkNetwork = async (ethereum: any) => {
    try {
      const chainId = await ethereum.request({ method: 'eth_chainId' })
      networkId.value = chainId
      // Convert hex to decimal for comparison
      const chainIdDecimal = parseInt(chainId, 16).toString()
      isCorrectNetwork.value = chainIdDecimal === SOMNIA_TESTNET.chainId
      return isCorrectNetwork.value
    } catch (error) {
      console.error('Failed to check network:', error)
      return false
    }
  }

  // Switch to Somnia Testnet
  const switchToSomniaTestnet = async (ethereum: any) => {
    try {
      // Try to switch first
      await ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0xc478' }] // Hex format for MetaMask
      })
      return true
    } catch (switchError: any) {
      // This error code indicates that the chain has not been added to MetaMask
      if (switchError.code === 4902) {
        try {
          // Add the network with proper configuration
          await ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: '0xc478', // Hex format for MetaMask
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
        } catch (addError) {
          console.error('Failed to add Somnia Testnet:', addError)
          throw new Error('Failed to add Somnia Testnet to wallet. Please add it manually using: https://testnet.somnia.network/')
        }
      }
      throw new Error('Failed to switch to Somnia Testnet')
    }
  }

  // Initialize provider and contract (minimal approach)
  const initializeProvider = async (ethereum: any) => {
    // Skip provider initialization for now to avoid ethers v6 issues
    // Just set basic connection status
    provider.value = null
    contract.value = null
  }

  // Update balance using direct ethereum calls
  const updateBalance = async () => {
    if (!account.value) return
    
    try {
      // Use direct ethereum request instead of ethers provider
      const balanceHex = await window.ethereum.request({
        method: 'eth_getBalance',
        params: [account.value, 'latest']
      })
      
      // Convert hex to decimal string
      balance.value = BigInt(balanceHex).toString()
    } catch (error) {
      console.error('Failed to update balance:', error)
      balance.value = '0'
    }
  }

  // Connect MetaMask wallet
  const connectMetaMask = async () => {
    try {
      if (typeof window.ethereum === 'undefined') {
        throw new Error('MetaMask not installed. Please install MetaMask to continue.')
      }

      // Request account access
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
      
      if (accounts.length === 0) {
        throw new Error('No accounts found. Please create an account in MetaMask.')
      }

      // Check and switch network if needed
      const isOnCorrectNetwork = await checkNetwork(window.ethereum)
      if (!isOnCorrectNetwork) {
        await switchToSomniaTestnet(window.ethereum)
      }

      // Set account and wallet type
      account.value = accounts[0]
      walletType.value = 'metamask'
      isConnected.value = true

      // Initialize provider and contract (don't await, let it fail silently)
      initializeProvider(window.ethereum)
      
      // Update balance
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
      // Check for Coinbase Wallet
      if (typeof window.ethereum === 'undefined' || !window.ethereum.isCoinbaseWallet) {
        throw new Error('Coinbase Wallet not detected. Please install Coinbase Wallet to continue.')
      }

      // Request account access
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
      
      if (accounts.length === 0) {
        throw new Error('No accounts found. Please create an account in Coinbase Wallet.')
      }

      // Check and switch network if needed
      const isOnCorrectNetwork = await checkNetwork(window.ethereum)
      if (!isOnCorrectNetwork) {
        await switchToSomniaTestnet(window.ethereum)
      }

      // Set account and wallet type
      account.value = accounts[0]
      walletType.value = 'coinbase'
      isConnected.value = true

      // Initialize provider and contract
      await initializeProvider(window.ethereum)
      
      // Update balance
      await updateBalance()

      // Set up event listeners
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
    // Account changed
    ethereum.on('accountsChanged', (accounts: string[]) => {
      if (accounts.length === 0) {
        disconnect()
      } else {
        account.value = accounts[0] || null
        updateBalance()
      }
    })

    // Network changed
    ethereum.on('chainChanged', (chainId: string) => {
      networkId.value = chainId
      isCorrectNetwork.value = chainId === SOMNIA_TESTNET.chainId
      if (isCorrectNetwork.value) {
        updateBalance()
      }
    })

    // Disconnect
    ethereum.on('disconnect', () => {
      disconnect()
    })
  }

  // Disconnect wallet
  const disconnect = () => {
    // Clear all state
    isConnected.value = false
    account.value = null
    balance.value = '0'
    walletType.value = null
    provider.value = null
    contract.value = null
    networkId.value = null
    isCorrectNetwork.value = false
    
    // Remove event listeners
    if (typeof window.ethereum !== 'undefined') {
      window.ethereum.removeAllListeners()
    }
    
    // Clear any stored wallet data
    if (typeof window !== 'undefined') {
      localStorage.removeItem('walletConnected')
      sessionStorage.clear()
    }
  }

  // Place a bet on a ship (disabled temporarily)
  const placeBet = async (shipId: number, amount: string) => {
    throw new Error('Betting temporarily disabled due to provider issues. Please try again later.')
  }

  // Get current race information (disabled)
  const getCurrentRaceInfo = async () => {
    return null
  }

  // Get ship betting totals (disabled)
  const getShipBets = async (raceId: number, shipId: number) => {
    return '0'
  }

  // Get player's bets for a race (disabled)
  const getPlayerBets = async (raceId: number) => {
    return []
  }

  // Claim winnings for a race (disabled)
  const claimWinnings = async (raceId: number) => {
    throw new Error('Claiming winnings temporarily disabled due to provider issues.')
  }

  // Check if wallet is already connected on page load
  const checkConnection = async () => {
    // Don't auto-connect on page load - require explicit connection
    return
  }

  // Initialize on mount
  onMounted(() => {
    checkConnection()
  })

  return {
    // State
    isConnected: readonly(isConnected),
    account: readonly(account),
    balance: readonly(balance),
    walletType: readonly(walletType),
    networkId: readonly(networkId),
    isCorrectNetwork: readonly(isCorrectNetwork),
    
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
    switchToSomniaTestnet: () => switchToSomniaTestnet(window.ethereum)
  }
} 