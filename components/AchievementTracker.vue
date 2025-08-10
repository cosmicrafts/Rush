<template>
  <div class="achievement-tracker">
    <div class="header">
      <h3 class="title">🏆 Achievement Tracker</h3>
      <div class="stats">
        <div class="stat">
          <span class="label">Unlocked:</span>
          <span class="value">{{ unlockedCount }}/{{ totalAchievements }}</span>
        </div>
        <div class="stat">
          <span class="label">Rewards:</span>
          <SpiralToken :amount="totalRewards" color="yellow" size="sm" />
        </div>
      </div>
    </div>

    <!-- Achievement Categories -->
    <div class="categories">
      <!-- Betting Achievements -->
      <div class="category">
        <h4 class="category-title">🎯 Betting Achievements</h4>
        <div class="achievements-grid">
          <div 
            v-for="achievement in bettingAchievements" 
            :key="achievement.id"
            class="achievement-card"
            :class="{ unlocked: achievement.unlocked, locked: !achievement.unlocked }"
          >
            <div class="achievement-icon">
              <span v-if="achievement.unlocked" class="unlocked-icon">✅</span>
              <span v-else class="locked-icon">🔒</span>
            </div>
            <div class="achievement-info">
              <h5 class="achievement-name">{{ achievement.name }}</h5>
              <p class="achievement-description">{{ achievement.description }}</p>
              <div class="achievement-progress">
                <div class="progress-bar">
                  <div 
                    class="progress-fill" 
                    :style="{ width: `${achievement.progressPercent}%` }"
                  ></div>
                </div>
                <span class="progress-text">{{ achievement.current }}/{{ achievement.threshold }}</span>
              </div>
              <div class="achievement-reward">
                <span class="reward-amount">{{ achievement.reward }} SPIRAL</span>
                <span v-if="achievement.unlocked" class="reward-status">✅ Claimed</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Placement Achievements -->
      <div class="category">
        <h4 class="category-title">🏆 Placement Achievements</h4>
        <div class="achievements-grid">
          <div 
            v-for="achievement in placementAchievements" 
            :key="achievement.id"
            class="achievement-card"
            :class="{ unlocked: achievement.unlocked, locked: !achievement.unlocked }"
          >
            <div class="achievement-icon">
              <span v-if="achievement.unlocked" class="unlocked-icon">✅</span>
              <span v-else class="locked-icon">🔒</span>
            </div>
            <div class="achievement-info">
              <h5 class="achievement-name">{{ achievement.name }}</h5>
              <p class="achievement-description">{{ achievement.description }}</p>
              <div class="achievement-progress">
                <div class="progress-bar">
                  <div 
                    class="progress-fill" 
                    :style="{ width: `${achievement.progressPercent}%` }"
                  ></div>
                </div>
                <span class="progress-text">{{ achievement.current }}/{{ achievement.threshold }}</span>
              </div>
              <div class="achievement-reward">
                <span class="reward-amount">{{ achievement.reward }} SPIRAL</span>
                <span v-if="achievement.unlocked" class="reward-status">✅ Claimed</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Milestone Achievements -->
      <div class="category">
        <h4 class="category-title">🌟 Milestone Achievements</h4>
        <div class="achievements-grid">
          <div 
            v-for="achievement in milestoneAchievements" 
            :key="achievement.id"
            class="achievement-card"
            :class="{ unlocked: achievement.unlocked, locked: !achievement.unlocked }"
          >
            <div class="achievement-icon">
              <span v-if="achievement.unlocked" class="unlocked-icon">✅</span>
              <span v-else class="locked-icon">🔒</span>
            </div>
            <div class="achievement-info">
              <h5 class="achievement-name">{{ achievement.name }}</h5>
              <p class="achievement-description">{{ achievement.description }}</p>
              <div class="achievement-progress">
                <div class="progress-bar">
                  <div 
                    class="progress-fill" 
                    :style="{ width: `${achievement.progressPercent}%` }"
                  ></div>
                </div>
                <span class="progress-text">{{ achievement.current }}/{{ achievement.threshold }}</span>
              </div>
              <div class="achievement-reward">
                <span class="reward-amount">{{ achievement.reward }} SPIRAL</span>
                <span v-if="achievement.unlocked" class="reward-status">✅ Claimed</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Special Achievements -->
      <div class="category">
        <h4 class="category-title">👑 Special Achievements</h4>
        <div class="achievements-grid">
          <div 
            v-for="achievement in specialAchievements" 
            :key="achievement.id"
            class="achievement-card"
            :class="{ unlocked: achievement.unlocked, locked: !achievement.unlocked }"
          >
            <div class="achievement-icon">
              <span v-if="achievement.unlocked" class="unlocked-icon">✅</span>
              <span v-else class="locked-icon">🔒</span>
            </div>
            <div class="achievement-info">
              <h5 class="achievement-name">{{ achievement.name }}</h5>
              <p class="achievement-description">{{ achievement.description }}</p>
              <div class="achievement-progress">
                <div class="progress-bar">
                  <div 
                    class="progress-fill" 
                    :style="{ width: `${achievement.progressPercent}%` }"
                  ></div>
                </div>
                <span class="progress-text">{{ achievement.current }}/{{ achievement.threshold }}</span>
              </div>
              <div class="achievement-reward">
                <span class="reward-amount">{{ achievement.reward }} SPIRAL</span>
                <span v-if="achievement.unlocked" class="reward-status">✅ Claimed</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- NFT Collection -->
    <div v-if="userNFTs.length > 0" class="nft-section">
      <h4 class="section-title">🎨 Your Achievement NFTs</h4>
      <div class="nft-grid">
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
            <h5 class="nft-name">{{ nft.name }}</h5>
            <p class="nft-description">{{ nft.description }}</p>
            <div class="nft-attributes">
              <span class="attribute">{{ nft.type }}</span>
              <span class="attribute rarity" :class="nft.rarity.toLowerCase()">
                {{ nft.rarity }}
              </span>
            </div>
          </div>
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

    <!-- Loading State -->
    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      <p>Loading achievements...</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useWeb3 } from '~/composables/useWeb3'
import SpiralToken from './SpiralToken.vue'

const { account, isConnected } = useWeb3()

// State
const loading = ref(false)
const userNFTs = ref([])
const addingNFT = ref(null)
const playerStats = ref(null)

// Achievement definitions
const achievementDefinitions = {
  betting: [
    { id: 'bet-5', name: 'The Rising Star', description: 'Place 5 bets on any ship', threshold: 5, reward: 50 },
    { id: 'bet-25', name: 'Bearer of the Crest', description: 'Place 25 bets on any ship', threshold: 25, reward: 200 },
    { id: 'bet-100', name: 'Eternal Overseer', description: 'Place 100 bets on any ship', threshold: 100, reward: 1000 }
  ],
  placement: [
    { id: 'win-3', name: 'Triumphant Warrior', description: 'Win 3 races', threshold: 3, reward: 150 },
    { id: 'win-10', name: 'Dominant Force', description: 'Win 10 races', threshold: 10, reward: 500 },
    { id: 'second-5', name: 'Guardian-in-Training', description: 'Place 2nd 5 times', threshold: 5, reward: 100 },
    { id: 'second-20', name: 'Keeper of the Code', description: 'Place 2nd 20 times', threshold: 20, reward: 400 },
    { id: 'third-10', name: 'Pathfinder of Peace', description: 'Place 3rd 10 times', threshold: 10, reward: 75 },
    { id: 'third-50', name: 'Sentinel of Stability', description: 'Place 3rd 50 times', threshold: 50, reward: 300 },
    { id: 'fourth-15', name: 'Harbinger of Harmony', description: 'Place 4th 15 times', threshold: 15, reward: 50 },
    { id: 'fourth-75', name: 'Wielder of the Will', description: 'Place 4th 75 times', threshold: 75, reward: 250 }
  ],
  milestone: [
    { id: 'races-10', name: 'Initiate of the Cosmos', description: 'Complete 10 races', threshold: 10, reward: 100 },
    { id: 'races-50', name: 'Strategist in Training', description: 'Complete 50 races', threshold: 50, reward: 500 },
    { id: 'races-100', name: 'Guardian of the Galaxy', description: 'Complete 100 races', threshold: 100, reward: 2000 }
  ],
  special: [
    { id: 'winnings-10k', name: 'Cosmic Conqueror', description: 'Amass 10,000 SPIRAL in winnings', threshold: 10000, reward: 5000 },
    { id: 'super-jackpot', name: 'Super Jackpot Hunter', description: 'Hit the Super Jackpot', threshold: 1, reward: 3000 }
  ]
}

// Computed achievements with progress
const bettingAchievements = computed(() => {
  if (!playerStats.value) return achievementDefinitions.betting.map(def => ({ ...def, current: 0, unlocked: false, progressPercent: 0 }))
  
  return achievementDefinitions.betting.map(def => {
    const current = getBettingProgress(def.id)
    const unlocked = current >= def.threshold
    const progressPercent = Math.min((current / def.threshold) * 100, 100)
    
    return { ...def, current, unlocked, progressPercent }
  })
})

const placementAchievements = computed(() => {
  if (!playerStats.value) return achievementDefinitions.placement.map(def => ({ ...def, current: 0, unlocked: false, progressPercent: 0 }))
  
  return achievementDefinitions.placement.map(def => {
    const current = getPlacementProgress(def.id)
    const unlocked = current >= def.threshold
    const progressPercent = Math.min((current / def.threshold) * 100, 100)
    
    return { ...def, current, unlocked, progressPercent }
  })
})

const milestoneAchievements = computed(() => {
  if (!playerStats.value) return achievementDefinitions.milestone.map(def => ({ ...def, current: 0, unlocked: false, progressPercent: 0 }))
  
  return achievementDefinitions.milestone.map(def => {
    const current = getMilestoneProgress(def.id)
    const unlocked = current >= def.threshold
    const progressPercent = Math.min((current / def.threshold) * 100, 100)
    
    return { ...def, current, unlocked, progressPercent }
  })
})

const specialAchievements = computed(() => {
  if (!playerStats.value) return achievementDefinitions.special.map(def => ({ ...def, current: 0, unlocked: false, progressPercent: 0 }))
  
  return achievementDefinitions.special.map(def => {
    const current = getSpecialProgress(def.id)
    const unlocked = current >= def.threshold
    const progressPercent = Math.min((current / def.threshold) * 100, 100)
    
    return { ...def, current, unlocked, progressPercent }
  })
})

// Computed totals
const unlockedCount = computed(() => {
  return [...bettingAchievements.value, ...placementAchievements.value, ...milestoneAchievements.value, ...specialAchievements.value]
    .filter(achievement => achievement.unlocked).length
})

const totalAchievements = computed(() => {
  return achievementDefinitions.betting.length + 
         achievementDefinitions.placement.length + 
         achievementDefinitions.milestone.length + 
         achievementDefinitions.special.length
})

const totalRewards = computed(() => {
  return [...bettingAchievements.value, ...placementAchievements.value, ...milestoneAchievements.value, ...specialAchievements.value]
    .filter(achievement => achievement.unlocked)
    .reduce((total, achievement) => total + achievement.reward, 0)
})

// Methods
const loadAchievements = async () => {
  if (!isConnected.value || !account.value) return
  
  loading.value = true
  
  try {
    // Load player stats
    await loadPlayerStats()
    
    // Load user NFTs
    await loadUserNFTs()
  } catch (error) {
    console.error('Error loading achievements:', error)
  } finally {
    loading.value = false
  }
}

const loadPlayerStats = async () => {
  // This would call the contract to get player stats
  // For now, using mock data
  playerStats.value = {
    totalRaces: 15,
    totalWinnings: 5000,
    biggestWin: 1000,
    spaceshipWins: [2, 1, 0, 0, 0, 0, 0, 0],
    spaceshipSecondPlace: [1, 2, 0, 0, 0, 0, 0, 0],
    spaceshipThirdPlace: [0, 1, 1, 0, 0, 0, 0, 0],
    spaceshipFourthPlace: [0, 0, 1, 0, 0, 0, 0, 0],
    spaceshipBetCount: [8, 5, 2, 0, 0, 0, 0, 0]
  }
}

const loadUserNFTs = async () => {
  // This would call the contract to get user's NFTs
  // For now, using mock data
  userNFTs.value = [
    {
      tokenId: '1',
      name: 'The Rising Star of Comet',
      description: 'First steps to glory with Comet',
      image: '/nft-art/images/betting-achievements/comet-bet-5.png',
      type: 'Betting',
      rarity: 'Common'
    }
  ]
}

const getBettingProgress = (achievementId) => {
  if (!playerStats.value) return 0
  
  const totalBets = playerStats.value.spaceshipBetCount.reduce((sum, count) => sum + count, 0)
  
  switch (achievementId) {
    case 'bet-5': return Math.min(totalBets, 5)
    case 'bet-25': return Math.min(totalBets, 25)
    case 'bet-100': return Math.min(totalBets, 100)
    default: return 0
  }
}

const getPlacementProgress = (achievementId) => {
  if (!playerStats.value) return 0
  
  const totalWins = playerStats.value.spaceshipWins.reduce((sum, wins) => sum + wins, 0)
  const totalSecond = playerStats.value.spaceshipSecondPlace.reduce((sum, count) => sum + count, 0)
  const totalThird = playerStats.value.spaceshipThirdPlace.reduce((sum, count) => sum + count, 0)
  const totalFourth = playerStats.value.spaceshipFourthPlace.reduce((sum, count) => sum + count, 0)
  
  switch (achievementId) {
    case 'win-3': return Math.min(totalWins, 3)
    case 'win-10': return Math.min(totalWins, 10)
    case 'second-5': return Math.min(totalSecond, 5)
    case 'second-20': return Math.min(totalSecond, 20)
    case 'third-10': return Math.min(totalThird, 10)
    case 'third-50': return Math.min(totalThird, 50)
    case 'fourth-15': return Math.min(totalFourth, 15)
    case 'fourth-75': return Math.min(totalFourth, 75)
    default: return 0
  }
}

const getMilestoneProgress = (achievementId) => {
  if (!playerStats.value) return 0
  
  const totalRaces = playerStats.value.totalRaces
  
  switch (achievementId) {
    case 'races-10': return Math.min(totalRaces, 10)
    case 'races-50': return Math.min(totalRaces, 50)
    case 'races-100': return Math.min(totalRaces, 100)
    default: return 0
  }
}

const getSpecialProgress = (achievementId) => {
  if (!playerStats.value) return 0
  
  const totalWinnings = playerStats.value.totalWinnings
  
  switch (achievementId) {
    case 'winnings-10k': return Math.min(totalWinnings, 10000)
    case 'super-jackpot': return 0 // This would need to be tracked separately
    default: return 0
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
          address: '0xCD8a1C3ba11CF5ECfa6267617243239504a98d90', // Achievement NFT contract
          tokenId: nft.tokenId,
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

// Lifecycle
onMounted(() => {
  if (isConnected.value) {
    loadAchievements()
  }
})
</script>

<style scoped>
.achievement-tracker {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 30px;
  color: white;
}

.title {
  margin: 0 0 15px 0;
  font-size: 24px;
  font-weight: bold;
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

.categories {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.category {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.category-title {
  margin: 0 0 20px 0;
  font-size: 20px;
  color: #333;
  border-bottom: 2px solid #f0f0f0;
  padding-bottom: 10px;
}

.achievements-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 15px;
}

.achievement-card {
  display: flex;
  gap: 15px;
  padding: 15px;
  border-radius: 8px;
  border: 2px solid #e0e0e0;
  transition: all 0.2s;
}

.achievement-card.unlocked {
  border-color: #28a745;
  background: #f8fff9;
}

.achievement-card.locked {
  border-color: #e0e0e0;
  background: #f8f9fa;
  opacity: 0.7;
}

.achievement-icon {
  font-size: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #f0f0f0;
}

.unlocked-icon {
  color: #28a745;
}

.locked-icon {
  color: #6c757d;
}

.achievement-info {
  flex: 1;
}

.achievement-name {
  margin: 0 0 5px 0;
  font-size: 16px;
  font-weight: bold;
  color: #333;
}

.achievement-description {
  margin: 0 0 10px 0;
  font-size: 14px;
  color: #666;
  line-height: 1.4;
}

.achievement-progress {
  margin-bottom: 10px;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 5px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #28a745, #20c997);
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 12px;
  color: #666;
}

.achievement-reward {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.reward-amount {
  font-size: 14px;
  font-weight: bold;
  color: #28a745;
}

.reward-status {
  font-size: 12px;
  color: #28a745;
}

.nft-section {
  margin-top: 30px;
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.section-title {
  margin: 0 0 20px 0;
  font-size: 20px;
  color: #333;
  border-bottom: 2px solid #f0f0f0;
  padding-bottom: 10px;
}

.nft-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
}

.nft-card {
  background: white;
  border-radius: 8px;
  padding: 15px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s;
  cursor: pointer;
}

.nft-card:hover {
  transform: translateY(-2px);
}

.nft-image {
  width: 100%;
  height: 150px;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 10px;
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

.nft-name {
  margin: 0 0 5px 0;
  font-size: 16px;
  font-weight: bold;
  color: #333;
}

.nft-description {
  margin: 0 0 10px 0;
  font-size: 14px;
  color: #666;
  line-height: 1.4;
}

.nft-attributes {
  display: flex;
  gap: 8px;
  margin-bottom: 10px;
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
  padding: 8px;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s;
  font-size: 12px;
}

.add-to-wallet-btn:hover:not(:disabled) {
  opacity: 0.9;
}

.add-to-wallet-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.loading {
  text-align: center;
  padding: 60px 20px;
  color: #666;
}

.spinner {
  border: 4px solid #f3f3f3;
  border-top: 4px solid #667eea;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>
