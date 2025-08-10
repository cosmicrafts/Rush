<template>
  <div class="nft-wallet-integration">
    <h3>🎨 Achievement NFTs</h3>
    
    <!-- NFT Collection Overview -->
    <div class="nft-overview">
      <div class="stats">
        <div class="stat">
          <span class="label">Total NFTs:</span>
          <span class="value">{{ userNFTs.length }}</span>
        </div>
        <div class="stat">
          <span class="label">Contract:</span>
          <span class="value contract-address">{{ contractAddress }}</span>
        </div>
      </div>
    </div>

    <!-- NFT Grid -->
    <div class="nft-grid" v-if="userNFTs.length > 0">
      <div 
        v-for="nft in userNFTs" 
        :key="nft.tokenId" 
        class="nft-card"
        @click="addNFTToMetaMask(nft)"
      >
        <div class="nft-image">
          <img :src="nft.image" :alt="nft.name" />
        </div>
        <div class="nft-info">
          <h4>{{ nft.name }}</h4>
          <p>{{ nft.description }}</p>
          <div class="nft-attributes">
            <span class="attribute">{{ nft.type }}</span>
            <span class="attribute">{{ nft.spaceship }}</span>
            <span class="attribute rarity" :class="nft.rarity.toLowerCase()">
              {{ nft.rarity }}
            </span>
          </div>
        </div>
        <div class="nft-actions">
          <button 
            class="add-to-wallet-btn"
            @click.stop="addNFTToMetaMask(nft)"
            :disabled="addingNFT === nft.tokenId"
          >
            {{ addingNFT === nft.tokenId ? 'Adding...' : 'Add to MetaMask' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="empty-state">
      <div class="empty-icon">🏆</div>
      <h4>No Achievement NFTs Yet</h4>
      <p>Start racing to earn epic achievement NFTs!</p>
    </div>

    <!-- Bulk Import -->
    <div class="bulk-import" v-if="userNFTs.length > 0">
      <h4>Bulk Import to MetaMask</h4>
      <p>Add all your achievement NFTs to MetaMask at once</p>
      <button 
        class="bulk-import-btn"
        @click="bulkImportToMetaMask"
        :disabled="bulkImporting"
      >
        {{ bulkImporting ? 'Importing...' : `Import All ${userNFTs.length} NFTs` }}
      </button>
    </div>

    <!-- Instructions -->
    <div class="instructions">
      <h4>How to View NFTs in MetaMask</h4>
      <ol>
        <li>Click "Add to MetaMask" on any NFT above</li>
        <li>Or manually import: MetaMask → NFTs → Import NFT</li>
        <li>Contract: <code>{{ contractAddress }}</code></li>
        <li>Token ID: The number shown on each NFT</li>
      </ol>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useWeb3 } from '~/composables/useWeb3'

const { account, isConnected } = useWeb3()

// Contract addresses (update with your deployed addresses)
const contractAddress = '0x9E545E3C0baAB3E08CdfD552C960A1050f373042'

// State
const userNFTs = ref([])
const addingNFT = ref(null)
const bulkImporting = ref(false)

// Computed
const hasNFTs = computed(() => userNFTs.value.length > 0)

// Methods
const loadUserNFTs = async () => {
  if (!isConnected.value || !account.value) return

  try {
    // Get user's NFTs from contract
    const tokens = await window.ethereum.request({
      method: 'eth_call',
      params: [{
        to: contractAddress,
        data: '0x' + 'getTokensOfOwner' + '000000000000000000000000' + account.value.slice(2)
      }]
    })

    // Parse token IDs
    const tokenIds = parseTokenIds(tokens)
    
    // Get metadata for each token
    const nfts = []
    for (const tokenId of tokenIds) {
      const metadata = await getNFTMetadata(tokenId)
      nfts.push({
        tokenId,
        ...metadata
      })
    }

    userNFTs.value = nfts
  } catch (error) {
    console.error('Error loading NFTs:', error)
  }
}

const getNFTMetadata = async (tokenId) => {
  try {
    // Get achievement info
    const info = await window.ethereum.request({
      method: 'eth_call',
      params: [{
        to: contractAddress,
        data: '0x' + 'getAchievementInfo' + tokenId.toString().padStart(64, '0')
      }]
    })

    // Get token URI
    const uri = await window.ethereum.request({
      method: 'eth_call',
      params: [{
        to: contractAddress,
        data: '0x' + 'tokenURI' + tokenId.toString().padStart(64, '0')
      }]
    })

    // Parse metadata
    const metadata = parseMetadata(uri)
    
    return {
      name: metadata.name,
      description: metadata.description,
      image: metadata.image,
      type: metadata.attributes.find(attr => attr.trait_type === 'Type')?.value || 'Unknown',
      spaceship: metadata.attributes.find(attr => attr.trait_type === 'Spaceship')?.value || 'None',
      rarity: metadata.attributes.find(attr => attr.trait_type === 'Rarity')?.value || 'Common'
    }
  } catch (error) {
    console.error('Error getting NFT metadata:', error)
    return {
      name: `Achievement #${tokenId}`,
      description: 'Achievement NFT',
      image: '/nft-art/placeholder.png',
      type: 'Unknown',
      spaceship: 'None',
      rarity: 'Common'
    }
  }
}

const addNFTToMetaMask = async (nft) => {
  if (!window.ethereum) {
    alert('MetaMask not found! Please install MetaMask.')
    return
  }

  addingNFT.value = nft.tokenId

  try {
    await window.ethereum.request({
      method: 'wallet_watchAsset',
      params: {
        type: 'ERC721',
        options: {
          address: contractAddress,
          tokenId: nft.tokenId.toString(),
          image: nft.image
        }
      }
    })

    alert(`✅ ${nft.name} added to MetaMask!`)
  } catch (error) {
    console.error('Error adding NFT to MetaMask:', error)
    alert('❌ Failed to add NFT to MetaMask. Please try manually importing.')
  } finally {
    addingNFT.value = null
  }
}

const bulkImportToMetaMask = async () => {
  if (!window.ethereum) {
    alert('MetaMask not found! Please install MetaMask.')
    return
  }

  bulkImporting.value = true

  try {
    for (const nft of userNFTs.value) {
      await window.ethereum.request({
        method: 'wallet_watchAsset',
        params: {
          type: 'ERC721',
          options: {
            address: contractAddress,
            tokenId: nft.tokenId.toString(),
            image: nft.image
          }
        }
      })
    }

    alert(`✅ All ${userNFTs.value.length} NFTs added to MetaMask!`)
  } catch (error) {
    console.error('Error bulk importing NFTs:', error)
    alert('❌ Failed to import some NFTs. Please try individually.')
  } finally {
    bulkImporting.value = false
  }
}

const parseTokenIds = (data) => {
  // Parse the returned data to extract token IDs
  // This is a simplified version - you'll need to implement proper parsing
  const tokenIds = []
  // Implementation depends on the exact format returned by the contract
  return tokenIds
}

const parseMetadata = (uri) => {
  // Parse the base64 metadata
  try {
    const jsonStr = atob(uri.replace('data:application/json;base64,', ''))
    return JSON.parse(jsonStr)
  } catch (error) {
    console.error('Error parsing metadata:', error)
    return {
      name: 'Unknown NFT',
      description: 'Metadata unavailable',
      image: '/nft-art/placeholder.png',
      attributes: []
    }
  }
}

// Lifecycle
onMounted(() => {
  if (isConnected.value) {
    loadUserNFTs()
  }
})

// Watch for account changes
watch(account, () => {
  if (isConnected.value) {
    loadUserNFTs()
  }
})
</script>

<style scoped>
.nft-wallet-integration {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.nft-overview {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 30px;
  color: white;
}

.stats {
  display: flex;
  gap: 30px;
}

.stat {
  display: flex;
  flex-direction: column;
}

.label {
  font-size: 14px;
  opacity: 0.8;
}

.value {
  font-size: 18px;
  font-weight: bold;
}

.contract-address {
  font-family: monospace;
  font-size: 14px;
  background: rgba(255, 255, 255, 0.1);
  padding: 4px 8px;
  border-radius: 4px;
}

.nft-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.nft-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s, box-shadow 0.2s;
  cursor: pointer;
}

.nft-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.nft-image {
  width: 100%;
  height: 200px;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 15px;
  background: linear-gradient(45deg, #f0f0f0, #e0e0e0);
  display: flex;
  align-items: center;
  justify-content: center;
}

.nft-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.nft-info h4 {
  margin: 0 0 8px 0;
  font-size: 18px;
  color: #333;
}

.nft-info p {
  margin: 0 0 15px 0;
  color: #666;
  font-size: 14px;
  line-height: 1.4;
}

.nft-attributes {
  display: flex;
  gap: 8px;
  margin-bottom: 15px;
}

.attribute {
  background: #f0f0f0;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.rarity.common { background: #e0e0e0; color: #666; }
.rarity.uncommon { background: #90EE90; color: #2d5a2d; }
.rarity.rare { background: #87CEEB; color: #2d5a5a; }
.rarity.epic { background: #DDA0DD; color: #5a2d5a; }
.rarity.legendary { background: #FFD700; color: #5a5a2d; }

.add-to-wallet-btn {
  width: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 12px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s;
}

.add-to-wallet-btn:hover:not(:disabled) {
  opacity: 0.9;
}

.add-to-wallet-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #666;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 20px;
}

.bulk-import {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 30px;
  text-align: center;
}

.bulk-import h4 {
  margin: 0 0 10px 0;
  color: #333;
}

.bulk-import p {
  margin: 0 0 20px 0;
  color: #666;
}

.bulk-import-btn {
  background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
  color: white;
  border: none;
  padding: 15px 30px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s;
}

.bulk-import-btn:hover:not(:disabled) {
  opacity: 0.9;
}

.bulk-import-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.instructions {
  background: #fff3cd;
  border: 1px solid #ffeaa7;
  border-radius: 8px;
  padding: 20px;
}

.instructions h4 {
  margin: 0 0 15px 0;
  color: #856404;
}

.instructions ol {
  margin: 0;
  padding-left: 20px;
  color: #856404;
}

.instructions li {
  margin-bottom: 8px;
}

.instructions code {
  background: #f8f9fa;
  padding: 2px 6px;
  border-radius: 4px;
  font-family: monospace;
  font-size: 12px;
}
</style>
