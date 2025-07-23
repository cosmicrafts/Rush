import { defineStore } from 'pinia'
import { reactive, computed } from 'vue'
import type { GameState, RaceState, RaceEvent, Bet } from '../types/game'
import { SHIPS_ROSTER, RACE_TURNS, TRACK_DISTANCE, CHAOS_FACTORS } from '../data/ships'

export const useGameStore = defineStore('game', () => {
  // State
  const state = reactive<GameState>({
    isConnected: false,
    playerAddress: null,
    currentRace: [],
    raceInProgress: false,
    bets: [],
    raceLog: [],
    bulkResults: {}
  })

  // Getters
  const isConnected = computed(() => state.isConnected)
  const playerAddress = computed(() => state.playerAddress)
  const raceInProgress = computed(() => state.raceInProgress)
  const currentRace = computed(() => state.currentRace)
  const raceLog = computed(() => state.raceLog)
  const bulkResults = computed(() => state.bulkResults)

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

  function runRaceSimulation(): { winner: RaceState; replayLog: RaceEvent[] } {
    const raceState = SHIPS_ROSTER.map(ship => ({
      ...ship,
      currentSpeed: ship.stats.initialSpeed,
      distance: 0,
      finalTurn: -1
    }))

    const replayLog: RaceEvent[] = []

    for (let turn = 1; turn <= RACE_TURNS; turn++) {
      raceState.sort((a, b) => b.distance - a.distance)
      const currentRanks = raceState.map(s => s.id)

      for (const ship of raceState) {
        if (ship.finalTurn !== -1) continue

        let turnAcceleration = ship.stats.acceleration
        let turnSpeed = ship.currentSpeed
        let chaosEvent: any = null

        const chance = Math.random() * 100
        const chaosFactor = CHAOS_FACTORS[ship.chaosFactor as keyof typeof CHAOS_FACTORS]
        
        if (chaosFactor && chance < chaosFactor.chance) {
          switch (ship.chaosFactor) {
            case 'Overdrive':
              turnSpeed *= 2; 
              chaosEvent = { type: 'OVERDRIVE', text: 'effect' in chaosFactor ? chaosFactor.effect : 'x2 Speed!' }; 
              break
            case 'Unstable Engine':
              turnAcceleration *= 3; 
              chaosEvent = { type: 'UNSTABLE', text: 'effect' in chaosFactor ? chaosFactor.effect : 'x3 Accel!' }; 
              break
            case 'Slipstreamer':
              const rank = currentRanks.indexOf(ship.id)
              if (rank > 1) { 
                turnSpeed += 50; 
                chaosEvent = { type: 'SLIPSTREAM', text: 'effect' in chaosFactor ? chaosFactor.effect : '+50 Speed!' }; 
              }
              break
            case 'Quantum Tunneling':
              ship.distance += TRACK_DISTANCE * 0.25; 
              chaosEvent = { type: 'TELEPORT', text: 'effect' in chaosFactor ? chaosFactor.effect : 'TELEPORT!' }; 
              break
            case 'Last Stand Protocol':
              if (turn >= RACE_TURNS - 3) { 
                turnSpeed *= 4; 
                chaosEvent = { type: 'LAST_STAND', text: 'effect' in chaosFactor ? chaosFactor.effect : 'Last Stand!' }; 
              }
              break
            case 'Micro-warp Engine':
              turnAcceleration *= 2; 
              chaosEvent = { type: 'WARP', text: 'effect' in chaosFactor ? chaosFactor.effect : 'Warp Speed!' }; 
              break
            case 'Rogue AI':
              const effect = Math.floor(Math.random() * 4)
              const effects = 'effects' in chaosFactor ? chaosFactor.effects : ['AI: x2 Speed!', 'AI: /2 Speed!', 'AI: x2 Accel!', 'AI: Accel=0!']
              if (effect === 0) { 
                turnSpeed *= 2; 
                chaosEvent = { type: 'ROGUE', text: effects[0] }; 
              }
              else if (effect === 1) { 
                turnSpeed *= 0.5; 
                chaosEvent = { type: 'ROGUE', text: effects[1] }; 
              }
              else if (effect === 2) { 
                turnAcceleration *= 2; 
                chaosEvent = { type: 'ROGUE', text: effects[2] }; 
              }
              else { 
                turnAcceleration = 0; 
                chaosEvent = { type: 'ROGUE', text: effects[3] }; 
              }
              break
            case 'Graviton Brake':
              const rankBrake = currentRanks.indexOf(ship.id)
              if (rankBrake === 0) {
                const targetShip = raceState.find(s => s.id === currentRanks[1])
                if (targetShip) { 
                  chaosEvent = { 
                    type: 'GRAV_BRAKE', 
                    text: `Braked ${targetShip.name}!`, 
                    targetId: targetShip.id 
                  }; 
                }
              }
              break
          }
        }
        
        ship.currentSpeed += turnAcceleration
        let moveAmount = turnSpeed
        const brakeEvent = replayLog.find(e => 
          e.turn === turn && 
          e.event?.type === 'GRAV_BRAKE' && 
          e.event.targetId === ship.id
        )
        if (brakeEvent) { 
          moveAmount *= 0.5; 
          chaosEvent = { type: 'BRAKED', text: 'Braked!' }; 
        }
        ship.distance += moveAmount

        if (ship.distance >= TRACK_DISTANCE && ship.finalTurn === -1) {
          ship.distance = TRACK_DISTANCE
          ship.finalTurn = turn
        }
        
        replayLog.push({ 
          turn, 
          shipId: ship.id, 
          moveAmount, 
          distance: ship.distance, 
          event: chaosEvent 
        })
      }
    }
    
    const finishedShips = raceState
      .filter(s => s.finalTurn !== -1)
      .sort((a, b) => a.finalTurn - b.finalTurn)
    const unfinishedShips = raceState
      .filter(s => s.finalTurn === -1)
      .sort((a, b) => b.distance - a.distance)
    
    // Since we have 8 ships, at least one will always be in unfinishedShips
    // if no ships finished the race
    const winner = (finishedShips.length > 0 ? finishedShips[0] : unfinishedShips[0]) as RaceState
    
    return { winner, replayLog }
  }

  function runBulkSimulations() {
    const wins: { [key: number]: number } = {}
    SHIPS_ROSTER.forEach(ship => wins[ship.id] = 0)

    for (let i = 0; i < 1000; i++) {
      const result = runRaceSimulation()
      if (result.winner) {
        wins[result.winner.id]++
      }
    }

    state.bulkResults = wins
  }

  function addRaceLogEntry(entry: string) {
    state.raceLog.push(entry)
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
    bulkResults,
    
    // Actions
    setConnectionStatus,
    startNewRace,
    runRaceSimulation,
    runBulkSimulations,
    addRaceLogEntry,
    setRaceInProgress
  }
}) 