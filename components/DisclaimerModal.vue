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
      class="modal-overlay"
      @click.self="acceptDisclaimer"
    >
      <div class="modal-container">
        <!-- Modal Header -->
        <div class="modal-header">
          <div class="layout-flex-center space-responsive-md">
            <img
              src="/cosmicrush.webp"
              alt="Cosmicrafts Rush Logo"
              class="w-32 h-32 object-contain"
            />
            <h2>Welcome to RUSH!</h2>
            <p class="text-responsive-sm text-gray-400">On-chain spaceship racing with AI chaos & instant payouts</p>
          </div>
        </div>

        <!-- Modal Content -->
        <div class="modal-content">
          <!-- Welcome Content -->
          <div class="text-center space-responsive-md">
            <div class="layout-flex-center space-responsive-sm">
              <div class="badge badge-primary">
                <span class="text-white text-sm font-bold">🏆</span>
              </div>
              <span class="text-responsive-sm font-semibold text-cyan-400"
                >Somnia v1 Mini-Games Hackathon</span
              >
            </div>

            <div class="space-responsive-md text-responsive-sm text-gray-300 leading-relaxed">
              <p class="text-gray-400">
                Built for the first Somnia Testnet hackathon in partnership with
                <span class="text-pink-400 font-semibold">DoraHacks</span>. Experience high-stakes
                spaceship racing with blockchain-powered chaos factors!
              </p>

              <div class="card card-md bg-gradient-secondary border-gradient-secondary">
                <div class="layout-flex-center space-responsive-sm">
                  <span class="text-amber-400 text-lg">⚠️</span>
                  <span class="text-amber-300 text-responsive-xs font-semibold"
                    >Demo Version - Testnet Environment</span
                  >
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Modal Footer -->
        <div class="modal-footer">
          <div class="layout-flex-center">
            <button
              class="btn btn-primary btn-lg"
              @click="acceptDisclaimer"
            >
              <span class="layout-flex-center space-responsive-sm">
                <span>🚀</span>
                <span>Let's RUSH!</span>
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
  import { ref, onMounted, watch } from 'vue'

  interface Props {
    showWhenNoSession?: boolean
    hasSession?: boolean
    isSessionChecked?: boolean
  }

  const props = withDefaults(defineProps<Props>(), {
    showWhenNoSession: false,
    hasSession: false,
    isSessionChecked: false,
  })

  const show = ref(false)

  // Mark disclaimer as accepted
  const acceptDisclaimer = () => {
    show.value = false
    // Store in localStorage to remember user accepted
    localStorage.setItem('cosmicrush-disclaimer-accepted', 'true')
  }

  // Show disclaimer logic
  const shouldShowDisclaimer = () => {
    // If we're checking for auto-reconnect status, show when auto-reconnect fails
    if (props.showWhenNoSession && props.isSessionChecked) {
      return !props.hasSession
    }
    
    // Fallback to original behavior - check if user has accepted
    const hasAccepted = localStorage.getItem('cosmicrush-disclaimer-accepted')
    return !hasAccepted
  }

  // Watch for session changes
  watch([() => props.hasSession, () => props.isSessionChecked], () => {
    if (props.showWhenNoSession && props.isSessionChecked) {
      show.value = shouldShowDisclaimer()
    }
  }, { immediate: true })

  // Show disclaimer on mount if not previously accepted (original behavior)
  onMounted(() => {
    if (!props.showWhenNoSession) {
      show.value = shouldShowDisclaimer()
    }
  })

  defineExpose({
    open: () => {
      show.value = true
    },
    close: () => {
      show.value = false
    },
  })
</script>
