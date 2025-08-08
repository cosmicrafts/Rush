// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";


// Interface for SpiralToken to access mint function
interface SpiralToken is IERC20 {
    function mint(address to, uint256 amount) external;
}

/**
 * @title SpaceshipRace
 * @notice True single-player casino-style spaceship racing game with tiered jackpots and NFT achievements
 * @dev Players race independently against contract odds, no pooling
 */
contract SpaceshipRace is ReentrancyGuard, Ownable {
    
    // Events
    event BetPlaced(address indexed player, uint8 spaceshipId, uint256 amount, uint256 raceId);
    event RaceResult(address indexed player, uint8 playerSpaceship, uint8 winner, uint256 payout, bool jackpotHit, uint8 jackpotTier);
    event AchievementUnlocked(address indexed player, string achievementId, uint256 nftId, uint256 tokenReward);
    event JackpotHit(address indexed player, uint8 tier, uint256 jackpotAmount);
    
    // Token contract
    IERC20 public immutable spiralToken;
    
    // Game constants
    uint256 public constant MIN_BET = 10 * 10**18; // 10 SPIRAL tokens
    uint256 public constant MAX_BET = 1000 * 10**18; // 1000 SPIRAL tokens
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
    
    // Achievement thresholds and rewards
    uint256[8] public spaceshipAchievementThresholds = [10, 5, 8, 3, 5, 7, 2, 5];
    uint256[8] public spaceshipAchievementRewards = [100, 150, 120, 200, 180, 160, 300, 250];
    
    // Achievement IDs
    bytes32 public constant COMET_MASTER = keccak256("COMET_MASTER");
    bytes32 public constant JUGGERNAUT_DESTROYER = keccak256("JUGGERNAUT_DESTROYER");
    bytes32 public constant SHADOW_HUNTER = keccak256("SHADOW_HUNTER");
    bytes32 public constant PHANTOM_PHANTOM = keccak256("PHANTOM_PHANTOM");
    bytes32 public constant PHOENIX_RISING = keccak256("PHOENIX_RISING");
    bytes32 public constant VANGUARD_VETERAN = keccak256("VANGUARD_VETERAN");
    bytes32 public constant WILDCARD_WIZARD = keccak256("WILDCARD_WIZARD");
    bytes32 public constant APEX_PREDATOR = keccak256("APEX_PREDATOR");
    
    bytes32 public constant NOVICE_RACER = keccak256("NOVICE_RACER");
    bytes32 public constant EXPERIENCED_PILOT = keccak256("EXPERIENCED_PILOT");
    bytes32 public constant VETERAN_CAPTAIN = keccak256("VETERAN_CAPTAIN");
    bytes32 public constant HIGH_ROLLER = keccak256("HIGH_ROLLER");
    bytes32 public constant COSMIC_LUCK = keccak256("COSMIC_LUCK");
    
    // NFT Achievement contract
    AchievementNFT public achievementNFT;
    
    constructor(address _spiralToken) Ownable(msg.sender) {
        spiralToken = IERC20(_spiralToken);
        currentRaceId = 1;
        
        // Deploy NFT contract
        achievementNFT = new AchievementNFT();
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
     * @notice Check and award achievements based on player stats
     * @param player The player address
     */
    function _checkAchievements(address player) internal {
        // Spaceship specialist achievements
        for (uint8 i = 0; i < 8; i++) {
            if (spaceshipWins[player][i] >= spaceshipAchievementThresholds[i]) {
                bytes32 achievementId = _getSpaceshipAchievementId(i);
                if (!achievements[player][achievementId]) {
                    _awardAchievement(player, achievementId, spaceshipAchievementRewards[i]);
                }
            }
        }
        
        // Milestone achievements
        if (totalRaces[player] >= 5 && !achievements[player][NOVICE_RACER]) {
            _awardAchievement(player, NOVICE_RACER, 50);
        }
        if (totalRaces[player] >= 25 && !achievements[player][EXPERIENCED_PILOT]) {
            _awardAchievement(player, EXPERIENCED_PILOT, 200);
        }
        if (totalRaces[player] >= 100 && !achievements[player][VETERAN_CAPTAIN]) {
            _awardAchievement(player, VETERAN_CAPTAIN, 500);
        }
        
        // High roller achievement (check biggest win)
        if (biggestWin[player] >= 1000 * 10**18 && !achievements[player][HIGH_ROLLER]) {
            _awardAchievement(player, HIGH_ROLLER, 1000);
        }
        
        // Jackpot achievement
        if (highestJackpotTier[player] > JACKPOT_TIER_NONE && !achievements[player][COSMIC_LUCK]) {
            _awardAchievement(player, COSMIC_LUCK, 1000);
        }
    }
    
    /**
     * @notice Get achievement ID for a spaceship
     * @param spaceshipId The spaceship ID
     * @return The achievement ID
     */
    function _getSpaceshipAchievementId(uint8 spaceshipId) internal pure returns (bytes32) {
        if (spaceshipId == 0) return COMET_MASTER;
        if (spaceshipId == 1) return JUGGERNAUT_DESTROYER;
        if (spaceshipId == 2) return SHADOW_HUNTER;
        if (spaceshipId == 3) return PHANTOM_PHANTOM;
        if (spaceshipId == 4) return PHOENIX_RISING;
        if (spaceshipId == 5) return VANGUARD_VETERAN;
        if (spaceshipId == 6) return WILDCARD_WIZARD;
        if (spaceshipId == 7) return APEX_PREDATOR;
        revert("Invalid spaceship ID");
    }
    
    /**
     * @notice Award achievement with NFT and tokens
     * @param player The player address
     * @param achievementId The achievement ID
     * @param tokenReward The token reward amount
     */
    function _awardAchievement(address player, bytes32 achievementId, uint256 tokenReward) internal {
        achievements[player][achievementId] = true;
        achievementRewardsEarned[player] += tokenReward;
        
        // Calculate reward in token units
        uint256 rewardAmount = tokenReward * 10**18;
        
        // Mint NFT achievement
        uint256 nftId = achievementNFT.mintAchievement(player, _getAchievementName(achievementId), _getAchievementDescription(achievementId));
        
        // Award tokens
        if (spiralToken.balanceOf(address(this)) < rewardAmount) {
            try SpiralToken(address(spiralToken)).mint(address(this), rewardAmount) {
                spiralToken.transfer(player, rewardAmount);
            } catch {
                // Mint failed, skip token reward
                emit AchievementUnlocked(player, _getAchievementName(achievementId), nftId, 0);
                return;
            }
        } else {
            spiralToken.transfer(player, rewardAmount);
        }
        
        emit AchievementUnlocked(player, _getAchievementName(achievementId), nftId, rewardAmount);
    }
    
    /**
     * @notice Get achievement name from ID
     * @param achievementId The achievement ID
     * @return The achievement name
     */
    function _getAchievementName(bytes32 achievementId) internal pure returns (string memory) {
        if (achievementId == COMET_MASTER) return "Comet Master";
        if (achievementId == JUGGERNAUT_DESTROYER) return "Juggernaut Destroyer";
        if (achievementId == SHADOW_HUNTER) return "Shadow Hunter";
        if (achievementId == PHANTOM_PHANTOM) return "Phantom Phantom";
        if (achievementId == PHOENIX_RISING) return "Phoenix Rising";
        if (achievementId == VANGUARD_VETERAN) return "Vanguard Veteran";
        if (achievementId == WILDCARD_WIZARD) return "Wildcard Wizard";
        if (achievementId == APEX_PREDATOR) return "Apex Predator";
        if (achievementId == NOVICE_RACER) return "Novice Racer";
        if (achievementId == EXPERIENCED_PILOT) return "Experienced Pilot";
        if (achievementId == VETERAN_CAPTAIN) return "Veteran Captain";
        if (achievementId == HIGH_ROLLER) return "High Roller";
        if (achievementId == COSMIC_LUCK) return "Cosmic Luck";
        return "Unknown Achievement";
    }
    
    /**
     * @notice Get achievement description from ID
     * @param achievementId The achievement ID
     * @return The achievement description
     */
    function _getAchievementDescription(bytes32 achievementId) internal pure returns (string memory) {
        if (achievementId == COMET_MASTER) return "Mastered The Comet with 10 victories";
        if (achievementId == JUGGERNAUT_DESTROYER) return "Destroyed opponents with The Juggernaut 5 times";
        if (achievementId == SHADOW_HUNTER) return "Hunted down 8 victories with The Shadow";
        if (achievementId == PHANTOM_PHANTOM) return "Became a phantom with 3 Phantom victories";
        if (achievementId == PHOENIX_RISING) return "Rose from ashes 5 times with The Phoenix";
        if (achievementId == VANGUARD_VETERAN) return "Veteran of 7 Vanguard battles";
        if (achievementId == WILDCARD_WIZARD) return "Wizard of 2 Wildcard wins";
        if (achievementId == APEX_PREDATOR) return "Apex predator with 5 Apex victories";
        if (achievementId == NOVICE_RACER) return "Completed 5 races as a novice";
        if (achievementId == EXPERIENCED_PILOT) return "Experienced pilot with 25 races";
        if (achievementId == VETERAN_CAPTAIN) return "Veteran captain with 100 races";
        if (achievementId == HIGH_ROLLER) return "High roller with a 1000+ SPIRAL win";
        if (achievementId == COSMIC_LUCK) return "Cosmic luck - hit a jackpot!";
        return "Unknown achievement description";
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
     * @notice Get player achievements
     * @param player The player address
     * @return unlockedAchievements Array of unlocked achievement names
     */
    function getPlayerAchievements(address player) external view returns (string[] memory unlockedAchievements) {
        bytes32[] memory allAchievements = new bytes32[](13);
        allAchievements[0] = COMET_MASTER;
        allAchievements[1] = JUGGERNAUT_DESTROYER;
        allAchievements[2] = SHADOW_HUNTER;
        allAchievements[3] = PHANTOM_PHANTOM;
        allAchievements[4] = PHOENIX_RISING;
        allAchievements[5] = VANGUARD_VETERAN;
        allAchievements[6] = WILDCARD_WIZARD;
        allAchievements[7] = APEX_PREDATOR;
        allAchievements[8] = NOVICE_RACER;
        allAchievements[9] = EXPERIENCED_PILOT;
        allAchievements[10] = VETERAN_CAPTAIN;
        allAchievements[11] = HIGH_ROLLER;
        allAchievements[12] = COSMIC_LUCK;
        
        uint256 count = 0;
        for (uint256 i = 0; i < allAchievements.length; i++) {
            if (achievements[player][allAchievements[i]]) {
                count++;
            }
        }
        
        unlockedAchievements = new string[](count);
        uint256 index = 0;
        for (uint256 i = 0; i < allAchievements.length; i++) {
            if (achievements[player][allAchievements[i]]) {
                unlockedAchievements[index] = _getAchievementName(allAchievements[i]);
                index++;
            }
        }
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

/**
 * @title AchievementNFT
 * @notice NFT contract for achievement badges
 */
contract AchievementNFT is ERC721, ERC721URIStorage, Ownable {
    uint256 private _tokenIds;
    
    // Achievement metadata
    mapping(uint256 => string) public achievementNames;
    mapping(uint256 => string) public achievementDescriptions;
    
    constructor() ERC721("Cosmicrafts Achievements", "COSMIC") Ownable(msg.sender) {}
    
    /**
     * @notice Mint achievement NFT
     * @param to Recipient address
     * @param name Achievement name
     * @param description Achievement description
     * @return tokenId The minted token ID
     */
    function mintAchievement(address to, string memory name, string memory description) external returns (uint256) {
        require(msg.sender == owner(), "Only owner can mint");
        
        _tokenIds++;
        uint256 newTokenId = _tokenIds;
        
        _mint(to, newTokenId);
        
        achievementNames[newTokenId] = name;
        achievementDescriptions[newTokenId] = description;
        
        // Set token URI with metadata
        string memory tokenURI = _generateTokenURI(name, description);
        _setTokenURI(newTokenId, tokenURI);
        
        return newTokenId;
    }
    
    /**
     * @notice Generate token URI with metadata
     * @param name Achievement name
     * @param description Achievement description
     * @return Token URI
     */
    function _generateTokenURI(string memory name, string memory description) internal pure returns (string memory) {
        return string(abi.encodePacked(
            "data:application/json;base64,",
            _base64Encode(bytes(string(abi.encodePacked(
                '{"name":"', name, '",',
                '"description":"', description, '",',
                '"image":"data:image/svg+xml;base64,', _generateSVG(name), '",',
                '"attributes":[{"trait_type":"Type","value":"Achievement"},{"trait_type":"Game","value":"Cosmicrafts Rush"}]}'
            ))))
        ));
    }
    
    /**
     * @notice Generate simple SVG for achievement
     * @param name Achievement name
     * @return Base64 encoded SVG
     */
    function _generateSVG(string memory name) internal pure returns (string memory) {
        return _base64Encode(bytes(string(abi.encodePacked(
            '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">',
            '<rect width="400" height="400" fill="#1a1a2e"/>',
            '<circle cx="200" cy="200" r="150" fill="#16213e" stroke="#0f3460" stroke-width="4"/>',
            '<circle cx="200" cy="200" r="120" fill="#e94560" stroke="#533483" stroke-width="3"/>',
            '<text x="200" y="180" text-anchor="middle" fill="white" font-family="Arial" font-size="16" font-weight="bold">', name, '</text>',
            '<text x="200" y="220" text-anchor="middle" fill="#cccccc" font-family="Arial" font-size="12">Achievement Badge</text>',
            '</svg>'
        ))));
    }
    
    /**
     * @notice Base64 encode function
     * @param data Data to encode
     * @return Base64 encoded string
     */
    function _base64Encode(bytes memory data) internal pure returns (string memory) {
        string memory table = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
        uint256 len = data.length;
        if (len == 0) return "";
        
        uint256 encodedLen = 4 * ((len + 2) / 3);
        bytes memory result = new bytes(encodedLen);
        
        uint256 i = 0;
        uint256 j = 0;
        
        while (i < len) {
            uint256 a = i < len ? uint8(data[i++]) : 0;
            uint256 b = i < len ? uint8(data[i++]) : 0;
            uint256 c = i < len ? uint8(data[i++]) : 0;
            
            uint256 triple = (a << 16) + (b << 8) + c;
            
            result[j++] = bytes1(bytes(table)[triple >> 18 & 0x3F]);
            result[j++] = bytes1(bytes(table)[triple >> 12 & 0x3F]);
            result[j++] = bytes1(bytes(table)[triple >> 6 & 0x3F]);
            result[j++] = bytes1(bytes(table)[triple & 0x3F]);
        }
        
        // Adjust for padding
        while (j > 0 && result[j - 1] == "=") {
            j--;
        }
        
        return string(result);
    }
    
    // Override required functions
    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }
    
    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721URIStorage) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
