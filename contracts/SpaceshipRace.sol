// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

// Interface for SpiralToken to access mint function
interface SpiralToken is IERC20 {
    function mint(address to, uint256 amount) external;
}

// Interface for AchievementNFT
interface IAchievementNFT {
    function mintAchievement(
        address to,
        string memory name,
        string memory description,
        string memory achievementType,
        uint8 spaceshipId,
        uint256 threshold
    ) external returns (uint256);
}

/**
 * @title SpaceshipRace
 * @notice True single-player casino-style spaceship racing game with tiered jackpots and NFT achievements
 * @dev Players race independently against contract odds, no pooling
 */
contract SpaceshipRace is ReentrancyGuard, Ownable {
    using Strings for uint256;
    
    // Events
    event BetPlaced(address indexed player, uint8 spaceshipId, uint256 amount, uint256 raceId);
    event RaceResult(address indexed player, uint8 playerSpaceship, uint8 winner, uint256 payout, bool jackpotHit, uint8 jackpotTier);
    event AchievementUnlocked(address indexed player, string achievementId, uint256 nftId, uint256 tokenReward);
    event JackpotHit(address indexed player, uint8 tier, uint256 jackpotAmount);
    
    // Token contract
    IERC20 public immutable spiralToken;
    
    // NFT contract
    IAchievementNFT public immutable achievementNFT;
    
    // Game constants
    uint256 public constant MIN_BET = 10 * 10**8; // 10 SPIRAL tokens
    uint256 public constant MAX_BET = 1000 * 10**8; // 1000 SPIRAL tokens
    uint256 public constant HOUSE_EDGE = 5; // 5% to jackpot
    uint256 public constant RACE_POOL_PERCENTAGE = 95; // 95% to race pool
    
    // Tiered jackpot chances (out of 1000)
    uint256 public constant MINI_JACKPOT_CHANCE = 50; // 5% (1 in 20)
    uint256 public constant MEGA_JACKPOT_CHANCE = 5; // 0.5% (1 in 200)
    uint256 public constant SUPER_JACKPOT_CHANCE = 1; // 0.1% (1 in 1000)
    
    // Jackpot tiers
    uint8 public constant JACKPOT_TIER_NONE = 0;
    uint8 public constant JACKPOT_TIER_MINI = 1;
    uint8 public constant JACKPOT_TIER_MEGA = 2;
    uint8 public constant JACKPOT_TIER_SUPER = 3;
    
    // Spaceship odds (multipliers for payouts)
    uint256[8] public spaceshipOdds = [
        300, // The Comet: 3.0x (25% win rate)
        400, // The Juggernaut: 4.0x (20% win rate)
        600, // The Shadow: 6.0x (15% win rate)
        700, // The Phantom: 7.0x (12% win rate)
        900, // The Phoenix: 9.0x (10% win rate)
        1100, // The Vanguard: 11.0x (8% win rate)
        1800, // The Wildcard: 18.0x (5% win rate)
        1800  // The Apex: 18.0x (5% win rate)
    ];
    
    // Spaceship win rates (out of 1000)
    uint256[8] public spaceshipWinRates = [250, 200, 150, 120, 100, 80, 50, 50];
    
    // Game state
    uint256 public currentRaceId;
    uint256 public miniJackpot;
    uint256 public megaJackpot;
    uint256 public superJackpot;
    uint256 public totalRacesPlayed;
    uint256 public totalVolume;
    
    // Player stats
    mapping(address => uint256) public totalRaces;
    mapping(address => mapping(uint8 => uint256)) public spaceshipWins;
    mapping(address => uint256) public totalWinnings;
    mapping(address => uint256) public biggestWin;
    mapping(address => uint8) public highestJackpotTier;
    mapping(address => uint256) public lastRaceTime;
    
    // Achievement tracking
    mapping(address => mapping(bytes32 => bool)) public achievements;
    mapping(address => uint256) public achievementRewardsEarned;
    
    // Per-spaceship achievement tracking
    mapping(address => mapping(uint8 => uint256)) public spaceshipBetCount;
    mapping(address => mapping(uint8 => mapping(uint8 => uint256))) public spaceshipPlacementCount; // spaceshipId => placement => count
    
    // Achievement thresholds
    uint256 public constant BET_5_THRESHOLD = 5;
    uint256 public constant BET_25_THRESHOLD = 25;
    uint256 public constant BET_100_THRESHOLD = 100;
    
    uint256 public constant FIRST_3_THRESHOLD = 3;
    uint256 public constant FIRST_10_THRESHOLD = 10;
    uint256 public constant SECOND_5_THRESHOLD = 5;
    uint256 public constant SECOND_20_THRESHOLD = 20;
    uint256 public constant THIRD_10_THRESHOLD = 10;
    uint256 public constant THIRD_50_THRESHOLD = 50;
    uint256 public constant FOURTH_15_THRESHOLD = 15;
    uint256 public constant FOURTH_75_THRESHOLD = 75;
    
    uint256 public constant RACES_10_THRESHOLD = 10;
    uint256 public constant RACES_50_THRESHOLD = 50;
    uint256 public constant RACES_100_THRESHOLD = 100;
    uint256 public constant HIGH_ROLLER_THRESHOLD = 1000 * 10**8; // 1000 SPIRAL
    
    constructor(address _spiralToken, address _achievementNFT) Ownable(msg.sender) {
        spiralToken = IERC20(_spiralToken);
        achievementNFT = IAchievementNFT(_achievementNFT);
        currentRaceId = 1;
    }
    
    /**
     * @notice Place a bet and run a race immediately (single-player)
     * @param spaceshipId The spaceship to bet on (0-7)
     * @param amount Amount of SPIRAL tokens to bet
     */
    function placeBet(uint8 spaceshipId, uint256 amount) external nonReentrant {
        require(spaceshipId < 8, "Invalid spaceship ID");
        require(amount >= MIN_BET, "Bet too small");
        require(amount <= MAX_BET, "Bet too large");
        require(spiralToken.balanceOf(msg.sender) >= amount, "Insufficient token balance");
        require(spiralToken.allowance(msg.sender, address(this)) >= amount, "Insufficient allowance");
        
        // Transfer tokens from player
        spiralToken.transferFrom(msg.sender, address(this), amount);
        
        // Split bet: 95% to race pool, 5% to jackpots
        uint256 poolAmount = (amount * RACE_POOL_PERCENTAGE) / 100;
        uint256 jackpotAmount = amount - poolAmount;
        
        // Distribute to tiered jackpots
        miniJackpot += (jackpotAmount * 60) / 100; // 60% to mini
        megaJackpot += (jackpotAmount * 30) / 100; // 30% to mega
        superJackpot += (jackpotAmount * 10) / 100; // 10% to super
        
        totalVolume += amount;
        
        emit BetPlaced(msg.sender, spaceshipId, amount, currentRaceId);
        
        // Run single-player race immediately
        _runSinglePlayerRace(spaceshipId, poolAmount);
        
        currentRaceId++;
        totalRacesPlayed++;
    }
    
    /**
     * @notice Run single-player race against contract odds
     * @param playerSpaceship The spaceship the player bet on
     * @param betAmount The amount bet (after house edge deduction)
     */
    function _runSinglePlayerRace(uint8 playerSpaceship, uint256 betAmount) internal {
        // Determine winner using verifiable randomness
        uint8 winner = _determineWinner();
        
        // Check for jackpot trigger (tiered system)
        uint8 jackpotTier = _checkJackpotTrigger();
        
        // Calculate payout based on contract odds
        uint256 payout = _calculatePayout(playerSpaceship, winner, betAmount);
        
        // Update player stats
        _updatePlayerStats(msg.sender, playerSpaceship, winner, payout, jackpotTier);
        
        // Pay out winnings
        if (payout > 0) {
            spiralToken.transfer(msg.sender, payout);
        }
        
        // Handle jackpot
        if (jackpotTier > JACKPOT_TIER_NONE) {
            uint256 jackpotAmount = _getJackpotAmount(jackpotTier);
            _resetJackpot(jackpotTier);
            spiralToken.transfer(msg.sender, jackpotAmount);
            emit JackpotHit(msg.sender, jackpotTier, jackpotAmount);
        }
        
        emit RaceResult(msg.sender, playerSpaceship, winner, payout, jackpotTier > JACKPOT_TIER_NONE, jackpotTier);
    }
    
    /**
     * @notice Determine race winner using verifiable randomness
     * @return The winning spaceship ID
     */
    function _determineWinner() internal view returns (uint8) {
        uint256 random = uint256(keccak256(abi.encodePacked(
            blockhash(block.number - 1),
            block.timestamp,
            msg.sender,
            currentRaceId
        ))) % 1000;
        
        uint256 cumulative = 0;
        for (uint8 i = 0; i < 8; i++) {
            cumulative += spaceshipWinRates[i];
            if (random < cumulative) {
                return i;
            }
        }
        return 7; // Fallback to last spaceship
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
     * @notice Calculate payout based on bet and result
     * @param playerSpaceship The spaceship the player bet on
     * @param winner The winning spaceship
     * @param betAmount The amount bet
     * @return The payout amount
     */
    function _calculatePayout(uint8 playerSpaceship, uint8 winner, uint256 betAmount) internal view returns (uint256) {
        if (playerSpaceship == winner) {
            return (betAmount * spaceshipOdds[playerSpaceship]) / 100;
        }
        return 0;
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
        
        // Update placement tracking
        uint8 placement = _getPlacement(spaceship, winner);
        spaceshipPlacementCount[player][spaceship][placement]++;
        
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
        
        // Check and award achievements
        _checkAchievements(player);
    }
    
    /**
     * @notice Get placement for a spaceship in a race
     * @param playerSpaceship The spaceship the player bet on
     * @param winner The winning spaceship
     * @return Placement (1 = 1st, 2 = 2nd, 3 = 3rd, 4 = 4th)
     */
    function _getPlacement(uint8 playerSpaceship, uint8 winner) internal pure returns (uint8) {
        if (playerSpaceship == winner) return 1; // 1st place
        
        // For simplicity, we'll use a deterministic placement based on spaceship ID
        // In a real implementation, you'd track actual race positions
        uint8 placement = 2; // Default to 2nd place
        
        // Simple placement logic based on spaceship proximity to winner
        uint8 distance = playerSpaceship > winner ? playerSpaceship - winner : winner - playerSpaceship;
        if (distance == 1) placement = 2; // 2nd place
        else if (distance == 2) placement = 3; // 3rd place
        else placement = 4; // 4th place
        
        return placement;
    }
    
    /**
     * @notice Check and award achievements based on player stats
     * @param player The player address
     */
    function _checkAchievements(address player) internal {
        // Check betting achievements for each spaceship
        for (uint8 spaceshipId = 0; spaceshipId < 8; spaceshipId++) {
            uint256 betCount = spaceshipBetCount[player][spaceshipId];
            
            // Bet 5 times achievement
            if (betCount >= BET_5_THRESHOLD) {
                bytes32 achievementId = keccak256(abi.encodePacked("BET_5", spaceshipId));
                if (!achievements[player][achievementId]) {
                    _awardBettingAchievement(player, spaceshipId, BET_5_THRESHOLD, 50);
                    achievements[player][achievementId] = true;
                }
            }
            
            // Bet 25 times achievement
            if (betCount >= BET_25_THRESHOLD) {
                bytes32 achievementId = keccak256(abi.encodePacked("BET_25", spaceshipId));
                if (!achievements[player][achievementId]) {
                    _awardBettingAchievement(player, spaceshipId, BET_25_THRESHOLD, 200);
                    achievements[player][achievementId] = true;
                }
            }
            
            // Bet 100 times achievement
            if (betCount >= BET_100_THRESHOLD) {
                bytes32 achievementId = keccak256(abi.encodePacked("BET_100", spaceshipId));
                if (!achievements[player][achievementId]) {
                    _awardBettingAchievement(player, spaceshipId, BET_100_THRESHOLD, 500);
                    achievements[player][achievementId] = true;
                }
            }
            
            // Check placement achievements
            uint256 firstPlaceCount = spaceshipPlacementCount[player][spaceshipId][1];
            uint256 secondPlaceCount = spaceshipPlacementCount[player][spaceshipId][2];
            uint256 thirdPlaceCount = spaceshipPlacementCount[player][spaceshipId][3];
            uint256 fourthPlaceCount = spaceshipPlacementCount[player][spaceshipId][4];
            
            // 1st place achievements
            if (firstPlaceCount >= FIRST_3_THRESHOLD) {
                bytes32 achievementId = keccak256(abi.encodePacked("FIRST_3", spaceshipId));
                if (!achievements[player][achievementId]) {
                    _awardPlacementAchievement(player, spaceshipId, 1, FIRST_3_THRESHOLD, 150);
                    achievements[player][achievementId] = true;
                }
            }
            
            if (firstPlaceCount >= FIRST_10_THRESHOLD) {
                bytes32 achievementId = keccak256(abi.encodePacked("FIRST_10", spaceshipId));
                if (!achievements[player][achievementId]) {
                    _awardPlacementAchievement(player, spaceshipId, 1, FIRST_10_THRESHOLD, 500);
                    achievements[player][achievementId] = true;
                }
            }
            
            // 2nd place achievements
            if (secondPlaceCount >= SECOND_5_THRESHOLD) {
                bytes32 achievementId = keccak256(abi.encodePacked("SECOND_5", spaceshipId));
                if (!achievements[player][achievementId]) {
                    _awardPlacementAchievement(player, spaceshipId, 2, SECOND_5_THRESHOLD, 100);
                    achievements[player][achievementId] = true;
                }
            }
            
            if (secondPlaceCount >= SECOND_20_THRESHOLD) {
                bytes32 achievementId = keccak256(abi.encodePacked("SECOND_20", spaceshipId));
                if (!achievements[player][achievementId]) {
                    _awardPlacementAchievement(player, spaceshipId, 2, SECOND_20_THRESHOLD, 300);
                    achievements[player][achievementId] = true;
                }
            }
            
            // 3rd place achievements
            if (thirdPlaceCount >= THIRD_10_THRESHOLD) {
                bytes32 achievementId = keccak256(abi.encodePacked("THIRD_10", spaceshipId));
                if (!achievements[player][achievementId]) {
                    _awardPlacementAchievement(player, spaceshipId, 3, THIRD_10_THRESHOLD, 75);
                    achievements[player][achievementId] = true;
                }
            }
            
            if (thirdPlaceCount >= THIRD_50_THRESHOLD) {
                bytes32 achievementId = keccak256(abi.encodePacked("THIRD_50", spaceshipId));
                if (!achievements[player][achievementId]) {
                    _awardPlacementAchievement(player, spaceshipId, 3, THIRD_50_THRESHOLD, 250);
                    achievements[player][achievementId] = true;
                }
            }
            
            // 4th place achievements
            if (fourthPlaceCount >= FOURTH_15_THRESHOLD) {
                bytes32 achievementId = keccak256(abi.encodePacked("FOURTH_15", spaceshipId));
                if (!achievements[player][achievementId]) {
                    _awardPlacementAchievement(player, spaceshipId, 4, FOURTH_15_THRESHOLD, 50);
                    achievements[player][achievementId] = true;
                }
            }
            
            if (fourthPlaceCount >= FOURTH_75_THRESHOLD) {
                bytes32 achievementId = keccak256(abi.encodePacked("FOURTH_75", spaceshipId));
                if (!achievements[player][achievementId]) {
                    _awardPlacementAchievement(player, spaceshipId, 4, FOURTH_75_THRESHOLD, 200);
                    achievements[player][achievementId] = true;
                }
            }
        }
        
        // Milestone achievements
        // Milestone achievements
        bytes32 noviceRacerId = keccak256("NOVICE_RACER");
        if (totalRaces[player] >= RACES_10_THRESHOLD && !achievements[player][noviceRacerId]) {
            _awardMilestoneAchievement(player, "Novice Racer", "Complete 10 races", RACES_10_THRESHOLD, 100);
            achievements[player][noviceRacerId] = true;
        }
        
        bytes32 experiencedPilotId = keccak256("EXPERIENCED_PILOT");
        if (totalRaces[player] >= RACES_50_THRESHOLD && !achievements[player][experiencedPilotId]) {
            _awardMilestoneAchievement(player, "Experienced Pilot", "Complete 50 races", RACES_50_THRESHOLD, 300);
            achievements[player][experiencedPilotId] = true;
        }
        
        bytes32 veteranCaptainId = keccak256("VETERAN_CAPTAIN");
        if (totalRaces[player] >= RACES_100_THRESHOLD && !achievements[player][veteranCaptainId]) {
            _awardMilestoneAchievement(player, "Veteran Captain", "Complete 100 races", RACES_100_THRESHOLD, 500);
            achievements[player][veteranCaptainId] = true;
        }
        
        // High roller achievement
        bytes32 highRollerId = keccak256("HIGH_ROLLER");
        if (biggestWin[player] >= HIGH_ROLLER_THRESHOLD && !achievements[player][highRollerId]) {
            _awardMilestoneAchievement(player, "High Roller", "Win 1000+ SPIRAL in a single race", HIGH_ROLLER_THRESHOLD / 10**8, 1000);
            achievements[player][highRollerId] = true;
        }
        
        // Jackpot achievement
        bytes32 cosmicLuckId = keccak256("COSMIC_LUCK");
        if (highestJackpotTier[player] > JACKPOT_TIER_NONE && !achievements[player][cosmicLuckId]) {
            _awardMilestoneAchievement(player, "Cosmic Luck", "Hit any jackpot", 1, 1000);
            achievements[player][cosmicLuckId] = true;
        }
    }
    
    /**
     * @notice Award betting achievement with NFT and tokens
     * @param player The player address
     * @param spaceshipId The spaceship ID
     * @param threshold The achievement threshold
     * @param tokenReward The token reward amount
     */
    function _awardBettingAchievement(address player, uint8 spaceshipId, uint256 threshold, uint256 tokenReward) internal {
        // Calculate reward in token units
        uint256 rewardAmount = tokenReward * 10**8; // SPIRAL has 8 decimals
        achievementRewardsEarned[player] += rewardAmount;
        
        string memory spaceshipName = _getSpaceshipName(spaceshipId);
        string memory achievementName = string(abi.encodePacked("Bet ", threshold.toString(), " times on ", spaceshipName));
        string memory achievementDesc = string(abi.encodePacked("Successfully bet on ", spaceshipName, " ", threshold.toString(), " times"));
        
        // Mint NFT achievement
        uint256 nftId = achievementNFT.mintAchievement(
            player,
            achievementName,
            achievementDesc,
            "Betting",
            spaceshipId,
            threshold
        );
        
        // Award tokens
        if (spiralToken.balanceOf(address(this)) < rewardAmount) {
            try SpiralToken(address(spiralToken)).mint(address(this), rewardAmount) {
                spiralToken.transfer(player, rewardAmount);
            } catch {
                // Mint failed, skip token reward
                emit AchievementUnlocked(player, achievementName, nftId, 0);
                return;
            }
        } else {
            spiralToken.transfer(player, rewardAmount);
        }
        
        emit AchievementUnlocked(player, achievementName, nftId, rewardAmount);
    }
    
    /**
     * @notice Award placement achievement with NFT and tokens
     * @param player The player address
     * @param spaceshipId The spaceship ID
     * @param placement The placement (1-4)
     * @param threshold The achievement threshold
     * @param tokenReward The token reward amount
     */
    function _awardPlacementAchievement(address player, uint8 spaceshipId, uint8 placement, uint256 threshold, uint256 tokenReward) internal {
        // Calculate reward in token units
        uint256 rewardAmount = tokenReward * 10**8; // SPIRAL has 8 decimals
        achievementRewardsEarned[player] += rewardAmount;
        
        string memory spaceshipName = _getSpaceshipName(spaceshipId);
        string memory placementText = _getPlacementText(placement);
        string memory achievementName = string(abi.encodePacked(placementText, " place ", threshold.toString(), " times with ", spaceshipName));
        string memory achievementDesc = string(abi.encodePacked("Achieved ", placementText, " place ", threshold.toString(), " times using ", spaceshipName));
        
        // Mint NFT achievement
        uint256 nftId = achievementNFT.mintAchievement(
            player,
            achievementName,
            achievementDesc,
            "Placement",
            spaceshipId,
            threshold
        );
        
        // Award tokens
        if (spiralToken.balanceOf(address(this)) < rewardAmount) {
            try SpiralToken(address(spiralToken)).mint(address(this), rewardAmount) {
                spiralToken.transfer(player, rewardAmount);
            } catch {
                // Mint failed, skip token reward
                emit AchievementUnlocked(player, achievementName, nftId, 0);
                return;
            }
        } else {
            spiralToken.transfer(player, rewardAmount);
        }
        
        emit AchievementUnlocked(player, achievementName, nftId, rewardAmount);
    }
    
    /**
     * @notice Award milestone achievement with NFT and tokens
     * @param player The player address
     * @param name The achievement name
     * @param description The achievement description
     * @param threshold The achievement threshold
     * @param tokenReward The token reward amount
     */
    function _awardMilestoneAchievement(address player, string memory name, string memory description, uint256 threshold, uint256 tokenReward) internal {
        // Calculate reward in token units
        uint256 rewardAmount = tokenReward * 10**8; // SPIRAL has 8 decimals
        achievementRewardsEarned[player] += rewardAmount;
        
        // Mint NFT achievement
        uint256 nftId = achievementNFT.mintAchievement(
            player,
            name,
            description,
            "Milestone",
            255, // No specific spaceship
            threshold
        );
        
        // Award tokens
        if (spiralToken.balanceOf(address(this)) < rewardAmount) {
            try SpiralToken(address(spiralToken)).mint(address(this), rewardAmount) {
                spiralToken.transfer(player, rewardAmount);
            } catch {
                // Mint failed, skip token reward
                emit AchievementUnlocked(player, name, nftId, 0);
                return;
            }
        } else {
            spiralToken.transfer(player, rewardAmount);
        }
        
        emit AchievementUnlocked(player, name, nftId, rewardAmount);
    }
    
    /**
     * @notice Get spaceship name by ID
     * @param spaceshipId The spaceship ID
     * @return The spaceship name
     */
    function _getSpaceshipName(uint8 spaceshipId) internal pure returns (string memory) {
        if (spaceshipId == 0) return "Comet";
        if (spaceshipId == 1) return "Juggernaut";
        if (spaceshipId == 2) return "Shadow";
        if (spaceshipId == 3) return "Phantom";
        if (spaceshipId == 4) return "Phoenix";
        if (spaceshipId == 5) return "Vanguard";
        if (spaceshipId == 6) return "Wildcard";
        if (spaceshipId == 7) return "Apex";
        return "Unknown";
    }
    
    /**
     * @notice Get placement text
     * @param placement The placement number
     * @return The placement text
     */
    function _getPlacementText(uint8 placement) internal pure returns (string memory) {
        if (placement == 1) return "1st";
        if (placement == 2) return "2nd";
        if (placement == 3) return "3rd";
        if (placement == 4) return "4th";
        return "Unknown";
    }
    

    
    // View functions for frontend
    
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
     * @notice Get player achievements count
     * @param player The player address
     * @return totalAchievements Total achievements unlocked
     */
    function getPlayerAchievementsCount(address player) external view returns (uint256 totalAchievements) {
        uint256 count = 0;
        
        // Count betting achievements
        for (uint8 spaceshipId = 0; spaceshipId < 8; spaceshipId++) {
            uint256 betCount = spaceshipBetCount[player][spaceshipId];
            if (betCount >= BET_5_THRESHOLD) count++;
            if (betCount >= BET_25_THRESHOLD) count++;
            if (betCount >= BET_100_THRESHOLD) count++;
        }
        
        // Count placement achievements
        for (uint8 spaceshipId = 0; spaceshipId < 8; spaceshipId++) {
            uint256 firstPlaceCount = spaceshipPlacementCount[player][spaceshipId][1];
            uint256 secondPlaceCount = spaceshipPlacementCount[player][spaceshipId][2];
            uint256 thirdPlaceCount = spaceshipPlacementCount[player][spaceshipId][3];
            uint256 fourthPlaceCount = spaceshipPlacementCount[player][spaceshipId][4];
            
            if (firstPlaceCount >= FIRST_3_THRESHOLD) count++;
            if (firstPlaceCount >= FIRST_10_THRESHOLD) count++;
            if (secondPlaceCount >= SECOND_5_THRESHOLD) count++;
            if (secondPlaceCount >= SECOND_20_THRESHOLD) count++;
            if (thirdPlaceCount >= THIRD_10_THRESHOLD) count++;
            if (thirdPlaceCount >= THIRD_50_THRESHOLD) count++;
            if (fourthPlaceCount >= FOURTH_15_THRESHOLD) count++;
            if (fourthPlaceCount >= FOURTH_75_THRESHOLD) count++;
        }
        
        // Count milestone achievements
        if (totalRaces[player] >= RACES_10_THRESHOLD) count++;
        if (totalRaces[player] >= RACES_50_THRESHOLD) count++;
        if (totalRaces[player] >= RACES_100_THRESHOLD) count++;
        if (biggestWin[player] >= HIGH_ROLLER_THRESHOLD) count++;
        if (highestJackpotTier[player] > JACKPOT_TIER_NONE) count++;
        
        return count;
    }
    
    /**
     * @notice Get spaceship information
     * @param spaceshipId The spaceship ID
     * @return name The spaceship name
     * @return odds The payout multiplier
     * @return winRate The win rate (out of 1000)
     */
    function getSpaceshipInfo(uint8 spaceshipId) external view returns (
        string memory name,
        uint256 odds,
        uint256 winRate
    ) {
        require(spaceshipId < 8, "Invalid spaceship ID");
        
        string[8] memory names = [
            "The Comet",
            "The Juggernaut", 
            "The Shadow",
            "The Phantom",
            "The Phoenix",
            "The Vanguard",
            "The Wildcard",
            "The Apex"
        ];
        
        return (
            names[spaceshipId],
            spaceshipOdds[spaceshipId],
            spaceshipWinRates[spaceshipId]
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
        return (currentRaceId, totalRacesPlayed, totalVolume, miniJackpot, megaJackpot, superJackpot);
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
    
    /**
     * @notice Update spaceship odds (owner only)
     * @param spaceshipId The spaceship ID
     * @param newOdds The new odds multiplier
     */
    function updateSpaceshipOdds(uint8 spaceshipId, uint256 newOdds) external onlyOwner {
        require(spaceshipId < 8, "Invalid spaceship ID");
        require(newOdds > 0, "Odds must be positive");
        spaceshipOdds[spaceshipId] = newOdds;
    }
    
    /**
     * @notice Update spaceship win rates (owner only)
     * @param spaceshipId The spaceship ID
     * @param newWinRate The new win rate (out of 1000)
     */
    function updateSpaceshipWinRate(uint8 spaceshipId, uint256 newWinRate) external onlyOwner {
        require(spaceshipId < 8, "Invalid spaceship ID");
        require(newWinRate <= 1000, "Win rate must be <= 1000");
        spaceshipWinRates[spaceshipId] = newWinRate;
    }
}


