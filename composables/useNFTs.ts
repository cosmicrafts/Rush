import { ref, computed } from 'vue'

interface NFT {
  tokenId: string
  name: string
  description: string
  image: string
  attributes: Array<{ trait_type: string; value: string }>
  type: string
  rarity: string
}

interface NFTCache {
  lastUpdated: number
  account: string
  nfts: NFT[]
}

export const useNFTs = () => {
  // State - NFTs are disabled for now
  const userNFTs = ref<NFT[]>([])
  const loading = ref(false)
  const refreshingInBackground = ref(false)
  const error = ref<string | null>(null)

  // Cache
  const nftCache = ref<NFTCache | null>(null)

  // Computed
  const hasNFTs = computed(() => false) // NFTs disabled
  const totalNFTs = computed(() => 0) // NFTs disabled

  // Cache validation (unused but kept for future use)
  // const isCacheValid = () => {
  //   return false // NFTs disabled
  // }

  // Load from cache (unused but kept for future use)
  // const loadFromCache = () => {
  //   // NFTs disabled
  // }

  // Update cache (unused but kept for future use)
  // const updateCache = (nfts: NFT[]) => {
  //   // NFTs disabled
  // }

  // Load user's NFTs with caching - NFTs disabled
  const loadUserNFTs = async (_useCache = true) => {
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
  const addNFTToMetaMask = async (_nft: NFT) => {
    console.log('⚠️ NFT functionality is currently disabled')
    throw new Error('NFT functionality is currently disabled')
  }

  // Bulk import all NFTs to MetaMask - NFTs disabled
  const bulkImportToMetaMask = async () => {
    console.log('⚠️ NFT functionality is currently disabled')
    return []
  }

  // Parse base64 metadata - NFTs disabled (unused but kept for future use)
  // const parseMetadata = (_uri: string) => {
  //   return {
  //     name: 'NFT Disabled',
  //     description: 'NFT functionality is currently disabled',
  //     image: '/nft-art/placeholder.png',
  //     attributes: [],
  //   }
  // }

  // Get rarity based on threshold - NFTs disabled (unused but kept for future use)
  // const getRarity = (_threshold: number) => {
  //   return 'Disabled'
  // }

  // Get NFT by token ID - NFTs disabled
  const getNFTById = (_tokenId: string) => {
    return null
  }

  // Get NFTs by type - NFTs disabled
  const getNFTsByType = (_type: string) => {
    return []
  }

  // Get NFTs by rarity - NFTs disabled
  const getNFTsByRarity = (_rarity: string) => {
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
