<template>
  <div
    v-if="show"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-[2px] px-4"
    @click.self="$emit('close')"
  >
    <div class="modal-container modal-container-md">
      <div class="modal-header">
        <div class="modal-header-container">
          <div class="modal-header-title">
            <span class="text-2xl">🧭</span>
            <h2 class="modal-header-text">{{ t('tour.title') }}</h2>
          </div>
          <button class="modal-close-btn" @click="$emit('close')">×</button>
        </div>
        <p class="text-responsive-xs text-gray-400 mt-1">{{ t('tour.subtitle') }}</p>
      </div>
      <div class="modal-content space-y-2">
        <div
          v-for="item in items"
          :key="item.id"
          class="flex items-center gap-3 p-3 rounded-xl border"
          :class="done[item.id] ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-white/10 bg-white/[0.02]'"
        >
          <span class="text-2xl w-8 text-center">{{ done[item.id] ? '✅' : item.icon }}</span>
          <div class="flex-1 min-w-0">
            <p class="font-bold text-sm text-white">{{ t(`tour.${item.id}`) }}</p>
            <p class="text-xs text-gray-400">{{ t(`tour.${item.id}_body`) }}</p>
          </div>
          <button
            v-if="!done[item.id]"
            class="btn-inline-secondary px-3 py-1.5 text-xs font-bold shrink-0"
            @click="$emit('go', item.id)"
          >
            {{ t('tour.go') }}
          </button>
          <span v-else class="text-emerald-400 text-xs font-bold shrink-0">{{ t('tour.done') }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { useRushI18n } from '~/composables/useRushI18n'

  const { t } = useRushI18n()

  defineProps<{ show: boolean; done: Record<string, boolean> }>()
  defineEmits<{ go: [id: string]; close: [] }>()

  const items = [
    { id: 'nickname', icon: '🏷️' },
    { id: 'avatar', icon: '🎭' },
    { id: 'board', icon: '🏆' },
    { id: 'cards', icon: '🃏' },
    { id: 'topup', icon: '🪙' },
  ]
</script>
