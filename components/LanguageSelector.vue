<template>
  <div class="rush-lang" data-rush-lang>
    <button
      type="button"
      class="rush-lang-trigger"
      :aria-label="t('header.language')"
      aria-haspopup="listbox"
      :aria-expanded="open ? 'true' : 'false'"
      @click.stop="toggle"
    >
      <span aria-hidden="true">🌐</span>
      <span class="rush-lang-label">{{ currentLabel }}</span>
    </button>
    <ul v-if="open" role="listbox" class="rush-lang-menu">
      <li
        v-for="l in RUSH_LOCALES"
        :key="l.code"
        role="option"
        tabindex="0"
        :aria-selected="l.code === locale"
        :class="{ active: l.code === locale }"
        @click.stop="pick(l.code)"
        @keydown.enter.prevent="pick(l.code)"
        @keydown.space.prevent="pick(l.code)"
      >
        {{ l.label }}
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted, onUnmounted } from 'vue'
  import { useRushI18n, RUSH_LOCALES } from '~/composables/useRushI18n'

  defineOptions({ name: 'LanguageSelector' })

  const { t, locale, setLocale } = useRushI18n()
  const open = ref(false)

  const currentLabel = computed(
    () => RUSH_LOCALES.find((l) => l.code === locale.value)?.label ?? 'English'
  )

  const toggle = () => {
    open.value = !open.value
  }

  const pick = (code: string) => {
    open.value = false
    void setLocale(code)
  }

  const close = () => {
    open.value = false
  }

  onMounted(() => document.addEventListener('click', close))
  onUnmounted(() => document.removeEventListener('click', close))
</script>

<style scoped>
  .rush-lang {
    position: relative;
    display: flex;
    align-items: center;
    z-index: 60;
  }
  .rush-lang-trigger {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    background: transparent;
    border: none;
    color: #e2e8f0;
    font-size: 0.8rem;
    font-weight: 600;
    cursor: pointer;
    padding: 0.5rem;
    white-space: nowrap;
  }
  .rush-lang-trigger:hover {
    color: #22d3ee;
  }
  .rush-lang-label {
    max-width: 5.5rem;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .rush-lang-menu {
    position: absolute;
    top: 120%;
    right: 0;
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 0.25rem;
    padding: 0.75rem;
    margin: 0;
    list-style: none;
    min-width: 300px;
    background: rgba(4, 7, 18, 0.97);
    border: 1px solid rgba(34, 211, 238, 0.25);
    border-radius: 12px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(12px);
    z-index: 70;
  }
  .rush-lang-menu li {
    padding: 0.5rem;
    font-size: 0.8rem;
    font-weight: 600;
    color: #e2e8f0;
    border-radius: 8px;
    cursor: pointer;
    text-align: center;
    white-space: nowrap;
  }
  .rush-lang-menu li:hover {
    background: rgba(34, 211, 238, 0.1);
    color: #22d3ee;
  }
  .rush-lang-menu li.active {
    background: rgba(34, 211, 238, 0.15);
    color: #22d3ee;
  }
  @media (max-width: 576px) {
    .rush-lang-menu {
      min-width: 260px;
    }
    .rush-lang-label {
      display: none;
    }
  }
</style>
