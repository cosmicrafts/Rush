<template>
  <span class="inline-flex items-center space-x-1">
    <img src="/spiral.svg" :alt="`${formattedAmount} SPIRAL`" class="w-6 h-6" :class="iconClass" />
    <div class="flex items-center gap-1">
      <div class="text-white font-bold text-responsive-md">{{ formattedAmount }}</div>
      <div class="text-gray-500 text-responsive-xs">SPIRAL</div>
    </div>
  </span>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  interface Props {
    amount: string | number
    size?: 'sm' | 'md' | 'lg'
    format?: boolean
  }

  const props = withDefaults(defineProps<Props>(), {
    size: 'md',
    format: true,
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

  // Format SPIRAL amount with K/M notation for large numbers
  const formattedAmount = computed(() => {
    if (!props.format) {
      return props.amount.toString()
    }

    // Convert to string and remove 'SPIRAL' suffix if present
    const amountStr = props.amount.toString().replace(' SPIRAL', '')
    const num = parseFloat(amountStr)

    if (isNaN(num)) return '0'

    // Use K/M notation for numbers >= 1,000
    if (num >= 1000000) {
      return (num / 1000000).toFixed(2) + 'M'
    } else if (num >= 1000) {
      return (num / 1000).toFixed(2) + 'K'
    } else {
      // For smaller numbers, use regular formatting with 2 decimal places
      return num.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    }
  })
</script>
