import { defineStore } from 'pinia'
import { reactive, computed, watch } from 'vue'
import type { GameState, RaceState, Bet } from '../types/game'
import { SHIPS_ROSTER } from '../data/ships'

export const useGameStore = defineStore('game', () => {
  // State
  const state = reactive<GameState>({
    isConnected: false,
    playerAddress: null,
    currentRace: [],
    raceInProgress: false,
    bets: [],
    raceLog: []
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
    state.currentRace = SHIPS_ROSTER.map(ship => ({
      ...ship,
      currentSpeed: ship.stats.initialSpeed,
      distance: 0,
      finalTurn: -1
    }))
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
    setRaceInProgress
  }
}) 