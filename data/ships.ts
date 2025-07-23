import type { Ship } from '~/types/game'

// Chaos Factor Definitions - All values and descriptions in one place for easy balancing
export const CHAOS_FACTORS = {
  'Overdrive': {
    description: '10% chance to double speed for one turn',
    chance: 10,
    effect: 'x2 Speed!'
  },
  'Unstable Engine': {
    description: '25% chance to triple acceleration for one turn',
    chance: 25,
    effect: 'x3 Accel!'
  },
  'Slipstreamer': {
    description: '20% chance to gain +50 speed when trailing (not in 1st or 2nd place)',
    chance: 20,
    effect: '+50 Speed!'
  },
  'Quantum Tunneling': {
    description: '8% chance to teleport 25% of track distance',
    chance: 8,
    effect: 'TELEPORT!'
  },
  'Last Stand Protocol': {
    description: '20% chance to quadruple speed in final 4 turns of the race',
    chance: 20,
    effect: 'Last Stand!'
  },
  'Micro-warp Engine': {
    description: '40% chance to double acceleration for one turn',
    chance: 65,
    effect: 'Warp Speed!'
  },
  'Rogue AI': {
    description: '20% chance for random effect: x2 speed, /2 speed, x2 accel, or 0 accel',
    chance: 20,
    effects: ['AI: x2 Speed!', 'AI: /2 Speed!', 'AI: x2 Accel!', 'AI: Accel=0!']
  },
  'Graviton Brake': {
    description: '25% chance to slow 2nd place ship by 50% when in 1st place',
    chance: 75,
    effect: 'Braked!'
  }
}

export const SHIPS_ROSTER: Ship[] = [
  // Nerfed Vanguard (was winning 50% on pure stats)
  { 
    id: 6, 
    name: 'The Vanguard', 
    color: '#f3f4f6', 
    stats: { initialSpeed: 80, acceleration: 10 }, 
    chaosFactor: 'Micro-warp Engine' 
  },

  // Nerfed Phoenix (was too dominant at 45.2%)
  { 
    id: 5, 
    name: 'The Phoenix', 
    color: '#facc15', 
    stats: { initialSpeed: 90, acceleration: 12 }, 
    chaosFactor: 'Last Stand Protocol' 
  },
  
  // Buffed Shadow (was getting 0.2% wins)
  { 
    id: 3, 
    name: 'The Shadow', 
    color: '#a78bfa', 
    stats: { initialSpeed: 82, acceleration: 14 }, 
    chaosFactor: 'Slipstreamer' 
  },
  
  // Stable middle-pack
  { 
    id: 8, 
    name: 'The Apex', 
    color: '#ec4899', 
    stats: { initialSpeed: 95.12, acceleration: 12 }, 
    chaosFactor: 'Graviton Brake' 
  },
  { 
    id: 1, 
    name: 'The Comet', 
    color: '#34d399', 
    stats: { initialSpeed: 78, acceleration: 11 }, 
    chaosFactor: 'Overdrive' 
  },
  { 
    id: 4, 
    name: 'The Phantom', 
    color: '#60a5fa', 
    stats: { initialSpeed: 69, acceleration: 8.8 }, 
    chaosFactor: 'Quantum Tunneling' 
  },
  { 
    id: 2, 
    name: 'The Juggernaut', 
    color: '#f87171', 
    stats: { initialSpeed: 85, acceleration: 9 }, 
    chaosFactor: 'Unstable Engine' 
  },
  { 
    id: 7, 
    name: 'The Wildcard', 
    color: '#fb923c', 
    stats: { initialSpeed: 80, acceleration: 13 }, 
    chaosFactor: 'Rogue AI' 
  },
]

export const RACE_TURNS = 10
export const TRACK_DISTANCE = 1000 