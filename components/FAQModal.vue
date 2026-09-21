<template>
  <div
    v-if="show"
    class="modal-overlay"
    @click.self="closeFAQ"
  >
    <div class="modal-container faq-modal-container">
      <!-- Modal Header -->
      <div class="modal-header">
        <div class="layout-flex-between items-center">
          <div class="layout-flex-center space-responsive-xs">
            <h2>{{ t('faq.title') }}</h2>
          </div>
          <button
            class="btn btn-ghost btn-sm"
            @click="closeFAQ"
          >
            <Icon name="solar:close-circle-bold" class="w-6 h-6" />
          </button>
        </div>
        <div class="separator-line"></div>
      </div>

      <!-- Modal Content -->
      <div class="modal-content faq-content">
        <section
          v-for="section in sections"
          :key="section.title"
          class="faq-section"
        >
          <h3>{{ t(section.title) }}</h3>
          <div
            v-for="item in section.items"
            :key="item[0]"
            class="faq-item"
          >
            <p><strong>{{ t(item[0]) }}</strong><br>
            {{ t(item[1]) }}</p>
          </div>
        </section>

        <!-- General -->
        <section class="faq-section">
          <h3>{{ t('faq.general_title') }}</h3>
          <div class="faq-item">
            <ul class="faq-keywords">
              <li>web3 betting racing game free</li>
              <li>crypto betting platform</li>
              <li>zed run alternative</li>
              <li>best web3 games 2025</li>
              <li>virtual horse racing game</li>
              <li>web3 games play-to-earn</li>
              <li>best web3 casinos</li>
              <li>crypto betting app</li>
            </ul>
            <p>{{ t('faq.general_note') }}</p>
          </div>
        </section>
      </div>

      <!-- Modal Footer -->
      <div class="modal-footer">
        <div class="layout-flex-center">
          <button
            class="btn btn-primary btn-sm"
            @click="closeFAQ"
          >
            <div class="layout-flex-center gap-2">
              <Icon name="solar:rocket-bold" class="w-5 h-5" />
              <span>{{ t('faq.ready') }}</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted } from 'vue'
  import { useRushI18n } from '~/composables/useRushI18n'

  const { t } = useRushI18n()

  interface Props {
    showOnStart?: boolean
  }

  const props = withDefaults(defineProps<Props>(), {
    showOnStart: false,
  })

  const show = ref(false)

  const sections: Array<{ title: string; items: Array<[string, string]> }> = [
    {
      title: 'faq.about_title',
      items: [
        ['faq.about_q1', 'faq.about_a1'],
        ['faq.about_q2', 'faq.about_a2'],
        ['faq.about_q3', 'faq.about_a3'],
        ['faq.about_q4', 'faq.about_a4'],
      ],
    },
    {
      title: 'faq.betting_title',
      items: [
        ['faq.betting_q1', 'faq.betting_a1'],
        ['faq.betting_q2', 'faq.betting_a2'],
        ['faq.betting_q3', 'faq.betting_a3'],
      ],
    },
    {
      title: 'faq.ai_title',
      items: [
        ['faq.ai_q1', 'faq.ai_a1'],
        ['faq.ai_q2', 'faq.ai_a2'],
        ['faq.ai_q3', 'faq.ai_a3'],
      ],
    },
    {
      title: 'faq.start_title',
      items: [
        ['faq.start_q1', 'faq.start_a1'],
        ['faq.start_q2', 'faq.start_a2'],
        ['faq.start_q3', 'faq.start_a3'],
      ],
    },
    {
      title: 'faq.trust_title',
      items: [
        ['faq.trust_q1', 'faq.trust_a1'],
        ['faq.trust_q2', 'faq.trust_a2'],
        ['faq.trust_q3', 'faq.trust_a3'],
        ['faq.trust_q4', 'faq.trust_a4'],
        ['faq.trust_q5', 'faq.trust_a5'],
        ['faq.trust_q6', 'faq.trust_a6'],
        ['faq.trust_q7', 'faq.trust_a7'],
        ['faq.trust_q8', 'faq.trust_a8'],
      ],
    },
  ]

  // Close FAQ modal
  const closeFAQ = () => {
    show.value = false
    // Store in localStorage to remember user has seen FAQ
    localStorage.setItem('cosmicrush-faq-seen', 'true')
  }

  // Show FAQ on mount if configured to show on start
  onMounted(() => {
    if (props.showOnStart) {
      const hasSeenFAQ = localStorage.getItem('cosmicrush-faq-seen')
      show.value = !hasSeenFAQ
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

<style scoped>
  .faq-modal-container {
    max-width: 90vw;
    max-height: 90vh;
    width: 800px;
  }

  .faq-content {
    max-height: 60vh;
    overflow-y: auto;
    padding: 1.5rem;
  }

  .faq-section {
    margin-bottom: 2rem;
  }

  .faq-section h3 {
    color: var(--cosmic-sky);
    font-size: 1.25rem;
    font-weight: 700;
    margin-bottom: 1rem;
    border-bottom: 1px solid var(--cosmic-sky);
    padding-bottom: 0.5rem;
  }

  .faq-item {
    margin-bottom: 1.5rem;
    padding: 1rem;
    background: rgba(15, 185, 253, 0.05);
    border-radius: 0.5rem;
    border-left: 3px solid var(--cosmic-sky);
  }

  .faq-item p {
    color: var(--text-color);
    line-height: 1.6;
    margin: 0;
  }

  .faq-item strong {
    color: var(--cosmic-pink);
    font-weight: 600;
  }

  .faq-keywords {
    list-style: none;
    padding: 0;
    margin: 1rem 0;
  }

  .faq-keywords li {
    color: var(--cosmic-sky);
    font-weight: 500;
    margin-bottom: 0.5rem;
    padding: 0.5rem;
    background: rgba(15, 185, 253, 0.1);
    border-radius: 0.25rem;
    border-left: 2px solid var(--cosmic-sky);
  }

  /* Responsive adjustments */
  @media (max-width: 768px) {
    .faq-modal-container {
      max-width: 95vw;
      width: 95vw;
    }

    .faq-content {
      max-height: 70vh;
      padding: 1rem;
    }

    .faq-section h3 {
      font-size: 1.1rem;
    }

    .faq-item {
      padding: 0.75rem;
    }
  }
</style>
