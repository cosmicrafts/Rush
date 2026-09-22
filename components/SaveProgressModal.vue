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
            <span class="text-2xl">💾</span>
            <h2 class="modal-header-text">{{ t('save.title') }}</h2>
          </div>
          <button class="modal-close-btn" @click="$emit('close')">×</button>
        </div>
      </div>
      <div class="modal-content">
        <!-- Step 1: email -->
        <div v-if="step === 'idle'">
          <p class="text-sm text-gray-300 mb-3">{{ t('save.body') }}</p>
          <input
            v-model="email"
            type="email"
            :placeholder="t('save.email_ph')"
            class="input w-full"
            @keyup.enter="sendCode"
          />
          <button class="btn btn-primary w-full mt-3 py-2.5 font-bold" :disabled="busy || !email" @click="sendCode">
            {{ busy ? t('save.sending') : t('save.send_code') }}
          </button>
        </div>
        <!-- Step 2: code -->
        <div v-else-if="step === 'code'">
          <p class="text-sm text-gray-300 mb-3">{{ email }}</p>
          <input
            v-model="code"
            inputmode="numeric"
            :placeholder="t('save.code_ph')"
            class="input w-full text-center text-xl tracking-widest"
            @keyup.enter="verify"
          />
          <button class="btn btn-primary w-full mt-3 py-2.5 font-bold" :disabled="busy || !code" @click="verify">
            {{ busy ? t('save.verifying') : t('save.verify') }}
          </button>
        </div>
        <!-- Existing account: explicit choice, progress stays behind on switch -->
        <div v-else-if="step === 'decide'">
          <p class="text-lg font-black text-amber-300">⚠️ {{ t('save.existing_title') }}</p>
          <p class="text-sm text-gray-300 mt-2">{{ t('save.existing_body') }}</p>
          <div class="flex flex-col gap-2 mt-4">
            <button class="btn btn-primary w-full py-2.5 font-bold" @click="stayAnonymous">
              {{ t('save.stay') }}
            </button>
            <button class="btn-inline-secondary w-full py-2.5" @click="switchAccount">
              {{ t('save.switch') }}
            </button>
          </div>
        </div>
        <!-- Promoted: same account, now linked -->
        <div v-else>
          <p class="text-lg font-black text-emerald-300">✅ {{ t('save.promoted_title') }}</p>
          <p class="text-sm text-gray-300 mt-2">{{ t('save.promoted_body') }}</p>
          <button class="btn btn-primary w-full mt-4 py-2.5 font-bold" @click="$emit('close')">
            {{ t('save.close') }}
          </button>
        </div>
        <p v-if="error" class="text-sm text-red-400 text-center mt-3">{{ error }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, watch } from 'vue'
  import { useRushI18n } from '~/composables/useRushI18n'
  import { useWeb3 } from '~/composables/useBackend'

  const { t } = useRushI18n()
  const web3 = useWeb3()

  const props = defineProps<{ show: boolean }>()
  const emit = defineEmits<{ close: []; switched: [] }>()

  type Step = 'idle' | 'code' | 'decide' | 'done'
  const step = ref<Step>('idle')
  const email = ref('')
  const code = ref('')
  const busy = ref(false)
  const error = ref('')

  // Stashed anonymous session: restored if the player keeps playing here.
  let stashed: { token: string; account: unknown } | null = null

  watch(
    () => props.show,
    show => {
      if (show) {
        step.value = 'idle'
        email.value = ''
        code.value = ''
        error.value = ''
        stashed = null
      }
    },
  )

  const sendCode = async () => {
    busy.value = true
    error.value = ''
    try {
      await web3.wouAuth.requestOtp(email.value.trim(), false, 'rush')
      step.value = 'code'
    } catch (e) {
      error.value = e instanceof Error ? e.message : String(e)
    } finally {
      busy.value = false
    }
  }

  const verify = async () => {
    busy.value = true
    error.value = ''
    try {
      const token = web3.wouAuth.getSessionToken()
      const me = await web3.wouAuth.getMe().catch(() => null)
      if (token && me) stashed = { token, account: me }
      const res = await web3.wouAuth.verifyOtp(email.value.trim(), code.value.trim(), 'rush')
      if (res.is_new_account) {
        await web3.refreshIdentity()
        step.value = 'done'
        emit('switched')
      } else {
        step.value = 'decide'
      }
    } catch (e) {
      error.value = e instanceof Error ? e.message : String(e)
    } finally {
      busy.value = false
    }
  }

  const stayAnonymous = () => {
    if (stashed) {
      web3.wouAuth.setSession(stashed.token, stashed.account as never)
      web3.refreshIdentity().catch(() => {})
    }
    emit('close')
  }

  const switchAccount = async () => {
    await web3.refreshIdentity().catch(() => {})
    emit('switched')
    emit('close')
  }
</script>
