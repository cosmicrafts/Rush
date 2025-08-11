<template>
  <Transition
    enter-active-class="duration-500 ease-out"
    enter-from-class="transform scale-95 opacity-0"
    enter-to-class="transform scale-100 opacity-100"
    leave-active-class="duration-300 ease-in"
    leave-from-class="transform scale-100 opacity-100"
    leave-to-class="transform scale-95 opacity-0"
  >
    <div
      v-if="show"
      class="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 backdrop-blur-lg px-4"
      @click.self="acceptDisclaimer"
    >
      <!-- Enhanced animated background particles with COSMIC RUSH theme -->
      <div class="absolute inset-0 overflow-hidden">
        <div class="absolute top-1/4 left-1/4 w-3 h-3 bg-cyan-400 rounded-full animate-pulse opacity-60 blur-sm shadow-lg shadow-cyan-400/50"></div>
        <div class="absolute top-3/4 right-1/4 w-2 h-2 bg-pink-500 rounded-full animate-ping opacity-50 shadow-lg shadow-pink-500/50"></div>
        <div class="absolute bottom-1/4 left-1/3 w-2 h-2 bg-cyan-400 rounded-full animate-bounce opacity-60 shadow-lg shadow-cyan-400/50"></div>
        <div class="absolute top-1/2 right-1/3 w-1 h-1 bg-pink-500 rounded-full animate-pulse opacity-40 shadow-lg shadow-pink-500/50"></div>
        <div class="absolute bottom-1/3 right-1/4 w-1.5 h-1.5 bg-cyan-400 rounded-full animate-ping opacity-30 shadow-lg shadow-cyan-400/50"></div>
        
        <!-- Circuit board lines -->
        <div class="absolute top-1/4 left-0 w-32 h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-30"></div>
        <div class="absolute bottom-1/4 right-0 w-32 h-px bg-gradient-to-l from-transparent via-pink-500 to-transparent opacity-30"></div>
        <div class="absolute top-0 left-1/3 w-px h-32 bg-gradient-to-b from-transparent via-cyan-400 to-transparent opacity-30"></div>
        <div class="absolute bottom-0 right-1/3 w-px h-32 bg-gradient-to-t from-transparent via-pink-500 to-transparent opacity-30"></div>
        
        <!-- Scattered plus signs -->
        <div class="absolute top-1/3 left-1/6 text-pink-500 text-xs animate-pulse">+</div>
        <div class="absolute bottom-1/3 right-1/6 text-cyan-400 text-xs animate-ping">+</div>
        <div class="absolute top-2/3 left-2/3 text-pink-500 text-xs animate-bounce">+</div>
      </div>

      <div class="relative w-full max-w-lg mx-auto bg-gradient-to-tr from-gray-900 via-black to-gray-900 shadow-2xl border border-cyan-500/30 overflow-hidden backdrop-blur-sm">
        <!-- Enhanced glowing border effect with COSMIC RUSH colors -->
        <div class="absolute inset-0 bg-gradient-to-r from-cyan-500/20 via-pink-500/20 to-cyan-500/20 blur-2xl"></div>
        
        <!-- Header with COSMIC RUSH theme -->
        <div class="relative p-6 text-center border-b border-cyan-500/20">
          <div class="flex flex-col items-center space-y-3">
            <img src="/cosmicrush.webp" alt="Cosmicrafts Rush Logo" class="w-32 h-32 object-contain" />
            <h2 class="text-2xl font-extrabold bg-gradient-to-r from-cyan-400 to-pink-500 bg-clip-text text-transparent tracking-tight">
              Welcome to RUSH!
            </h2>
            <p class="text-sm text-gray-400">🚀 Spaceship Racing Game</p>
          </div>
        </div>

        <!-- Content -->
        <div class="relative p-6 space-y-6">
          <!-- Welcome Content -->
          <div class="text-center space-y-4">
            <div class="flex items-center justify-center space-x-2 mb-3">
              <div class="w-6 h-6 bg-gradient-to-r from-cyan-400 to-pink-500 rounded-sm flex items-center justify-center">
                <span class="text-white text-sm font-bold">🏆</span>
              </div>
              <span class="text-cyan-400 font-semibold text-sm">Somnia v1 Mini-Games Hackathon</span>
            </div>
            
            <div class="space-y-3 text-sm text-gray-300 leading-relaxed">
              <p class="text-gray-400">
                Built for the first Somnia Testnet hackathon in partnership with <span class="text-pink-400 font-semibold">DoraHacks</span>. 
                Experience high-stakes spaceship racing with blockchain-powered chaos factors!
              </p>
              
              <div class="flex items-center justify-center space-x-2 p-3 bg-amber-900/20 border border-amber-500/30 rounded-lg">
                <span class="text-amber-400 text-lg">⚠️</span>
                <span class="text-amber-300 text-xs font-semibold">Demo Version - Testnet Environment</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer with COSMIC RUSH themed button -->
        <div class="relative bg-gradient-to-t from-black/50 to-transparent p-6 border-t border-cyan-500/20">
          <div class="flex justify-center">
            <button 
              @click="acceptDisclaimer"
              class="w-full bg-gradient-to-r from-cyan-400 to-pink-500 hover:from-cyan-500 hover:to-pink-600 text-white font-bold py-4 px-8 rounded-sm shadow-lg shadow-cyan-400/25 transition-all duration-200 transform hover:scale-105"
            >
              <span class="flex items-center justify-center space-x-2">
                <span>🚀</span>
                <span>Let's RUSH!</span>
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';

const show = ref(false);

// Mark disclaimer as accepted
const acceptDisclaimer = () => {
  show.value = false;
  // Store in localStorage to remember user accepted
  localStorage.setItem('cosmicrush-disclaimer-accepted', 'true');
};

// Show disclaimer on mount if not previously accepted
onMounted(() => {
  const hasAccepted = localStorage.getItem('cosmicrush-disclaimer-accepted');
  if (!hasAccepted) {
    show.value = true;
  }
});

defineExpose({ 
  open: () => { 
    show.value = true; 
  }, 
  close: () => { 
    show.value = false; 
  } 
});
</script>

<style scoped>
@keyframes gradient {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

.animate-gradient {
  background-size: 200% 200%;
  animation: gradient 3s ease infinite;
}

.bg-size-200 {
  background-size: 200% 200%;
}
</style>
