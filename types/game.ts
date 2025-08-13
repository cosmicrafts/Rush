export interface Ship {
  id: number
  name: string
  color: string
  stats: {
    initialSpeed: number
    acceleration: number
  }
  chaosFactor: string
}

export interface RaceState {
  id: number
  name: string
  color: string
  stats: {
    initialSpeed: number
    acceleration: number
  }
  chaosFactor: string
  currentSpeed: number
  distance: number
  finalTurn: number
}

export interface ChaosEvent {
  type: string
  text: string
  targetId?: number
}

export interface RaceEvent {
  turn: number
  shipId: number
  moveAmount: number
  distance: number
  event?: ChaosEvent
}

export interface RaceResult {
  winner: RaceState
  replayLog: RaceEvent[]
}

export interface ContractRaceResult {
  winner: number
  placements: number[]
  turnEvents: ContractTurnEvent[]
  totalEvents: number
}

export interface ContractTurnEvent {
  turn: number
  shipId: number
  moveAmount: number
  distance: number
  chaosEventType: number
  targetShipId: number
}

export interface Bet {
  shipId: number
  amount: string
  playerAddress: string
}

export interface GameState {
  isConnected: boolean
  playerAddress: string | null
  currentRace: RaceState[]
  raceInProgress: boolean
  bets: Bet[]
  raceLog: string[]
}
