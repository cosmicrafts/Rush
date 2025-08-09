// SPDX-License-Identifier: MIT
pragma solidity 0.8.23;

import "./ShipConfiguration.sol";

/**
 * @title ChaosManager
 * @notice Manages chaos factor effects for spaceship racing
 * @dev Handles all chaos factor calculations and random events
 */
contract ChaosManager {
    // Reference to ship configuration
    ShipConfiguration public immutable shipConfig;
    
    // Chaos factor event types
    uint8 public constant CHAOS_NONE = 0;
    uint8 public constant CHAOS_OVERDRIVE = 1;
    uint8 public constant CHAOS_UNSTABLE = 2;
    uint8 public constant CHAOS_SLIPSTREAM = 3;
    uint8 public constant CHAOS_QUANTUM = 4;
    uint8 public constant CHAOS_LAST_STAND = 5;
    uint8 public constant CHAOS_WARP = 6;
    uint8 public constant CHAOS_ROGUE = 7;
    uint8 public constant CHAOS_GRAV_BRAKE = 8;
    uint8 public constant CHAOS_BRAKED = 9;
    
    constructor(address _shipConfig) {
        shipConfig = ShipConfiguration(_shipConfig);
    }
    
    /**
     * @notice Apply chaos factor effects for a ship's speed
     * @param shipIndex The ship index (0-7)
     * @param turn Current turn number
     * @param currentSpeed Current speed before chaos
     * @param raceId Current race ID for randomness
     * @param player Player address for randomness
     * @return modifiedSpeed Speed after chaos effects
     * @return eventType Type of chaos event triggered
     */
    function applyChaosEffect(
        uint8 shipIndex,
        uint8 turn,
        uint256 currentSpeed,
        uint256 raceId,
        address player
    ) external view returns (uint256 modifiedSpeed, uint8 eventType) {
        modifiedSpeed = currentSpeed;
        eventType = CHAOS_NONE;
        
        // Get ship stats
        ShipConfiguration.ShipStats memory stats = shipConfig.getShipStats(shipIndex);
        
        // Generate randomness for this specific chaos check
        // Use multiple entropy sources to ensure proper randomness across different races and turns
        uint256 random = uint256(keccak256(abi.encodePacked(
            blockhash(block.number - 1),
            block.timestamp,
            player,
            raceId,
            turn,
            shipIndex,
            currentSpeed, // Current speed for turn-specific entropy
            stats.initialSpeed, // Ship-specific entropy
            stats.acceleration,
            block.difficulty, // Block-specific entropy
            gasleft(), // Gas-based entropy (changes based on execution context)
            uint256(raceId % 1000) * 1000 + uint256(turn) * 100 + uint256(shipIndex), // Safe entropy calculation
            "CHAOS"
        ))) % 100;
        
        // Check if chaos triggers
        if (random >= stats.chaosChance) {
            return (modifiedSpeed, eventType);
        }
        
        // Apply chaos factors based on ship's chaos factor type
        if (stats.chaosFactor == 0) {
            // The Comet - Overdrive: Double speed
            modifiedSpeed = currentSpeed * 2;
            eventType = CHAOS_OVERDRIVE;
        } else if (stats.chaosFactor == 1) {
            // The Juggernaut - Unstable Engine: Acceleration effect handled separately
            eventType = CHAOS_UNSTABLE;
        } else if (stats.chaosFactor == 2) {
            // The Shadow - Slipstreamer: +50 speed when trailing (requires ranking check)
            // This will be handled in the main contract with ranking data
            if (currentSpeed <= type(uint256).max - 50) {
                modifiedSpeed = currentSpeed + 50;
                eventType = CHAOS_SLIPSTREAM;
            }
        } else if (stats.chaosFactor == 3) {
            // The Phantom - Quantum Tunneling: Teleport 25% of track (250 distance)
            eventType = CHAOS_QUANTUM;
            // Teleport effect will be applied as distance bonus in main contract
        } else if (stats.chaosFactor == 4) {
            // The Phoenix - Last Stand Protocol: Quadruple speed in final turns
            // This will be checked based on turn number in main contract
            if (currentSpeed <= type(uint256).max / 4) {
                modifiedSpeed = currentSpeed * 4;
                eventType = CHAOS_LAST_STAND;
            }
        } else if (stats.chaosFactor == 5) {
            // The Vanguard - Micro-warp Engine: Acceleration effect handled separately
            eventType = CHAOS_WARP;
        } else if (stats.chaosFactor == 6) {
            // The Wildcard - Rogue AI: Random effect
            eventType = CHAOS_ROGUE;
            // Generate additional randomness for AI choice
            uint256 aiRandom = uint256(keccak256(abi.encodePacked(
                random, // Use the main random as seed
                "ROGUE_AI_SPEED"
            ))) % 4;
            
            if (aiRandom == 0) {
                // x2 speed
                if (currentSpeed <= type(uint256).max / 2) {
                    modifiedSpeed = currentSpeed * 2;
                }
            } else if (aiRandom == 1) {
                // /2 speed
                modifiedSpeed = currentSpeed / 2;
                if (modifiedSpeed == 0) modifiedSpeed = 1;
            }
            // aiRandom 2 and 3 affect acceleration only, speed unchanged
        } else if (stats.chaosFactor == 7) {
            // The Apex - Graviton Brake: Affects other ships, handled in main contract
            eventType = CHAOS_GRAV_BRAKE;
        }
    }
    
    /**
     * @notice Apply acceleration-modifying chaos effects
     * @param shipIndex The ship index (0-7)
     * @param turn Current turn number
     * @param baseAcceleration Base acceleration before chaos
     * @param raceId Current race ID for randomness
     * @param player Player address for randomness
     * @return modifiedAcceleration Acceleration after chaos effects
     */
    function applyChaosAcceleration(
        uint8 shipIndex,
        uint8 turn,
        uint256 baseAcceleration,
        uint256 raceId,
        address player
    ) external view returns (uint256 modifiedAcceleration) {
        modifiedAcceleration = baseAcceleration;
        
        // Get ship stats
        ShipConfiguration.ShipStats memory stats = shipConfig.getShipStats(shipIndex);
        
        // Generate the same randomness as in applyChaosEffect
        // We need to use the exact same entropy sources to get consistent results
        // Note: We use baseAcceleration as an approximation of currentSpeed for consistency
        uint256 currentSpeedApprox = baseAcceleration * 10;
        uint256 random = uint256(keccak256(abi.encodePacked(
            blockhash(block.number - 1),
            block.timestamp,
            player,
            raceId,
            turn,
            shipIndex,
            currentSpeedApprox, // Approximate current speed for consistency
            stats.initialSpeed, // Ship-specific entropy
            stats.acceleration,
            block.difficulty, // Block-specific entropy
            gasleft(), // Gas-based entropy (changes based on execution context)
            uint256(raceId % 1000) * 1000 + uint256(turn) * 100 + uint256(shipIndex), // Safe entropy calculation
            "CHAOS"
        ))) % 100;
        
        // Check if chaos triggers
        if (random >= stats.chaosChance) {
            return modifiedAcceleration;
        }
        
        // Apply acceleration-modifying chaos factors
        if (stats.chaosFactor == 1) {
            // The Juggernaut - Unstable Engine: Triple acceleration
            if (baseAcceleration <= type(uint256).max / 3) {
                modifiedAcceleration = baseAcceleration * 3;
            }
        } else if (stats.chaosFactor == 5) {
            // The Vanguard - Micro-warp Engine: Double acceleration  
            if (baseAcceleration <= type(uint256).max / 2) {
                modifiedAcceleration = baseAcceleration * 2;
            }
        } else if (stats.chaosFactor == 6) {
            // The Wildcard - Rogue AI: Random acceleration effect
            // Generate additional randomness for AI choice
            uint256 aiRandom = uint256(keccak256(abi.encodePacked(
                random, // Use the main random as seed
                "ROGUE_AI_ACCEL"
            ))) % 4;
            
            if (aiRandom == 0) {
                // x2 acceleration
                if (baseAcceleration <= type(uint256).max / 2) {
                    modifiedAcceleration = baseAcceleration * 2;
                }
            } else if (aiRandom == 1) {
                // /2 acceleration
                modifiedAcceleration = baseAcceleration / 2;
                if (modifiedAcceleration == 0) modifiedAcceleration = 1;
            } else if (aiRandom == 2) {
                // x2 acceleration (duplicate of case 0 for balanced odds)
                if (baseAcceleration <= type(uint256).max / 2) {
                    modifiedAcceleration = baseAcceleration * 2;
                }
            } else {
                // 0 acceleration
                modifiedAcceleration = 0;
            }
        }
    }
    
    /**
     * @notice Check if a chaos factor affects speed
     * @param chaosFactor The chaos factor type
     * @return True if it affects speed
     */
    function affectsSpeed(uint8 chaosFactor) external pure returns (bool) {
        return chaosFactor == 0 || // Overdrive
               chaosFactor == 2 || // Slipstreamer
               chaosFactor == 4 || // Last Stand Protocol
               chaosFactor == 6;   // Rogue AI (sometimes)
    }
    
    /**
     * @notice Check if a chaos factor affects acceleration
     * @param chaosFactor The chaos factor type
     * @return True if it affects acceleration
     */
    function affectsAcceleration(uint8 chaosFactor) external pure returns (bool) {
        return chaosFactor == 1 || // Unstable Engine
               chaosFactor == 5 || // Micro-warp Engine
               chaosFactor == 6;   // Rogue AI (sometimes)
    }
    
    /**
     * @notice Get chaos factor name
     * @param chaosFactor The chaos factor type
     * @return name Chaos factor name
     */
    function getChaosFactorName(uint8 chaosFactor) external pure returns (string memory name) {
        if (chaosFactor == 0) return "Overdrive";
        if (chaosFactor == 1) return "Unstable Engine";
        if (chaosFactor == 2) return "Slipstreamer";
        if (chaosFactor == 3) return "Quantum Tunneling";
        if (chaosFactor == 4) return "Last Stand Protocol";
        if (chaosFactor == 5) return "Micro-warp Engine";
        if (chaosFactor == 6) return "Rogue AI";
        if (chaosFactor == 7) return "Graviton Brake";
        return "Unknown";
    }
}
