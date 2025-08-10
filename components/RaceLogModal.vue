<template>
  <Transition
    enter-active-class="transition-all duration-300 ease-out"
    enter-from-class="opacity-0 scale-95"
    enter-to-class="opacity-100 scale-100"
    leave-active-class="transition-all duration-200 ease-in"
    leave-from-class="opacity-100 scale-100"
    leave-to-class="opacity-0 scale-95"
  >
    <div
      v-if="show"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
      @click.self="$emit('close')"
    >
      <div class="bg-gray-900 border border-cyan-500/30 rounded-lg p-4 max-w-4xl w-full mx-4 max-h-[80vh] overflow-y-auto">
        <div class="flex justify-between items-center mb-3">
          <h2 class="text-lg font-bold text-cyan-400">📊 Race Log</h2>
          <button 
            @click="$emit('close')" 
            class="text-gray-400 hover:text-white text-xl"
          >
            ×
          </button>
        </div>
        
        <div class="space-y-2">
          <div v-for="(entry, index) in reversedRaceLog" :key="index" v-html="entry" class="text-xs text-gray-400"></div>
        </div>
        
        <div class="flex justify-center mt-4">
          <button 
            @click="$emit('close')" 
            class="bg-gray-700 hover:bg-gray-600 text-white px-4 py-1 rounded text-sm transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { computed } from 'vue'

// Props
interface Props {
  show: boolean
  raceLog: string[]
}

const props = defineProps<Props>()

// Emits
const emit = defineEmits<{
  close: []
}>()

// Reverse the race log to show most recent first
const reversedRaceLog = computed(() => {
  return [...props.raceLog].reverse()
})
</script>
