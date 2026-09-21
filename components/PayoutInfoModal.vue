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
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/25 backdrop-blur-sm px-4"
      @click.self="$emit('close')"
    >
      <div class="modal-container modal-container-md flex flex-col">
        <!-- Enhanced glowing border effect with COSMIC RUSH colors -->
        <div
          class="absolute inset-0 bg-gradient-to-r from-cyan-500/20 via-pink-500/20 to-cyan-500/20 blur-2xl"
        />

                <!-- Modal Header -->
        <div class="modal-header flex-shrink-0">
          <div class="modal-header-container">
            <div class="modal-header-title">
              <Icon name="game-icons:pouch-with-beads" class="modal-header-icon" />
              <h2 class="modal-header-text-gradient">{{ t('payout.title') }}</h2>
            </div>
            <button class="modal-close-btn" @click="$emit('close')">
              ×
            </button>
          </div>
        </div>

        <!-- Modal Content -->
        <div class="modal-content custom-scrollbar flex-1">
          <div class="p-6 space-y-6">
          <div class="space-y-6">
            <!-- Payout Structure -->
            <div class="bg-gray-800 border border-gray-700 rounded-lg p-4">
              <h3 class="text-sm font-bold text-purple-300 mb-3">{{ t('payout.race_payouts') }}</h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div class="flex items-center justify-between p-2 bg-gray-700 rounded">
                  <div class="flex items-center gap-2">
                    <span class="text-yellow-400">🥇</span>
                    <span class="text-gray-300">{{ t('payout.place_1') }}</span>
                  </div>
                  <span class="text-emerald-400 font-bold">4X Bet</span>
                </div>
                <div class="flex items-center justify-between p-2 bg-gray-700 rounded">
                  <div class="flex items-center gap-2">
                    <span class="text-gray-400">🥈</span>
                    <span class="text-gray-300">{{ t('payout.place_2') }}</span>
                  </div>
                  <span class="text-emerald-400 font-bold">2X Bet</span>
                </div>
                <div class="flex items-center justify-between p-2 bg-gray-700 rounded">
                  <div class="flex items-center gap-2">
                    <span class="text-amber-600">🥉</span>
                    <span class="text-gray-300">{{ t('payout.place_3') }}</span>
                  </div>
                  <span class="text-gray-400 font-bold">1X Bet</span>
                </div>
                <div class="flex items-center justify-between p-2 bg-gray-700 rounded">
                  <div class="flex items-center gap-2">
                    <span class="text-gray-500">4️⃣</span>
                    <span class="text-gray-300">{{ t('payout.place_4') }}</span>
                  </div>
                  <span class="text-red-400 font-bold">0.5X Bet</span>
                </div>
                <div class="flex items-center justify-between p-2 bg-gray-700 rounded">
                  <div class="flex items-center gap-2">
                    <span class="text-gray-500">5️⃣</span>
                    <span class="text-gray-300">{{ t('payout.place_5') }}</span>
                  </div>
                  <span class="text-red-400 font-bold">0.35X Bet</span>
                </div>
                <div class="flex items-center justify-between p-2 bg-gray-700 rounded">
                  <div class="flex items-center gap-2">
                    <span class="text-gray-500">6️⃣</span>
                    <span class="text-gray-300">{{ t('payout.place_6') }}</span>
                  </div>
                  <span class="text-red-400 font-bold">0.25X Bet</span>
                </div>
                <div class="flex items-center justify-between p-2 bg-gray-700 rounded">
                  <div class="flex items-center gap-2">
                    <span class="text-gray-500">7️⃣</span>
                    <span class="text-gray-300">{{ t('payout.place_7') }}</span>
                  </div>
                  <span class="text-red-400 font-bold">0.1X Bet</span>
                </div>
                <div class="flex items-center justify-between p-2 bg-gray-700 rounded">
                  <div class="flex items-center gap-2">
                    <span class="text-gray-500">8️⃣</span>
                    <span class="text-gray-300">{{ t('payout.place_8') }}</span>
                  </div>
                  <span class="text-red-400 font-bold">0X Bet</span>
                </div>
              </div>
              <p class="text-gray-400 text-xs mt-2">
                {{ t('payout.house_edge') }}
              </p>
            </div>

            <!-- Jackpot Information -->
            <div class="bg-gray-800 border border-gray-700 rounded-lg p-4">
              <h3 class="text-sm font-bold text-purple-300 mb-3">{{ t('payout.jackpot_system') }}</h3>
              <p class="text-gray-300 text-sm mb-4">
                {{ t('payout.jackpot_desc') }}
              </p>

              <div class="space-y-4">
                <!-- Mini Jackpot -->
                <div class="flex items-center gap-4 p-3 bg-gray-700 rounded">
                  <nuxt-img
                    src="/mini-jackpot.webp"
                    :alt="t('betting.mini_jackpot')"
                    class="w-12 h-12 object-contain"
                    width="48"
                    height="48"
                    format="webp"
                    quality="85"
                    sizes="48px"
                  />
                  <div class="flex-1">
                    <h4 class="text-amber-400 font-bold">{{ t('betting.mini_jackpot') }}</h4>
                    <p class="text-gray-400 text-xs">{{ t('payout.mini_chance') }}</p>
                    <p class="text-gray-300 text-xs">{{ t('payout.mini_share') }}</p>
                  </div>
                  <div class="text-right">
                    <div class="text-amber-400 font-bold text-lg">
                      <SpiralToken :amount="jackpotAmounts.mini" color="amber" size="lg" />
                    </div>
                  </div>
                </div>

                <!-- Mega Jackpot -->
                <div class="flex items-center gap-4 p-3 bg-gray-700 rounded">
                  <nuxt-img
                    src="/mega-jackpot.webp"
                    :alt="t('betting.mega_jackpot')"
                    class="w-12 h-12 object-contain"
                    width="48"
                    height="48"
                    format="webp"
                    quality="85"
                    sizes="48px"
                  />
                  <div class="flex-1">
                    <h4 class="text-orange-400 font-bold">{{ t('betting.mega_jackpot') }}</h4>
                    <p class="text-gray-400 text-xs">{{ t('payout.mega_chance') }}</p>
                    <p class="text-gray-300 text-xs">{{ t('payout.mega_share') }}</p>
                  </div>
                  <div class="text-right">
                    <div class="text-orange-400 font-bold text-lg">
                      <SpiralToken :amount="jackpotAmounts.mega" color="amber" size="lg" />
                    </div>
                  </div>
                </div>

                <!-- Super Jackpot -->
                <div class="flex items-center gap-4 p-3 bg-gray-700 rounded">
                  <nuxt-img
                    src="/super-jackpot.webp"
                    :alt="t('betting.super_jackpot')"
                    class="w-12 h-12 object-contain"
                    width="48"
                    height="48"
                    format="webp"
                    quality="85"
                    sizes="48px"
                  />
                  <div class="flex-1">
                    <h4 class="text-red-400 font-bold">{{ t('betting.super_jackpot') }}</h4>
                    <p class="text-gray-400 text-xs">{{ t('payout.super_chance') }}</p>
                    <p class="text-gray-300 text-xs">{{ t('payout.super_share') }}</p>
                  </div>
                  <div class="text-right">
                    <div class="text-red-400 font-bold text-lg">
                      <SpiralToken :amount="jackpotAmounts.super" color="red" size="lg" />
                    </div>
                  </div>
                </div>
              </div>

              <div class="mt-4 p-3 bg-sky-900/20 border border-sky-500/30 rounded">
                <h4 class="text-sky-400 font-bold text-sm mb-2">{{ t('payout.how_title') }}</h4>
                <ul class="text-gray-300 text-xs space-y-1">
                  <li>• {{ t('payout.how_1') }}</li>
                  <li>• {{ t('payout.how_2') }}</li>
                  <li>• {{ t('payout.how_3') }}</li>
                  <li>• {{ t('payout.how_4') }}</li>
                  <li>• {{ t('payout.how_5') }}</li>
                </ul>
              </div>
            </div>

            <!-- Betting Limits -->
            <div class="bg-gray-800 border border-gray-700 rounded-lg p-4">
              <h3 class="text-sm font-bold text-purple-300 mb-3">{{ t('payout.limits') }}</h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div class="flex items-center justify-between p-2 bg-gray-700 rounded">
                  <span class="text-gray-300">{{ t('payout.min_bet') }}</span>
                  <SpiralToken :amount="10" color="emerald" size="sm" :format="false" />
                </div>
                <div class="flex items-center justify-between p-2 bg-gray-700 rounded">
                  <span class="text-gray-300">{{ t('payout.max_bet') }}</span>
                  <SpiralToken :amount="1000" color="red" size="sm" :format="false" />
                </div>
              </div>
            </div>
          </div>
        </div>
        </div>

        <!-- Modal Footer -->
        <div class="modal-footer flex-shrink-0">
          <div class="flex justify-center">
            <button
              class="btn btn-primary btn-sm flex items-center space-x-2"
              @click="$emit('close')"
            >
              <Icon name="game-icons:pouch-with-beads" class="w-5 h-5" />
              <span>{{ t('profile.close') }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
  import { useBetting } from '~/composables/useBetting'
  import { useRushI18n } from '~/composables/useRushI18n'

  const { t } = useRushI18n()
  import SpiralToken from './SpiralToken.vue'

  // Props
  interface Props {
    show: boolean
  }

  defineProps<Props>()

  // Define emits
  defineEmits<{
    close: []
  }>()

  // Use the betting composable for jackpot data
  const {
    // State
    jackpotAmounts,
  } = useBetting()
</script>
