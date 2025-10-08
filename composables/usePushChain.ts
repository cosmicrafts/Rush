import { ref, computed } from 'vue'
import { PushChain } from '@pushchain/core'
import { ethers } from 'ethers'

// Push Chain client state
const pushChainClient = ref<any>(null)
const universalSigner = ref<any>(null)
const isConnected = ref(false)
const userAddress = ref<string | null>(null)
const userChain = ref<string | null>(null)

export const usePushChain = () => {
  // Initialize Push Chain client
  const initializePushChain = async () => {
    try {
      // This will be handled by the UI Kit in most cases
      console.log('Push Chain client initialization handled by UI Kit')
      return true
    } catch (error) {
      console.error('Failed to initialize Push Chain:', error)
      return false
    }
  }

  // Create universal signer from existing wallet
  const createUniversalSigner = async (wallet: any) => {
    try {
      // Convert ethers signer to Universal Signer
      const universal = await PushChain.utils.signer.toUniversal(wallet)
      universalSigner.value = universal
      
      // Initialize Push Chain client with the universal signer
      pushChainClient.value = await PushChain.initialize({
        signer: universal,
        network: 'testnet' // Push Chain Donut Testnet
      })
      
      isConnected.value = true
      userAddress.value = await wallet.getAddress()
      
      // Determine the source chain based on the provider
      const network = await wallet.provider.getNetwork()
      if (network.chainId === 42101) {
        userChain.value = 'push-chain'
      } else if (network.chainId === 11155111) {
        userChain.value = 'ethereum-sepolia'
      } else if (network.chainId === 1) {
        userChain.value = 'ethereum-mainnet'
      } else {
        userChain.value = `chain-${network.chainId}`
      }
      
      console.log('Universal signer created:', {
        address: userAddress.value,
        chain: userChain.value
      })
      
      return universal
    } catch (error) {
      console.error('Failed to create universal signer:', error)
      throw error
    }
  }

  // Send universal transaction
  const sendUniversalTransaction = async (txParams: any) => {
    if (!pushChainClient.value) {
      throw new Error('Push Chain client not initialized')
    }

    try {
      const tx = await pushChainClient.value.sendTransaction(txParams)
      console.log('Universal transaction sent:', tx.hash)
      return tx
    } catch (error) {
      console.error('Failed to send universal transaction:', error)
      throw error
    }
  }

  // Get contract instance with universal signer
  const getUniversalContract = (contractAddress: string, abi: any) => {
    if (!pushChainClient.value) {
      throw new Error('Push Chain client not initialized')
    }

    return new ethers.Contract(contractAddress, abi, universalSigner.value)
  }

  // Check if address is a Universal Execution Account (UEA)
  const checkIfUEA = async (address: string) => {
    if (!pushChainClient.value) {
      return { isUEA: false, origin: null }
    }

    try {
      // Use UEAFactory to check if address is a UEA
      const ueaFactory = new ethers.Contract(
        '0x00000000000000000000000000000000000000eA', // UEAFactory address
        [
          'function getOriginForUEA(address addr) external view returns (tuple(string chainNamespace, uint256 chainId, bytes owner) account, bool isUEA)'
        ],
        pushChainClient.value.provider
      )

      const [account, isUEA] = await ueaFactory.getOriginForUEA(address)
      
      return {
        isUEA,
        origin: isUEA ? {
          chainNamespace: account.chainNamespace,
          chainId: account.chainId.toString(),
          owner: account.owner
        } : null
      }
    } catch (error) {
      console.error('Failed to check UEA status:', error)
      return { isUEA: false, origin: null }
    }
  }

  // Disconnect
  const disconnect = () => {
    pushChainClient.value = null
    universalSigner.value = null
    isConnected.value = false
    userAddress.value = null
    userChain.value = null
  }

  // Computed properties
  const isReady = computed(() => {
    return pushChainClient.value !== null && universalSigner.value !== null
  })

  const userInfo = computed(() => {
    return {
      address: userAddress.value,
      chain: userChain.value,
      isConnected: isConnected.value
    }
  })

  return {
    // State
    pushChainClient,
    universalSigner,
    isConnected,
    userAddress,
    userChain,

    // Computed
    isReady,
    userInfo,

    // Methods
    initializePushChain,
    createUniversalSigner,
    sendUniversalTransaction,
    getUniversalContract,
    checkIfUEA,
    disconnect
  }
}
