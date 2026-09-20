// Interruptor de backend: local (navegador) o chain (contratos).
// Por defecto local. Para volver a cadena: NUXT_PUBLIC_RUSH_MODE=chain.
import { useChainWeb3 } from './useWeb3'
import { useLocalBackend } from './useLocalBackend'

export const useWeb3 = () => {
  try {
    const { public: { rushMode } } = useRuntimeConfig()
    if (rushMode === 'chain') return useChainWeb3()
  } catch {
    // Prerender/SSR sin config: local.
  }
  return useLocalBackend()
}
