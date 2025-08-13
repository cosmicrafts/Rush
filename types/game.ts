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
