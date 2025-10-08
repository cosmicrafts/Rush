// SPDX-License-Identifier: MIT
pragma solidity 0.8.23;

/**
 * @title ShipConfiguration
 * @notice Manages spaceship statistics and configurations
 * @dev Provides centralized ship data management for the racing game
 */
contract ShipConfiguration {
    // Ship stats structure
    struct ShipStats {
        uint256 initialSpeed;
        uint256 acceleration;
        uint8 chaosFactor;
        uint8 chaosChance;
    }
    
    // Ship configurations (matching frontend)
    ShipStats[8] public shipStats;
    
    // Ship names for reference
    string[8] public shipNames = [
        "The Comet",      // ID 0 - Overdrive
        "The Juggernaut", // ID 1 - Unstable Engine
        "The Shadow",     // ID 2 - Slipstreamer
        "The Phantom",    // ID 3 - Quantum Tunneling
        "The Phoenix",    // ID 4 - Last Stand Protocol
        "The Vanguard",   // ID 5 - Micro-warp Engine
        "The Wildcard",   // ID 6 - Rogue AI
        "The Apex"        // ID 7 - Graviton Brake
    ];
    
    // Events
    event ShipStatsUpdated(uint8 indexed shipId, uint256 initialSpeed, uint256 acceleration, uint8 chaosFactor, uint8 chaosChance);
    
    constructor() {
        _initializeShipStats();
    }
    
    /**
     * @notice Initialize ship stats with balanced values from frontend
     */
    function _initializeShipStats() internal {
        // Frontend balanced values from ships.ts - exact mapping by array index to ship ID
        shipStats[0] = ShipStats(77, 11, 0, 10);   // The Comet (ID 1) - Overdrive: 10% chance x2 speed
        shipStats[1] = ShipStats(92, 8, 1, 35);    // The Juggernaut (ID 2) - Unstable Engine: 35% chance x3 acceleration
        shipStats[2] = ShipStats(89, 12, 2, 40);   // The Shadow (ID 3) - Slipstreamer: 40% chance +50 speed when trailing
        shipStats[3] = ShipStats(69, 9, 3, 40);     // The Phantom (ID 4) - Quantum Tunneling: 40% chance teleport 25%
        shipStats[4] = ShipStats(91, 10, 4, 10);   // The Phoenix (ID 5) - Last Stand Protocol: 10% chance x4 speed final turns
        shipStats[5] = ShipStats(80, 10, 5, 55);   // The Vanguard (ID 6) - Micro-warp Engine: 55% chance x2 acceleration
        shipStats[6] = ShipStats(88, 14, 6, 20);   // The Wildcard (ID 7) - Rogue AI: 20% chance random effect
        shipStats[7] = ShipStats(99, 16, 7, 77);   // The Apex (ID 8) - Graviton Brake: 77% chance slow 2nd place
    }
    
    /**
     * @notice Get ship stats by ID
     * @param shipId The ship ID (0-7)
     * @return stats Ship statistics
     */
    function getShipStats(uint8 shipId) external view returns (ShipStats memory stats) {
        require(shipId < 8, "Invalid ship ID");
        return shipStats[shipId];
    }
    
    /**
     * @notice Get ship name by ID
     * @param shipId The ship ID (0-7)
     * @return name Ship name
     */
    function getShipName(uint8 shipId) external view returns (string memory name) {
        require(shipId < 8, "Invalid ship ID");
        return shipNames[shipId];
    }
    
    /**
     * @notice Get all ship stats
     * @return allStats Array of all ship statistics
     */
    function getAllShipStats() external view returns (ShipStats[8] memory allStats) {
        return shipStats;
    }
    
    /**
     * @notice Update ship stats (for testing/balancing purposes)
     * @param shipId The ship ID (0-7)
     * @param initialSpeed New initial speed
     * @param acceleration New acceleration
     * @param chaosFactor New chaos factor type
     * @param chaosChance New chaos chance percentage
     */
    function updateShipStats(
        uint8 shipId,
        uint256 initialSpeed,
        uint256 acceleration,
        uint8 chaosFactor,
        uint8 chaosChance
    ) external {
        require(shipId < 8, "Invalid ship ID");
        require(chaosChance <= 100, "Chaos chance must be <= 100");
        
        shipStats[shipId] = ShipStats(initialSpeed, acceleration, chaosFactor, chaosChance);
        
        emit ShipStatsUpdated(shipId, initialSpeed, acceleration, chaosFactor, chaosChance);
    }
}
