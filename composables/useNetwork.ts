import { ref, computed } from 'vue'

// Network configuration
export interface NetworkConfig {
  chainId: string
  chainName: string
  rpcUrl: string
  blockExplorer: string
  nativeCurrency: {
    name: string
    symbol: string
    decimals: number
  }
}

// Somnia Testnet configuration (documented chain ID)
export const SOMNIA_CONFIG: NetworkConfig = {
  chainId: '0xc478', // 50312 in decimal (documented)
  chainName: 'Somnia Testnet',
  rpcUrl: 'https://dream-rpc.somnia.network/',
  blockExplorer: 'https://shannon-explorer.somnia.network/',
  nativeCurrency: {
    name: 'Somnia Test Token',
    symbol: 'STT',
    decimals: 18,
  },
}

// Alternative Somnia config (what RPC actually returns)
export const SOMNIA_ALT_CONFIG: NetworkConfig = {
  chainId: '0xc488', // 50312 in decimal (actual RPC response)
  chainName: 'Somnia Testnet',
  rpcUrl: 'https://dream-rpc.somnia.network/',
  blockExplorer: 'https://shannon-explorer.somnia.network/',
  nativeCurrency: {
    name: 'Somnia Test Token',
    symbol: 'STT',
    decimals: 18,
  },
}

export const useNetwork = () => {
  const currentChainId = ref<string | null>(null)
  const isCorrectNetwork = ref(false)
  const networkError = ref<string | null>(null)

  // Get current network config
  const getCurrentNetworkConfig = computed(() => {
    if (currentChainId.value === SOMNIA_CONFIG.chainId) {
      return SOMNIA_CONFIG
    } else if (currentChainId.value === SOMNIA_ALT_CONFIG.chainId) {
      return SOMNIA_ALT_CONFIG
    }
    return null
  })

  // Check if we're on the correct network
  const checkNetwork = async (ethereum: {
    request: (params: { method: string }) => Promise<string>
  }) => {
    try {
      const chainId = await ethereum.request({ method: 'eth_chainId' })
      currentChainId.value = chainId

      // Check if it's a valid Somnia network
      isCorrectNetwork.value =
        chainId === SOMNIA_CONFIG.chainId || chainId === SOMNIA_ALT_CONFIG.chainId

      if (!isCorrectNetwork.value) {
        networkError.value = `Wrong network. Expected Somnia Testnet (${SOMNIA_CONFIG.chainId} or ${SOMNIA_ALT_CONFIG.chainId}), got ${chainId}`
      } else {
        networkError.value = null
      }

      return isCorrectNetwork.value
    } catch (error) {
      console.error('Failed to check network:', error)
      networkError.value = 'Failed to check network'
      return false
    }
  }

  // Switch to Somnia Testnet
  const switchToSomniaTestnet = async (ethereum: {
    request: (params: unknown) => Promise<unknown>
  }) => {
    try {
      // First, try to switch to the actual RPC chain ID (which is what the RPC returns)
      try {
        await ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: SOMNIA_ALT_CONFIG.chainId }],
        })
        return true
      } catch (switchError: unknown) {
        if ((switchError as { code?: number }).code === 4902) {
          // Chain not added, try to add it with the actual RPC chain ID first
          try {
            await ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [
                {
                  chainId: SOMNIA_ALT_CONFIG.chainId,
                  chainName: SOMNIA_ALT_CONFIG.chainName,
                  nativeCurrency: SOMNIA_ALT_CONFIG.nativeCurrency,
                  rpcUrls: [SOMNIA_ALT_CONFIG.rpcUrl],
                  blockExplorerUrls: [SOMNIA_ALT_CONFIG.blockExplorer],
                },
              ],
            })
            return true
          } catch (addError: unknown) {
            console.warn('Failed to add Somnia network with actual RPC chain ID:', addError)

            // If actual RPC chain ID fails, try the documented chain ID as fallback
            try {
              await ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [
                  {
                    chainId: SOMNIA_CONFIG.chainId,
                    chainName: SOMNIA_CONFIG.chainName,
                    nativeCurrency: SOMNIA_CONFIG.nativeCurrency,
                    rpcUrls: [SOMNIA_CONFIG.rpcUrl],
                    blockExplorerUrls: [SOMNIA_CONFIG.blockExplorer],
                  },
                ],
              })
              return true
            } catch (docAddError: unknown) {
              console.warn('Failed to add Somnia network with documented chain ID:', docAddError)
              throw new Error(
                'Failed to add Somnia Testnet to MetaMask. Please add it manually at https://testnet.somnia.network/'
              )
            }
          }
        } else {
          // Other switch error
          console.warn('Failed to switch to Somnia:', switchError)
          throw new Error('Failed to switch to Somnia Testnet')
        }
      }
    } catch (error: unknown) {
      console.error('Network switch failed:', error)
      throw error
    }
  }

  // Get network display info
  const getNetworkDisplay = computed(() => {
    if (
      currentChainId.value === SOMNIA_CONFIG.chainId ||
      currentChainId.value === SOMNIA_ALT_CONFIG.chainId
    ) {
      return 'Somnia Testnet'
    } else if (currentChainId.value) {
      return `Wrong Network (${currentChainId.value})`
    } else {
      return 'No Network'
    }
  })

  // Get network indicator class
  const getNetworkIndicatorClass = computed(() => {
    if (
      currentChainId.value === SOMNIA_CONFIG.chainId ||
      currentChainId.value === SOMNIA_ALT_CONFIG.chainId
    ) {
      return 'bg-gradient-to-r from-cyan-400 to-pink-500 rounded-sm'
    } else {
      return 'bg-red-400 rounded-sm'
    }
  })

  // Get network text class
  const getNetworkTextClass = computed(() => {
    if (
      currentChainId.value === SOMNIA_CONFIG.chainId ||
      currentChainId.value === SOMNIA_ALT_CONFIG.chainId
    ) {
      return 'text-cyan-400'
    } else {
      return 'text-red-400'
    }
  })

  // Get explorer URL
  const getExplorerUrl = (address: string) => {
    return `${SOMNIA_CONFIG.blockExplorer}/address/${address}`
  }

  return {
    // State
    currentChainId,
    isCorrectNetwork,
    networkError,

    // Config
    SOMNIA_CONFIG,
    SOMNIA_ALT_CONFIG,

    // Computed
    getCurrentNetworkConfig,
    getNetworkDisplay,
    getNetworkIndicatorClass,
    getNetworkTextClass,

    // Methods
    checkNetwork,
    switchToSomniaTestnet,
    getExplorerUrl,
  }
}
