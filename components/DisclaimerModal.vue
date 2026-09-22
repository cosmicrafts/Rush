<template>
  <div
    v-if="show"
    class="modal-overlay"
    @click.self="$emit('start')"
  >
    <div class="modal-container">
      <!-- Modal Header -->
      <div class="modal-header">
        <div class="layout-flex-between items-center">
          <div class="layout-flex-center space-responsive-xs">

            <h2>{{ t('disclaimer.title') }}</h2>
          </div>
          <p class="text-responsive-xs text-gray-400 text-right max-w-48">
            {{ t('disclaimer.subtitle') }}
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
              >Cosmicrafts <span class="font-bold">Rush</span></span
            >
          </div>

          <!-- Description -->
            <div class="space-responsive-sm text-responsive-sm text-gray-300 leading-relaxed">
            <p class="text-gray-400">
              {{ t('disclaimer.line1') }}
              {{ t('disclaimer.line2') }}
            </p>
          </div>


        </div>
      </div>

      <!-- Modal Footer -->
      <div class="modal-footer">
        <div class="layout-flex-center">
          <button
            class="btn btn-primary btn-sm"
            :disabled="busy"
            @click="$emit('start')"
          >
            <div class="layout-flex-center gap-2">
              <div v-if="busy" class="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
              <Icon v-else name="simple-icons:starship" class="w-5 h-5" />
              <span>{{ busy ? t('funnel.starting') : t('disclaimer.cta') }}</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { useRushI18n } from '~/composables/useRushI18n'

  const { t } = useRushI18n()

  // Controlled by the funnel: shown only to first-run players without a
  // session. Returning players never see it. CTA provisions everything.
  defineProps<{ show: boolean; busy: boolean }>()
  defineEmits<{ start: [] }>()
</script>
