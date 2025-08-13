<template>
  <div class="bg-gray-800 p-4 rounded-lg border border-gray-700">
    <!-- Wallet Connection -->
    <div v-if="!isConnected" class="text-center">
      <UButton
        :loading="connecting"
        class="w-full bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-2 px-6 rounded text-sm"
        @click="connectMetaMaskHandler"
      >
        {{ connecting ? 'Connecting...' : 'Connect Wallet' }}
      </UButton>
      <p class="text-xs text-gray-400 mt-2">Connect your MetaMask wallet to start betting</p>
      <p class="text-xs text-cyan-400 mt-1">Network: Somnia Testnet</p>
      <p class="text-xs text-gray-400 mt-1">
        <a
          href="https://testnet.somnia.network/"
          target="_blank"
          class="text-cyan-400 hover:underline"
        >
          Add Somnia Testnet to MetaMask
        </a>
      </p>
    </div>

    <!-- Connected State -->
    <div v-else class="text-center">
      <div class="flex items-center justify-center gap-2 mb-2">
        <div class="w-2 h-2 bg-green-400 rounded-full" />
        <span class="text-green-400 text-sm font-medium">Connected</span>
      </div>
      <div class="text-xs text-gray-400 mb-2">{{ shortAddress }} ({{ walletType }})</div>

      <!-- Network Status -->
      <div class="mb-3">
        <div class="flex items-center justify-center gap-2 mb-1">
          <div class="w-2 h-2" :class="networkIndicatorClass" />
          <span class="text-xs" :class="networkTextClass">{{ networkDisplay }}</span>
        </div>

        <!-- Switch to Somnia button if not on Somnia -->
        <UButton
          v-if="!isOnSomnia"
          :loading="switchingNetwork"
          size="xs"
          class="bg-gradient-to-r from-cyan-400 to-pink-500 hover:from-cyan-500 hover:to-pink-600 text-white text-xs mt-1"
          @click="switchToSomnia"
        >
          {{ switchingNetwork ? 'Switching...' : 'Switch to Somnia Testnet' }}
        </UButton>
      </div>

      <UButton
        variant="outline"
        size="sm"
        class="text-red-400 border-red-400 hover:bg-red-400 hover:text-white text-xs"
        @click="disconnect"
      >
        Disconnect
      </UButton>
    </div>

    <!-- Error Display -->
    <div v-if="error" class="mt-3 p-2 bg-red-900/50 border border-red-500 rounded text-xs">
      <p class="text-red-400">{{ error }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue'
  import { useWeb3 } from '~/composables/useWeb3'

  // Define emits
  const emit = defineEmits<{
    connected: []
    disconnected: []
  }>()

  // Use the Web3 composable
  const {
    isConnected,
    shortAddress,
    walletType,
    connectMetaMask,
    disconnect: web3Disconnect,
    updateBalance,
    network,
  } = useWeb3()

  // Local state
  const connecting = ref(false)
  const switchingNetwork = ref(false)
  const error = ref('')

  // Computed properties
  const networkDisplay = computed(() => {
    return network.getNetworkDisplay.value
  })

  const isOnSomnia = computed(() => {
    return network.isCorrectNetwork.value
  })

  const networkIndicatorClass = computed(() => {
    return network.getNetworkIndicatorClass.value
  })

  const networkTextClass = computed(() => {
    return network.getNetworkTextClass.value
  })

  // Methods
  const connectMetaMaskHandler = async () => {
    connecting.value = true
    error.value = ''

    try {
      await connectMetaMask()
      await updateBalance()
      emit('connected')
    } catch {
      error.value = 'Failed to connect MetaMask'
    } finally {
      connecting.value = false
    }
  }

  const switchToSomnia = async () => {
    switchingNetwork.value = true
    error.value = ''

    try {
      await network.switchToSomniaTestnet(window.ethereum)
      // Refresh balance after network switch
      await updateBalance()
    } catch {
      error.value =
        'Failed to switch to Somnia Testnet. Please add it manually at https://testnet.somnia.network/'
    } finally {
      switchingNetwork.value = false
    }
  }

  const disconnect = () => {
    web3Disconnect()
    emit('disconnected')
  }
</script>
