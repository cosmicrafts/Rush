

// Ship name to image mapping
const SHIP_IMAGE_MAP: { [key: string]: string } = {
  'The Comet': 'comet',
  'The Juggernaut': 'juggernaut',
  'The Shadow': 'shadow',
  'The Phantom': 'phantom',
  'The Phoenix': 'phoenix',
  'The Vanguard': 'vanguard',
  'The Wildcard': 'wildcard',
  'The Apex': 'apex',
}

// Ship ID to name mapping
const SHIP_ID_MAP: { [key: number]: string } = {
  0: 'The Comet',
  1: 'The Juggernaut',
  2: 'The Shadow',
  3: 'The Phantom',
  4: 'The Phoenix',
  5: 'The Vanguard',
  6: 'The Wildcard',
  7: 'The Apex',
}

export function useShips() {
  /**
   * Get ship image filename from ship name
   * @param shipName - Full ship name (e.g., "The Comet")
   * @returns Image filename without extension (e.g., "comet")
   */
  const getShipImageName = (shipName: string): string => {
    return SHIP_IMAGE_MAP[shipName] || 'comet' // fallback to comet if not found
  }

  /**
   * Get ship name from ship ID
   * @param shipId - Ship ID (0-7)
   * @returns Full ship name
   */
  const getShipNameById = (shipId: number): string => {
    return SHIP_ID_MAP[shipId] || 'The Comet' // fallback to comet if not found
  }

  /**
   * Get ship ID from ship name
   * @param shipName - Full ship name
   * @returns Ship ID or -1 if not found
   */
  const getShipIdByName = (shipName: string): number => {
    const entry = Object.entries(SHIP_ID_MAP).find(([_, name]) => name === shipName)
    return entry ? parseInt(entry[0]) : -1
  }

  /**
   * Get full ship image path
   * @param shipName - Full ship name
   * @returns Complete image path
   */
  const getShipImagePath = (shipName: string): string => {
    const imageName = getShipImageName(shipName)
    return `/ships/${imageName}.webp`
  }

  /**
   * Get full ship image path by ID
   * @param shipId - Ship ID
   * @returns Complete image path
   */
  const getShipImagePathById = (shipId: number): string => {
    const shipName = getShipNameById(shipId)
    return getShipImagePath(shipName)
  }

  /**
   * Get all ship names
   * @returns Array of all ship names
   */
  const getAllShipNames = (): string[] => {
    return Object.values(SHIP_ID_MAP)
  }

  /**
   * Get all ship IDs
   * @returns Array of all ship IDs
   */
  const getAllShipIds = (): number[] => {
    return Object.keys(SHIP_ID_MAP).map(id => parseInt(id))
  }

  return {
    // Core mapping functions
    getShipImageName,
    getShipNameById,
    getShipIdByName,

    // Convenience functions
    getShipImagePath,
    getShipImagePathById,
    getAllShipNames,
    getAllShipIds,

    // Constants
    SHIP_IMAGE_MAP,
    SHIP_ID_MAP,
  }
}
