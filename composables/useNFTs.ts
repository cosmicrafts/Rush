import { ref, computed } from 'vue'
import { useWeb3 } from './useWeb3'

interface NFTCache {
  lastUpdated: number
  account: string
  nfts: any[]
}

export const useNFTs = () => {
  const { account, isConnected, getSafeProvider } = useWeb3()

  // Get contract address from runtime config
  const config = useRuntimeConfig()
  const ACHIEVEMENT_NFT_ADDRESS = config.public.achievementNFTAddress

  // State - NFTs are disabled for now
  const userNFTs = ref<any[]>([])
  const loading = ref(false)
  const refreshingInBackground = ref(false)
  const error = ref<string | null>(null)

  // Cache
  const nftCache = ref<NFTCache | null>(null)
  const cacheValidDuration = 60000 // 60 seconds for NFTs

  // Computed
  const hasNFTs = computed(() => false) // NFTs disabled
  const totalNFTs = computed(() => 0) // NFTs disabled

  // Cache validation
  const isCacheValid = () => {
    return false // NFTs disabled
  }

  // Load from cache
  const loadFromCache = () => {
    // NFTs disabled
  }

  // Update cache
  const updateCache = (nfts: any[]) => {
    // NFTs disabled
  }

  // Load user's NFTs with caching - NFTs disabled
  const loadUserNFTs = async (useCache = true) => {
    console.log('⚠️ NFT functionality is currently disabled')
    userNFTs.value = []
    loading.value = false
    error.value = null
  }

  // Background refresh - NFTs disabled
  const refreshNFTsInBackground = async () => {
    console.log('⚠️ NFT functionality is currently disabled')
    refreshingInBackground.value = false
  }

  // Invalidate cache
  const invalidateCache = () => {
    nftCache.value = null
  }

  // Add single NFT to MetaMask - NFTs disabled
  const addNFTToMetaMask = async (nft: any) => {
    console.log('⚠️ NFT functionality is currently disabled')
    throw new Error('NFT functionality is currently disabled')
  }

  // Bulk import all NFTs to MetaMask - NFTs disabled
  const bulkImportToMetaMask = async () => {
    console.log('⚠️ NFT functionality is currently disabled')
    return []
  }

  // Parse base64 metadata - NFTs disabled
  const parseMetadata = (uri: string) => {
    return {
      name: 'NFT Disabled',
      description: 'NFT functionality is currently disabled',
      image: '/nft-art/placeholder.png',
      attributes: [],
    }
  }

  // Get rarity based on threshold - NFTs disabled
  const getRarity = (threshold: number) => {
    return 'Disabled'
  }

  // Get NFT by token ID - NFTs disabled
  const getNFTById = (tokenId: string) => {
    return null
  }

  // Get NFTs by type - NFTs disabled
  const getNFTsByType = (type: string) => {
    return []
  }

  // Get NFTs by rarity - NFTs disabled
  const getNFTsByRarity = (rarity: string) => {
    return []
  }

  // Get manual import instructions - NFTs disabled
  const getManualImportInstructions = () => {
    return {
      contractAddress: 'NFTs Disabled',
      steps: ['NFT functionality is currently disabled', 'Please check back later for updates'],
    }
  }

  return {
    // State
    userNFTs,
    loading,
    error,
    refreshingInBackground,

    // Computed
    hasNFTs,
    totalNFTs,

    // Methods
    loadUserNFTs,
    refreshNFTsInBackground,
    invalidateCache,
    addNFTToMetaMask,
    bulkImportToMetaMask,
    getNFTById,
    getNFTsByType,
    getNFTsByRarity,
    getManualImportInstructions,
  }
}
