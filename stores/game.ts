import { defineStore } from 'pinia'
import { reactive, computed } from 'vue'
import type { GameState, RaceState, RaceEvent, Bet } from '../types/game'
import { SHIPS_ROSTER, RACE_TURNS, TRACK_DISTANCE } from '../data/ships'

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
        switch (ship.chaosFactor) {
          case 'Overdrive':
            if (chance < 10) { 
              turnSpeed *= 2; 
              chaosEvent = { type: 'OVERDRIVE', text: 'x2 Speed!' }; 
            }
            break
          case 'Unstable Engine':
            if (chance < 20) { 
              turnAcceleration *= 3; 
              chaosEvent = { type: 'UNSTABLE', text: 'x3 Accel!' }; 
            }
            break
          case 'Slipstreamer':
            const rank = currentRanks.indexOf(ship.id)
            if (rank > 1 && chance < 30) { 
              turnSpeed += 50; 
              chaosEvent = { type: 'SLIPSTREAM', text: '+50 Speed!' }; 
            }
            break
          case 'Quantum Tunneling':
            if (chance < 2) { 
              ship.distance += TRACK_DISTANCE * 0.25; 
              chaosEvent = { type: 'TELEPORT', text: 'TELEPORT!' }; 
            }
            break
          case 'Last Stand Protocol':
            if (turn >= RACE_TURNS - 2) { 
              turnAcceleration *= 4; 
            }
            break
          case 'Micro-warp Engine':
            turnAcceleration *= 2
            break
          case 'Rogue AI':
            if (chance < 15) {
              const effect = Math.floor(Math.random() * 4)
              if (effect === 0) { 
                turnSpeed *= 2; 
                chaosEvent = { type: 'ROGUE', text: 'AI: x2 Speed!' }; 
              }
              else if (effect === 1) { 
                turnSpeed *= 0.5; 
                chaosEvent = { type: 'ROGUE', text: 'AI: /2 Speed!' }; 
              }
              else if (effect === 2) { 
                turnAcceleration *= 2; 
                chaosEvent = { type: 'ROGUE', text: 'AI: x2 Accel!' }; 
              }
              else { 
                turnAcceleration = 0; 
                chaosEvent = { type: 'ROGUE', text: 'AI: Accel=0!' }; 
              }
            }
            break
          case 'Graviton Brake':
            const rankBrake = currentRanks.indexOf(ship.id)
            if (rankBrake === 0 && chance < 25) {
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
    const winner = (finishedShips.length > 0 ? finishedShips[0] : unfinishedShips[0])

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