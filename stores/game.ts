import { defineStore } from 'pinia'
import { reactive, computed } from 'vue'
import { SHIPS_ROSTER } from '../data/ships'

export const useGameStore = defineStore('game', () => {
  // State
  interface GameState {
    isConnected: boolean
    playerAddress: string | null
    currentRace: Array<{
      id: number
      name: string
      color: string
      stats: {
        initialSpeed: number
        acceleration: number
      }
      chaosFactor?: string
      currentSpeed: number
      distance: number
      finalTurn: number
    }>
    raceInProgress: boolean
    bets: Array<{
      shipId: number
      amount: string
      player: string
    }>
    raceLog: string[]
  }

  const state = reactive<GameState>({
    isConnected: false,
    playerAddress: null,
    currentRace: [],
    raceInProgress: false,
    bets: [],
    raceLog: [],
  })

  // Getters
  const isConnected = computed(() => state.isConnected)
  const playerAddress = computed(() => state.playerAddress)
  const raceInProgress = computed(() => state.raceInProgress)
  const currentRace = computed(() => state.currentRace)
  const raceLog = computed(() => state.raceLog)

  // Actions
  function setConnectionStatus(connected: boolean, address?: string) {
    state.isConnected = connected
    state.playerAddress = address || null
  }

  function startNewRace() {
    console.log('🎮 Starting new race with ships:', SHIPS_ROSTER)
    state.currentRace = SHIPS_ROSTER.map(ship => ({
      ...ship,
      currentSpeed: ship.stats.initialSpeed,
      distance: 0,
      finalTurn: -1,
    }))
    console.log('🎮 Race state initialized:', state.currentRace)
    state.raceLog = []
    state.raceInProgress = false
  }

  function addRaceLogEntry(entry: string) {
    state.raceLog.push(entry)
  }

  function clearLog() {
    state.raceLog = []
  }

  function setRaceInProgress(inProgress: boolean) {
    state.raceInProgress = inProgress
  }

  return {
    // State
    state,

    // Getters
    isConnected,
    playerAddress,
    raceInProgress,
    currentRace,
    raceLog,

    // Actions
    setConnectionStatus,
    startNewRace,
    addRaceLogEntry,
    clearLog,
    setRaceInProgress,
  }
})
