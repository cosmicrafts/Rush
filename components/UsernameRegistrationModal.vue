<template>
  <Transition
    enter-active-class="modal-enter-active"
    enter-from-class="modal-enter-from"
    enter-to-class="modal-enter-to"
    leave-active-class="modal-leave-active"
    leave-from-class="modal-leave-from"
    leave-to-class="modal-leave-to"
  >
    <div
      v-if="show"
      class="fixed inset-0 z-[60] flex items-center justify-center bg-black/25 backdrop-blur-sm px-4"
      @click.self="handleSkip"
    >
      <!-- Enhanced animated background particles with COSMIC RUSH theme -->
      <div class="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          class="absolute top-1/4 left-1/4 w-3 h-3 bg-cyan-400 rounded-full animate-pulse opacity-60 blur-sm shadow-lg shadow-cyan-400/50"
        />
        <div
          class="absolute top-3/4 right-1/4 w-2 h-2 bg-pink-500 rounded-full animate-ping opacity-50 shadow-lg shadow-pink-500/50"
        />
        <div
          class="absolute bottom-1/4 left-1/3 w-2 h-2 bg-cyan-400 rounded-full animate-bounce opacity-60 shadow-lg shadow-cyan-400/50"
        />
        <div
          class="absolute top-1/2 right-1/3 w-1 h-1 bg-pink-500 rounded-full animate-pulse opacity-40 shadow-lg shadow-pink-500/50"
        />
        <div
          class="absolute bottom-1/3 right-1/4 w-1.5 h-1.5 bg-cyan-400 rounded-full animate-ping opacity-30 shadow-lg shadow-cyan-400/50"
        />

        <!-- Circuit board lines -->
        <div
          class="absolute top-1/4 left-0 w-32 h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-30"
        />
        <div
          class="absolute bottom-1/4 right-0 w-32 h-px bg-gradient-to-l from-transparent via-pink-500 to-transparent opacity-30"
        />
        <div
          class="absolute top-0 left-1/3 w-px h-32 bg-gradient-to-b from-transparent via-cyan-400 to-transparent opacity-30"
        />
        <div
          class="absolute bottom-0 right-1/3 w-px h-32 bg-gradient-to-t from-transparent via-pink-500 to-transparent opacity-30"
        />

        <!-- Scattered plus signs -->
        <div class="absolute top-1/3 left-1/6 text-pink-500 text-xs animate-pulse">+</div>
        <div class="absolute bottom-1/3 right-1/6 text-cyan-400 text-xs animate-ping">+</div>
        <div class="absolute top-2/3 left-2/3 text-pink-500 text-xs animate-bounce">+</div>
      </div>

      <div class="modal-container modal-container-md flex flex-col">
        <!-- Enhanced glowing border effect with COSMIC RUSH colors -->
        <div
          class="absolute inset-0 bg-gradient-to-r from-cyan-500/20 via-pink-500/20 to-cyan-500/20 blur-2xl"
        />

        <!-- Modal Header -->
        <div class="modal-header flex-shrink-0">
          <div class="flex items-center justify-center space-x-3">
            <h2 class="text-responsive-lg font-extrabold bg-gradient-to-r from-cyan-400 to-pink-500 bg-clip-text text-transparent tracking-tight">
              Rush Registration
            </h2>
          </div>
        </div>

        <!-- Modal Content -->
        <div class="modal-content flex-1">
          <div class="p-6 space-y-6">
            <!-- Username Input Section -->
            <div class="space-y-3">
              <div class="flex items-center space-x-2">
                <div
                  class="w-6 h-6 bg-gradient-to-r from-cyan-400 to-pink-500 rounded-sm flex items-center justify-center"
                >
                  <Icon name="lucide:user" class="w-4 h-4 text-white" />
                </div>
                <label class="text-sm font-semibold text-white">Username</label>
              </div>

              <div class="relative">
                <UInput
                  v-model="usernameInput"
                  type="text"
                  placeholder="Enter your username..."
                  maxlength="12"
                  class="w-full bg-gray-800/90 border border-gray-600 rounded-sm px-4 py-3 text-white placeholder-gray-400 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30 transition-all duration-200 backdrop-blur-sm"
                  :disabled="registering"
                  @keyup.enter="handleRegister"
                />
                <div class="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div
                    class="w-2 h-2 rounded-sm"
                    :class="
                      usernameInput.length > 0
                        ? 'bg-cyan-400 shadow-lg shadow-cyan-400/50'
                        : 'bg-gray-500'
                    "
                  />
                </div>
              </div>

              <div class="space-y-2">
                <p v-if="usernameError" class="text-red-400 text-xs font-medium flex items-center">
                  <Icon name="lucide:alert-triangle" class="w-3 h-3 mr-1" />
                  {{ usernameError }}
                </p>
                <div class="flex items-center justify-between text-xs">
                  <span class="text-gray-300">{{ usernameInput.length }}/12 characters</span>
                </div>
              </div>
            </div>

            <!-- Avatar Selection Section -->
            <div class="space-y-3">
              <div class="flex items-center space-x-2">
                <div
                  class="w-5 h-5 bg-gradient-to-r from-pink-500 to-cyan-400 rounded-sm flex items-center justify-center"
                >
                  <Icon name="lucide:star" class="w-4 h-4 text-white" />
                </div>
                <label class="text-sm font-semibold text-white">Choose Your Avatar</label>
              </div>

              <div class="grid grid-cols-4 gap-3">
                <div
                  v-for="avatarId in 8"
                  :key="avatarId - 1"
                  class="group relative cursor-pointer transition-all duration-200 flex flex-col items-center"
                  tabindex="0"
                  @click="selectedAvatarId = avatarId - 1"
                  @keydown.enter="selectedAvatarId = avatarId - 1"
                  @keydown.space="selectedAvatarId = avatarId - 1"
                >
                  <div
                    class="relative w-20 h-20 rounded-sm overflow-hidden border-4 transition-all duration-200"
                    :class="[
                      selectedAvatarId === avatarId - 1
                        ? 'border-cyan-400 shadow-lg shadow-cyan-400/50 scale-110 bg-cyan-600/30'
                        : 'border-transparent group-hover:border-pink-500 group-hover:bg-pink-800/50',
                    ]"
                  >
                    <img
                      :src="`/avatars/${avatarId - 1}.webp`"
                      :alt="`Avatar ${avatarId - 1}`"
                      class="w-full h-full object-cover transition-transform duration-200"
                      @error="handleAvatarError"
                    />

                    <!-- Enhanced selection indicator with COSMIC RUSH theme -->
                    <div
                      v-if="selectedAvatarId === avatarId - 1"
                      class="absolute inset-0 bg-gradient-to-t from-cyan-400/30 to-transparent flex items-end justify-center pb-1"
                    >
                      <div
                        class="w-5 h-5 bg-gradient-to-r from-cyan-400 to-pink-500 rounded-sm flex items-center justify-center shadow-lg"
                      >
                        <svg class="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fill-rule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clip-rule="evenodd"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>

                  <div class="text-center mt-1 w-full">
                    <span class="text-xs text-gray-300 font-medium select-none">{{
                      getAvatarName(avatarId - 1)
                    }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Modal Footer -->
        <div class="modal-footer flex-shrink-0">
          <div class="p-6">
            <div class="flex space-x-3">
              <button
                :disabled="registering"
                class="btn-inline-secondary flex-1 flex items-center justify-center space-x-2"
                @click="handleSkip"
              >
                <Icon name="lucide:skip-forward" class="w-4 h-4" />
                <span>Skip for now</span>
              </button>

              <button
                :disabled="!canRegister"
                class="btn-inline-primary flex-1 flex items-center justify-center"
                @click="handleRegister"
              >
                <span v-if="registering" class="flex items-center space-x-2">
                  <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Signing up...</span>
                </span>
                <span v-else>Sign Up</span>
              </button>
            </div>

            <!-- Enhanced progress indicator with COSMIC RUSH colors -->
            <div class="mt-4 flex items-center justify-center space-x-3">
              <div class="flex items-center space-x-2">
                <div
                  class="w-2 h-2 rounded-sm transition-colors duration-200"
                  :class="
                    usernameInput.length > 0
                      ? 'bg-cyan-400 shadow-sm shadow-cyan-400/50'
                      : 'bg-gray-600'
                  "
                />
                <div
                  class="w-2 h-2 rounded-sm transition-colors duration-200"
                  :class="
                    selectedAvatarId >= 0 ? 'bg-pink-500 shadow-sm shadow-pink-500/50' : 'bg-gray-600'
                  "
                />
              </div>
              <span class="text-xs text-gray-400 font-medium">{{ progressText }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
  import { ref, watch, computed } from 'vue'
  import { useNotifications } from '~/composables/useNotifications'

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

  // Initialize notification system
  const { showError, showInfo } = useNotifications()

  // State
  const usernameInput = ref('')
  const selectedAvatarId = ref(-1) // Start with no selection
  const registering = ref(false)
  const usernameError = ref('')

  // Computed
  const canRegister = computed(() => {
    return (
      usernameInput.value.trim().length > 0 &&
      usernameInput.value.trim().length <= 12 &&
      selectedAvatarId.value >= 0 &&
      !registering.value
    )
  })

  const progressText = computed(() => {
    if (usernameInput.value.length === 0) return 'Enter username'
    if (selectedAvatarId.value < 0) return 'Select avatar'
    return 'Ready to create profile!'
  })

  // Methods
  const getAvatarName = (avatarId: number): string => {
    const avatarNames = [
      'Luna', // 0 - girl with purple hair
      'Rex', // 1 - bearded cool guy
      'Ace', // 2 - looks like a guy pilot
      'Maya', // 3 - latina girl very joyful
      'Scarlet', // 4 - redhead girl that looks cunning
      'Zeke', // 5 - guy nerdy with glasses
      'Pixie', // 6 - girl that looks like a gnome very cool
      'Void', // 7 - guy that looks like chaos
    ]
    return avatarNames[avatarId] || `Avatar ${avatarId}`
  }

  const handleRegister = async () => {
    if (!canRegister.value) return

    if (!usernameInput.value.trim()) {
      usernameError.value = 'Username cannot be empty'
      return
    }

    if (usernameInput.value.length > 12) {
      usernameError.value = 'Username must be 12 characters or less'
      return
    }

    if (selectedAvatarId.value < 0) {
      usernameError.value = 'Please select an avatar'
      return
    }

    // Immediately set registering to true to show loading state
    registering.value = true
    usernameError.value = ''

    try {
      emit('register', usernameInput.value.trim(), selectedAvatarId.value)
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to register username'
      usernameError.value = errorMessage
      showError('Registration Failed', errorMessage)
      registering.value = false
    }
  }

  const handleSkip = () => {
    showInfo('Registration Skipped', 'You can register your username later from your profile')
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
  watch(
    () => props.show,
    newShow => {
      if (newShow) {
        usernameInput.value = ''
        selectedAvatarId.value = -1
        usernameError.value = ''
        registering.value = false
      }
    }
  )

  // Watch for username changes to clear errors
  watch(usernameInput, () => {
    if (usernameError.value) {
      usernameError.value = ''
    }
  })
</script>

<style scoped>
  @keyframes gradient {
    0% {
      background-position: 0% 50%;
    }
    50% {
      background-position: 100% 50%;
    }
    100% {
      background-position: 0% 50%;
    }
  }

  .animate-gradient {
    background-size: 200% 200%;
    animation: gradient 3s ease infinite;
  }

  .bg-size-200 {
    background-size: 200% 200%;
  }
</style>
