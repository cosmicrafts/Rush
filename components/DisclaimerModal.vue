<template>
  <div
    v-if="show"
    class="modal-overlay"
    @click.self="acceptDisclaimer"
  >
    <div class="modal-container">
      <!-- Modal Header -->
      <div class="modal-header">
        <div class="layout-flex-between items-center">
          <div class="layout-flex-center space-responsive-xs">

            <h2>Welcome to RUSH!</h2>
          </div>
          <p class="text-responsive-xs text-gray-400 text-right max-w-48">
            On-chain spaceship racing with AI chaos & instant payouts
          </p>
        </div>
        <div class="separator-line"></div>
      </div>

      <!-- Modal Content -->
      <div class="modal-content">
        <!-- Trophy and Hackathon Section -->
        <div class="text-center space-responsive-sm">
          <div class="layout-flex-center space-responsive-xs gap-2">
            <div class="badge badge-primary">
              <Icon name="solar:cup-bold" class="w-4 h-4 text-white" />
            </div>
            <span class="text-responsive-sm font-semibold text-cyan-400"
              >Somnia <span class="font-bold">v1 Mini-Games Hackathon</span></span
            >
          </div>

          <!-- Description -->
          <div class="space-responsive-sm text-responsive-sm text-gray-300 leading-relaxed">
            <p class="text-gray-400">
              Built for the first Somnia Testnet hackathon in partnership with
              <span class="text-pink-400 font-semibold">DoraHacks</span>.
            </p>
          </div>


        </div>
      </div>

      <!-- Modal Footer -->
      <div class="modal-footer">
        <div class="layout-flex-center">
          <button
            class="btn btn-primary btn-sm"
            @click="acceptDisclaimer"
          >
            <div class="layout-flex-center gap-2">
              <Icon name="simple-icons:starship" class="w-5 h-5" />
              <span>Let's RUSH!</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  </div>
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
