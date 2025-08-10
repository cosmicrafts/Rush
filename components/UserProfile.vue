<template>
  <div class="bg-gray-700 p-3 rounded-lg">
    <div class="flex items-center justify-between">
      <!-- User Info -->
      <div class="flex items-center space-x-3">
        <!-- Avatar -->
        <div class="flex-shrink-0">
          <div 
            class="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold border-2 border-purple-400/30"
            :class="getAvatarClass(playerAvatar)"
          >
            <img 
              v-if="playerAvatar < 255" 
              :src="`/avatars/${playerAvatar}.webp`" 
              :alt="`Avatar ${playerAvatar}`"
              class="w-full h-full rounded-full object-cover"
              @error="handleAvatarError"
            />
            <img 
              v-else 
              src="/avatars/null.webp" 
              alt="No Avatar"
              class="w-full h-full rounded-full object-cover"
            />
          </div>
        </div>

        <!-- Username and Address -->
        <div class="flex-1 min-w-0">
          <div class="flex items-center space-x-2">
            <h3 class="font-semibold text-purple-400 text-sm truncate">
              {{ displayUsername }}
            </h3>
            <button
              v-if="!hasUsername"
              @click="$emit('register')"
              class="text-xs bg-purple-600 hover:bg-purple-700 text-white px-2 py-1 rounded transition-colors"
            >
              Register
            </button>
          </div>
                      <div class="flex items-center space-x-2 mt-1">
              <span class="text-gray-400 text-xs font-mono">{{ shortAddress }}</span>
              <button
                v-if="props.address"
                @click="copyAddress"
                class="text-gray-500 hover:text-gray-300 transition-colors"
                :title="copySuccess ? 'Copied!' : 'Copy address'"
              >
              <svg 
                v-if="!copySuccess" 
                class="w-3 h-3" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <svg 
                v-else 
                class="w-3 h-3 text-green-400" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Connection Status -->
      <div class="flex-shrink-0">
        <div class="flex items-center space-x-2">
          <div class="w-2 h-2 rounded-full bg-green-400"></div>
          <span class="text-xs text-gray-400">{{ walletType }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

// Props
const props = defineProps<{
  address: string | null
  username?: string
  avatarId?: number
  walletType: string
}>()

// Emits
const emit = defineEmits<{
  register: []
}>()

// State
const copySuccess = ref(false)

// Computed
const shortAddress = computed(() => {
  if (!props.address) return ''
  return `${props.address.slice(0, 6)}...${props.address.slice(-4)}`
})

const displayUsername = computed(() => {
  return props.username || 'Anon'
})

const hasUsername = computed(() => {
  return !!props.username
})

const playerAvatar = computed(() => {
  return props.avatarId ?? 255
})

// Methods
const getAvatarClass = (avatarId: number) => {
  if (avatarId === 255) return 'bg-gray-600'
  return 'bg-gradient-to-br from-purple-400 to-blue-500'
}

const handleAvatarError = (event: Event) => {
  const img = event.target as HTMLImageElement
  img.style.display = 'none'
  img.nextElementSibling?.classList.remove('hidden')
}

const copyAddress = async () => {
  if (!props.address) return
  
  try {
    await navigator.clipboard.writeText(props.address)
    copySuccess.value = true
    setTimeout(() => {
      copySuccess.value = false
    }, 2000)
  } catch (error) {
    console.error('Failed to copy address:', error)
    // Fallback for older browsers
    const textArea = document.createElement('textarea')
    textArea.value = props.address
    document.body.appendChild(textArea)
    textArea.select()
    document.execCommand('copy')
    document.body.removeChild(textArea)
    
    copySuccess.value = true
    setTimeout(() => {
      copySuccess.value = false
    }, 2000)
  }
}
</script>
