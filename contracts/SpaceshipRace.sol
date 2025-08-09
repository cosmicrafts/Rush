// SPDX-License-Identifier: MIT
pragma solidity 0.8.23;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "./IAchievementNFT.sol";
import "./ShipConfiguration.sol";
import "./ChaosManager.sol";

using Strings for uint256;

/**
 * @title SpaceshipRace
 * @notice Single-player spaceship racing casino with NFT achievements
 * @dev Each bet triggers an independent race against the house
 */
contract SpaceshipRace is ReentrancyGuard, Ownable {
    using Strings for uint256;
    
    // Interface for NFT contract
    IAchievementNFT public immutable achievementNFT;
    
    // Token contract
    IERC20 public immutable spiralToken;
    
    // Modular contracts
    ShipConfiguration public immutable shipConfig;
    ChaosManager public immutable chaosManager;
    
    // Race simulation constants
    uint256 public constant TRACK_DISTANCE = 1000;
    uint256 public constant RACE_TURNS = 10;
    uint256 public constant NUM_SHIPS = 8;
    
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
    
    // Use ShipStats from ShipConfiguration contract
    // struct ShipStats moved to ShipConfiguration.sol
    
    // Race event structure
    struct RaceTurnEvent {
        uint8 turn;
        uint8 shipId;
        uint256 moveAmount;
        uint256 distance;
        uint8 chaosEventType;
        uint8 targetShipId; // for GRAV_BRAKE events
    }
    
    // Race result structure
    struct RaceResult {
        uint8 winner;
        uint8[8] placements; // 0-7 for 1st through 8th place
        RaceTurnEvent[] turnEvents;
        uint256 totalEvents;
    }
    
    // Ship state during race
    struct ShipState {
        uint8 id;
        uint256 currentSpeed;
        uint256 distance;
        uint256 finalTurn; // 0 = not finished, otherwise finish time (turn * 1000 + fraction)
    }
    
    // Ship configurations now handled by ShipConfiguration contract
    
    // Betting limits
    uint256 public constant MIN_BET = 10 * 10**8; // 10 SPIRAL
    uint256 public constant MAX_BET = 1000 * 10**8; // 1000 SPIRAL
    
    // House edge and jackpot percentages
    uint256 public constant HOUSE_EDGE = 2; // 2%
    uint256 public constant RACE_POOL_PERCENTAGE = 98; // 98% to race pool
    uint256 public constant MINI_JACKPOT_CHANCE = 50; // 5%
    uint256 public constant MEGA_JACKPOT_CHANCE = 5; // 0.5%
    uint256 public constant SUPER_JACKPOT_CHANCE = 1; // 0.1%
    
    // Jackpot tiers
    uint8 public constant JACKPOT_TIER_NONE = 0;
    uint8 public constant JACKPOT_TIER_MINI = 1;
    uint8 public constant JACKPOT_TIER_MEGA = 2;
    uint8 public constant JACKPOT_TIER_SUPER = 3;
    
    // Game state
    uint256 public currentRaceId = 1;
    uint256 public totalVolume;
    uint256 public miniJackpot;
    uint256 public megaJackpot;
    uint256 public superJackpot;
    
    // Player statistics
    mapping(address => uint256) public totalRaces;
    mapping(address => uint256) public totalWinnings;
    mapping(address => uint256) public biggestWin;
    mapping(address => uint8) public highestJackpotTier;
    mapping(address => uint256) public achievementRewardsEarned;
    mapping(address => uint256) public lastRaceTime;
    mapping(address => uint256[8]) public spaceshipWins;
    mapping(address => uint256[8]) public spaceshipBetCount;
    // Simplified placement tracking - separate mappings for each placement
    mapping(address => uint256[8]) public spaceshipFirstPlace;
    mapping(address => uint256[8]) public spaceshipSecondPlace;
    mapping(address => uint256[8]) public spaceshipThirdPlace;
    mapping(address => uint256[8]) public spaceshipFourthPlace;
    mapping(address => mapping(bytes32 => bool)) public achievements;
    
    // Events
    event BetPlaced(address indexed player, uint8 spaceship, uint256 amount, uint8 winner, uint256 payout, uint8 jackpotTier);
    event AchievementUnlocked(address indexed player, string name, uint256 nftId, uint256 tokenReward);
    event JackpotHit(address indexed player, uint8 tier, uint256 amount);
    
    /**
     * @notice Constructor
     * @param _spiralToken Address of the SPIRAL token contract
     * @param _achievementNFT Address of the achievement NFT contract
     * @param _shipConfig Address of the ship configuration contract
     * @param _chaosManager Address of the chaos manager contract
     */
    constructor(
        address _spiralToken,
        address _achievementNFT,
        address _shipConfig,
        address _chaosManager
    ) Ownable(msg.sender) {
        spiralToken = IERC20(_spiralToken);
        achievementNFT = IAchievementNFT(_achievementNFT);
        shipConfig = ShipConfiguration(_shipConfig);
        chaosManager = ChaosManager(_chaosManager);
    }
    

    
    /**
     * @notice Place a bet and run race simulation
     * @param spaceship The spaceship to bet on (0-7)
     * @param amount The amount to bet in SPIRAL tokens
     * @return raceResult Complete race simulation result
     */
    function placeBet(uint8 spaceship, uint256 amount) external nonReentrant returns (RaceResult memory raceResult) {
        require(spaceship < 8, "Invalid spaceship");
        require(amount >= MIN_BET && amount <= MAX_BET, "Bet amount out of range");
        require(spiralToken.transferFrom(msg.sender, address(this), amount), "Token transfer failed");
        
        // Run full race simulation
        raceResult = _runRaceSimulation();
        
        // Calculate payout
        uint256 payout = _calculatePayout(spaceship, raceResult.winner, amount);
        
        // Check for jackpot
        uint8 jackpotTier = _checkJackpotTrigger();
        uint256 jackpotAmount = _getJackpotAmount(jackpotTier);
        
        // Update game state
        totalVolume += amount;
        currentRaceId++;
        
        // Update player stats
        _updatePlayerStats(msg.sender, spaceship, raceResult.winner, payout, jackpotTier);
        
        // Transfer winnings and jackpot
        if (payout > 0) {
            spiralToken.transfer(msg.sender, payout);
        }
        if (jackpotAmount > 0) {
            spiralToken.transfer(msg.sender, jackpotAmount);
            _resetJackpot(jackpotTier);
            emit JackpotHit(msg.sender, jackpotTier, jackpotAmount);
        }
        
        emit BetPlaced(msg.sender, spaceship, amount, raceResult.winner, payout, jackpotTier);
    }
    
    /**
     * @notice Run complete race simulation (10 turns, 8 ships)
     * @return raceResult Complete race data
     */
    function _runRaceSimulation() internal view returns (RaceResult memory raceResult) {
        // Initialize ship states
        ShipState[8] memory raceState;
        for (uint8 i = 0; i < 8; i++) {
            ShipConfiguration.ShipStats memory stats = shipConfig.getShipStats(i);
            raceState[i] = ShipState({
                id: i,
                currentSpeed: stats.initialSpeed,
                distance: 0,
                finalTurn: 0
            });
        }
        
        // Initialize result
        raceResult.turnEvents = new RaceTurnEvent[](80); // 8 ships × 10 turns
        raceResult.totalEvents = 0;
        
        // Run 10 turns with proper race simulation
        for (uint8 turn = 1; turn <= 10; turn++) {
            // Calculate movement for all ships first (simultaneous processing)
            uint256[8] memory moveAmounts;
            uint256[8] memory newDistances;
            
            for (uint8 shipIndex = 0; shipIndex < 8; shipIndex++) {
                // Skip ships that have already finished
                if (raceState[shipIndex].finalTurn != 0) {
                    continue;
                }
                
                // Get current speed and apply chaos effects
                uint256 currentSpeed = raceState[shipIndex].currentSpeed;
                (uint256 modifiedSpeed, uint8 eventType) = chaosManager.applyChaosEffect(
                    shipIndex, turn, currentSpeed, currentRaceId, msg.sender
                );
                
                // Calculate movement for this turn using modified speed
                moveAmounts[shipIndex] = modifiedSpeed;
                newDistances[shipIndex] = raceState[shipIndex].distance + modifiedSpeed;
            }
            
            // Handle Graviton Brake effects first (affects movement)
            for (uint8 shipIndex = 0; shipIndex < 8; shipIndex++) {
                if (raceState[shipIndex].finalTurn != 0) continue;
                
                (, uint8 eventType) = chaosManager.applyChaosEffect(
                    shipIndex, turn, raceState[shipIndex].currentSpeed, currentRaceId, msg.sender
                );
                
                // If Apex triggers Graviton Brake and is in 1st place, slow 2nd place ship
                if (eventType == CHAOS_GRAV_BRAKE) {
                    uint8 firstPlaceShip = _getCurrentLeader(raceState);
                    uint8 secondPlaceShip = _getSecondPlace(raceState);
                    
                    if (shipIndex == firstPlaceShip && secondPlaceShip != 255) {
                        // Slow 2nd place ship by 50%
                        moveAmounts[secondPlaceShip] = moveAmounts[secondPlaceShip] / 2;
                        newDistances[secondPlaceShip] = raceState[secondPlaceShip].distance + moveAmounts[secondPlaceShip];
                        
                        // Record the brake event on the target ship
                        raceResult.turnEvents[raceResult.totalEvents] = RaceTurnEvent({
                            turn: turn,
                            shipId: shipIndex,
                            moveAmount: moveAmounts[shipIndex],
                            distance: raceState[shipIndex].distance,
                            chaosEventType: CHAOS_GRAV_BRAKE,
                            targetShipId: secondPlaceShip
                        });
                        raceResult.totalEvents++;
                    }
                }
            }
            
            // Now apply all movements and check for finishers
            for (uint8 shipIndex = 0; shipIndex < 8; shipIndex++) {
                // Skip ships that have already finished
                if (raceState[shipIndex].finalTurn != 0) {
                    continue;
                }
                
                // Update ship state - FIRST update distance, THEN update speed for next turn
                raceState[shipIndex].distance = newDistances[shipIndex];
                
                // Check if ship finished and calculate exact finish time
                if (raceState[shipIndex].distance >= TRACK_DISTANCE && raceState[shipIndex].finalTurn == 0) {
                    // Calculate the exact fraction of the turn when the ship reached 1000
                    uint256 distanceBefore = raceState[shipIndex].distance - moveAmounts[shipIndex];
                    uint256 distanceNeeded = TRACK_DISTANCE - distanceBefore;
                    
                    // Use higher precision for fractional calculation (1e18 for decimals)
                    uint256 turnFraction = (distanceNeeded * 1e18) / moveAmounts[shipIndex];
                    
                    // Store finish time as: turn * 1e18 + fraction
                    raceState[shipIndex].finalTurn = uint256(turn) * 1e18 + turnFraction;
                    raceState[shipIndex].distance = TRACK_DISTANCE;
                }
                
                // Update speed for next turn (AFTER movement and finish check)
                ShipConfiguration.ShipStats memory stats = shipConfig.getShipStats(shipIndex);
                uint256 modifiedAcceleration = chaosManager.applyChaosAcceleration(
                    shipIndex, turn, stats.acceleration, currentRaceId, msg.sender
                );
                
                raceState[shipIndex].currentSpeed = raceState[shipIndex].currentSpeed + modifiedAcceleration;
                
                // Get the chaos event type for recording
                (, uint8 eventType) = chaosManager.applyChaosEffect(
                    shipIndex, turn, raceState[shipIndex].currentSpeed, currentRaceId, msg.sender
                );
                
                // Record turn event
                raceResult.turnEvents[raceResult.totalEvents] = RaceTurnEvent({
                    turn: turn,
                    shipId: shipIndex,
                    moveAmount: moveAmounts[shipIndex],
                    distance: raceState[shipIndex].distance,
                    chaosEventType: eventType,
                    targetShipId: 0
                });
                raceResult.totalEvents++;
            }
        }
        
        // Determine winner and all placements using proper logic
        (raceResult.winner, raceResult.placements) = _determineWinnerAndPlacements(raceState);
    }
    

    
    /**
     * @notice Check if ship was braked by Graviton Brake
     * @param shipId The ship to check
     * @param turn Current turn
     * @param turnEvents Array of turn events
     * @param totalEvents Number of events
     * @return True if ship was braked
     */
    function _wasShipBraked(uint8 shipId, uint8 turn, RaceTurnEvent[] memory turnEvents, uint256 totalEvents) internal pure returns (bool) {
        for (uint256 i = 0; i < totalEvents; i++) {
            if (turnEvents[i].turn == turn && 
                turnEvents[i].chaosEventType == CHAOS_GRAV_BRAKE && 
                turnEvents[i].targetShipId == shipId) {
                return true;
            }
        }
        return false;
    }
    
    /**
     * @notice Get current race leader by distance
     * @param raceState Array of ship states  
     * @return Ship index of current leader
     */
    function _getCurrentLeader(ShipState[8] memory raceState) internal pure returns (uint8) {
        uint8 leader = 0;
        uint256 maxDistance = 0;
        
        for (uint8 i = 0; i < 8; i++) {
            if (raceState[i].finalTurn == 0 && raceState[i].distance > maxDistance) {
                maxDistance = raceState[i].distance;
                leader = i;
            }
        }
        return leader;
    }
    
    /**
     * @notice Get current second place ship by distance  
     * @param raceState Array of ship states
     * @return Ship index of second place (255 if not found)
     */
    function _getSecondPlace(ShipState[8] memory raceState) internal pure returns (uint8) {
        uint8 leader = _getCurrentLeader(raceState);
        uint8 secondPlace = 255;
        uint256 secondMaxDistance = 0;
        
        for (uint8 i = 0; i < 8; i++) {
            if (i != leader && raceState[i].finalTurn == 0 && raceState[i].distance > secondMaxDistance) {
                secondMaxDistance = raceState[i].distance;
                secondPlace = i;
            }
        }
        return secondPlace;
    }
    
    /**
     * @notice Sort ships by distance (descending)
     * @param raceState Array of ship states
     */
    function _sortShipsByDistance(ShipState[8] memory raceState) internal pure {
        // Simple bubble sort for small array
        for (uint8 i = 0; i < 7; i++) {
            for (uint8 j = 0; j < 7 - i; j++) {
                if (raceState[j].distance < raceState[j + 1].distance) {
                    ShipState memory temp = raceState[j];
                    raceState[j] = raceState[j + 1];
                    raceState[j + 1] = temp;
                }
            }
        }
    }
    
    /**
     * @notice Get current ship rankings
     * @param raceState Array of ship states (must be sorted by distance)
     * @return rankings Array of ship IDs in rank order
     */
    function _getCurrentRanks(ShipState[8] memory raceState) internal pure returns (uint8[8] memory rankings) {
        for (uint8 i = 0; i < 8; i++) {
            rankings[i] = raceState[i].id;
        }
    }
    
    /**
     * @notice Get ship's current rank
     * @param shipId The ship ID
     * @param currentRanks Current rankings
     * @return rank The ship's rank (0 = 1st, 1 = 2nd, etc.)
     */
    function _getShipRank(uint8 shipId, uint8[8] memory currentRanks) internal pure returns (uint8 rank) {
        for (uint8 i = 0; i < 8; i++) {
            if (currentRanks[i] == shipId) {
                return i;
            }
        }
        return 0;
    }
    
    /**
     * @notice Determine winner and all placements from race simulation
     * @param raceState Final race state
     * @return winner The winning ship ID
     * @return placements Array of ship IDs in order of finish (1st to 8th)
     */
    function _determineWinnerAndPlacements(ShipState[8] memory raceState) internal pure returns (uint8 winner, uint8[8] memory placements) {
        uint8[8] memory shipIndices = [0, 1, 2, 3, 4, 5, 6, 7];

        for (uint8 i = 0; i < 7; i++) {
            for (uint8 j = i + 1; j < 8; j++) {
                bool swap = false;

                bool finishedI = raceState[shipIndices[i]].finalTurn > 0;
                bool finishedJ = raceState[shipIndices[j]].finalTurn > 0;

                if (finishedI && finishedJ) {
                    // Lower finalTurn wins (includes fractional precision)
                    if (raceState[shipIndices[i]].finalTurn > raceState[shipIndices[j]].finalTurn) {
                        swap = true;
                    }
                } else if (finishedI && !finishedJ) {
                    // Finished always beats unfinished
                    swap = false;
                } else if (!finishedI && finishedJ) {
                    swap = true;
                } else {
                    // Neither finished — compare raw distance
                    if (raceState[shipIndices[i]].distance < raceState[shipIndices[j]].distance) {
                        swap = true;
                    }
                }

                if (swap) {
                    uint8 temp = shipIndices[i];
                    shipIndices[i] = shipIndices[j];
                    shipIndices[j] = temp;
                }
            }
        }

        for (uint8 i = 0; i < 8; i++) {
            placements[i] = shipIndices[i];
        }
        winner = placements[0];
    }
    
    /**
     * @notice Calculate payout based on bet and result
     * @param playerSpaceship The spaceship the player bet on
     * @param winner The winning spaceship
     * @param betAmount The amount bet
     * @return The payout amount
     */
    function _calculatePayout(uint8 playerSpaceship, uint8 winner, uint256 betAmount) internal view returns (uint256) {
        if (playerSpaceship == winner) {
            return (betAmount * 100) / HOUSE_EDGE; // Payout is 100% of bet
        }
        return 0;
    }
    
    /**
     * @notice Check for tiered jackpot trigger
     * @return Jackpot tier (0 = none, 1 = mini, 2 = mega, 3 = super)
     */
    function _checkJackpotTrigger() internal view returns (uint8) {
        uint256 random = uint256(keccak256(abi.encodePacked(
            blockhash(block.number - 1),
            block.timestamp,
            msg.sender,
            currentRaceId,
            "JACKPOT"
        ))) % 1000;
        
        if (random < SUPER_JACKPOT_CHANCE) {
            return JACKPOT_TIER_SUPER;
        } else if (random < MEGA_JACKPOT_CHANCE) {
            return JACKPOT_TIER_MEGA;
        } else if (random < MINI_JACKPOT_CHANCE) {
            return JACKPOT_TIER_MINI;
        }
        
        return JACKPOT_TIER_NONE;
    }
    
    /**
     * @notice Get jackpot amount for given tier
     * @param tier Jackpot tier
     * @return Jackpot amount
     */
    function _getJackpotAmount(uint8 tier) internal view returns (uint256) {
        if (tier == JACKPOT_TIER_SUPER) return superJackpot;
        if (tier == JACKPOT_TIER_MEGA) return megaJackpot;
        if (tier == JACKPOT_TIER_MINI) return miniJackpot;
        return 0;
    }
    
    /**
     * @notice Reset jackpot for given tier
     * @param tier Jackpot tier
     */
    function _resetJackpot(uint8 tier) internal {
        if (tier == JACKPOT_TIER_SUPER) superJackpot = 0;
        else if (tier == JACKPOT_TIER_MEGA) megaJackpot = 0;
        else if (tier == JACKPOT_TIER_MINI) miniJackpot = 0;
    }
    
    /**
     * @notice Update player statistics and check achievements
     * @param player The player address
     * @param spaceship The spaceship they bet on
     * @param winner The winning spaceship
     * @param payout The payout amount
     * @param jackpotTier The jackpot tier hit
     */
    function _updatePlayerStats(
        address player,
        uint8 spaceship,
        uint8 winner,
        uint256 payout,
        uint8 jackpotTier
    ) internal {
        totalRaces[player]++;
        lastRaceTime[player] = block.timestamp;
        
        // Update spaceship bet count
        spaceshipBetCount[player][spaceship]++;
        
        // Update placement tracking - Simple approach with separate mappings
        if (spaceship == winner) {
            spaceshipFirstPlace[player][spaceship]++; // 1st place
        } else {
            // For non-winners, just track as 2nd place for now
            spaceshipSecondPlace[player][spaceship]++; // 2nd place
        }
        
        if (spaceship == winner) {
            spaceshipWins[player][spaceship]++;
        }
        
        if (payout > 0) {
            totalWinnings[player] += payout;
            if (payout > biggestWin[player]) {
                biggestWin[player] = payout;
            }
        }
        
        if (jackpotTier > highestJackpotTier[player]) {
            highestJackpotTier[player] = jackpotTier;
        }
    }
    

    
    /**
     * @notice Get spaceship information
     * @param spaceshipId The spaceship ID
     * @return initialSpeed The ship's initial speed
     * @return acceleration The ship's acceleration
     * @return chaosFactor The chaos factor type
     * @return chaosChance The chaos factor chance percentage
     */
    function getSpaceshipInfo(uint8 spaceshipId) external view returns (
        uint256 initialSpeed,
        uint256 acceleration,
        uint8 chaosFactor,
        uint8 chaosChance
    ) {
        require(spaceshipId < 8, "Invalid spaceship ID");
        
        ShipConfiguration.ShipStats memory stats = shipConfig.getShipStats(spaceshipId);
        return (
            stats.initialSpeed,
            stats.acceleration,
            stats.chaosFactor,
            stats.chaosChance
        );
    }
    
    /**
     * @notice Get game statistics
     * @return gameCurrentRace Current race ID
     * @return gameTotalRaces Total races played
     * @return gameTotalVolume Total betting volume
     * @return gameMiniJackpot Current mini jackpot
     * @return gameMegaJackpot Current mega jackpot
     * @return gameSuperJackpot Current super jackpot
     */
    function getGameStats() external view returns (
        uint256 gameCurrentRace,
        uint256 gameTotalRaces,
        uint256 gameTotalVolume,
        uint256 gameMiniJackpot,
        uint256 gameMegaJackpot,
        uint256 gameSuperJackpot
    ) {
        return (currentRaceId, currentRaceId - 1, totalVolume, miniJackpot, megaJackpot, superJackpot);
    }
    
    /**
     * @notice Get player statistics
     * @param player The player address
     * @return playerTotalRaces Total races played by the player
     * @return playerTotalWinnings Total winnings earned by the player
     * @return playerBiggestWin Biggest single win by the player
     * @return playerHighestJackpotTier Highest jackpot tier hit by player
     * @return playerAchievementRewards Total achievement rewards earned
     * @return playerSpaceshipWins Array of wins for each spaceship
     */
    function getPlayerStats(address player) external view returns (
        uint256 playerTotalRaces,
        uint256 playerTotalWinnings,
        uint256 playerBiggestWin,
        uint8 playerHighestJackpotTier,
        uint256 playerAchievementRewards,
        uint256[8] memory playerSpaceshipWins
    ) {
        return (
            totalRaces[player],
            totalWinnings[player],
            biggestWin[player],
            highestJackpotTier[player],
            achievementRewardsEarned[player],
            [
                spaceshipWins[player][0],
                spaceshipWins[player][1],
                spaceshipWins[player][2],
                spaceshipWins[player][3],
                spaceshipWins[player][4],
                spaceshipWins[player][5],
                spaceshipWins[player][6],
                spaceshipWins[player][7]
            ]
        );
    }
    
    /**
     * @notice Debug function to test race simulation and see finalTurn values
     * @return raceResult Complete race simulation result
     */
    function debugRaceSimulation() external view returns (RaceResult memory raceResult) {
        return _runRaceSimulation();
    }
    
    // Owner functions
    
    /**
     * @notice Withdraw accumulated fees (owner only)
     * @param amount Amount to withdraw
     */
    function withdrawFees(uint256 amount) external onlyOwner {
        require(amount <= spiralToken.balanceOf(address(this)), "Insufficient balance");
        spiralToken.transfer(owner(), amount);
    }
    
    /**
     * @notice Emergency withdraw all tokens (owner only)
     */
    function emergencyWithdraw() external onlyOwner {
        uint256 balance = spiralToken.balanceOf(address(this));
        spiralToken.transfer(owner(), balance);
    }
}