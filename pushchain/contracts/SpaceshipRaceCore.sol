// SPDX-License-Identifier: MIT
pragma solidity 0.8.23;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./ShipConfiguration.sol";
import "./ChaosManager.sol";
import "./IPlayerStatsManager.sol";
import "./IPlayerProfileManager.sol";
import "./IAchievementManager.sol";

/**
 * @title SpaceshipRaceCore
 * @notice Core racing logic for single-player spaceship racing casino
 * @dev Orchestrates race simulation and delegates to specialized managers
 */
contract SpaceshipRaceCore is ReentrancyGuard, Ownable {
    // Immutable contracts
    IERC20 public immutable spiralToken;
    ShipConfiguration public immutable shipConfig;
    ChaosManager public immutable chaosManager;
    IPlayerStatsManager public immutable statsManager;
    IPlayerProfileManager public immutable profileManager;
    IAchievementManager public immutable achievementManager;
    
    // Race simulation constants
    uint256 public constant TRACK_DISTANCE = 1000;
    uint256 public constant RACE_TURNS = 10;
    uint256 public constant NUM_SHIPS = 8;
    
    // Chaos event types
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
    
    // Betting limits
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
    uint256 public totalRaces;
    
    // Race structures
    struct RaceTurnEvent {
        uint8 turn;
        uint8 shipId;
        uint256 moveAmount;
        uint256 distance;
        uint8 chaosEventType;
        uint8 targetShipId;
    }
    
    struct RaceResult {
        uint8 winner;
        uint8[8] placements;
        RaceTurnEvent[] turnEvents;
        uint256 totalEvents;
    }
    
    struct ShipState {
        uint8 id;
        uint256 currentSpeed;
        uint256 distance;
        uint256 finalTurn;
    }
    
    // Race betting data
    struct RaceInfo {
        bool isActive;
        uint256 totalBets;
        uint256[8] shipBets;
        uint256 timestamp;
    }
    
    struct PlayerBet {
        uint8 spaceship;
        uint256 amount;
        bool claimed;
    }
    
    // Storage
    mapping(uint256 => RaceInfo) public raceInfo;
    mapping(uint256 => mapping(uint8 => uint256)) public shipBets;
    mapping(address => mapping(uint256 => PlayerBet)) public playerBets;
    RaceResult public lastRaceResult;
    
    // Events
    event BetPlaced(address indexed player, uint8 spaceship, uint256 amount, uint8 winner, uint256 payout, uint8 jackpotTier);
    event RaceCompleted(address indexed player, uint8 winner, uint8[8] placements, uint256 totalEvents);
    event JackpotHit(address indexed player, uint8 tier, uint256 amount);
    
    constructor(
        address _spiralToken,
        address _shipConfig,
        address _chaosManager,
        address _statsManager,
        address _profileManager,
        address _achievementManager
    ) Ownable(msg.sender) {
        spiralToken = IERC20(_spiralToken);
        shipConfig = ShipConfiguration(_shipConfig);
        chaosManager = ChaosManager(_chaosManager);
        statsManager = IPlayerStatsManager(_statsManager);
        profileManager = IPlayerProfileManager(_profileManager);
        achievementManager = IAchievementManager(_achievementManager);
    }
    
    /**
     * @notice Place bet and run race simulation
     */
    function placeBet(uint8 spaceship, uint256 amount) external nonReentrant returns (RaceResult memory raceResult) {
        require(spaceship < NUM_SHIPS, "Invalid spaceship");
        require(amount >= MIN_BET && amount <= MAX_BET, "Invalid bet amount");
        require(spiralToken.transferFrom(msg.sender, address(this), amount), "Transfer failed");
        
        // Record bet
        playerBets[msg.sender][currentRaceId] = PlayerBet({
            spaceship: spaceship,
            amount: amount,
            claimed: false
        });
        
        // Update race info
        raceInfo[currentRaceId].isActive = true;
        raceInfo[currentRaceId].totalBets += amount;
        raceInfo[currentRaceId].shipBets[spaceship] += amount;
        raceInfo[currentRaceId].timestamp = block.timestamp;
        shipBets[currentRaceId][spaceship] += amount;
        
        // Update global stats
        totalVolume += amount;
        totalRaces++;
        
        // Simulate race
        raceResult = _simulateRace(spaceship);
        lastRaceResult = raceResult;
        
        // Calculate payout and jackpot
        uint256 payout = 0;
        uint8 jackpotTier = JACKPOT_TIER_NONE;
        uint256 jackpotAmount = 0;
        
        uint8 placement = _getPlacement(spaceship, raceResult.placements);
        
        if (placement <= 4) { // Top 4 get payout
            payout = _calculatePayout(amount, placement);
            (jackpotTier, jackpotAmount) = _checkJackpot(amount, placement);
            
            if (payout > 0) {
                require(spiralToken.transfer(msg.sender, payout), "Payout failed");
            }
            
            if (jackpotAmount > 0) {
                require(spiralToken.transfer(msg.sender, jackpotAmount), "Jackpot failed");
                _deductJackpot(jackpotTier, jackpotAmount);
                emit JackpotHit(msg.sender, jackpotTier, jackpotAmount);
            }
        }
        
        // Update jackpots
        _updateJackpots(amount);
        
        // Get current player stats for achievements
        (uint256 totalPlayerRaces, uint256 totalWinnings, uint256 biggestWin,,) = statsManager.getPlayerStats(msg.sender);
        
        // Update all managers
        statsManager.updatePlayerStats(msg.sender, amount, payout, placement, jackpotTier, jackpotAmount, spaceship);
        profileManager.recordMatch(msg.sender, currentRaceId, spaceship, amount, placement, payout, jackpotTier, jackpotAmount);
        achievementManager.checkAndMintAchievements(msg.sender, placement, amount, payout, spaceship, totalPlayerRaces + 1, totalWinnings + payout, biggestWin > payout ? biggestWin : payout);
        
        // Emit events
        emit BetPlaced(msg.sender, spaceship, amount, raceResult.winner, payout, jackpotTier);
        emit RaceCompleted(msg.sender, raceResult.winner, raceResult.placements, raceResult.totalEvents);
        
        // Increment race ID
        currentRaceId++;
        
        return raceResult;
    }
    
    /**
     * @notice Simulate race with chaos events
     */
    function _simulateRace(uint8 playerSpaceship) internal returns (RaceResult memory) {
        ShipState[NUM_SHIPS] memory raceState;
        RaceTurnEvent[] memory turnEvents = new RaceTurnEvent[](RACE_TURNS * NUM_SHIPS);
        uint256 eventCount = 0;
        
        // Initialize ships
        for (uint8 i = 0; i < NUM_SHIPS; i++) {
            ShipConfiguration.ShipStats memory stats = shipConfig.getShipStats(i);
            raceState[i] = ShipState({
                id: i,
                currentSpeed: stats.initialSpeed,
                distance: 0,
                finalTurn: 0
            });
        }
        
        // Run race simulation
        for (uint8 turn = 1; turn <= RACE_TURNS; turn++) {
            for (uint8 shipIndex = 0; shipIndex < NUM_SHIPS; shipIndex++) {
                if (raceState[shipIndex].finalTurn > 0) continue; // Already finished
                
                uint256 currentSpeed = raceState[shipIndex].currentSpeed;
                
                // Apply chaos effects
                (uint256 modifiedSpeed, uint8 eventType) = chaosManager.applyChaosEffect(
                    shipIndex, turn, currentSpeed, currentRaceId, msg.sender
                );
                
                raceState[shipIndex].currentSpeed = modifiedSpeed;
                raceState[shipIndex].distance += modifiedSpeed;
                
                // Record event
                if (eventCount < turnEvents.length) {
                    turnEvents[eventCount] = RaceTurnEvent({
                        turn: turn,
                        shipId: shipIndex,
                        moveAmount: modifiedSpeed,
                        distance: raceState[shipIndex].distance,
                        chaosEventType: eventType,
                        targetShipId: 0
                    });
                    eventCount++;
                }
                
                // Check if finished
                if (raceState[shipIndex].distance >= TRACK_DISTANCE && raceState[shipIndex].finalTurn == 0) {
                    raceState[shipIndex].finalTurn = turn * 1000 + ((raceState[shipIndex].distance - TRACK_DISTANCE) * 1000) / modifiedSpeed;
                }
            }
        }
        
        // Determine placements
        uint8[NUM_SHIPS] memory placements = _calculatePlacements(raceState);
        
        // Trim events array
        RaceTurnEvent[] memory finalEvents = new RaceTurnEvent[](eventCount);
        for (uint256 i = 0; i < eventCount; i++) {
            finalEvents[i] = turnEvents[i];
        }
        
        return RaceResult({
            winner: placements[0],
            placements: placements,
            turnEvents: finalEvents,
            totalEvents: eventCount
        });
    }
    
    /**
     * @notice Calculate race placements based on finish times
     */
    function _calculatePlacements(ShipState[NUM_SHIPS] memory raceState) internal pure returns (uint8[NUM_SHIPS] memory) {
        uint8[NUM_SHIPS] memory placements;
        uint256[NUM_SHIPS] memory finishTimes;
        
        // Get finish times (lower is better)
        for (uint8 i = 0; i < NUM_SHIPS; i++) {
            if (raceState[i].finalTurn > 0) {
                finishTimes[i] = raceState[i].finalTurn;
            } else {
                finishTimes[i] = type(uint256).max; // Didn't finish
            }
        }
        
        // Sort by finish time
        for (uint8 pos = 0; pos < NUM_SHIPS; pos++) {
            uint8 bestShip = 0;
            uint256 bestTime = type(uint256).max;
            
            for (uint8 i = 0; i < NUM_SHIPS; i++) {
                if (finishTimes[i] < bestTime) {
                    bestTime = finishTimes[i];
                    bestShip = i;
                }
            }
            
            placements[pos] = bestShip;
            finishTimes[bestShip] = type(uint256).max; // Remove from consideration
        }
        
        return placements;
    }
    
    /**
     * @notice Get placement of specific spaceship
     */
    function _getPlacement(uint8 spaceship, uint8[NUM_SHIPS] memory placements) internal pure returns (uint8) {
        for (uint8 i = 0; i < NUM_SHIPS; i++) {
            if (placements[i] == spaceship) {
                return i + 1; // 1-based placement
            }
        }
        return uint8(NUM_SHIPS); // Should never happen
    }
    
    /**
     * @notice Calculate payout based on placement
     */
    function _calculatePayout(uint256 betAmount, uint8 placement) internal pure returns (uint256) {
        if (placement == 1) return (betAmount * 400) / 100;  // 4X
        if (placement == 2) return (betAmount * 250) / 100;  // 2.5X
        if (placement == 3) return (betAmount * 150) / 100;  // 1.5X
        if (placement == 4) return (betAmount * 110) / 100;  // 1.1X
        return 0;
    }
    
    /**
     * @notice Check for jackpot win
     */
    function _checkJackpot(uint256 betAmount, uint8 placement) internal view returns (uint8 tier, uint256 amount) {
        if (placement != 1) return (JACKPOT_TIER_NONE, 0);
        
        uint256 randomValue = uint256(keccak256(abi.encodePacked(
            block.timestamp, block.prevrandao, msg.sender, betAmount
        ))) % 1000;
        
        if (randomValue < SUPER_JACKPOT_CHANCE && superJackpot > 0) {
            return (JACKPOT_TIER_SUPER, superJackpot);
        } else if (randomValue < MEGA_JACKPOT_CHANCE && megaJackpot > 0) {
            return (JACKPOT_TIER_MEGA, megaJackpot);
        } else if (randomValue < MINI_JACKPOT_CHANCE && miniJackpot > 0) {
            return (JACKPOT_TIER_MINI, miniJackpot);
        }
        
        return (JACKPOT_TIER_NONE, 0);
    }
    
    /**
     * @notice Update jackpot pools
     */
    function _updateJackpots(uint256 betAmount) internal {
        uint256 houseAmount = (betAmount * HOUSE_EDGE) / 100;
        uint256 jackpotContribution = houseAmount / 3; // Split house edge among 3 jackpots
        
        miniJackpot += jackpotContribution;
        megaJackpot += jackpotContribution;
        superJackpot += jackpotContribution;
    }
    
    /**
     * @notice Deduct jackpot amount after win
     */
    function _deductJackpot(uint8 tier, uint256 amount) internal {
        if (tier == JACKPOT_TIER_MINI) {
            miniJackpot = miniJackpot > amount ? miniJackpot - amount : 0;
        } else if (tier == JACKPOT_TIER_MEGA) {
            megaJackpot = megaJackpot > amount ? megaJackpot - amount : 0;
        } else if (tier == JACKPOT_TIER_SUPER) {
            superJackpot = superJackpot > amount ? superJackpot - amount : 0;
        }
    }
    
    // View functions
    function getGameStats() external view returns (
        uint256 gameCurrentRace,
        uint256 gameTotalRaces,
        uint256 gameTotalVolume,
        uint256 gameMiniJackpot,
        uint256 gameMegaJackpot,
        uint256 gameSuperJackpot
    ) {
        return (currentRaceId, totalRaces, totalVolume, miniJackpot, megaJackpot, superJackpot);
    }
    
    function getJackpotAmounts() external view returns (uint256 mini, uint256 mega, uint256 superJackpotAmount) {
        return (miniJackpot, megaJackpot, superJackpot);
    }
    
    function getShipBets(uint256 raceId) external view returns (uint256[8] memory shipBetsArray) {
        return raceInfo[raceId].shipBets;
    }
    
    function getPlayerBets(address player, uint256 raceId) external view returns (
        uint8 spaceship,
        uint256 amount,
        bool claimed
    ) {
        PlayerBet memory bet = playerBets[player][raceId];
        return (bet.spaceship, bet.amount, bet.claimed);
    }
    
    function debugRaceSimulation() external view returns (RaceResult memory raceResult) {
        return lastRaceResult;
    }
    
    // Admin functions
    function withdrawFees(uint256 amount) external onlyOwner {
        require(spiralToken.transfer(owner(), amount), "Withdrawal failed");
    }
    
    function emergencyWithdraw() external onlyOwner {
        uint256 balance = spiralToken.balanceOf(address(this));
        require(spiralToken.transfer(owner(), balance), "Emergency withdrawal failed");
    }
}
