<template>
  <Transition
    enter-active-class="duration-500 ease-out"
    enter-from-class="transform scale-95 opacity-0"
    enter-to-class="transform scale-100 opacity-100"
    leave-active-class="duration-300 ease-in"
    leave-from-class="transform scale-100 opacity-100"
    leave-to-class="transform scale-95 opacity-0"
  >
    <div
      v-if="show"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-lg px-4"
      @click.self="handleSkip"
    >
      <!-- Enhanced animated background particles -->
      <div class="absolute inset-0 overflow-hidden">
        <div class="absolute top-1/4 left-1/4 w-3 h-3 bg-cyan-400 rounded-full animate-pulse opacity-60 blur-sm"></div>
        <div class="absolute top-3/4 right-1/4 w-2 h-2 bg-purple-400 rounded-full animate-ping opacity-50"></div>
        <div class="absolute bottom-1/4 left-1/3 w-2 h-2 bg-pink-400 rounded-full animate-bounce opacity-60"></div>
        <div class="absolute top-1/2 right-1/3 w-1 h-1 bg-indigo-400 rounded-full animate-pulse opacity-40"></div>
        <div class="absolute bottom-1/3 right-1/4 w-1.5 h-1.5 bg-blue-400 rounded-full animate-ping opacity-30"></div>
      </div>

      <div class="relative w-full max-w-lg mx-auto bg-gradient-to-tr from-purple-900 via-indigo-900 to-blue-900 shadow-2xl rounded-2xl border border-purple-500/30 overflow-hidden backdrop-blur-sm">
        <!-- Enhanced glowing border effect -->
        <div class="absolute inset-0 bg-gradient-to-r from-cyan-500/30 via-purple-500/30 to-pink-500/30 rounded-2xl blur-2xl"></div>
        
        <!-- Header with enhanced animated gradient -->
        <div class="relative p-3 text-center">
          <div class="flex items-center justify-center space-x-3">
            <h2 class="text-xl font-extrabold text-white tracking-tight">Create Your Profile</h2>
          </div>
        </div>

        <!-- Content -->
        <div class="relative p-4 space-y-4">
          <!-- Username Input Section -->
          <div class="space-y-3">
            <div class="flex items-center space-x-2">
              <div class="w-6 h-6 bg-gradient-to-r from-cyan-400 to-purple-400 rounded-full flex items-center justify-center">
                <span class="text-white text-sm font-bold">👤</span>
              </div>
              <label class="text-sm font-semibold text-white">Username</label>
            </div>
            
            <div class="relative">
              <UInput
                v-model="usernameInput"
                type="text"
                placeholder="Enter your username..."
                maxlength="20"
                class="w-full bg-slate-800/90 border border-gray-600 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/30 transition-all duration-200 backdrop-blur-sm"
                :disabled="registering"
                @keyup.enter="handleRegister"
              />
              <div class="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div class="w-2 h-2 rounded-full" :class="usernameInput.length > 0 ? 'bg-green-400 shadow-lg shadow-green-400/50' : 'bg-gray-500'"></div>
              </div>
            </div>
            
            <div class="space-y-2">
              <p v-if="usernameError" class="text-red-400 text-xs font-medium flex items-center">
                <span class="mr-1">⚠️</span>
                {{ usernameError }}
              </p>
              <div class="flex items-center justify-between text-xs">
                <span class="text-gray-300">{{ usernameInput.length }}/20 characters</span>
              </div>
            </div>
          </div>
          
          <!-- Avatar Selection Section -->
          <div class="space-y-3">
            <div class="flex items-center space-x-2">
              <div class="w-5 h-5 bg-gradient-to-r from-pink-400 to-purple-400 rounded-full flex items-center justify-center">
                <span class="text-white text-lg font-bold">⭐</span>
              </div>
              <label class="text-sm font-semibold text-white">Choose Your Avatar</label>
            </div>
            
            <div class="grid grid-cols-4 gap-3">
              <div
                v-for="avatarId in 8"
                :key="avatarId - 1"
                @click="selectedAvatarId = avatarId - 1"
                class="group relative cursor-pointer transition-all duration-200 transform hover:scale-105 flex flex-col items-center"
                tabindex="0"
                @keydown.enter="selectedAvatarId = avatarId - 1"
                @keydown.space="selectedAvatarId = avatarId - 1"
              >
                <div 
                  class="relative w-20 h-20 rounded-xl overflow-hidden border-4 transition-all duration-200"
                  :class="[
                    selectedAvatarId === avatarId - 1 
                      ? 'border-purple-400 shadow-lg shadow-purple-400/50 scale-110 bg-purple-600/30' 
                      : 'border-transparent group-hover:border-purple-500 group-hover:bg-purple-800/50'
                  ]"
                >
                  <img 
                    :src="`/avatars/${avatarId - 1}.webp`" 
                    :alt="`Avatar ${avatarId - 1}`"
                    class="w-full h-full object-cover transition-transform duration-200 group-hover:scale-110"
                    @error="handleAvatarError"
                  />
                  
                  <!-- Enhanced selection indicator -->
                  <div 
                    v-if="selectedAvatarId === avatarId - 1"
                    class="absolute inset-0 bg-gradient-to-t from-purple-400/30 to-transparent flex items-end justify-center pb-1"
                  >
                    <div class="w-5 h-5 bg-purple-400 rounded-full flex items-center justify-center shadow-lg">
                      <svg class="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                      </svg>
                    </div>
                  </div>
                </div>
                
                <div class="text-center mt-1 w-full">
                  <span class="text-xs text-gray-300 font-medium select-none">{{ getAvatarName(avatarId - 1) }}</span>
                </div>
              </div>
            </div>
          
          </div>
        </div>

        <!-- Footer with enhanced buttons -->
        <div class="relative bg-gradient-to-t from-black/50 to-transparent p-4 border-t border-purple-500/20">
          <div class="flex space-x-3">
            <UButton
              @click="handleSkip"
              variant="outline"
              :disabled="registering"
              class="flex-1 bg-transparent border border-gray-500 text-gray-300 hover:bg-gray-700 hover:border-gray-400 font-medium py-3 rounded-xl transition-all duration-200"
            >
              <span class="flex items-center justify-center space-x-2">
                <span>⏭️</span>
                <span>Skip for now</span>
              </span>
            </UButton>
            
            <UButton
              @click="handleRegister"
              :loading="registering"
              :disabled="!canRegister"
              class="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-purple-500/25 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              <span v-if="!registering" class="flex items-center justify-center space-x-2">
                <span>🚀</span>
                <span>Create Profile</span>
              </span>
              <span v-else class="flex items-center justify-center space-x-2">
                <div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Creating...</span>
              </span>
            </UButton>
          </div>
          
          <!-- Enhanced progress indicator -->
          <div class="mt-3 flex items-center justify-center space-x-3">
            <div class="flex items-center space-x-2">
              <div class="w-2 h-2 rounded-full transition-colors duration-200" :class="usernameInput.length > 0 ? 'bg-cyan-400 shadow-sm shadow-cyan-400/50' : 'bg-gray-600'"></div>
              <div class="w-2 h-2 rounded-full transition-colors duration-200" :class="selectedAvatarId >= 0 ? 'bg-purple-400 shadow-sm shadow-purple-400/50' : 'bg-gray-600'"></div>
            </div>
            <span class="text-xs text-gray-400 font-medium">{{ progressText }}</span>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'

// Props
const props = defineProps<{
  show: boolean
}>()

// Emits
const emit = defineEmits<{
  register: [username: string, avatarId: number]
  skip: []
  close: []
}>()

// State
const usernameInput = ref('')
const selectedAvatarId = ref(-1) // Start with no selection
const registering = ref(false)
const usernameError = ref('')

// Computed
const canRegister = computed(() => {
  return usernameInput.value.trim().length > 0 && 
         usernameInput.value.trim().length <= 20 && 
         selectedAvatarId.value >= 0 && 
         !registering.value
})

const progressText = computed(() => {
  if (usernameInput.value.length === 0) return 'Enter username'
  if (selectedAvatarId.value < 0) return 'Select avatar'
  return 'Ready to create profile!'
})

// Methods
const getAvatarName = (avatarId: number): string => {
  const avatarNames = [
    'Luna',      // 0 - girl with purple hair
    'Rex',       // 1 - bearded cool guy
    'Ace',       // 2 - looks like a guy pilot
    'Maya',      // 3 - latina girl very joyful
    'Scarlet',   // 4 - redhead girl that looks cunning
    'Zeke',      // 5 - guy nerdy with glasses
    'Pixie',     // 6 - girl that looks like a gnome very cool
    'Void'       // 7 - guy that looks like chaos
  ]
  return avatarNames[avatarId] || `Avatar ${avatarId}`
}

const handleRegister = async () => {
  if (!canRegister.value) return
  
  if (!usernameInput.value.trim()) {
    usernameError.value = 'Username cannot be empty'
    return
  }
  
  if (usernameInput.value.length > 20) {
    usernameError.value = 'Username must be 20 characters or less'
    return
  }
  
  if (selectedAvatarId.value < 0) {
    usernameError.value = 'Please select an avatar'
    return
  }
  
  registering.value = true
  usernameError.value = ''
  
  try {
    emit('register', usernameInput.value.trim(), selectedAvatarId.value)
  } catch (err: any) {
    usernameError.value = err.message || 'Failed to register username'
  } finally {
    registering.value = false
  }
}

const handleSkip = () => {
  emit('skip')
}

const handleAvatarError = (event: Event) => {
  const img = event.target as HTMLImageElement
  // Create a fallback with gradient background
  const parent = img.parentElement
  if (parent) {
    parent.innerHTML = `
      <div class="w-full h-full bg-gradient-to-br from-purple-500 to-indigo-500 rounded-xl flex items-center justify-center">
        <span class="text-white text-lg font-bold">${selectedAvatarId.value}</span>
      </div>
    `
  }
}

// Reset form when modal opens/closes
watch(() => props.show, (newShow) => {
  if (newShow) {
    usernameInput.value = ''
    selectedAvatarId.value = -1
    usernameError.value = ''
    registering.value = false
  }
})

// Watch for username changes to clear errors
watch(usernameInput, () => {
  if (usernameError.value) {
    usernameError.value = ''
  }
})
</script>

<style scoped>
@keyframes gradient {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

.animate-gradient {
  background-size: 200% 200%;
  animation: gradient 3s ease infinite;
}

.bg-size-200 {
  background-size: 200% 200%;
}
</style>
