// Funnel state machine: hero -> silent provisioning -> tutorial -> discovery tour.
// Persisted in localStorage so returning players skip straight to the track.
export type FunnelPhase = 'checking' | 'hero' | 'provisioning' | 'ready'
export type TutorialState = 'pending' | 'done' | 'skipped'

export interface FunnelStore {
  seenHero: boolean
  tutorial: TutorialState
  tourSeen: boolean
  tourDone: Record<string, boolean>
  racesPlayed: number
}

const STORAGE_KEY = 'rush-funnel-v1'

const defaultStore = (): FunnelStore => ({
  seenHero: false,
  tutorial: 'pending',
  tourSeen: false,
  tourDone: {},
  racesPlayed: 0,
})

const loadStore = (): FunnelStore => {
  if (typeof window === 'undefined') return defaultStore()
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return defaultStore()
    return { ...defaultStore(), ...JSON.parse(raw) }
  } catch {
    return defaultStore()
  }
}

export const useFunnel = () => {
  const store = useState<FunnelStore>('rush-funnel', loadStore)
  const phase = useState<FunnelPhase>('rush-funnel-phase', () => 'checking')
  // null = tutorial hidden; 0/1/2 = coach-mark step
  const tutorialStep = useState<number | null>('rush-funnel-tutorial-step', () => null)
  const showTour = useState<boolean>('rush-funnel-show-tour', () => false)
  const showSave = useState<boolean>('rush-funnel-show-save', () => false)
  // Lightweight funnel analytics (local only): ordered event log, capped.
  const track = (event: string) => {
    try {
      const key = 'rush-funnel-events'
      const raw = window.localStorage.getItem(key)
      const arr: Array<{ e: string; at: number }> = raw ? JSON.parse(raw) : []
      arr.push({ e: event, at: Date.now() })
      window.localStorage.setItem(key, JSON.stringify(arr.slice(-200)))
    } catch {
      /* analytics never blocks play */
    }
  }

  const persist = () => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store.value))
    } catch {
      /* private mode: funnel still works in memory */
    }
  }

  // Called once auto-reconnect resolves: returning players skip the hero.
  const resolveEntry = (hasSession: boolean) => {
    if (hasSession) {
      store.value.seenHero = true
      persist()
      phase.value = 'ready'
      track('entry_returning')
    } else if (!store.value.seenHero) {
      phase.value = 'hero'
      track('entry_new')
    } else {
      phase.value = 'hero'
      track('entry_logged_out')
    }
  }

  const startPlaying = () => {
    store.value.seenHero = true
    persist()
    phase.value = 'provisioning'
    track('hero_cta')
  }

  const provisioningDone = () => {
    phase.value = 'ready'
    track('provisioned')
    if (store.value.tutorial === 'pending') {
      tutorialStep.value = 0
      track('tutorial_start')
    }
  }

  const nextTutorialStep = () => {
    if (tutorialStep.value === null) return
    if (tutorialStep.value >= 2) {
      store.value.tutorial = 'done'
      persist()
      tutorialStep.value = null
      track('tutorial_done')
    } else {
      tutorialStep.value += 1
      track(`tutorial_step_${tutorialStep.value}`)
    }
  }

  const skipTutorial = () => {
    store.value.tutorial = 'skipped'
    persist()
    tutorialStep.value = null
    track('tutorial_skip')
  }

  // Racing is the real graduation: close the tutorial however it ends.
  const completeTutorial = () => {
    if (store.value.tutorial === 'pending') {
      store.value.tutorial = 'done'
      persist()
    }
    tutorialStep.value = null
    track('tutorial_raced')
  }

  const recordRace = () => {
    store.value.racesPlayed += 1
    persist()
    track('race_completed')
    if (store.value.racesPlayed === 1 && !store.value.tourSeen) {
      showTour.value = true
    }
  }

  const closeTour = () => {
    store.value.tourSeen = true
    persist()
    showTour.value = false
    track('tour_close')
  }

  const openTour = () => {
    showTour.value = true
    track('tour_open')
  }

  const markTourItem = (id: string) => {
    store.value.tourDone[id] = true
    persist()
    track(`tour_${id}`)
  }

  return {
    store,
    phase,
    tutorialStep,
    showTour,
    showSave,
    track,
    resolveEntry,
    startPlaying,
    provisioningDone,
    nextTutorialStep,
    skipTutorial,
    completeTutorial,
    recordRace,
    closeTour,
    openTour,
    markTourItem,
  }
}
