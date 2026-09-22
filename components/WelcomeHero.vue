<template>
  <div
    v-if="show"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-[2px] px-4"
  >
    <div class="text-center max-w-xl">
      <div class="text-6xl md:text-7xl font-black tracking-tight">
        <span class="text-cyan-400">R</span><span class="text-white">U</span><span class="text-pink-500">S</span><span class="text-white">H</span>
      </div>
      <p class="mt-4 text-lg md:text-xl text-gray-200 font-medium">
        {{ t('funnel.subtitle') }}
      </p>
      <button
        class="btn btn-primary btn-lg mt-8 px-10 py-4 text-xl font-black"
        :disabled="busy"
        @click="$emit('start')"
      >
        <div v-if="busy" class="animate-spin rounded-full h-5 w-5 border-b-2 border-white inline-block mr-2" />
        {{ busy ? t('funnel.starting') : t('funnel.cta') }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { useRushI18n } from '~/composables/useRushI18n'

  const { t } = useRushI18n()

  defineProps<{ show: boolean; busy: boolean }>()
  defineEmits<{ start: [] }>()
</script>
