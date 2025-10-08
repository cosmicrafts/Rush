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

// Push Chain Testnet (Donut) configuration
export const PUSH_CHAIN_CONFIG: NetworkConfig = {
  chainId: '0xa4b5', // 42101 in decimal (Push Chain Donut Testnet)
  chainName: 'Push Chain Donut Testnet',
  rpcUrl: 'https://evm.rpc-testnet-donut-node1.push.org/',
  blockExplorer: 'https://donut.push.network/',
  nativeCurrency: {
    name: 'Push Chain Token',
    symbol: 'PC',
    decimals: 18,
  },
}

// Push Chain Local Development
export const PUSH_CHAIN_LOCAL_CONFIG: NetworkConfig = {
  chainId: '0xa4b5', // 42101 in decimal (same as testnet for consistency)
  chainName: 'Push Chain Local',
  rpcUrl: 'http://localhost:8545',
  blockExplorer: 'http://localhost:8545', // No explorer for local
  nativeCurrency: {
    name: 'Push Chain Token',
    symbol: 'PC',
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
    } else if (currentChainId.value === PUSH_CHAIN_CONFIG.chainId) {
      return PUSH_CHAIN_CONFIG
    } else if (currentChainId.value === PUSH_CHAIN_LOCAL_CONFIG.chainId) {
      return PUSH_CHAIN_LOCAL_CONFIG
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

      // Check if it's a valid network (Somnia or Push Chain)
      isCorrectNetwork.value =
        chainId === SOMNIA_CONFIG.chainId || 
        chainId === SOMNIA_ALT_CONFIG.chainId ||
        chainId === PUSH_CHAIN_CONFIG.chainId ||
        chainId === PUSH_CHAIN_LOCAL_CONFIG.chainId

      if (!isCorrectNetwork.value) {
        networkError.value = `Wrong network. Expected Somnia Testnet (${SOMNIA_CONFIG.chainId}/${SOMNIA_ALT_CONFIG.chainId}) or Push Chain (${PUSH_CHAIN_CONFIG.chainId}), got ${chainId}`
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

  // Switch to Push Chain Testnet
  const switchToPushChainTestnet = async (ethereum: {
    request: (params: unknown) => Promise<unknown>
  }) => {
    try {
      // Try to switch to Push Chain
      try {
        await ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: PUSH_CHAIN_CONFIG.chainId }],
        })
        return true
      } catch (switchError: unknown) {
        if ((switchError as { code?: number }).code === 4902) {
          // Chain not added, try to add it
          await ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: PUSH_CHAIN_CONFIG.chainId,
                chainName: PUSH_CHAIN_CONFIG.chainName,
                nativeCurrency: PUSH_CHAIN_CONFIG.nativeCurrency,
                rpcUrls: [PUSH_CHAIN_CONFIG.rpcUrl],
                blockExplorerUrls: [PUSH_CHAIN_CONFIG.blockExplorer],
              },
            ],
          })
          return true
        } else {
          console.warn('Failed to switch to Push Chain:', switchError)
          throw new Error('Failed to switch to Push Chain Testnet')
        }
      }
    } catch (error: unknown) {
      console.error('Push Chain network switch failed:', error)
      throw error
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
    } else if (currentChainId.value === PUSH_CHAIN_CONFIG.chainId) {
      return 'Push Chain Testnet'
    } else if (currentChainId.value === PUSH_CHAIN_LOCAL_CONFIG.chainId) {
      return 'Push Chain Local'
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
    } else if (
      currentChainId.value === PUSH_CHAIN_CONFIG.chainId ||
      currentChainId.value === PUSH_CHAIN_LOCAL_CONFIG.chainId
    ) {
      return 'bg-gradient-to-r from-purple-400 to-blue-500 rounded-sm'
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
    } else if (
      currentChainId.value === PUSH_CHAIN_CONFIG.chainId ||
      currentChainId.value === PUSH_CHAIN_LOCAL_CONFIG.chainId
    ) {
      return 'text-purple-400'
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
    PUSH_CHAIN_CONFIG,
    PUSH_CHAIN_LOCAL_CONFIG,

    // Computed
    getCurrentNetworkConfig,
    getNetworkDisplay,
    getNetworkIndicatorClass,
    getNetworkTextClass,

    // Methods
    checkNetwork,
    switchToSomniaTestnet,
    switchToPushChainTestnet,
    getExplorerUrl,
  }
}
