<template>
  <div class="bg-gray-800 p-6 rounded-xl border border-gray-700">
    <!-- Wallet Connection -->
    <div class="mb-6">
      <div v-if="!isConnected" class="text-center">
        <div v-if="!showWalletOptions">
          <UButton
            @click="showWalletOptions = true"
            class="bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-3 px-8 rounded-lg"
          >
            Connect Wallet
          </UButton>
          <p class="text-sm text-gray-400 mt-2">Choose your wallet to start betting</p>
        </div>
        
        <div v-else class="space-y-3">
          <UButton
            @click="connectMetaMaskHandler"
            :loading="connecting"
            class="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-8 rounded-lg"
          >
            {{ connecting ? 'Connecting...' : 'MetaMask' }}
          </UButton>
          
          <UButton
            @click="connectCoinbaseHandler"
            :loading="connecting"
            class="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-8 rounded-lg"
          >
            {{ connecting ? 'Connecting...' : 'Coinbase Wallet' }}
          </UButton>
          
          <UButton
            @click="showWalletOptions = false"
            variant="outline"
            class="w-full text-gray-400 border-gray-600 hover:bg-gray-700"
          >
            Cancel
          </UButton>
        </div>
      </div>
      
      <div v-else class="space-y-3">
        <!-- Connection Status -->
        <div class="flex justify-between items-center">
          <div>
            <p class="text-gray-300">
              Connected: <span class="text-cyan-400 font-mono">{{ shortAddress }}</span>
              <span class="text-gray-500 ml-2">({{ walletType }})</span>
            </p>
            <p class="text-gray-400">ETH: <span class="text-blue-400">{{ formattedBalance }}</span></p>
            <p class="text-gray-400">SPIRAL: <span class="text-green-400">{{ formattedSpiralBalance }}</span></p>
          </div>
          <div class="flex space-x-2">
            <UButton
              @click="claimFaucetHandler"
              :loading="claiming"
              class="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
              :disabled="hasClaimed"
            >
              {{ hasClaimed ? 'Claimed' : claiming ? 'Claiming...' : 'Claim 1000 SPIRAL' }}
            </UButton>
            <UButton
              @click="disconnect"
              variant="outline"
              class="text-red-400 border-red-400 hover:bg-red-400 hover:text-white"
            >
              Disconnect
            </UButton>
          </div>
        </div>

        <!-- Network Status -->
        <div v-if="!isCorrectNetwork" class="p-3 bg-red-900/50 border border-red-500 rounded-lg">
          <p class="text-red-400 text-sm">
            ⚠️ Wrong network detected. Please switch to Somnia Testnet.
          </p>
          <div class="flex space-x-2 mt-2">
            <UButton
              @click="handleSwitchNetwork"
              size="sm"
              class="bg-red-500 hover:bg-red-600 text-white"
            >
              Auto Switch
            </UButton>
            <UButton
              @click="openSomniaNetwork"
              size="sm"
              variant="outline"
              class="border-gray-500 text-gray-300 hover:bg-gray-700"
            >
              Manual Add
            </UButton>
          </div>
        </div>
      </div>
    </div>

    <!-- Player Statistics -->
    <div v-if="isConnected && playerStats" class="bg-gray-700 p-4 rounded-lg mb-4">
      <h3 class="text-lg font-bold text-gray-200 mb-3 flex items-center">
        <span class="mr-2">📊</span>
        Player Statistics
        <span v-if="achievementCount > 0" class="ml-auto text-sm bg-yellow-600 text-yellow-100 px-2 py-1 rounded">
          🏆 {{ achievementCount }} Achievements
        </span>
      </h3>
      
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        <div class="text-center">
          <div class="text-gray-400">Total Races</div>
          <div class="text-white font-semibold">{{ playerStats.totalRaces }}</div>
        </div>
        <div class="text-center">
          <div class="text-gray-400">Total Winnings</div>
          <div class="text-green-400 font-semibold">{{ playerStats.totalWinnings }} SPIRAL</div>
        </div>
        <div class="text-center">
          <div class="text-gray-400">Biggest Win</div>
          <div class="text-yellow-400 font-semibold">{{ playerStats.biggestWin }} SPIRAL</div>
        </div>
        <div class="text-center">
          <div class="text-gray-400">Achievement Rewards</div>
          <div class="text-purple-400 font-semibold">{{ playerStats.achievementRewards }} SPIRAL</div>
        </div>
      </div>
    </div>

    <!-- Race Information -->
    <div v-if="isConnected && raceInfo" class="bg-gray-700 p-4 rounded-lg mb-4">
      <h3 class="text-lg font-bold text-gray-200 mb-3 flex items-center">
        <span class="mr-2">🏁</span>
        Current Race Information
      </h3>
      
      <div class="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
        <div class="text-center">
          <div class="text-gray-400">Race ID</div>
          <div class="text-white font-semibold">#{{ currentRaceId }}</div>
        </div>
        <div class="text-center">
          <div class="text-gray-400">Total Bets</div>
          <div class="text-cyan-400 font-semibold">{{ raceInfo.totalBets ? ethers.utils.formatUnits(raceInfo.totalBets, 8) : '0' }} SPIRAL</div>
        </div>
        <div class="text-center">
          <div class="text-gray-400">Prize Pool</div>
          <div class="text-green-400 font-semibold">{{ raceInfo.prizePool ? ethers.utils.formatUnits(raceInfo.prizePool, 8) : '0' }} SPIRAL</div>
        </div>
      </div>
    </div>

    <!-- Betting Interface -->
    <div v-if="isConnected" class="space-y-4">
      <div class="text-center">
        <h3 class="text-xl font-bold text-gray-200 mb-2">Place Your Bets</h3>
        <p class="text-sm text-gray-400">
          Current Race: #{{ currentRaceId }} | Min: {{ minBet }} SPIRAL | Max: {{ maxBet }} SPIRAL
        </p>
      </div>

      <!-- Ship Selection -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div
          v-for="ship in ships"
          :key="ship.id"
          class="relative p-4 rounded-lg border-2 transition-all cursor-pointer"
          :class="[
            selectedShip?.id === ship.id 
              ? 'border-cyan-400 bg-cyan-400/10' 
              : 'border-gray-600 hover:border-gray-500'
          ]"
          @click="selectShip(ship)"
        >
          <div class="flex items-center space-x-3">
            <div 
              class="w-4 h-4 rounded-full"
              :style="{ backgroundColor: ship.color }"
            ></div>
            <div>
              <h4 class="font-semibold text-gray-200">{{ ship.name }}</h4>
              <p class="text-xs text-gray-400">{{ ship.chaosFactor }}</p>
            </div>
          </div>
          
          <!-- Bet Amount Display -->
          <div v-if="shipBets[ship.id]" class="mt-2 text-sm">
            <p class="text-gray-400">Total Bets: <span class="text-green-400">{{ shipBets[ship.id] }} SPIRAL</span></p>
          </div>
        </div>
      </div>

      <!-- Bet Amount Input -->
      <div v-if="selectedShip" class="space-y-4">
        <div class="flex items-center space-x-4">
          <div class="flex-1">
            <label class="block text-sm font-medium text-gray-300 mb-2">Bet Amount (SPIRAL)</label>
            <UInput
              v-model="betAmount"
              type="number"
              :min="minBet"
              :max="maxBet"
              step="0.001"
              placeholder="Enter bet amount"
              class="w-full"
            />
          </div>
          <div class="flex space-x-2">
            <UButton
              @click="setBetAmount(minBet)"
              variant="outline"
              size="sm"
            >
              Min
            </UButton>
            <UButton
              @click="setBetAmount(maxBet)"
              variant="outline"
              size="sm"
            >
              Max
            </UButton>
          </div>
        </div>

        <!-- Bet Preview -->
        <div class="bg-gray-700 p-4 rounded-lg">
          <h4 class="font-semibold text-gray-200 mb-2">Bet Preview</h4>
          <div class="space-y-1 text-sm">
            <div class="flex justify-between">
              <span class="text-gray-400">Ship:</span>
              <span class="text-gray-200">{{ selectedShip.name }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-400">Amount:</span>
              <span class="text-gray-200">{{ betAmount }} SPIRAL</span>
            </div>
            <!-- House fee removed - not available in current contract -->
            <div class="flex justify-between border-t border-gray-600 pt-1">
              <span class="text-gray-400">Total Cost:</span>
              <span class="text-cyan-400 font-semibold">{{ totalCost }} SPIRAL</span>
            </div>
          </div>
        </div>

        <!-- Place Bet Button -->
        <UButton
          @click="placeBet"
          :loading="placingBet || approving"
          :disabled="!canPlaceBet"
          class="w-full bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-3 rounded-lg"
        >
          {{ getButtonText() }}
        </UButton>

        <p v-if="!canPlaceBet" class="text-sm text-red-400 text-center">
          {{ betError }}
        </p>
      </div>

      <!-- Current Bets -->
      <div v-if="playerBets.length > 0" class="mt-6">
        <h4 class="font-semibold text-gray-200 mb-3">Your Current Bets</h4>
        <div class="space-y-2">
          <div
            v-for="(bet, index) in playerBets"
            :key="index"
            class="flex justify-between items-center p-3 bg-gray-700 rounded-lg"
          >
            <div>
              <span class="text-gray-300">{{ getShipName(index + 1) }}</span>
              <span class="text-gray-400 ml-2">{{ bet }} SPIRAL</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Error Display -->
    <div v-if="error" class="mt-4 p-4 bg-red-900/50 border border-red-500 rounded-lg">
      <p class="text-red-400">{{ error }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useWeb3 } from '~/composables/useWeb3'
import { SHIPS_ROSTER } from '~/data/ships'
import type { Ship } from '~/types/game'
import { ethers } from 'ethers'

// Define emits
const emit = defineEmits<{
  raceCompleted: [{ raceResult: any, playerShip: number, betAmount: string, actualPayout: string, jackpotTier: number }]
}>()

const {
  isConnected,
  shortAddress,
  formattedBalance,
  formattedSpiralBalance,
  spiralBalance,
  walletType,
  isCorrectNetwork,
  currentRaceId,
  contractInfo,
  connectMetaMask,
  connectCoinbaseWallet,
  disconnect,
  placeBet: web3PlaceBet,
  getCurrentRaceInfo,
  getShipBets,
  getPlayerBets,
  getPlayerStats,
  getPlayerAchievementCount,
  updateBalance,
  switchToSomniaTestnet,
  claimFaucet,
  hasClaimedFaucet,
  approveSpiralTokens,
  checkApprovalNeeded
} = useWeb3()

// Game constants - now from contract
const minBet = computed(() => contractInfo.value.minBet)
const maxBet = computed(() => contractInfo.value.maxBet)
// houseFee removed - not available in current contract

const betError = ref('')
const showWalletOptions = ref(false)

const connecting = ref(false)
const placingBet = ref(false)
const error = ref('')
const selectedShip = ref<Ship | null>(null)
const betAmount = ref('')
const shipBets = ref<{ [key: number]: string }>({})
const playerBets = ref<string[]>([])

// Faucet state
const claiming = ref(false)
const hasClaimed = ref(false)

// Approval state
const approving = ref(false)
const needsApproval = ref(false)
const approvalPending = ref(false)

// Player statistics
const playerStats = ref<any>(null)
const achievementCount = ref(0)
const raceInfo = ref<any>(null)

const ships = SHIPS_ROSTER

// Computed properties
// houseFeeAmount removed - not available in current contract

const totalCost = computed(() => {
  if (!betAmount.value) return '0'
  const amount = parseFloat(betAmount.value)
  // No house fee in current contract
  return amount.toFixed(4)
})

const canPlaceBet = computed(() => {
  if (!selectedShip.value || !betAmount.value) return false
  
  const amount = parseFloat(betAmount.value)
  const min = parseFloat(minBet.value)
  const max = parseFloat(maxBet.value)
  // Use SPIRAL balance for betting validation
  const spiralBalanceNum = spiralBalance.value ? parseFloat(spiralBalance.value) : 0
  const total = parseFloat(totalCost.value)
  
  if (amount < min) {
    betError.value = `Bet must be at least ${minBet.value} SPIRAL`
    return false
  }
  if (amount > max) {
    betError.value = `Bet cannot exceed ${maxBet.value} SPIRAL`
    return false
  }
  if (total > spiralBalanceNum) {
    betError.value = `Insufficient SPIRAL balance (have ${spiralBalanceNum.toFixed(4)} SPIRAL)`
    return false
  }
  
  betError.value = ''
  return true
})

const getButtonText = () => {
  if (approving.value) return 'Approving Tokens...'
  if (placingBet.value) return 'Placing Bet...'
  if (approvalPending.value) return `Click Again to Bet on ${selectedShip.value?.name || 'Ship'}`
  return `Place Bet on ${selectedShip.value?.name || 'Ship'}`
}

// Methods
const selectShip = (ship: Ship) => {
  selectedShip.value = ship
}

const setBetAmount = (amount: string) => {
  betAmount.value = amount
}

const getShipName = (shipId: number) => {
  const ship = ships.find(s => s.id === shipId)
  return ship?.name || 'Unknown'
}

const connectMetaMaskHandler = async () => {
  connecting.value = true
  error.value = ''
  
  try {
    await connectMetaMask()
    await loadBettingData()
    showWalletOptions.value = false
  } catch (err: any) {
    error.value = err.message || 'Failed to connect MetaMask'
  } finally {
    connecting.value = false
  }
}

const connectCoinbaseHandler = async () => {
  connecting.value = true
  error.value = ''
  
  try {
    await connectCoinbaseWallet()
    await loadBettingData()
    showWalletOptions.value = false
  } catch (err: any) {
    error.value = err.message || 'Failed to connect Coinbase Wallet'
  } finally {
    connecting.value = false
  }
}

const placeBet = async () => {
  if (!selectedShip.value || !betAmount.value) return
  
  error.value = ''
  
  try {
    // Check if we need approval first
    console.log('🔍 Checking approval for amount:', betAmount.value)
    const needsApprovalCheck = await checkApprovalNeeded(betAmount.value)
    console.log('🔍 Needs approval:', needsApprovalCheck, 'Approval pending:', approvalPending.value)
    
    if (needsApprovalCheck && !approvalPending.value) {
      // Need to approve first
      needsApproval.value = true
      approving.value = true
      
      try {
        await approveSpiralTokens()
        
        // Wait a moment for the blockchain to confirm the approval
        console.log('🔄 Waiting for approval confirmation...')
        await new Promise(resolve => setTimeout(resolve, 2000))
        
        // Verify the approval went through by checking again
        const verifyApproval = await checkApprovalNeeded(betAmount.value)
        if (verifyApproval) {
          throw new Error('Approval transaction may not have been confirmed yet. Please try again in a few seconds.')
        }
        
        approvalPending.value = true
        needsApproval.value = false
        console.log('✅ Approval confirmed! Click Place Bet again to proceed.')
      } catch (approveErr: any) {
        error.value = approveErr.message || 'Failed to approve tokens'
        needsApproval.value = false
      } finally {
        approving.value = false
      }
      return
    }
    
    // Place the bet
    placingBet.value = true
    const betResult = await web3PlaceBet(selectedShip.value.id, betAmount.value)
    
    // Store bet info for race emission
    const playerShipId = selectedShip.value.id
    const playerBetAmount = betAmount.value
    
    // Reset form and states
    selectedShip.value = null
    betAmount.value = ''
    needsApproval.value = false
    approvalPending.value = false
    
    // Reload data
    await Promise.all([
      updateBalance(),
      loadBettingData(),
      loadPlayerData()
    ])
    
    // Emit race result for parent to trigger animation
    if (betResult && betResult.raceResult) {
      console.log('🎬 Emitting race result for animation:', betResult.raceResult)
      emit('raceCompleted', {
        raceResult: betResult.raceResult,
        playerShip: playerShipId,
        betAmount: playerBetAmount,
        actualPayout: betResult.actualPayout,
        jackpotTier: betResult.jackpotTier
      })
    }
    
  } catch (err: any) {
    error.value = err.message || 'Failed to place bet'
  } finally {
    placingBet.value = false
  }
}

const handleSwitchNetwork = async () => {
  try {
    await switchToSomniaTestnet()
  } catch (err: any) {
    error.value = err.message || 'Failed to switch network'
  }
}

const openSomniaNetwork = () => {
  window.open('https://testnet.somnia.network/', '_blank')
}

const loadBettingData = async () => {
  if (!isConnected.value) return
  
  try {
    // Load current race info
    const currentRaceInfo = await getCurrentRaceInfo()
    if (currentRaceInfo) {
      console.log('Current race info:', currentRaceInfo)
      raceInfo.value = currentRaceInfo
    }
    
    // Load ship bets for current race
    const shipBetsData = await getShipBets(currentRaceId.value)
    if (shipBetsData && Array.isArray(shipBetsData)) {
      for (let i = 0; i < 8; i++) {
        shipBets.value[i + 1] = shipBetsData[i] || '0'
      }
    }
    
    // Load player bets
    const playerBetsData = await getPlayerBets(currentRaceId.value)
    if (playerBetsData) {
      playerBets.value = [playerBetsData.amount]
    } else {
      playerBets.value = []
    }
    
    console.log('Betting data loaded:', { shipBets: shipBets.value, playerBets: playerBets.value })
  } catch (err) {
    console.error('Failed to load betting data:', err)
  }
}

const loadPlayerData = async () => {
  if (!isConnected.value) return
  
  try {
    const [stats, achievements] = await Promise.all([
      getPlayerStats(),
      getPlayerAchievementCount()
    ])
    
    playerStats.value = stats
    achievementCount.value = achievements
    
    console.log('Player data loaded:', { stats, achievements })
  } catch (err) {
    console.error('Failed to load player data:', err)
  }
}

// Faucet handler
const claimFaucetHandler = async () => {
  claiming.value = true
  error.value = ''
  
  try {
    await claimFaucet()
    hasClaimed.value = true
    // Refresh balances after claiming
    setTimeout(async () => {
      if (isConnected.value) {
        await updateBalance()
        await loadBettingData()
      }
    }, 2000)
  } catch (err: any) {
    error.value = err.message || 'Failed to claim faucet'
  } finally {
    claiming.value = false
  }
}

// Approval handler
const approveTokensHandler = async () => {
  approving.value = true
  error.value = ''
  
  try {
    await approveSpiralTokens() // Approve unlimited tokens
    // Refresh balance after approval
    setTimeout(() => {
      if (isConnected.value) {
        loadBettingData()
      }
    }, 2000)
  } catch (err: any) {
    error.value = err.message || 'Failed to approve tokens'
  } finally {
    approving.value = false
  }
}

// Check faucet status
const checkFaucetStatus = async () => {
  if (isConnected.value) {
    try {
      hasClaimed.value = await hasClaimedFaucet()
    } catch (err) {
      console.error('Failed to check faucet status:', err)
    }
  }
}

// Initialize
onMounted(() => {
  if (isConnected.value) {
    loadBettingData()
    loadPlayerData()
    checkFaucetStatus()
  }
})

// Watch for connection changes to reload all data
watch(isConnected, () => {
  if (isConnected.value) {
    loadBettingData()
    loadPlayerData()
    checkFaucetStatus()
  }
})

// Watch for race ID changes to reload betting data
watch(currentRaceId, () => {
  if (isConnected.value) {
    loadBettingData()
  }
})
</script> 