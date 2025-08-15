import { ref } from 'vue'
import { SHIPS_ROSTER } from './useShips'

// ==================== TYPES ====================

export interface Ship {
  id: number
  name: string
  color: string
  stats: {
    initialSpeed: number
    acceleration: number
  }
  chaosFactor?: string
}

export interface RaceResult {
  raceResult: {
    winner: number
    placements: number[]
    turnEvents: Array<{
      turn: number
      shipId: number
      moveAmount: number
      distance: number
      chaosEventType: number
      targetShipId: number
    }>
    totalEvents: number
  }
  playerShip: number
  betAmount: string
  actualPayout: string
  jackpotTier: number
  jackpotAmount: string
}

export interface RaceState {
  id: number
  name: string
  color: string
  distance: number
  currentSpeed: number
  finalTurn: number
  stats: {
    initialSpeed: number
    acceleration: number
  }
  chaosFactor?: string
}

export interface BettingData {
  selectedShip: Ship | null
  betAmount: string
}

// ==================== GAME STATE ====================

// Global state to ensure all components use the same instance
let globalGameInstance: ReturnType<typeof createGameComposable> | null = null

const createGameComposable = () => {
  // State
  const isConnected = ref(false)
  const playerAddress = ref<string | null>(null)
  const currentRace = ref<RaceState[]>([])
  const raceInProgress = ref(false)
  const bets = ref<
    Array<{
      shipId: number
      amount: string
      player: string
    }>
  >([])
  const raceLog = ref<string[]>([])

  // Actions
  function setConnectionStatus(connected: boolean, address?: string) {
    isConnected.value = connected
    playerAddress.value = address || null
  }

  function startNewRace() {
    console.log('🎮 Starting new race with ships:', SHIPS_ROSTER)
    currentRace.value = SHIPS_ROSTER.map(ship => ({
      ...ship,
      currentSpeed: ship.stats.initialSpeed,
      distance: 0,
      finalTurn: -1,
    }))
    console.log('🎮 Race state initialized:', currentRace.value)
    raceLog.value = []
    raceInProgress.value = false
  }

  function addRaceLogEntry(entry: string) {
    raceLog.value.push(entry)
  }

  function clearLog() {
    raceLog.value = []
  }

  function setRaceInProgress(inProgress: boolean) {
    raceInProgress.value = inProgress
  }

  return {
    // State
    isConnected,
    playerAddress,
    currentRace,
    raceInProgress,
    bets,
    raceLog,

    // Actions
    setConnectionStatus,
    startNewRace,
    addRaceLogEntry,
    clearLog,
    setRaceInProgress,
  }
}

// Export the singleton function
export const useGame = () => {
  if (!globalGameInstance) {
    globalGameInstance = createGameComposable()
  }
  return globalGameInstance
}
