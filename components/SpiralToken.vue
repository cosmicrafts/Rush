<template>
  <span class="inline-flex items-center space-x-1">
    <img 
      src="/spiral.svg" 
      :alt="`${amount} SPIRAL`"
      class="w-4 h-4"
      :class="iconClass"
    />
    <span :class="textClass">
      {{ amount }} SPIRAL
    </span>
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'
interface Props {
  amount: string | number
  size?: 'sm' | 'md' | 'lg'
  color?: 'default' | 'green' | 'red' | 'yellow' | 'cyan' | 'purple' | 'amber'
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  color: 'default'
})

const iconClass = computed(() => {
  const sizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  }
  return sizeClasses[props.size]
})

const textClass = computed(() => {
  const colorClasses = {
    default: 'text-white',
    green: 'text-green-400',
    red: 'text-red-400',
    yellow: 'text-yellow-400',
    cyan: 'text-cyan-400',
    purple: 'text-purple-400',
    amber: 'text-amber-400'
  }
  return colorClasses[props.color]
})
</script>
