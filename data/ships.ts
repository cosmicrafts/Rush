import type { Ship } from '~/types/game'

export const SHIPS_ROSTER: Ship[] = [
  // Re-buffed
  { 
    id: 6, 
    name: 'The Vanguard', 
    color: '#f3f4f6', 
    stats: { initialSpeed: 80, acceleration: 8 }, 
    chaosFactor: 'Micro-warp Engine' 
  },

  // Nerfed
  { 
    id: 5, 
    name: 'The Phoenix', 
    color: '#facc15', 
    stats: { initialSpeed: 90, acceleration: 11 }, 
    chaosFactor: 'Last Stand Protocol' 
  },
  
  // Buffed
  { 
    id: 3, 
    name: 'The Shadow', 
    color: '#a78bfa', 
    stats: { initialSpeed: 80, acceleration: 15 }, 
    chaosFactor: 'Slipstreamer' 
  },
  
  // Stable middle-pack
  { 
    id: 8, 
    name: 'The Apex', 
    color: '#ec4899', 
    stats: { initialSpeed: 97, acceleration: 12 }, 
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
    stats: { initialSpeed: 55, acceleration: 9 }, 
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