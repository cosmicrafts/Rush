<template>
  <span class="inline-flex items-center space-x-1">
    <img src="/spiral.svg" :alt="`${amount} SPIRAL`" class="w-6 h-6" :class="iconClass" />
    <div class="flex items-center gap-1">
      <div class="text-white font-bold text-responsive-md">{{ amount }}</div>
      <div class="text-gray-500 text-responsive-xs">SPIRAL</div>
    </div>
  </span>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  interface Props {
    amount: string | number
    size?: 'sm' | 'md' | 'lg'
  }

  const props = withDefaults(defineProps<Props>(), {
    size: 'md',
  })

  const iconClass = computed(() => {
    const sizeClasses = {
      sm: 'w-4 h-4',
      md: 'w-5 h-5',
      lg: 'w-6 h-6',
      xl: 'w-7 h-7',
    }
    return sizeClasses[props.size]
  })
</script>
