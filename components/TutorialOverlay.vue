<template>
  <div v-if="step !== null" class="fixed inset-0 z-[60]" @click="swallow" @mousedown="swallow">
    <!-- Dim layer with a live hole over the real target: everything outside
         the hole is blocked, the target stays clickable. -->
    <div
      v-if="hole"
      class="funnel-hole"
      :style="{ left: hole.x + 'px', top: hole.y + 'px', width: hole.w + 'px', height: hole.h + 'px' }"
    />
    <!-- Instruction card (inside the dim layer: always foreground) -->
    <div class="fixed bottom-4 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-md">
      <div class="card card-sm border-cyan-400/60 p-4 text-center shadow-[0_0_60px_rgba(34,211,238,0.4)]">
        <p class="text-cyan-300 font-black text-xl">👉 {{ title }}</p>
        <p class="text-gray-100 text-sm mt-1 font-medium">{{ body }}</p>
        <div class="flex justify-center gap-2 mt-3">
          <span
            v-for="i in 3"
            :key="i"
            class="w-2 h-2 rounded-full"
            :class="i - 1 === step ? 'bg-cyan-400' : 'bg-gray-600'"
          />
        </div>
        <button class="btn-inline-secondary px-4 py-2 text-sm mt-3" @click.stop="$emit('skip')">
          {{ t('funnel.skip') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed, onBeforeUnmount, ref, watch } from 'vue'
  import { useRushI18n } from '~/composables/useRushI18n'

  const { t } = useRushI18n()

  const props = defineProps<{ step: number | null }>()
  const emits = defineEmits<{ next: []; skip: [] }>()

  const TARGETS = ['#funnel-ships', '#funnel-bet', '#funnel-race']

  const title = computed(() => t(`funnel.step${(props.step ?? 0) + 1}_title`))
  const body = computed(() => t(`funnel.step${(props.step ?? 0) + 1}_body`))

  interface Hole { x: number; y: number; w: number; h: number }
  const hole = ref<Hole | null>(null)
  let retries = 0
  let retryTimer: ReturnType<typeof setTimeout> | null = null
  let lastEl: HTMLElement | null = null

  // Swallow every click that isn't on the highlighted target.
  const swallow = (e: Event) => {
    e.stopPropagation()
    e.preventDefault()
  }

  const clearFx = () => {
    if (retryTimer) {
      clearTimeout(retryTimer)
      retryTimer = null
    }
    if (typeof document === 'undefined') {
      hole.value = null
      lastEl = null
      return
    }
    document.querySelectorAll('.funnel-pulse').forEach(el => el.classList.remove('funnel-pulse'))
    hole.value = null
    lastEl = null
  }

  const placeHole = (step: number) => {
    if (typeof document === 'undefined') return
    const el = document.querySelector(TARGETS[step]) as HTMLElement | null
    if (!el) {
      // Panel not rendered yet: retry briefly, then give up instead of hanging.
      retries += 1
      if (retries > 12) {
        emits('skip')
        return
      }
      retryTimer = setTimeout(() => placeHole(step), 400)
      return
    }
    retries = 0
    lastEl = el
    try {
      el.scrollIntoView({ block: 'nearest' })
    } catch {
      /* older browsers: hole still positions on next frame */
    }
    requestAnimationFrame(() => {
      const r = el.getBoundingClientRect()
      const pad = 8
      hole.value = {
        x: Math.max(0, r.left - pad),
        y: Math.max(0, r.top - pad),
        w: r.width + pad * 2,
        h: r.height + pad * 2,
      }
    })
    if (step === 2) el.classList.add('funnel-pulse')
  }

  // Advance only on REAL actions (dispatched by BettingInterface).
  const onShipPicked = () => {
    if (props.step === 0) emits('next')
  }
  const onBetReady = () => {
    if (props.step === 1) emits('next')
  }
  const onResize = () => {
    if (props.step !== null) placeHole(props.step)
  }

  const arm = (step: number | null) => {
    clearFx()
    disarm()
    if (step === null) return
    if (typeof window === 'undefined') return
    window.addEventListener('rush:ship-picked', onShipPicked)
    window.addEventListener('rush:bet-ready', onBetReady)
    window.addEventListener('resize', onResize)
    setTimeout(() => placeHole(step), 80)
  }

  const disarm = () => {
    if (typeof window === 'undefined') return
    window.removeEventListener('rush:ship-picked', onShipPicked)
    window.removeEventListener('rush:bet-ready', onBetReady)
    window.removeEventListener('resize', onResize)
  }

  watch(() => props.step, arm, { immediate: true })

  onBeforeUnmount(() => {
    disarm()
    if (typeof document !== 'undefined') {
      document.querySelectorAll('.funnel-pulse').forEach(el => el.classList.remove('funnel-pulse'))
    }
  })
</script>

<style>
  /* The hole: transparent window, everything around it dimmed. Clicks pass
     through the hole to the real target; the dim layer eats the rest. */
  .funnel-hole {
    position: fixed;
    pointer-events: none;
    border-radius: 14px;
    border: 3px solid rgba(34, 211, 238, 0.95);
    box-shadow:
      0 0 0 9999px rgba(0, 0, 0, 0.72),
      0 0 36px rgba(34, 211, 238, 0.55);
  }
  .funnel-pulse {
    animation: funnel-pulse 1.1s ease-in-out infinite;
  }
  @keyframes funnel-pulse {
    0%, 100% { filter: brightness(1); transform: scale(1); }
    50% { filter: brightness(1.5); transform: scale(1.04); }
  }
</style>
