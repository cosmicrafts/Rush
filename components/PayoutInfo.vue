<template>
  <div>
    <!-- Payout Info Button -->
    <button
      @click="openPayoutInfo()"
      class="w-5 h-5 bg-gradient-to-r from-cyan-400 to-pink-500 hover:from-cyan-500 hover:to-pink-600 text-white text-xs rounded-full flex items-center justify-center transition-all duration-200 transform hover:scale-105 shadow-lg shadow-cyan-400/25 z-10"
      title="Payout Information"
    >
      i
    </button>

    
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useBetting } from '~/composables/useBetting'
import SpiralToken from './SpiralToken.vue'

// Use the betting composable for jackpot data
const {
  // State
  jackpotAmounts,

  // Web3 state
  isConnected
} = useBetting()

// Define emits
const emit = defineEmits<{
  showPayoutInfo: []
  hidePayoutInfo: []
}>()

// Methods
const openPayoutInfo = () => {
  emit('showPayoutInfo')
}

// Only show the button when connected
const showInfoButton = computed(() => isConnected.value)
</script>
