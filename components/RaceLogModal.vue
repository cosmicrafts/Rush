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
      <div class="bg-gray-900 border border-cyan-500/30 rounded-lg p-4 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
        <div class="flex justify-between items-center mb-3">
          <h2 class="text-lg font-bold text-cyan-400">📊 Race Log</h2>
          <button 
            @click="$emit('close')" 
            class="text-gray-400 hover:text-white text-xl"
          >
            ×
          </button>
        </div>
        
        <div class="bg-gray-800 rounded border border-gray-700 p-3 font-mono text-xs">
          <div v-for="(entry, index) in reversedRaceLog" :key="index" 
               class="mb-1 leading-relaxed"
               :class="getLogEntryClass(entry)"
               v-html="formatLogEntry(entry)">
          </div>
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

// Format log entry for better display
const formatLogEntry = (entry: string) => {
  // Remove HTML tags for processing, then re-add them
  const cleanEntry = entry.replace(/<[^>]*>/g, '')
  
  // Add timestamp-like formatting for turn headers
  if (cleanEntry.includes('Turn') && (cleanEntry.includes('🔄') || cleanEntry.includes('✅'))) {
    return entry.replace(/<span[^>]*>/, '<span class="text-cyan-300 font-bold">')
  }
  
  // Format chaos events
  if (cleanEntry.includes('CHAOS:')) {
    return entry.replace(/<span[^>]*>/, '<span class="text-purple-300 font-semibold">')
  }
  
  // Format ship movements (remove color styling, use consistent format)
  if (cleanEntry.includes('moved') && cleanEntry.includes('units')) {
    return entry.replace(/<span[^>]*style="[^"]*"[^>]*>/, '<span class="text-gray-300">')
  }
  
  return entry
}

// Get CSS class for log entry
const getLogEntryClass = (entry: string) => {
  const cleanEntry = entry.replace(/<[^>]*>/g, '')
  
  if (cleanEntry.includes('Turn') && cleanEntry.includes('🔄')) {
    return 'text-cyan-300 font-bold border-b border-gray-600 pb-1 mb-2'
  }
  
  if (cleanEntry.includes('Turn') && cleanEntry.includes('✅')) {
    return 'text-green-400 font-bold border-b border-gray-600 pb-1 mb-2'
  }
  
  if (cleanEntry.includes('CHAOS:')) {
    return 'text-purple-300 font-semibold ml-2'
  }
  
  if (cleanEntry.includes('moved') && cleanEntry.includes('units')) {
    return 'text-gray-300 ml-4'
  }
  
  if (cleanEntry.includes('YOU WON!') || cleanEntry.includes('🎉')) {
    return 'text-green-400 font-bold'
  }
  
  if (cleanEntry.includes('YOUR RESULT:')) {
    return 'text-yellow-400 font-bold'
  }
  
  return 'text-gray-400'
}
</script>
