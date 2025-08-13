<template>
  <div class="nft-wallet-integration">
    <h3>🎨 Achievement NFTs</h3>

    <!-- NFT Collection Overview -->
    <div class="nft-overview">
      <div class="stats">
        <div class="stat">
          <span class="label">Total NFTs:</span>
          <span class="value">{{ totalNFTs }}</span>
        </div>
        <div class="stat">
          <span class="label">Contract:</span>
          <span class="value contract-address">{{ contractAddress }}</span>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <div class="loading-spinner"/>
      <p>Loading your achievement NFTs...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-state">
      <div class="error-icon">❌</div>
      <h4>Error Loading NFTs</h4>
      <p>{{ error }}</p>
      <button class="retry-btn" @click="loadUserNFTs">Retry</button>
    </div>

    <!-- NFT Grid -->
    <div v-else-if="hasNFTs" class="nft-grid">
      <div
        v-for="nft in userNFTs"
        :key="nft.tokenId"
        class="nft-card"
        @click="handleAddNFTToMetaMask(nft)"
      >
        <div class="nft-image">
          <img :src="nft.image" :alt="nft.name" >
        </div>
        <div class="nft-info">
          <h4>{{ nft.name }}</h4>
          <p>{{ nft.description }}</p>
          <div class="nft-attributes">
            <span class="attribute">{{ nft.type }}</span>
            <span class="attribute">{{ nft.spaceship || 'None' }}</span>
            <span class="attribute rarity" :class="nft.rarity.toLowerCase()">
              {{ nft.rarity }}
            </span>
          </div>
        </div>
        <div class="nft-actions">
          <button
            class="add-to-wallet-btn"
            :disabled="addingNFT === nft.tokenId"
            @click.stop="handleAddNFTToMetaMask(nft)"
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
    <div v-if="hasNFTs" class="bulk-import">
      <h4>Bulk Import to MetaMask</h4>
      <p>Add all your achievement NFTs to MetaMask at once</p>
      <button class="bulk-import-btn" :disabled="bulkImporting" @click="handleBulkImportToMetaMask">
        {{ bulkImporting ? 'Importing...' : `Import All ${totalNFTs} NFTs` }}
      </button>
    </div>

    <!-- Instructions -->
    <div class="instructions">
      <h4>How to View NFTs in MetaMask</h4>
      <ol>
        <li>Click "Add to MetaMask" on any NFT above</li>
        <li>Or manually import: MetaMask → NFTs → Import NFT</li>
        <li>
          Contract: <code>{{ contractAddress }}</code>
        </li>
        <li>Token ID: The number shown on each NFT</li>
      </ol>
    </div>
  </div>
</template>

<script setup>
  import { ref, onMounted, watch } from 'vue'
  import { useWeb3 } from '~/composables/useWeb3'
  import { useNFTs } from '~/composables/useNFTs'

  const { account, isConnected } = useWeb3()
  const {
    userNFTs,
    loading,
    error,
    hasNFTs,
    totalNFTs,
    loadUserNFTs,
    addNFTToMetaMask,
    bulkImportToMetaMask,
  } = useNFTs()

  // Get contract address from runtime config
  const config = useRuntimeConfig()
  const contractAddress = config.public.achievementNFTAddress || 'Not deployed'

  // Local state for UI
  const addingNFT = ref(null)
  const bulkImporting = ref(false)

  // Enhanced addNFTToMetaMask with loading state
  const handleAddNFTToMetaMask = async nft => {
    addingNFT.value = nft.tokenId

    try {
      await addNFTToMetaMask(nft)
      alert(`✅ ${nft.name} added to MetaMask!`)
    } catch (err) {
      console.error('Error adding NFT to MetaMask:', err)
      alert('❌ Failed to add NFT to MetaMask. Please try manually importing.')
    } finally {
      addingNFT.value = null
    }
  }

  // Enhanced bulk import with loading state
  const handleBulkImportToMetaMask = async () => {
    bulkImporting.value = true

    try {
      const results = await bulkImportToMetaMask()
      const successCount = results.filter(r => r.success).length
      const failCount = results.length - successCount

      if (failCount === 0) {
        alert(`✅ All ${successCount} NFTs added to MetaMask!`)
      } else {
        alert(
          `✅ ${successCount} NFTs added successfully, ${failCount} failed. Please try individually.`
        )
      }
    } catch (err) {
      console.error('Error bulk importing NFTs:', err)
      alert('❌ Failed to import some NFTs. Please try individually.')
    } finally {
      bulkImporting.value = false
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

  // Watch for connection changes
  watch(isConnected, () => {
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

  .loading-state {
    text-align: center;
    padding: 60px 20px;
    color: #666;
  }

  .loading-spinner {
    border: 4px solid #f3f3f3;
    border-top: 4px solid #667eea;
    border-radius: 50%;
    width: 40px;
    height: 40px;
    animation: spin 1s linear infinite;
    margin: 0 auto 20px;
  }

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }

  .error-state {
    text-align: center;
    padding: 60px 20px;
    color: #d32f2f;
  }

  .error-icon {
    font-size: 48px;
    margin-bottom: 20px;
  }

  .retry-btn {
    background: #d32f2f;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 8px;
    cursor: pointer;
    margin-top: 15px;
  }

  .retry-btn:hover {
    background: #b71c1c;
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
    transition:
      transform 0.2s,
      box-shadow 0.2s;
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

  .rarity.common {
    background: #e0e0e0;
    color: #666;
  }
  .rarity.uncommon {
    background: #90ee90;
    color: #2d5a2d;
  }
  .rarity.rare {
    background: #87ceeb;
    color: #2d5a5a;
  }
  .rarity.epic {
    background: #dda0dd;
    color: #5a2d5a;
  }
  .rarity.legendary {
    background: #ffd700;
    color: #5a5a2d;
  }

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
