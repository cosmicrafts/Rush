<template>
  <div v-if="step !== null">
    <!-- Coach-mark card -->
    <div class="fixed bottom-4 left-1/2 -translate-x-1/2 z-[60] w-[calc(100%-2rem)] max-w-md">
      <div class="card card-sm border-cyan-400/40 p-4 text-center shadow-[0_0_40px_rgba(34,211,238,0.25)]">
        <p class="text-cyan-300 font-black text-lg">{{ title }}</p>
        <p class="text-gray-200 text-sm mt-1">{{ body }}</p>
        <!-- Progress dots -->
        <div class="flex justify-center gap-2 mt-3">
          <span
            v-for="i in 3"
            :key="i"
            class="w-2 h-2 rounded-full"
            :class="i - 1 === step ? 'bg-cyan-400' : 'bg-gray-600'"
          />
        </div>
        <div class="flex justify-center gap-3 mt-3">
          <button class="btn-inline-secondary px-4 py-2 text-sm" @click="$emit('skip')">
            {{ t('funnel.skip') }}
          </button>
          <button v-if="step < 2" class="btn btn-primary px-4 py-2 text-sm font-bold" @click="$emit('next')">
            {{ t('funnel.next') }}
          </button>
          <button v-else class="btn btn-primary px-6 py-2 text-sm font-black" @click="$emit('next')">
            {{ t('funnel.race') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed, onBeforeUnmount, watch } from 'vue'
  import { useRushI18n } from '~/composables/useRushI18n'

  const { t } = useRushI18n()

  const props = defineProps<{ step: number | null }>()
  const emits = defineEmits<{ next: []; skip: [] }>()

  const TARGETS = ['#funnel-ships', '#funnel-bet', '#funnel-race']

  const title = computed(() => t(`funnel.step${(props.step ?? 0) + 1}_title`))
  const body = computed(() => t(`funnel.step${(props.step ?? 0) + 1}_body`))

  let cleanup: (() => void) | null = null

  const clearSpotlight = () => {
    cleanup?.()
    cleanup = null
    if (typeof document === 'undefined') return
    document.querySelectorAll('.funnel-spotlight').forEach(el => el.classList.remove('funnel-spotlight'))
  }

  // Auto-advance: tapping a ship finishes step 0, touching the bet finishes step 1.
  const spotlight = (step: number) => {
    clearSpotlight()
    if (typeof document === 'undefined') return
    const el = document.querySelector(TARGETS[step]) as HTMLElement | null
    if (!el) return
    el.classList.add('funnel-spotlight')
    try {
      el.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
    } catch {
      /* older browsers: spotlight still shows */
    }
    if (step === 2) {
      cleanup = null
      return
    }
    const evts = step === 0 ? ['click'] : ['click', 'input']
    const handler = () => emits('next')
    evts.forEach(evt => el.addEventListener(evt, handler, { capture: true }))
    cleanup = () =>
      evts.forEach(evt => el.removeEventListener(evt, handler, { capture: true } as AddEventListenerOptions))
  }

  watch(
    () => props.step,
    step => {
      if (step === null) clearSpotlight()
      else setTimeout(() => spotlight(step), 60)
    },
    { immediate: true },
  )

  onBeforeUnmount(clearSpotlight)
</script>

<style>
  .funnel-spotlight {
    outline: 3px solid rgba(34, 211, 238, 0.9) !important;
    outline-offset: 4px !important;
    border-radius: 12px;
    box-shadow: 0 0 32px rgba(34, 211, 238, 0.45) !important;
  }
</style>
