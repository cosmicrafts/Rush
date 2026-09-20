// Race simulation pura, copiada byte-por-byte de composables/useWeb3.ts
// (generateSimulatedRaceResult, reconstructRaceFromBlockchain, animateRaceProgression)
// No hablan a ninguna cadena: animacion local. Fuente original: MIT Rush repo.
import { SHIPS_ROSTER } from './useShips'

  const getShipNames = () => [
    'Comet',
    'Juggernaut',
    'Shadow',
    'Phantom',
    'Phoenix',
    'Vanguard',
    'Wildcard',
    'Apex',
  ]

  const getChaosEventText = (eventType: number, shipId: number, targetId?: number) => {
    const shipNames = getShipNames()

    switch (eventType) {
      case 1:
        return `🔥 ${shipNames[shipId]} activates Overdrive!`
      case 2:
        return `⚡ ${shipNames[shipId]}'s Unstable Engine surges!`
      case 3:
        return `💨 ${shipNames[shipId]} catches a Slipstream!`
      case 4:
        return `🌀 ${shipNames[shipId]} uses Quantum Tunneling!`
      case 5:
        return `🚀 ${shipNames[shipId]} activates Last Stand Protocol!`
      case 6:
        return `⚡ ${shipNames[shipId]}'s Micro-warp Engine activates!`
      case 7:
        return `🤖 ${shipNames[shipId]}'s Rogue AI takes control!`
      case 8:
        return `🛑 ${shipNames[shipId]} uses Graviton Brake on ${shipNames[targetId || 0]}!`
      case 9:
        return `💥 ${shipNames[shipId]} was slowed by Graviton Brake!`
      default:
        return ''
    }
  }

  export const generateSimulatedRaceResult = (winner: number, placements: number[]) => {
    const turnEvents: unknown[] = []
    const trackDistance = 1000
    const raceTurns = 10

    // Create ship states with final positions based on placements
    const shipStates = placements.map((shipId, index) => ({
      shipId,
      finalDistance: trackDistance - index, // 1st = 1000, 2nd = 999, etc.
      finalTurn: Math.min(raceTurns, 8 + index), // Earlier finishers finish in earlier turns
    }))

    // Generate turn events for each ship
    for (let turn = 1; turn <= raceTurns; turn++) {
      for (let shipIndex = 0; shipIndex < 8; shipIndex++) {
        const shipState = shipStates[shipIndex]
        if (!shipState) continue

        const shipId = shipState.shipId

        // Calculate progress for this turn
        const progressPerTurn = shipState.finalDistance / shipState.finalTurn
        const currentDistance = Math.min(shipState.finalDistance, progressPerTurn * turn)
        const moveAmount =
          turn === 1 ? currentDistance : currentDistance - progressPerTurn * (turn - 1)

        // Add some randomness to make it more interesting
        const randomFactor = 0.8 + Math.random() * 0.4 // 0.8 to 1.2
        const adjustedMoveAmount = Math.floor(moveAmount * randomFactor)
        const adjustedDistance = Math.min(
          shipState.finalDistance,
          turn === 1 ? adjustedMoveAmount : progressPerTurn * (turn - 1) + adjustedMoveAmount
        )

        // Add chaos events randomly (10% chance per turn per ship)
        const chaosEventType = Math.random() < 0.1 ? Math.floor(Math.random() * 9) + 1 : 0
        const targetShipId = chaosEventType === 8 ? Math.floor(Math.random() * 8) : 0

        turnEvents.push({
          turn,
          shipId,
          moveAmount: adjustedMoveAmount,
          distance: adjustedDistance,
          chaosEventType,
          targetShipId,
        })
      }
    }

    return {
      winner,
      placements,
      turnEvents,
      totalEvents: turnEvents.length,
    }
  }

  // Reconstruct race from blockchain turnEvents data
  export const reconstructRaceFromBlockchain = (contractRaceResult: unknown) => {
    // Import SHIPS_ROSTER to get the proper ship data
    // SHIPS_ROSTER is already imported at the top of the file

    // Initialize race states for all ships (using 0-7 IDs)
    const raceStates: unknown[] = []
    for (let shipId = 0; shipId <= 7; shipId++) {
      const shipData = SHIPS_ROSTER.find((ship: unknown) => (ship as { id: number }).id === shipId)
      raceStates.push({
        id: shipId, // 0-7 IDs
        name: shipData?.name || 'Unknown',
        color: shipData?.color || '#ffffff',
        stats: shipData?.stats || { initialSpeed: 0, acceleration: 0 },
        chaosFactor: shipData?.chaosFactor || '',
        currentSpeed: 0,
        distance: 0,
        finalTurn: 0,
      })
    }

    // Process turn events from blockchain
    const replayLog: unknown[] = []
    const chaosEvents: unknown[] = []

    // Group events by turn
    const turnEvents = (contractRaceResult as { turnEvents?: unknown[] }).turnEvents || []
    const maxTurn =
      turnEvents.length > 0
        ? Math.max(...turnEvents.map((e: unknown) => (e as { turn: number }).turn))
        : 0

    // Track final positions for each ship
    const finalPositions: { [shipId: number]: number } = {}

    for (let turn = 1; turn <= maxTurn; turn++) {
      const turnEvents = (contractRaceResult as { turnEvents: unknown[] }).turnEvents.filter(
        (e: unknown) => (e as { turn: number }).turn === turn
      )

      for (const event of turnEvents) {
        const shipId = Number(event.shipId) // Already 0-7
        const moveAmount = Number(event.moveAmount)
        const distance = Number(event.distance)
        const chaosEventType = Number(event.chaosEventType)
        const targetShipId = Number(event.targetShipId)

        // Track the final position for each ship
        finalPositions[shipId] = distance

        // Add to replay log (using 0-7 IDs)
        replayLog.push({
          turn,
          shipId: shipId, // 0-7 ID
          moveAmount,
          distance,
          event:
            chaosEventType > 0
              ? {
                  type: chaosEventType.toString(),
                  text: getChaosEventText(chaosEventType, shipId, targetShipId),
                  targetId: targetShipId > 0 ? targetShipId : undefined,
                }
              : undefined,
        })

        // Add chaos events
        if (chaosEventType > 0) {
          chaosEvents.push({
            type: chaosEventType.toString(),
            text: getChaosEventText(chaosEventType, shipId, targetShipId),
            targetId: targetShipId > 0 ? targetShipId : undefined,
          })
        }
      }
    }

    // Update race states with final blockchain positions
    for (let shipId = 0; shipId <= 7; shipId++) {
      raceStates[shipId].distance = finalPositions[shipId] || 0
    }

    // Set winner based on placements (already 0-7 IDs)
    const winnerId = Number(contractRaceResult.winner)
    const winner = raceStates[winnerId] // Array is 0-indexed

    // Convert placements (already 0-7 IDs)
    const placements = (contractRaceResult as { placements: unknown[] }).placements.map(
      (p: unknown) => Number(p)
    )

    // CRITICAL FIX: Update final positions based on actual blockchain results
    // The placements array shows the order they finished, so we need to set distances accordingly
    const trackDistance = 1000
    placements.forEach((shipId: number, index: number) => {
      // Calculate final distance based on placement
      // 1st place = 1000, 2nd place = 999, 3rd place = 998, etc.
      const finalDistance = trackDistance - index
      raceStates[shipId].distance = finalDistance
    })

    return {
      raceStates,
      winner,
      replayLog,
      chaosEvents,
      placements,
    }
  }

  // Animate race progression for frontend - PURE BLOCKCHAIN REPLAY
  export const animateRaceProgression = async (
    raceData: unknown,
    onTurnUpdate: (turn: number, states: unknown[], events: unknown[]) => void
  ) => {
    const { replayLog, raceStates } = raceData as { replayLog: unknown[]; raceStates: unknown[] }
    const maxTurn = Math.max(...replayLog.map((log: unknown) => (log as { turn: number }).turn))

    // CRITICAL FIX: Start all ships from distance 0 for proper animation
    const initialStates = raceStates.map((state: unknown) => ({
      ...(state as object),
      distance: 0,
    }))

    // Track current positions throughout animation
    const currentPositions = initialStates.map((state: unknown) => ({ ...(state as object) }))

    for (let turn = 1; turn <= maxTurn; turn++) {
      const turnEvents = replayLog.filter((log: unknown) => (log as { turn: number }).turn === turn)
      const turnChaosEvents: unknown[] = []

      for (const event of turnEvents) {
        const shipId = event.shipId // Already 0-7 ID

        // Update the ship's position to the EXACT blockchain position
        if (shipId >= 0 && shipId < currentPositions.length) {
          currentPositions[shipId].distance = event.distance
        }

        // Add chaos event if present, including the shipId that triggered it
        if (event.event) {
          turnChaosEvents.push({
            ...event.event,
            shipId: shipId, // Add the ship ID that triggered this event
          })
        }
      }
      onTurnUpdate(turn, currentPositions, turnChaosEvents)
      await new Promise(resolve => setTimeout(resolve, 800))
    }
  }
