<template>
  <div class="flex items-center justify-between gap-responsive-md">
      <!-- Left Side: Help Text and Actions -->
      <div class="flex items-center gap-responsive-md">
        <!-- Help Text -->
        <div v-if="hasClaimed" class="text-responsive-sm text-gray-400 font-medium">
          Need more tokens?
        </div>

        <!-- Actions -->
        <div class="flex items-center gap-responsive-sm">
          <!-- Faucet Button -->
          <div v-if="!hasClaimed">
            <UButton
              @click="claimFaucetHandler"
              :loading="claiming"
              :disabled="claiming"
              class="btn-responsive bg-gradient-to-r from-cyan-400 to-pink-500 hover:from-cyan-500 hover:to-pink-600 text-white font-bold shadow-lg shadow-cyan-400/25 transition-all duration-200 transform hover:scale-105"
            >
              {{ claiming ? 'Claiming...' : 'Claim SPIRAL' }}
            </UButton>
          </div>
          
          <!-- Social Icons -->
          <div v-else class="flex items-center gap-responsive-sm">
            <UButton
              @click="openTwitterRequest"
              size="sm"
              class="text-white hover:text-gray-800 transition-colors p-responsive-sm"
              title="Request more tokens on X"
            >
              <Icon name="fa7-brands:x-twitter" class="w-5 h-5" />
            </UButton>
            <UButton
              @click="openDiscord"
              size="sm"
              class="text-white hover:text-gray-800 transition-colors p-responsive-sm"
              title="Join our Discord"
            >
              <Icon name="ic:baseline-discord" class="w-5 h-5" />
            </UButton>
          </div>
          
          <!-- Separator after social buttons -->
          <div class="w-px h-6 bg-gray-600"></div>
        </div>
      </div>

      <!-- Right Side: Token Balances -->
      <div class="flex items-center gap-responsive-md">
        <!-- STT Balance -->
        <a 
          href="https://testnet.somnia.network/" 
          target="_blank" 
          rel="noopener noreferrer"
          class="flex items-center gap-responsive-sm hover:opacity-80 transition-opacity cursor-pointer group"
          title="Visit Somnia Testnet"
        >
          <img src="/somnia.webp" alt="STT" class="w-8 h-8 rounded-sm group-hover:scale-110 transition-transform" />
          <div class="flex items-center gap-responsive-xs">
            <div class="text-white font-bold text-responsive-lg group-hover:text-cyan-400 transition-colors">{{ formattedBalance.replace(' STT', '') }}</div>
            <div class="text-gray-500 text-responsive-sm group-hover:text-cyan-400 transition-colors">STT</div>
          </div>
        </a>

        <!-- SPIRAL Balance -->
        <div class="flex items-center gap-responsive-sm">
          <img src="/spiral.svg" alt="SPIRAL" class="w-8 h-8 rounded-sm" />
          <div class="flex items-center gap-responsive-xs">
            <div class="text-white font-bold text-responsive-lg">
              {{ formatSpiralBalance }}
            </div>
            <div class="text-gray-500 text-responsive-sm">SPIRAL</div>
          </div>
        </div>
      </div>
  </div>
</template>

<script setup lang="ts">
import { useBetting } from '~/composables/useBetting'
import SpiralToken from './SpiralToken.vue'

// Use the betting composable for balance and faucet functionality
const {
  // State
  claiming,
  hasClaimed,
  formattedBalance,
  formattedSpiralBalance,

  // Methods
  claimFaucetHandler,
  openTwitterRequest,
  openDiscord,
} = useBetting()

// Format SPIRAL balance with commas and 2 decimal places
const formatSpiralBalance = computed(() => {
  const amount = formattedSpiralBalance.value.replace(' SPIRAL', '')
  const num = parseFloat(amount)
  if (isNaN(num)) return '0'
  return num.toLocaleString('en-US', { 
    minimumFractionDigits: 2, 
    maximumFractionDigits: 2 
  })
})
</script>
