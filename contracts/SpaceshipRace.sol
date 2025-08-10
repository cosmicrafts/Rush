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
    
    // Betting limits (8 decimals to match SPIRAL token)
    uint256 public constant MIN_BET = 10 * 10**8; // 10 SPIRAL
    uint256 public constant MAX_BET = 1000 * 10**8; // 1000 SPIRAL
    
    // House edge and jackpot percentages
    uint256 public constant HOUSE_EDGE = 10; // 10%
    uint256 public constant RACE_POOL_PERCENTAGE = 90; // 90% to race pool
    uint256 public constant MINI_JACKPOT_CHANCE = 50; // 5%
    uint256 public constant MEGA_JACKPOT_CHANCE = 30; // 3%
    uint256 public constant SUPER_JACKPOT_CHANCE = 10; // 1%
    
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
    
    // Leaderboard tracking
    mapping(address => uint256) public totalJackpotsWon; // Track jackpot amounts won
    mapping(address => uint256) public playerRank; // Current rank (0 = unranked)
    mapping(uint256 => address) public rankToPlayer; // Rank to player mapping
    uint256 public totalRankedPlayers; // Total number of ranked players
    mapping(address => bool) public isRanked; // Whether player is in rankings
    
    // Faucet for SPIRAL tokens
    mapping(address => bool) public hasClaimed;
    uint256 public constant FAUCET_AMOUNT = 1000 * 10**8; // 1000 SPIRAL (8 decimals)
    
    // Username and avatar system
    mapping(address => string) public playerUsernames;
    mapping(string => address) public usernameToAddress;
    mapping(address => bool) public hasUsername;
    mapping(address => uint8) public playerAvatars; // Avatar ID (0-7)
    mapping(address => bool) public hasAvatar;
    
    // Match history
    struct MatchRecord {
        uint256 raceId;
        uint256 timestamp;
        uint8 shipBet;
        uint256 betAmount;
        uint8 placement;
        uint256 payout;
        uint8 jackpotTier;
        uint256 jackpotAmount;
    }
    
    mapping(address => MatchRecord[]) public playerMatchHistory;
    mapping(address => uint256) public playerMatchCount;
    
    // Race betting data
    struct RaceInfo {
        bool isActive;
        uint256 totalBets;
        uint256[8] shipBets;
        uint256 prizePool;
    }
    
    struct PlayerBet {
        uint8 spaceship;
        uint256 amount;
        bool claimed;
    }
    
    // Current race betting data
    mapping(uint256 => RaceInfo) public raceInfo;
    mapping(uint256 => mapping(uint8 => uint256)) public shipBets; // raceId => shipId => totalBets
    mapping(address => mapping(uint256 => PlayerBet)) public playerBets; // player => raceId => bet
    
    // Store last race result for debugRaceSimulation
    RaceResult public lastRaceResult;
    bool public hasLastRaceResult;
    
    // Events
    event BetPlaced(address indexed player, uint8 spaceship, uint256 amount, uint8 winner, uint256 payout, uint8 jackpotTier);
    event RaceCompleted(address indexed player, uint8 winner, uint8[8] placements, uint256 totalEvents);
    event AchievementUnlocked(address indexed player, string name, uint256 nftId, uint256 tokenReward);
    event JackpotHit(address indexed player, uint8 tier, uint256 amount);
    event FaucetClaimed(address indexed player, uint256 amount);
    event UsernameRegistered(address indexed player, string username, uint8 avatarId);
    event MatchRecorded(address indexed player, uint256 raceId, uint8 placement, uint256 payout);
    event LeaderboardUpdated(address indexed player, uint256 oldRank, uint256 newRank, uint256 totalWinnings);
    event JackpotWon(address indexed player, uint8 tier, uint256 amount);
    
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
        
        // Track betting data for current race
        uint256 raceId = currentRaceId;
        
        // Initialize race info if this is the first bet
        if (raceInfo[raceId].totalBets == 0) {
            raceInfo[raceId].isActive = true;
        }
        
        // Update race betting totals
        raceInfo[raceId].totalBets += amount;
        raceInfo[raceId].shipBets[spaceship] += amount;
        raceInfo[raceId].prizePool = raceInfo[raceId].totalBets; // Simple prize pool for now
        shipBets[raceId][spaceship] += amount;
        
        // Store player's bet
        playerBets[msg.sender][raceId] = PlayerBet({
            spaceship: spaceship,
            amount: amount,
            claimed: false
        });
        
        // Run full race simulation
        raceResult = _runRaceSimulation();
        
        // Store the race result for debugRaceSimulation
        lastRaceResult = raceResult;
        hasLastRaceResult = true;
        
        // Calculate payout based on placement
        uint256 payout = _calculatePayoutByPlacement(spaceship, raceResult.placements, amount);
        
        // Check for jackpot
        uint8 jackpotTier = _checkJackpotTrigger();
        uint256 jackpotAmount = _getJackpotAmount(jackpotTier);
        
        // Fund jackpots with 10% of bet amount
        uint256 jackpotContribution = (amount * HOUSE_EDGE) / 100;
        miniJackpot += (jackpotContribution * 10) / 100;  // 10% to mini
        megaJackpot += (jackpotContribution * 25) / 100;  // 25% to mega  
        superJackpot += (jackpotContribution * 65) / 100; // 65% to super
        
        // Update game state
        totalVolume += amount;
        currentRaceId++;
        
        // Update player stats and leaderboard
        _updatePlayerStats(msg.sender, spaceship, raceResult, payout, jackpotTier);
        _updateLeaderboard(msg.sender, payout + jackpotAmount);
        
        // Transfer winnings and jackpot
        if (payout > 0) {
            spiralToken.transfer(msg.sender, payout);
        }
        if (jackpotAmount > 0) {
            spiralToken.transfer(msg.sender, jackpotAmount);
            _resetJackpot(jackpotTier);
            totalJackpotsWon[msg.sender] += jackpotAmount;
            emit JackpotHit(msg.sender, jackpotTier, jackpotAmount);
            emit JackpotWon(msg.sender, jackpotTier, jackpotAmount);
        }
        
        // Record match history
        _recordMatch(msg.sender, raceId, spaceship, amount, raceResult.placements, payout + jackpotAmount, jackpotTier, jackpotAmount);
        
        emit BetPlaced(msg.sender, spaceship, amount, raceResult.winner, payout, jackpotTier);
        emit RaceCompleted(msg.sender, raceResult.winner, raceResult.placements, raceResult.totalEvents);
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
     * @notice Calculate payout based on placement
     * @param playerSpaceship The spaceship the player bet on
     * @param placements Array of ship IDs in order of finish (1st to 8th)
     * @param betAmount The amount bet
     * @return The payout amount
     */
    function _calculatePayoutByPlacement(uint8 playerSpaceship, uint8[8] memory placements, uint256 betAmount) internal pure returns (uint256) {
        // Find player's placement
        uint8 placement = 8; // Default to last place
        for (uint8 i = 0; i < 8; i++) {
            if (placements[i] == playerSpaceship) {
                placement = i + 1; // Convert to 1-based placement
                break;
            }
        }
        
        // Payout structure ensuring house edge (for 100 SPIRAL bet):
        if (placement == 1) {
            return (betAmount * 400) / 100;  // 1st: 400 SPIRAL (4X profit)
        } else if (placement == 2) {
            return (betAmount * 200) / 100;  // 2nd: 200 SPIRAL (2X profit)
        } else if (placement == 3) {
            return (betAmount * 100) / 100;  // 3rd: 100 SPIRAL (0 profit but no loss)
        } else if (placement == 4) {
            return (betAmount * 50) / 100;   // 4th: 50 SPIRAL (50% loss)
        } else if (placement == 5) {
            return (betAmount * 35) / 100;   // 5th: 35 SPIRAL (65% loss)
        } else if (placement == 6) {
            return (betAmount * 25) / 100;   // 6th: 25 SPIRAL (75% loss)
        } else if (placement == 7) {
            return (betAmount * 10) / 100;   // 7th: 10 SPIRAL (90% loss)
        }
        
        // 8th place: lose entire bet
        return 0;
    }

    /**
     * @notice Calculate payout based on bet and result (legacy function for compatibility)
     * @param playerSpaceship The spaceship the player bet on
     * @param winner The winning spaceship
     * @param betAmount The amount bet
     * @return The payout amount
     */
    function _calculatePayout(uint8 playerSpaceship, uint8 winner, uint256 betAmount) internal pure returns (uint256) {
        if (playerSpaceship == winner) {
            return betAmount * 2; // 1st place: 2x bet amount
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
     * @param raceResult The complete race result
     * @param payout The payout amount
     * @param jackpotTier The jackpot tier hit
     */
    function _updatePlayerStats(
        address player,
        uint8 spaceship,
        RaceResult memory raceResult,
        uint256 payout,
        uint8 jackpotTier
    ) internal {
        totalRaces[player]++;
        lastRaceTime[player] = block.timestamp;
        
        // Update spaceship bet count
        spaceshipBetCount[player][spaceship]++;
        
        // Find the placement of the player's spaceship
        uint8 placement = 8; // Default to last place
        for (uint8 i = 0; i < 8; i++) {
            if (raceResult.placements[i] == spaceship) {
                placement = i + 1; // Convert to 1-based placement
                break;
            }
        }
        
        // Update placement tracking
        if (placement == 1) {
            spaceshipFirstPlace[player][spaceship]++;
        } else if (placement == 2) {
            spaceshipSecondPlace[player][spaceship]++;
        } else if (placement == 3) {
            spaceshipThirdPlace[player][spaceship]++;
        } else if (placement == 4) {
            spaceshipFourthPlace[player][spaceship]++;
        }
        
        if (spaceship == raceResult.winner) {
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
        
        // Check for achievements after updating stats
        _checkAchievements(player, spaceship);
    }
    
    /**
     * @notice Update leaderboard rankings
     * @param player The player address
     * @param newWinnings The new winnings amount to add
     */
    function _updateLeaderboard(address player, uint256 newWinnings) internal {
        uint256 oldRank = playerRank[player];
        uint256 currentWinnings = totalWinnings[player];
        
        // If player is not ranked and has winnings, add them to rankings
        if (!isRanked[player] && currentWinnings > 0) {
            totalRankedPlayers++;
            isRanked[player] = true;
            playerRank[player] = totalRankedPlayers;
            rankToPlayer[totalRankedPlayers] = player;
            emit LeaderboardUpdated(player, 0, totalRankedPlayers, currentWinnings);
            return;
        }
        
        // If player is already ranked, update their position
        if (isRanked[player]) {
            uint256 newRank = _calculateNewRank(player, currentWinnings);
            if (newRank != oldRank) {
                // Update rankings for affected players
                _reorderRankings(player, oldRank, newRank);
                emit LeaderboardUpdated(player, oldRank, newRank, currentWinnings);
            }
        }
    }
    
    /**
     * @notice Calculate new rank for a player based on total winnings
     * @param player The player address
     * @param winnings The player's total winnings
     * @return newRank The calculated new rank
     */
    function _calculateNewRank(address player, uint256 winnings) internal view returns (uint256 newRank) {
        if (winnings == 0) return 0;
        
        newRank = 1; // Start at rank 1
        
        // Count how many players have more winnings
        for (uint256 i = 1; i <= totalRankedPlayers; i++) {
            address rankedPlayer = rankToPlayer[i];
            if (rankedPlayer != address(0) && rankedPlayer != player) {
                if (totalWinnings[rankedPlayer] > winnings) {
                    newRank++;
                }
            }
        }
        
        return newRank;
    }
    
    /**
     * @notice Reorder rankings when a player's position changes
     * @param player The player whose rank changed
     * @param oldRank The old rank
     * @param newRank The new rank
     */
    function _reorderRankings(address player, uint256 oldRank, uint256 newRank) internal {
        if (oldRank == newRank) return;
        
        if (oldRank > newRank) {
            // Player moved up in rankings
            // Shift players down
            for (uint256 i = oldRank; i > newRank; i--) {
                address shiftedPlayer = rankToPlayer[i - 1];
                rankToPlayer[i] = shiftedPlayer;
                playerRank[shiftedPlayer] = i;
            }
        } else {
            // Player moved down in rankings
            // Shift players up
            for (uint256 i = oldRank; i < newRank; i++) {
                address shiftedPlayer = rankToPlayer[i + 1];
                rankToPlayer[i] = shiftedPlayer;
                playerRank[shiftedPlayer] = i;
            }
        }
        
        // Set player's new rank
        rankToPlayer[newRank] = player;
        playerRank[player] = newRank;
    }
    
    /**
     * @notice Check and unlock achievements for player
     * @param player The player address
     * @param spaceship The spaceship they just bet on
     */
    function _checkAchievements(address player, uint8 spaceship) internal {
        string[8] memory spaceshipNames = ["Comet", "Juggernaut", "Shadow", "Phantom", "Phoenix", "Vanguard", "Wildcard", "Apex"];
        
        // Check betting achievements for this spaceship
        uint256 betCount = spaceshipBetCount[player][spaceship];
        if (betCount == 5) {
            _mintAchievement(player, string(abi.encodePacked(spaceshipNames[spaceship], " Supporter")), 
                string(abi.encodePacked("Place 5 bets on ", spaceshipNames[spaceship])), "Betting", spaceship, 5);
        } else if (betCount == 25) {
            _mintAchievement(player, string(abi.encodePacked(spaceshipNames[spaceship], " Enthusiast")), 
                string(abi.encodePacked("Place 25 bets on ", spaceshipNames[spaceship])), "Betting", spaceship, 25);
        } else if (betCount == 100) {
            _mintAchievement(player, string(abi.encodePacked(spaceshipNames[spaceship], " Devotee")), 
                string(abi.encodePacked("Place 100 bets on ", spaceshipNames[spaceship])), "Betting", spaceship, 100);
        }
        
        // Check placement achievements for this spaceship
        uint256 firstPlace = spaceshipFirstPlace[player][spaceship];
        uint256 secondPlace = spaceshipSecondPlace[player][spaceship];
        uint256 thirdPlace = spaceshipThirdPlace[player][spaceship];
        uint256 fourthPlace = spaceshipFourthPlace[player][spaceship];
        
        if (firstPlace == 3) {
            _mintAchievement(player, string(abi.encodePacked(spaceshipNames[spaceship], " Winner")), 
                string(abi.encodePacked("Win 3 races with ", spaceshipNames[spaceship])), "Placement", spaceship, 3);
        } else if (firstPlace == 10) {
            _mintAchievement(player, string(abi.encodePacked(spaceshipNames[spaceship], " Champion")), 
                string(abi.encodePacked("Win 10 races with ", spaceshipNames[spaceship])), "Placement", spaceship, 10);
        }
        
        if (secondPlace == 5) {
            _mintAchievement(player, string(abi.encodePacked(spaceshipNames[spaceship], " Runner-up")), 
                string(abi.encodePacked("Place 2nd 5 times with ", spaceshipNames[spaceship])), "Placement", spaceship, 5);
        } else if (secondPlace == 20) {
            _mintAchievement(player, string(abi.encodePacked(spaceshipNames[spaceship], " Consistent")), 
                string(abi.encodePacked("Place 2nd 20 times with ", spaceshipNames[spaceship])), "Placement", spaceship, 20);
        }
        
        if (thirdPlace == 10) {
            _mintAchievement(player, string(abi.encodePacked(spaceshipNames[spaceship], " Steady")), 
                string(abi.encodePacked("Place 3rd 10 times with ", spaceshipNames[spaceship])), "Placement", spaceship, 10);
        } else if (thirdPlace == 50) {
            _mintAchievement(player, string(abi.encodePacked(spaceshipNames[spaceship], " Persistent")), 
                string(abi.encodePacked("Place 3rd 50 times with ", spaceshipNames[spaceship])), "Placement", spaceship, 50);
        }
        
        if (fourthPlace == 15) {
            _mintAchievement(player, string(abi.encodePacked(spaceshipNames[spaceship], " Participant")), 
                string(abi.encodePacked("Place 4th 15 times with ", spaceshipNames[spaceship])), "Placement", spaceship, 15);
        } else if (fourthPlace == 75) {
            _mintAchievement(player, string(abi.encodePacked(spaceshipNames[spaceship], " Dedicated")), 
                string(abi.encodePacked("Place 4th 75 times with ", spaceshipNames[spaceship])), "Placement", spaceship, 75);
        }
        
        // Check milestone achievements
        uint256 totalRaceCount = totalRaces[player];
        if (totalRaceCount == 10) {
            _mintAchievement(player, "Novice Racer", "Complete 10 races", "Milestone", 255, 10);
        } else if (totalRaceCount == 50) {
            _mintAchievement(player, "Experienced Pilot", "Complete 50 races", "Milestone", 255, 50);
        } else if (totalRaceCount == 100) {
            _mintAchievement(player, "Veteran Captain", "Complete 100 races", "Milestone", 255, 100);
        }
    }
    
    /**
     * @notice Mint achievement NFT and emit event
     * @param player The player address
     * @param name Achievement name
     * @param description Achievement description
     * @param achievementType Achievement type
     * @param spaceshipId Spaceship ID (255 for none)
     * @param threshold Achievement threshold
     */
    function _mintAchievement(
        address player,
        string memory name,
        string memory description,
        string memory achievementType,
        uint8 spaceshipId,
        uint256 threshold
    ) internal {
        // Create unique achievement ID to prevent duplicate minting
        bytes32 achievementId = keccak256(abi.encodePacked(player, name, threshold));
        
        // Check if achievement already minted
        if (achievements[player][achievementId]) {
            return;
        }
        
        // Mark as minted
        achievements[player][achievementId] = true;
        
        // Mint NFT
        uint256 nftId = achievementNFT.mintAchievement(player, name, description, achievementType, spaceshipId, threshold);
        
        // Give token reward (1000 SPIRAL per achievement)
        uint256 tokenReward = 1000 * 10**8; // 1000 SPIRAL
        achievementRewardsEarned[player] += tokenReward;
        spiralToken.transfer(player, tokenReward);
        
        emit AchievementUnlocked(player, name, nftId, tokenReward);
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
     * @notice Debug function to get the last actual race result
     * @return raceResult Complete race simulation result from last bet
     */
    function debugRaceSimulation() external view returns (RaceResult memory raceResult) {
        require(hasLastRaceResult, "No race result available");
        return lastRaceResult;
    }
    
    /**
     * @notice Get player's total achievement count (internal version)
     * @param player The player address
     * @return Total achievements unlocked by player
     */
    function _getPlayerAchievementsCount(address player) internal view returns (uint256) {
        // For now, return a simple count based on stored achievement flags
        // This is a simplified version - in full implementation would track all achievements
        uint256 count = 0;
        
        // Count betting achievements (simplified)
        for (uint8 i = 0; i < 8; i++) {
            if (spaceshipBetCount[player][i] >= 5) count++;
            if (spaceshipBetCount[player][i] >= 25) count++;
            if (spaceshipBetCount[player][i] >= 100) count++;
        }
        
        // Count placement achievements (simplified)
        for (uint8 i = 0; i < 8; i++) {
            if (spaceshipFirstPlace[player][i] >= 3) count++;
            if (spaceshipFirstPlace[player][i] >= 10) count++;
            if (spaceshipSecondPlace[player][i] >= 5) count++;
            if (spaceshipSecondPlace[player][i] >= 20) count++;
            if (spaceshipThirdPlace[player][i] >= 10) count++;
            if (spaceshipThirdPlace[player][i] >= 50) count++;
            if (spaceshipFourthPlace[player][i] >= 15) count++;
            if (spaceshipFourthPlace[player][i] >= 75) count++;
        }
        
        // Count milestone achievements
        if (totalRaces[player] >= 10) count++;
        if (totalRaces[player] >= 50) count++;
        if (totalRaces[player] >= 100) count++;
        
        return count;
    }
    
    /**
     * @notice Get player's total achievement count (external version)
     * @param player The player address
     * @return Total achievements unlocked by player
     */
    function getPlayerAchievementsCount(address player) external view returns (uint256) {
        return _getPlayerAchievementsCount(player);
    }
    
    /**
     * @notice Get spaceship placement count for player
     * @param player The player address  
     * @param spaceshipId The spaceship ID (0-7)
     * @param placement The placement (1-4 for 1st-4th place)
     * @return Count of times player got that placement with that spaceship
     */
    function spaceshipPlacementCount(address player, uint8 spaceshipId, uint8 placement) external view returns (uint256) {
        require(spaceshipId < 8, "Invalid spaceship ID");
        require(placement >= 1 && placement <= 4, "Invalid placement");
        
        if (placement == 1) return spaceshipFirstPlace[player][spaceshipId];
        if (placement == 2) return spaceshipSecondPlace[player][spaceshipId];
        if (placement == 3) return spaceshipThirdPlace[player][spaceshipId];
        if (placement == 4) return spaceshipFourthPlace[player][spaceshipId];
        
        return 0;
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
    
    // SPIRAL Token Faucet - 1000 tokens per wallet
    function claimFaucet() external {
        require(!hasClaimed[msg.sender], "Already claimed faucet");
        require(spiralToken.balanceOf(address(this)) >= FAUCET_AMOUNT, "Faucet empty");
        
        hasClaimed[msg.sender] = true;
        spiralToken.transfer(msg.sender, FAUCET_AMOUNT);
        
        emit FaucetClaimed(msg.sender, FAUCET_AMOUNT);
    }
    
    // Check if address has claimed faucet
    function hasClaimedFaucet(address user) external view returns (bool) {
        return hasClaimed[user];
    }
    
    // Get current race betting information
    function getRaceInfo(uint256 raceId) external view returns (
        bool isActive,
        uint256 totalBets,
        uint256[8] memory shipBetsArray,
        uint256 prizePool
    ) {
        RaceInfo storage race = raceInfo[raceId];
        return (
            race.isActive,
            race.totalBets,
            race.shipBets,
            race.prizePool
        );
    }
    
    // Get ship betting totals for a race
    function getShipBets(uint256 raceId) external view returns (uint256[8] memory shipBetsArray) {
        for (uint8 i = 0; i < 8; i++) {
            shipBetsArray[i] = shipBets[raceId][i];
        }
        return shipBetsArray;
    }
    
    // Get player's bet for a specific race
    function getPlayerBets(address player, uint256 raceId) external view returns (
        uint8 spaceship,
        uint256 amount,
        bool claimed
    ) {
        PlayerBet storage bet = playerBets[player][raceId];
        return (bet.spaceship, bet.amount, bet.claimed);
    }
    
    // Get current race info (convenience function)
    function getCurrentRaceInfo() external view returns (
        bool isActive,
        uint256 totalBets,
        uint256[8] memory shipBetsArray,
        uint256 prizePool
    ) {
        return this.getRaceInfo(currentRaceId);
    }
    
    /**
     * @notice Get current jackpot amounts
     * @return mini Current mini jackpot amount
     * @return mega Current mega jackpot amount  
     * @return superJackpotAmount Current super jackpot amount
     */
    function getJackpotAmounts() external view returns (uint256 mini, uint256 mega, uint256 superJackpotAmount) {
        return (miniJackpot, megaJackpot, superJackpot);
    }
    
    /**
     * @notice Get comprehensive race result including rewards
     * @param player Player address
     * @param spaceship Player's spaceship
     * @param raceResult Race simulation result
     * @param payout Regular payout amount
     * @param jackpotTier Jackpot tier hit (0-3)
     * @param jackpotAmount Jackpot amount won
     * @return winner Winning spaceship ID
     * @return placements Array of spaceship placements
     * @return totalPayout Total payout amount
     * @return achievementReward Achievement reward amount
     * @return jackpotHit Jackpot tier hit
     * @return jackpotWon Jackpot amount won
     */
    function _formatRaceResult(
        address player,
        uint8 spaceship,
        RaceResult memory raceResult,
        uint256 payout,
        uint8 jackpotTier,
        uint256 jackpotAmount
    ) internal view returns (
        uint8 winner,
        uint8[8] memory placements,
        uint256 totalPayout,
        uint256 achievementReward,
        uint8 jackpotHit,
        uint256 jackpotWon
    ) {
        winner = raceResult.winner;
        placements = raceResult.placements;
        totalPayout = payout;
        achievementReward = 0; // Will be calculated in _checkAchievements
        jackpotHit = jackpotTier;
        jackpotWon = jackpotAmount;
        
        return (winner, placements, totalPayout, achievementReward, jackpotHit, jackpotWon);
    }
    
    /**
     * @notice Record a match in player's history
     * @param player Player address
     * @param raceId Race ID
     * @param shipBet Ship player bet on
     * @param betAmount Amount bet
     * @param placements Race placements array
     * @param totalPayout Total payout including jackpot
     * @param jackpotTier Jackpot tier hit
     * @param jackpotAmount Jackpot amount won
     */
    function _recordMatch(
        address player,
        uint256 raceId,
        uint8 shipBet,
        uint256 betAmount,
        uint8[8] memory placements,
        uint256 totalPayout,
        uint8 jackpotTier,
        uint256 jackpotAmount
    ) internal {
        // Find player's placement
        uint8 placement = 8; // Default to last place
        for (uint8 i = 0; i < 8; i++) {
            if (placements[i] == shipBet) {
                placement = i + 1; // Convert to 1-based placement
                break;
            }
        }
        
        // Create match record
        MatchRecord memory matchRecord = MatchRecord({
            raceId: raceId,
            timestamp: block.timestamp,
            shipBet: shipBet,
            betAmount: betAmount,
            placement: placement,
            payout: totalPayout,
            jackpotTier: jackpotTier,
            jackpotAmount: jackpotAmount
        });
        
        // Add to player's history
        playerMatchHistory[player].push(matchRecord);
        playerMatchCount[player]++;
        
        emit MatchRecorded(player, raceId, placement, totalPayout);
    }
    
    // ==================== USERNAME & AVATAR SYSTEM ====================
    
    /**
     * @notice Register a username and avatar for the calling player
     * @param username Desired username (must be unique and not empty)
     * @param avatarId Avatar ID (0-7)
     */
    function registerUsername(string calldata username, uint8 avatarId) external {
        require(bytes(username).length > 0 && bytes(username).length <= 20, "Username must be 1-20 characters");
        require(avatarId < 8, "Avatar ID must be 0-7");
        require(usernameToAddress[username] == address(0), "Username already taken");
        require(!hasUsername[msg.sender], "Player already has username");
        
        // Register the username and avatar
        playerUsernames[msg.sender] = username;
        usernameToAddress[username] = msg.sender;
        hasUsername[msg.sender] = true;
        playerAvatars[msg.sender] = avatarId;
        hasAvatar[msg.sender] = true;
        
        emit UsernameRegistered(msg.sender, username, avatarId);
    }
    
    /**
     * @notice Get username and avatar for a player address
     * @param player Player address
     * @return username Player's username (empty if not registered)
     * @return avatarId Player's avatar ID (0-7, 255 if not set)
     * @return hasUsernameSet True if player has username
     * @return hasAvatarSet True if player has avatar
     */
    function getPlayerProfile(address player) external view returns (
        string memory username,
        uint8 avatarId,
        bool hasUsernameSet,
        bool hasAvatarSet
    ) {
        return (
            playerUsernames[player],
            hasAvatar[player] ? playerAvatars[player] : 255,
            hasUsername[player],
            hasAvatar[player]
        );
    }
    
    /**
     * @notice Get username for a player address (legacy function)
     * @param player Player address
     * @return username Player's username (empty if not registered)
     */
    function getUsername(address player) external view returns (string memory username) {
        return playerUsernames[player];
    }
    
    /**
     * @notice Get address for a username
     * @param username Username to lookup
     * @return player Player address (zero address if username not found)
     */
    function getAddressByUsername(string calldata username) external view returns (address player) {
        return usernameToAddress[username];
    }
    
    /**
     * @notice Check if player has registered username
     * @param player Player address
     * @return hasRegistered True if player has username
     */
    function playerHasUsername(address player) external view returns (bool hasRegistered) {
        return hasUsername[player];
    }
    
    /**
     * @notice Get avatar ID for a player
     * @param player Player address
     * @return avatarId Player's avatar ID (255 if not set)
     */
    function getPlayerAvatar(address player) external view returns (uint8 avatarId) {
        return hasAvatar[player] ? playerAvatars[player] : 255;
    }
    
    /**
     * @notice Check if player has registered avatar
     * @param player Player address
     * @return hasRegistered True if player has avatar
     */
    function playerHasAvatar(address player) external view returns (bool hasRegistered) {
        return hasAvatar[player];
    }
    
    // ==================== MATCH HISTORY ====================
    
    /**
     * @notice Get player's match history
     * @param player Player address
     * @param offset Starting index (for pagination)
     * @param limit Maximum number of matches to return
     * @return matches Array of match records
     * @return totalMatches Total number of matches for player
     */
    function getPlayerMatchHistory(address player, uint256 offset, uint256 limit) 
        external view returns (MatchRecord[] memory matches, uint256 totalMatches) {
        
        uint256 playerTotal = playerMatchCount[player];
        totalMatches = playerTotal;
        
        if (offset >= playerTotal) {
            return (new MatchRecord[](0), totalMatches);
        }
        
        uint256 end = offset + limit;
        if (end > playerTotal) {
            end = playerTotal;
        }
        
        uint256 returnLength = end - offset;
        matches = new MatchRecord[](returnLength);
        
        // Return most recent matches first (reverse order)
        for (uint256 i = 0; i < returnLength; i++) {
            uint256 index = playerTotal - 1 - offset - i;
            matches[i] = playerMatchHistory[player][index];
        }
        
        return (matches, totalMatches);
    }
    
    /**
     * @notice Get recent matches for a player
     * @param player Player address
     * @param count Number of recent matches to return
     * @return matches Array of recent match records
     */
    function getRecentMatches(address player, uint256 count) external view returns (MatchRecord[] memory matches) {
        uint256 totalMatches = playerMatchCount[player];
        if (totalMatches == 0) {
            return new MatchRecord[](0);
        }
        
        uint256 returnCount = count > totalMatches ? totalMatches : count;
        matches = new MatchRecord[](returnCount);
        
        for (uint256 i = 0; i < returnCount; i++) {
            uint256 index = totalMatches - 1 - i;
            matches[i] = playerMatchHistory[player][index];
        }
        
        return matches;
    }
    
    // ==================== LEADERBOARDS ====================
    
    /**
     * @notice Get top players by total winnings
     * @param limit Maximum number of players to return
     * @return players Array of player addresses
     * @return usernames Array of player usernames
     * @return avatars Array of player avatar IDs (255 if not set)
     * @return winnings Array of total winnings
     */
    function getTopPlayersByWinnings(uint256 limit) external view returns (
        address[] memory players,
        string[] memory usernames,
        uint8[] memory avatars,
        uint256[] memory winnings
    ) {
        // Get actual top players from rankings
        uint256 actualLimit = limit > totalRankedPlayers ? totalRankedPlayers : limit;
        actualLimit = actualLimit > 50 ? 50 : actualLimit; // Cap at 50 for gas efficiency
        
        players = new address[](actualLimit);
        usernames = new string[](actualLimit);
        avatars = new uint8[](actualLimit);
        winnings = new uint256[](actualLimit);
        
        for (uint256 i = 0; i < actualLimit; i++) {
            uint256 rank = i + 1;
            address player = rankToPlayer[rank];
            
            if (player != address(0)) {
                players[i] = player;
                usernames[i] = playerUsernames[player];
                avatars[i] = hasAvatar[player] ? playerAvatars[player] : 255;
                winnings[i] = totalWinnings[player];
            }
        }
        
        return (players, usernames, avatars, winnings);
    }
    
    /**
     * @notice Get player leaderboard stats
     * @param player Player address
     * @return totalWinningsRank Player's rank by total winnings (0 if not ranked)
     * @return firstPlaceCount Number of 1st place finishes
     * @return secondPlaceCount Number of 2nd place finishes  
     * @return thirdPlaceCount Number of 3rd place finishes
     * @return fourthPlaceCount Number of 4th place finishes
     * @return totalJackpots Total jackpot amount won
     * @return totalAchievements Number of achievements unlocked
     */
    function getPlayerLeaderboardStats(address player) external view returns (
        uint256 totalWinningsRank,
        uint256 firstPlaceCount,
        uint256 secondPlaceCount,
        uint256 thirdPlaceCount,
        uint256 fourthPlaceCount,
        uint256 totalJackpots,
        uint256 totalAchievements
    ) {
        // Calculate placement counts across all spaceships
        firstPlaceCount = 0;
        secondPlaceCount = 0;
        thirdPlaceCount = 0;
        fourthPlaceCount = 0;
        
        for (uint8 i = 0; i < 8; i++) {
            firstPlaceCount += spaceshipFirstPlace[player][i];
            secondPlaceCount += spaceshipSecondPlace[player][i];
            thirdPlaceCount += spaceshipThirdPlace[player][i];
            fourthPlaceCount += spaceshipFourthPlace[player][i];
        }
        
        // Get actual rank from leaderboard
        totalWinningsRank = playerRank[player];
        
        // Get total jackpots won
        totalJackpots = totalJackpotsWon[player];
        
        // Get total achievements (use existing achievement count)
        totalAchievements = _getPlayerAchievementsCount(player);
        
        return (
            totalWinningsRank,
            firstPlaceCount,
            secondPlaceCount,
            thirdPlaceCount,
            fourthPlaceCount,
            totalJackpots,
            totalAchievements
        );
    }
    
    /**
     * @notice Get comprehensive player stats including profile info
     * @param player Player address
     * @return username Player's username (empty if not set)
     * @return avatarId Player's avatar ID (255 if not set)
     * @return playerTotalRaces Total races played
     * @return playerTotalWinnings Total winnings earned
     * @return playerBiggestWin Biggest single win
     * @return firstPlaceCount Total 1st place finishes
     * @return secondPlaceCount Total 2nd place finishes
     * @return thirdPlaceCount Total 3rd place finishes
     * @return fourthPlaceCount Total 4th place finishes
     */
    function getPlayerComprehensiveStats(address player) external view returns (
        string memory username,
        uint8 avatarId,
        uint256 playerTotalRaces,
        uint256 playerTotalWinnings,
        uint256 playerBiggestWin,
        uint256 firstPlaceCount,
        uint256 secondPlaceCount,
        uint256 thirdPlaceCount,
        uint256 fourthPlaceCount
    ) {
        // Get profile info
        username = playerUsernames[player];
        avatarId = hasAvatar[player] ? playerAvatars[player] : 255;
        
        // Get basic stats
        playerTotalRaces = totalRaces[player];
        playerTotalWinnings = totalWinnings[player];
        playerBiggestWin = biggestWin[player];
        
        // Calculate placement counts across all spaceships
        firstPlaceCount = 0;
        secondPlaceCount = 0;
        thirdPlaceCount = 0;
        fourthPlaceCount = 0;
        
        for (uint8 i = 0; i < 8; i++) {
            firstPlaceCount += spaceshipFirstPlace[player][i];
            secondPlaceCount += spaceshipSecondPlace[player][i];
            thirdPlaceCount += spaceshipThirdPlace[player][i];
            fourthPlaceCount += spaceshipFourthPlace[player][i];
        }
        
        return (
            username,
            avatarId,
            playerTotalRaces,
            playerTotalWinnings,
            playerBiggestWin,
            firstPlaceCount,
            secondPlaceCount,
            thirdPlaceCount,
            fourthPlaceCount
        );
    }
    
    /**
     * @notice Get leaderboard statistics
     * @return totalPlayers Total number of ranked players
     * @return gameTotalVolume Total betting volume
     * @return totalJackpotsPaid Total jackpots paid out
     */
    function getLeaderboardStats() external view returns (
        uint256 totalPlayers,
        uint256 gameTotalVolume,
        uint256 totalJackpotsPaid
    ) {
        return (totalRankedPlayers, totalVolume, 0); // Total jackpots paid would need separate tracking
    }
    
    /**
     * @notice Get player's rank and surrounding players
     * @param player Player address
     * @param context Number of players to return around the target player
     * @return players Array of player addresses
     * @return usernames Array of player usernames
     * @return avatars Array of player avatar IDs
     * @return winnings Array of total winnings
     * @return ranks Array of player ranks
     */
    function getPlayerRankContext(address player, uint256 context) external view returns (
        address[] memory players,
        string[] memory usernames,
        uint8[] memory avatars,
        uint256[] memory winnings,
        uint256[] memory ranks
    ) {
        uint256 playerRankNum = playerRank[player];
        if (playerRankNum == 0) {
            // Player not ranked, return empty arrays
            return (new address[](0), new string[](0), new uint8[](0), new uint256[](0), new uint256[](0));
        }
        
        uint256 startRank = playerRankNum > context ? playerRankNum - context : 1;
        uint256 endRank = playerRankNum + context;
        if (endRank > totalRankedPlayers) {
            endRank = totalRankedPlayers;
        }
        
        uint256 arraySize = endRank - startRank + 1;
        players = new address[](arraySize);
        usernames = new string[](arraySize);
        avatars = new uint8[](arraySize);
        winnings = new uint256[](arraySize);
        ranks = new uint256[](arraySize);
        
        uint256 index = 0;
        for (uint256 rank = startRank; rank <= endRank; rank++) {
            address rankedPlayer = rankToPlayer[rank];
            if (rankedPlayer != address(0)) {
                players[index] = rankedPlayer;
                usernames[index] = playerUsernames[rankedPlayer];
                avatars[index] = hasAvatar[rankedPlayer] ? playerAvatars[rankedPlayer] : 255;
                winnings[index] = totalWinnings[rankedPlayer];
                ranks[index] = rank;
                index++;
            }
        }
        
        return (players, usernames, avatars, winnings, ranks);
    }
}