import { ref, computed } from 'vue'
import { ethers } from 'ethers'

export const usePushChainDynamic = () => {
  // State
  const isConnected = ref(false)
  const userAddress = ref<string | null>(null)
  const provider = ref<ethers.providers.Web3Provider | null>(null)
  const signer = ref<ethers.Signer | null>(null)
  const connecting = ref(false)

  // Connect wallet to Push Chain network
  const connectWallet = async () => {
    if (connecting.value) return
    
    connecting.value = true
    
    try {
      // Check if MetaMask is available
      if (!window.ethereum) {
        throw new Error('No wallet found. Please install MetaMask.')
      }

      console.log('🔗 Connecting to Push Chain...')

      // First switch to Push Chain network (this will add it if needed)
      await switchToPushChain()

      // Request account access
      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      })

      if (accounts.length === 0) {
        throw new Error('No accounts found')
      }

      // Create ethers provider and signer for Push Chain
      const web3Provider = new ethers.providers.Web3Provider(window.ethereum)
      const ethersSigner = web3Provider.getSigner()
      
      // Verify we're connected to the right network
      const network = await web3Provider.getNetwork()
      console.log('📍 Connected to network:', network.name, 'Chain ID:', network.chainId)
      
      if (network.chainId !== 42101) {
        throw new Error(`Wrong network. Expected Push Chain (42101), got ${network.chainId}`)
      }

      provider.value = web3Provider
      signer.value = ethersSigner
      userAddress.value = accounts[0]
      isConnected.value = true

      console.log('✅ Connected to Push Chain successfully')
      console.log('📍 Address:', accounts[0])
      
      return ethersSigner
    } catch (error: any) {
      console.error('Failed to connect wallet:', error)
      throw error
    } finally {
      connecting.value = false
    }
  }

  // Disconnect wallet
  const disconnectWallet = () => {
    isConnected.value = false
    userAddress.value = null
    provider.value = null
    signer.value = null
    console.log('👋 Disconnected from Push Chain')
  }

  // Switch to Push Chain network
  const switchToPushChain = async () => {
    if (!window.ethereum) {
      throw new Error('No wallet found')
    }

    try {
       // Try to switch to Push Chain
       await window.ethereum.request({
         method: 'wallet_switchEthereumChain',
         params: [{ chainId: '0xa475' }], // 42101 in hex
       })
    } catch (switchError: any) {
      // If network doesn't exist (code 4902) or unrecognized chain (code -32603), add it
      if (switchError.code === 4902 || switchError.code === -32603) {
        console.log('Adding Push Chain network to wallet...')
        await window.ethereum.request({
           method: 'wallet_addEthereumChain',
           params: [{
             chainId: '0xa475',
            chainName: 'Push Chain Donut Testnet',
            rpcUrls: ['https://evm.rpc-testnet-donut-node1.push.org/'],
            nativeCurrency: {
              name: 'Push Chain Token',
              symbol: 'PC',
              decimals: 18,
            },
            blockExplorerUrls: ['https://donut.push.network/'],
          }],
        })
        
         // After adding, try to switch again
         await window.ethereum.request({
           method: 'wallet_switchEthereumChain',
           params: [{ chainId: '0xa475' }],
         })
      } else {
        throw switchError
      }
    }
  }

  // Send transaction using ethers signer
  const sendTransaction = async (to: string, value: string, data?: string) => {
    if (!signer.value) {
      throw new Error('Signer not initialized')
    }

    try {
      const tx = await signer.value.sendTransaction({
        to,
        value: ethers.utils.parseEther(value),
        data: data || '0x'
      })

      console.log('✅ Transaction sent:', tx.hash)
      return tx
    } catch (error) {
      console.error('Failed to send transaction:', error)
      throw error
    }
  }

  // Computed properties
  const shortAddress = computed(() => {
    if (!userAddress.value) return ''
    return `${userAddress.value.slice(0, 6)}...${userAddress.value.slice(-4)}`
  })

  return {
    // State
    isConnected,
    userAddress,
    shortAddress,
    connecting,
    provider,
    signer,

    // Methods
    connectWallet,
    disconnectWallet,
    sendTransaction,
    switchToPushChain
  }
}
