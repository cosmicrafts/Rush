import type { Ship } from '~/types/game'

// Chaos Factor Definitions - All values and descriptions in one place for easy balancing
export const CHAOS_FACTORS = {
  'Overdrive': {
    description: '10% chance to double speed for one turn',
    chance: 10,
    effect: 'x2 Speed!'
  },
  'Unstable Engine': {
    description: '35% chance to triple acceleration for one turn',
    chance: 35,
    effect: 'x3 Accel!'
  },
  'Slipstreamer': {
    description: '40% chance to gain +50 speed when trailing (not in 1st or 2nd place)',
    chance: 40,
    effect: '+50 Speed!'
  },
  'Quantum Tunneling': {
    description: '40% chance to teleport 25% of track distance',
    chance: 40,
    effect: 'TELEPORT!'
  },
  'Last Stand Protocol': {
    description: '10% chance to quadruple speed in final 4 turns of the race',
    chance: 10,
    effect: 'Last Stand!'
  },
  'Micro-warp Engine': {
    description: '55% chance to double acceleration for one turn',
    chance: 55,
    effect: 'Warp Speed!'
  },
  'Rogue AI': {
    description: '20% chance for random effect: x2 speed, /2 speed, x2 accel, or 0 accel',
    chance: 20,
    effects: ['AI: x2 Speed!', 'AI: /2 Speed!', 'AI: x2 Accel!', 'AI: Accel=0!']
  },
  'Graviton Brake': {
    description: '77% chance to slow 2nd place ship by 50% when in 1st place',
    chance: 77,
    effect: 'Braked!'
  }
}

export const SHIPS_ROSTER: Ship[] = [
  // ID 0 - The Comet - Overdrive
  { 
    id: 0, 
    name: 'The Comet', 
    color: '#34d399', 
    stats: { initialSpeed: 77, acceleration: 11 }, 
    chaosFactor: 'Overdrive' 
  },
  // ID 1 - The Juggernaut - Unstable Engine
  { 
    id: 1, 
    name: 'The Juggernaut', 
    color: '#f87171', 
    stats: { initialSpeed: 92, acceleration: 8 }, 
    chaosFactor: 'Unstable Engine' 
  },
  // ID 2 - The Shadow - Slipstreamer
  { 
    id: 2, 
    name: 'The Shadow', 
    color: '#a78bfa', 
    stats: { initialSpeed: 89, acceleration: 12 }, 
    chaosFactor: 'Slipstreamer' 
  },
  // ID 3 - The Phantom - Quantum Tunneling
  { 
    id: 3, 
    name: 'The Phantom', 
    color: '#60a5fa', 
    stats: { initialSpeed: 69, acceleration: 9 }, 
    chaosFactor: 'Quantum Tunneling' 
  },
  // ID 4 - The Phoenix - Last Stand Protocol
  { 
    id: 4, 
    name: 'The Phoenix', 
    color: '#facc15', 
    stats: { initialSpeed: 91, acceleration: 10 }, 
    chaosFactor: 'Last Stand Protocol' 
  },
  // ID 5 - The Vanguard - Micro-warp Engine
  { 
    id: 5, 
    name: 'The Vanguard', 
    color: '#f3f4f6', 
    stats: { initialSpeed: 80, acceleration: 10 }, 
    chaosFactor: 'Micro-warp Engine' 
  },
  // ID 6 - The Wildcard - Rogue AI
  { 
    id: 6, 
    name: 'The Wildcard', 
    color: '#fb923c', 
    stats: { initialSpeed: 88, acceleration: 14 }, 
    chaosFactor: 'Rogue AI' 
  },
  // ID 7 - The Apex - Graviton Brake
  { 
    id: 7, 
    name: 'The Apex', 
    color: '#ec4899', 
    stats: { initialSpeed: 99, acceleration: 16 }, 
    chaosFactor: 'Graviton Brake' 
  }
]

export const RACE_TURNS = 10
export const TRACK_DISTANCE = 1000 