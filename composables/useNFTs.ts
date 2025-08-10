import { ref, computed } from 'vue'
import { useWeb3 } from './useWeb3'

export const useNFTs = () => {
  const { account, isConnected, provider } = useWeb3()
  
  // Contract addresses
  const ACHIEVEMENT_NFT_ADDRESS = '0xa82fF9aFd8f496c3d6ac40E2a0F282E47488CFc9'
  
  // State
  const userNFTs = ref<any[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Computed
  const hasNFTs = computed(() => userNFTs.value.length > 0)
  const totalNFTs = computed(() => userNFTs.value.length)

  // Load user's NFTs
  const loadUserNFTs = async () => {
    if (!isConnected.value || !account.value || !provider.value) return

    loading.value = true
    error.value = null

    try {
      // Get user's NFTs using ethers.js
      const contract = new (await import('ethers')).ethers.Contract(
        ACHIEVEMENT_NFT_ADDRESS,
        [
          'function getTokensOfOwner(address owner) external view returns (uint256[] memory)',
          'function getAchievementInfo(uint256 tokenId) external view returns (string memory name, string memory description, string memory achievementType, uint8 spaceshipId, uint256 threshold)',
          'function tokenURI(uint256 tokenId) external view returns (string memory)'
        ],
        provider.value
      )

      // Get token IDs
      const tokenIds = await contract.getTokensOfOwner(account.value)
      
      // Get metadata for each token
      const nfts = []
      for (const tokenId of tokenIds) {
        try {
          const [name, description, type, shipId, threshold] = await contract.getAchievementInfo(tokenId)
          const tokenURI = await contract.tokenURI(tokenId)
          
          // Parse metadata
          const metadata = parseMetadata(tokenURI)
          
          nfts.push({
            tokenId: tokenId.toString(),
            name,
            description,
            type,
            shipId: shipId.toString(),
            threshold: threshold.toString(),
            image: metadata.image,
            attributes: metadata.attributes,
            rarity: getRarity(threshold)
          })
        } catch (err) {
          console.error(`Error loading NFT ${tokenId}:`, err)
        }
      }

      userNFTs.value = nfts
    } catch (err) {
      console.error('Error loading NFTs:', err)
      error.value = 'Failed to load NFTs'
    } finally {
      loading.value = false
    }
  }

  // Add single NFT to MetaMask
  const addNFTToMetaMask = async (nft: any) => {
    if (!window.ethereum) {
      throw new Error('MetaMask not found')
    }

    try {
      await window.ethereum.request({
        method: 'wallet_watchAsset',
        params: {
          type: 'ERC721',
          options: {
            address: ACHIEVEMENT_NFT_ADDRESS,
            tokenId: nft.tokenId,
            image: nft.image
          }
        }
      })
      
      return true
    } catch (err) {
      console.error('Error adding NFT to MetaMask:', err)
      throw new Error('Failed to add NFT to MetaMask')
    }
  }

  // Bulk import all NFTs to MetaMask
  const bulkImportToMetaMask = async () => {
    if (!window.ethereum) {
      throw new Error('MetaMask not found')
    }

    const results = []
    
    for (const nft of userNFTs.value) {
      try {
        await addNFTToMetaMask(nft)
        results.push({ tokenId: nft.tokenId, success: true })
      } catch (err) {
        results.push({ tokenId: nft.tokenId, success: false, error: err })
      }
    }

    return results
  }

  // Parse base64 metadata
  const parseMetadata = (uri: string) => {
    try {
      const jsonStr = atob(uri.replace('data:application/json;base64,', ''))
      return JSON.parse(jsonStr)
    } catch (err) {
      console.error('Error parsing metadata:', err)
      return {
        name: 'Unknown NFT',
        description: 'Metadata unavailable',
        image: '/nft-art/placeholder.png',
        attributes: []
      }
    }
  }

  // Get rarity based on threshold
  const getRarity = (threshold: number) => {
    if (threshold <= 5) return 'Common'
    if (threshold <= 15) return 'Uncommon'
    if (threshold <= 50) return 'Rare'
    if (threshold <= 100) return 'Epic'
    return 'Legendary'
  }

  // Get NFT by token ID
  const getNFTById = (tokenId: string) => {
    return userNFTs.value.find(nft => nft.tokenId === tokenId)
  }

  // Get NFTs by type
  const getNFTsByType = (type: string) => {
    return userNFTs.value.filter(nft => nft.type === type)
  }

  // Get NFTs by rarity
  const getNFTsByRarity = (rarity: string) => {
    return userNFTs.value.filter(nft => nft.rarity === rarity)
  }

  // Get manual import instructions
  const getManualImportInstructions = () => {
    return {
      contractAddress: ACHIEVEMENT_NFT_ADDRESS,
      steps: [
        'Open MetaMask',
        'Go to NFTs tab',
        'Click "Import NFT"',
        `Enter contract address: ${ACHIEVEMENT_NFT_ADDRESS}`,
        'Enter token ID (1, 2, 3, etc.)',
        'Click "Add"'
      ]
    }
  }

  return {
    // State
    userNFTs,
    loading,
    error,
    
    // Computed
    hasNFTs,
    totalNFTs,
    
    // Methods
    loadUserNFTs,
    addNFTToMetaMask,
    bulkImportToMetaMask,
    getNFTById,
    getNFTsByType,
    getNFTsByRarity,
    getManualImportInstructions
  }
}
