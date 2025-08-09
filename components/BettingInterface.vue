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
            <p class="text-gray-400">Balance: <span class="text-green-400">{{ formattedBalance }}</span></p>
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

    <!-- Betting Interface -->
    <div v-if="isConnected" class="space-y-4">
      <div class="text-center">
        <h3 class="text-xl font-bold text-gray-200 mb-2">Place Your Bets</h3>
        <p class="text-sm text-gray-400">
          Current Race: #{{ currentRaceId }} | Min: {{ minBet }} SPIRAL | Max: {{ maxBet }} SPIRAL | Fee: {{ houseFee }}%
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
            <div class="flex justify-between">
              <span class="text-gray-400">House Fee ({{ houseFee }}%):</span>
              <span class="text-gray-200">{{ houseFeeAmount }} SPIRAL</span>
            </div>
            <div class="flex justify-between border-t border-gray-600 pt-1">
              <span class="text-gray-400">Total Cost:</span>
              <span class="text-cyan-400 font-semibold">{{ totalCost }} SPIRAL</span>
            </div>
          </div>
        </div>

        <!-- Place Bet Button -->
        <UButton
          @click="placeBet"
          :loading="placingBet"
          :disabled="!canPlaceBet"
          class="w-full bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-3 rounded-lg"
        >
          {{ placingBet ? 'Placing Bet...' : `Place Bet on ${selectedShip.name}` }}
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

const {
  isConnected,
  shortAddress,
  formattedBalance,
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
  switchToSomniaTestnet,
  claimFaucet,
  hasClaimedFaucet
} = useWeb3()

// Game constants - now from contract
const minBet = computed(() => contractInfo.value.minBet)
const maxBet = computed(() => contractInfo.value.maxBet)
const houseFee = computed(() => contractInfo.value.houseFee)

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

const ships = SHIPS_ROSTER

// Computed properties
const houseFeeAmount = computed(() => {
  if (!betAmount.value || !houseFee.value) return '0'
  const amount = parseFloat(betAmount.value)
  return (amount * (houseFee.value / 100)).toFixed(4)
})

const totalCost = computed(() => {
  if (!betAmount.value) return '0'
  const amount = parseFloat(betAmount.value)
  const fee = amount * (houseFee.value / 100)
  return (amount + fee).toFixed(4)
})

const canPlaceBet = computed(() => {
  if (!selectedShip.value || !betAmount.value) return false
  
  const amount = parseFloat(betAmount.value)
  const min = parseFloat(minBet.value)
  const max = parseFloat(maxBet.value)
  const balanceStr = formattedBalance.value.split(' ')[0]
  const balance = balanceStr ? parseFloat(balanceStr) : 0
  const total = parseFloat(totalCost.value)
  
  if (amount < min) {
    betError.value = `Bet must be at least ${minBet.value} SPIRAL`
    return false
  }
  if (amount > max) {
    betError.value = `Bet cannot exceed ${maxBet.value} SPIRAL`
    return false
  }
  if (total > balance) {
    betError.value = 'Insufficient balance'
    return false
  }
  
  betError.value = ''
  return true
})

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
  
  placingBet.value = true
  error.value = ''
  
  try {
    await web3PlaceBet(selectedShip.value.id, betAmount.value)
    
    // Reset form
    selectedShip.value = null
    betAmount.value = ''
    
    // Reload data
    await loadBettingData()
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
    const raceInfo = await getCurrentRaceInfo()
    if (raceInfo) {
      console.log('Current race info:', raceInfo)
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

// Faucet handler
const claimFaucetHandler = async () => {
  claiming.value = true
  error.value = ''
  
  try {
    await claimFaucet()
    hasClaimed.value = true
    // Refresh balance after claiming
    setTimeout(() => {
      if (isConnected.value) {
        loadBettingData()
      }
    }, 2000)
  } catch (err: any) {
    error.value = err.message || 'Failed to claim faucet'
  } finally {
    claiming.value = false
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