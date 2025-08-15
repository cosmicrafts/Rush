<template>
  <div class="flex items-center justify-between gap-responsive-md">
    <!-- Left Side: Help Text and Actions -->
    <div class="flex items-center gap-responsive-md">
      <!-- Help Text -->
      <div v-if="hasClaimed" class="text-responsive-xs text-gray-400 font-medium">
        Need more tokens?
      </div>

      <!-- Actions -->
      <div class="flex items-center gap-responsive-sm">
        <!-- Faucet Button -->
        <div v-if="!hasClaimed">
          <button
            :disabled="claiming"
            class="btn-inline-primary flex items-center justify-center space-x-2"
            @click="handleClaimFaucet"
          >
            <div v-if="claiming" class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            <span>{{ claiming ? 'Getting tokens...' : 'Claim SPIRAL' }}</span>
          </button>
        </div>

        <!-- Social Icons -->
        <div v-else class="flex items-center gap-responsive-sm">
          <button
            class="btn-inline-secondary flex items-center justify-center p-2"
            title="Request more tokens on X"
            @click="openTwitterRequest"
          >
            <Icon name="fa7-brands:x-twitter" class="w-5 h-5" />
          </button>
          <button
            class="btn-inline-secondary flex items-center justify-center p-2"
            title="Join our Discord"
            @click="openDiscord"
          >
            <Icon name="ic:baseline-discord" class="w-5 h-5" />
          </button>
        </div>

        <!-- Separator after social buttons -->
        <div class="w-px h-6 bg-gray-600" />
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
        <img
          src="/somnia.webp"
          alt="STT"
          class="w-8 h-8 rounded-sm transition-transform"
        />
        <div class="flex items-center gap-responsive-xs">
          <div
            class="text-white font-bold text-responsive-md group-hover:text-cyan-400 transition-colors"
          >
            {{ formattedBalance.replace(' STT', '') }}
          </div>
          <div class="text-gray-500 text-responsive-xs group-hover:text-cyan-400 transition-colors">
            STT
          </div>
        </div>
      </a>

      <!-- SPIRAL Balance -->
      <div class="flex items-center gap-responsive-sm">
        <img src="/icons/spiral.svg" alt="SPIRAL" class="w-8 h-8 rounded-sm" />
        <div class="flex items-center gap-responsive-xs">
          <div class="text-white font-bold text-responsive-md">
            {{ formatSpiralBalance }}
          </div>
          <div class="text-gray-500 text-responsive-xs">SPIRAL</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { useBetting } from '~/composables/useBetting'
  import { useNotifications } from '~/composables/useNotifications'

  // Initialize notification system
  const { showError, showInfo, showClaimNotification } = useNotifications()

  // Use the betting composable for balance and faucet functionality
  const {
    // State
    claiming,
    hasClaimed,
    formattedBalance,
    formattedSpiralBalance,

    // Methods
    claimFaucetHandler,
    checkFaucetStatus,
    updateBalance,
    openTwitterRequest,
    openDiscord,
  } = useBetting()

  // Format SPIRAL balance with K/M notation for large numbers
  const formatSpiralBalance = computed(() => {
    const amount = formattedSpiralBalance.value.replace(' SPIRAL', '')
    const num = parseFloat(amount)
    if (isNaN(num)) return '0'

    // Use K/M notation for numbers >= 10,000
    if (num >= 1000000) {
      return (num / 1000000).toFixed(2) + 'M'
    } else if (num >= 10000) {
      return (num / 1000).toFixed(2) + 'K'
    } else {
      // For smaller numbers, use regular formatting with 2 decimal places
      return num.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    }
  })

  // Custom claim handler with notifications
  const handleClaimFaucet = async () => {
    try {
      // Check if user has already claimed before attempting
      if (hasClaimed.value) {
        showInfo(
          'Already Claimed!',
          "You've already claimed your SPIRAL tokens. Check your balance! 🎉"
        )
        return
      }

      // Set claiming state to true to show loading
      claiming.value = true

      // Start the claim process (this will trigger wallet popup)
      const tx = await claimFaucetHandler()

      // Show notification that tokens are on the way
      showInfo('Transaction accepted! 🚀', 'Your SPIRAL tokens are on the way...')

      // Wait for the transaction to be mined
      await tx.wait()

      // Show claim success notification with transaction hash
      setTimeout(() => {
        showClaimNotification(tx.hash, 'success')
      }, 1000) // 1 second delay

      // Small delay to ensure blockchain state is updated
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Update balances and check faucet status
      await Promise.all([updateBalance(), checkFaucetStatus()])
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to claim SPIRAL tokens'

      // Provide user-friendly error messages based on common failure reasons
      let userFriendlyMessage = 'Something went wrong with the claim'

      if (
        errorMessage.includes('transaction failed') ||
        errorMessage.includes('CALL_EXCEPTION') ||
        errorMessage.includes('Already claimed faucet tokens')
      ) {
        userFriendlyMessage = "Looks like you've already claimed your tokens!"
      } else if (errorMessage.includes('insufficient funds')) {
        userFriendlyMessage = 'Whoops!You need STT for gas fees.'
      } else if (errorMessage.includes('user rejected')) {
        userFriendlyMessage = 'Transaction was cancelled'
      } else if (errorMessage.includes('network')) {
        userFriendlyMessage = 'Network issue detected.Try again!'
      }

      showError('Claim Failed', userFriendlyMessage)
    } finally {
      // Always set claiming to false when done
      claiming.value = false
    }
  }
</script>
