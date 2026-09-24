<template>
  <div v-if="step !== null && hole">
    <!-- 4 dim panels around the hole: everything outside the hole is covered
         (blocked), the hole itself has NO element over it so the real target
         receives real clicks. -->
    <div class="fixed left-0 right-0 top-0 bg-black/70" style="z-index: 60" :style="{ height: hole.y + 'px' }" />
    <div
      class="fixed left-0 right-0 bottom-0 bg-black/70"
      style="z-index: 60"
      :style="{ top: hole.y + hole.h + 'px' }"
    />
    <div
      class="fixed left-0 bg-black/70"
      style="z-index: 60"
      :style="{ top: hole.y + 'px', height: hole.h + 'px', width: hole.x + 'px' }"
    />
    <div
      class="fixed right-0 bg-black/70"
      style="z-index: 60"
      :style="{ top: hole.y + 'px', height: hole.h + 'px', left: hole.x + hole.w + 'px' }"
    />
    <!-- Ring around the live target (visual only, never intercepts). -->
    <div
      class="funnel-ring"
      :style="{ left: hole.x + 'px', top: hole.y + 'px', width: hole.w + 'px', height: hole.h + 'px' }"
    />
    <!-- Instruction card glued to the hole (never background decor) -->
    <div class="fixed w-[calc(100%-2rem)] max-w-md" style="z-index: 61" :style="cardStyle">
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
  <!-- Hole not measured yet: block nothing, show only the card. -->
  <div v-else-if="step !== null">
    <div class="fixed bottom-4 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-md" style="z-index: 61}">
      <div class="card card-sm border-cyan-400/60 p-4 text-center">
        <p class="text-cyan-300 font-black text-xl">👉 {{ title }}</p>
        <p class="text-gray-100 text-sm mt-1 font-medium">{{ body }}</p>
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
  const vp = ref({ w: 1280, h: 800 })
  // Card glued to the hole: above it when the target sits low, below it
  // when it sits high. Horizontally centered on the hole, clamped onscreen.
  const cardStyle = computed<Record<string, string>>(() => {
    const h = hole.value
    if (!h || typeof window === 'undefined') return { bottom: '1rem', left: '50%', transform: 'translateX(-50%)' }
    const vw = vp.value.w
    const vh = vp.value.h
    const half = Math.min(224, Math.max(140, (vw - 32) / 2))
    const cx = Math.min(Math.max(h.x + h.w / 2, half + 8), vw - half - 8)
    const left = `calc(${cx}px - ${half}px)`
    if (h.y + h.h / 2 > vh * 0.52) {
      return { left, bottom: `${Math.max(8, vh - h.y + 12)}px` }
    }
    return { left, top: `${h.y + h.h + 12}px` }
  })
  let retries = 0
  let retryTimer: ReturnType<typeof setTimeout> | null = null
  let lastEl: HTMLElement | null = null
  let cleanup: (() => void) | null = null

  const clearFx = () => {
    if (retryTimer) {
      clearTimeout(retryTimer)
      retryTimer = null
    }
    try {
      cleanup?.()
    } catch {
      /* listener already gone */
    }
    cleanup = null
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
    if (typeof window !== 'undefined') vp.value = { w: window.innerWidth, h: window.innerHeight }
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
    if (step === 1) {
      // Bet comes pre-filled at minimum: pulse Min like RACE, and advance on
      // the player's own touch — never on the pre-fill itself.
      const minBtn = document.querySelector('#funnel-min') as HTMLElement | null
      minBtn?.classList.add('funnel-pulse')
      const interact = () => emits('next')
      el.addEventListener('click', interact, { capture: true })
      el.addEventListener('input', interact, { capture: true })
      cleanup = () => {
        minBtn?.classList.remove('funnel-pulse')
        el.removeEventListener('click', interact, { capture: true } as AddEventListenerOptions)
        el.removeEventListener('input', interact, { capture: true } as AddEventListenerOptions)
      }
    }
  }

  // Advance only on REAL actions (dispatched by BettingInterface).
  const onShipPicked = () => {
    if (props.step === 0) emits('next')
  }
  const onReposition = () => {
    if (typeof window !== 'undefined') vp.value = { w: window.innerWidth, h: window.innerHeight }
    if (props.step !== null) placeHole(props.step)
  }
  const arm = (step: number | null) => {
    clearFx()
    disarm()
    if (step === null) return
    if (typeof window === 'undefined') return
    window.addEventListener('rush:ship-picked', onShipPicked)
    window.addEventListener('resize', onReposition)
    window.addEventListener('scroll', onReposition, true)
    setTimeout(() => placeHole(step), 80)
  }

  const disarm = () => {
    if (typeof window === 'undefined') return
    window.removeEventListener('rush:ship-picked', onShipPicked)
    window.removeEventListener('resize', onReposition)
    window.removeEventListener('scroll', onReposition, true)
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
  /* Ring only: marks the live target, never intercepts clicks. The 4 dim
     panels do the blocking; the hole area has no overlay element at all. */
  .funnel-ring {
    position: fixed;
    z-index: 60;
    pointer-events: none;
    border-radius: 14px;
    border: 3px solid rgba(34, 211, 238, 0.95);
    box-shadow: 0 0 36px rgba(34, 211, 238, 0.55);
  }
  .funnel-pulse {
    animation: funnel-pulse 1.1s ease-in-out infinite;
  }
  @keyframes funnel-pulse {
    0%, 100% { filter: brightness(1); transform: scale(1); }
    50% { filter: brightness(1.5); transform: scale(1.04); }
  }
</style>
