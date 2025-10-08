// SPDX-License-Identifier: MIT
pragma solidity 0.8.23;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./IPlayerStatsManager.sol";

/**
 * @title PlayerStatsManager
 * @notice Manages all player statistics, leaderboards, and spaceship performance data
 */
contract PlayerStatsManager is IPlayerStatsManager, Ownable {
    // Core player statistics
    mapping(address => uint256) public totalRaces;
    mapping(address => uint256) public totalWinnings;
    mapping(address => uint256) public biggestWin;
    mapping(address => uint8) public highestJackpotTier;
    mapping(address => uint256) public achievementRewardsEarned;
    mapping(address => uint256) public lastRaceTime;

    // Spaceship-specific statistics
    mapping(address => uint256[8]) public spaceshipWins;
    mapping(address => uint256[8]) public spaceshipBetCount;
    mapping(address => uint256[8]) public spaceshipFirstPlace;
    mapping(address => uint256[8]) public spaceshipSecondPlace;
    mapping(address => uint256[8]) public spaceshipThirdPlace;
    mapping(address => uint256[8]) public spaceshipFourthPlace;

    // Leaderboard tracking
    mapping(address => uint256) public totalJackpotsWon;
    mapping(address => uint256) public playerRank;
    mapping(uint256 => address) public rankToPlayer;
    uint256 public totalRankedPlayers;
    mapping(address => bool) public isRanked;

    // Access control - only authorized contracts can update stats
    mapping(address => bool) public authorizedCallers;

    // Global stats for leaderboard calculations
    uint256 public globalTotalRaces;
    uint256 public globalTotalVolume;

    modifier onlyAuthorized() {
        require(authorizedCallers[msg.sender] || msg.sender == owner(), "Not authorized");
        _;
    }

    constructor() Ownable(msg.sender) {}

    /**
     * @notice Authorize a contract to update player stats
     * @param caller Address to authorize
     */
    function authorizeCaller(address caller) external onlyOwner {
        authorizedCallers[caller] = true;
    }

    /**
     * @notice Revoke authorization for a contract
     * @param caller Address to revoke
     */
    function revokeCaller(address caller) external onlyOwner {
        authorizedCallers[caller] = false;
    }

    /**
     * @notice Update player statistics after a race
     * @param player Player address
     * @param betAmount Amount bet
     * @param payout Amount won
     * @param placement Race placement (1-8)
     * @param jackpotTier Jackpot tier won (0-3)
     * @param jackpotAmount Jackpot amount won
     * @param spaceship Spaceship used (0-7)
     */
    function updatePlayerStats(
        address player,
        uint256 betAmount,
        uint256 payout,
        uint8 placement,
        uint8 jackpotTier,
        uint256 jackpotAmount,
        uint8 spaceship
    ) external onlyAuthorized {
        // Update core stats
        totalRaces[player]++;
        totalWinnings[player] += payout;
        lastRaceTime[player] = block.timestamp;
        
        // Update global stats
        globalTotalRaces++;
        globalTotalVolume += betAmount;

        // Update biggest win
        if (payout > biggestWin[player]) {
            biggestWin[player] = payout;
        }

        // Update highest jackpot tier
        if (jackpotTier > highestJackpotTier[player]) {
            highestJackpotTier[player] = jackpotTier;
        }

        // Update jackpot winnings
        if (jackpotAmount > 0) {
            totalJackpotsWon[player] += jackpotAmount;
            emit JackpotWon(player, jackpotTier, jackpotAmount);
        }

        // Update spaceship stats
        spaceshipBetCount[player][spaceship]++;
        
        if (placement == 1) {
            spaceshipWins[player][spaceship]++;
            spaceshipFirstPlace[player][spaceship]++;
        } else if (placement == 2) {
            spaceshipSecondPlace[player][spaceship]++;
        } else if (placement == 3) {
            spaceshipThirdPlace[player][spaceship]++;
        } else if (placement == 4) {
            spaceshipFourthPlace[player][spaceship]++;
        }

        // Update leaderboard
        _updateLeaderboard(player);
    }

    /**
     * @notice Get comprehensive player statistics
     */
    function getPlayerStats(address player) external view returns (
        uint256 playerTotalRaces,
        uint256 playerTotalWinnings,
        uint256 playerBiggestWin,
        uint8 playerHighestJackpotTier,
        uint256 playerAchievementRewards
    ) {
        return (
            totalRaces[player],
            totalWinnings[player],
            biggestWin[player],
            highestJackpotTier[player],
            achievementRewardsEarned[player]
        );
    }

    /**
     * @notice Get spaceship-specific statistics for a player
     */
    function getSpaceshipStats(address player, uint8 spaceshipId) external view returns (
        uint256 wins,
        uint256 betCount,
        uint256 firstPlace,
        uint256 secondPlace,
        uint256 thirdPlace,
        uint256 fourthPlace
    ) {
        require(spaceshipId < 8, "Invalid spaceship ID");
        return (
            spaceshipWins[player][spaceshipId],
            spaceshipBetCount[player][spaceshipId],
            spaceshipFirstPlace[player][spaceshipId],
            spaceshipSecondPlace[player][spaceshipId],
            spaceshipThirdPlace[player][spaceshipId],
            spaceshipFourthPlace[player][spaceshipId]
        );
    }

    /**
     * @notice Get placement count for specific spaceship
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

    /**
     * @notice Get top players by winnings
     */
    function getTopPlayersByWinnings(uint256 limit) external view returns (
        address[] memory players,
        uint256[] memory winnings,
        uint256[] memory races
    ) {
        uint256 actualLimit = limit > totalRankedPlayers ? totalRankedPlayers : limit;
        
        players = new address[](actualLimit);
        winnings = new uint256[](actualLimit);
        races = new uint256[](actualLimit);
        
        for (uint256 i = 0; i < actualLimit; i++) {
            address player = rankToPlayer[i + 1]; // Ranks start at 1
            players[i] = player;
            winnings[i] = totalWinnings[player];
            races[i] = totalRaces[player];
        }
        
        return (players, winnings, races);
    }

    /**
     * @notice Get player's leaderboard statistics
     */
    function getPlayerLeaderboardStats(address player) external view returns (
        uint256 rank,
        uint256 playerTotalWinnings,
        uint256 playerTotalRaces,
        uint256 percentile
    ) {
        rank = playerRank[player];
        playerTotalWinnings = totalWinnings[player];
        playerTotalRaces = totalRaces[player];
        
        if (rank > 0 && totalRankedPlayers > 0) {
            percentile = ((totalRankedPlayers - rank + 1) * 100) / totalRankedPlayers;
        } else {
            percentile = 0;
        }
        
        return (rank, playerTotalWinnings, playerTotalRaces, percentile);
    }

    /**
     * @notice Get player rank context with surrounding players
     */
    function getPlayerRankContext(address player, uint256 context) external view returns (
        PlayerRankContext memory rankContext
    ) {
        uint256 rank = playerRank[player];
        
        rankContext.rank = rank;
        rankContext.totalWinnings = totalWinnings[player];
        rankContext.totalRaces = totalRaces[player];
        rankContext.totalRankedPlayers = totalRankedPlayers;
        
        if (rank > 1) {
            rankContext.abovePlayer = rankToPlayer[rank - 1];
        }
        
        if (rank < totalRankedPlayers && rank > 0) {
            rankContext.belowPlayer = rankToPlayer[rank + 1];
        }
        
        return rankContext;
    }

    /**
     * @notice Get overall leaderboard statistics
     */
    function getLeaderboardStats() external view returns (LeaderboardStats memory stats) {
        stats.totalPlayers = totalRankedPlayers;
        stats.totalVolume = globalTotalVolume;
        stats.totalRaces = globalTotalRaces;
        
        if (totalRankedPlayers > 0) {
            // Calculate average winnings across all ranked players
            uint256 totalWinningsSum = 0;
            for (uint256 i = 1; i <= totalRankedPlayers; i++) {
                totalWinningsSum += totalWinnings[rankToPlayer[i]];
            }
            stats.averageWinnings = totalWinningsSum / totalRankedPlayers;
        }
        
        return stats;
    }

    /**
     * @notice Update achievement rewards for a player
     * @param player Player address
     * @param rewardAmount Reward amount to add
     */
    function addAchievementReward(address player, uint256 rewardAmount) external onlyAuthorized {
        achievementRewardsEarned[player] += rewardAmount;
    }

    /**
     * @notice Internal function to update leaderboard rankings
     * @param player Player to update
     */
    function _updateLeaderboard(address player) internal {
        uint256 currentRank = playerRank[player];
        uint256 playerWinnings = totalWinnings[player];
        
        // If player is not ranked yet, add them
        if (currentRank == 0) {
            totalRankedPlayers++;
            currentRank = totalRankedPlayers;
            playerRank[player] = currentRank;
            rankToPlayer[currentRank] = player;
            isRanked[player] = true;
        }
        
        // Bubble up if player has more winnings than players above
        while (currentRank > 1) {
            address playerAbove = rankToPlayer[currentRank - 1];
            if (totalWinnings[playerAbove] >= playerWinnings) {
                break; // Correct position found
            }
            
            // Swap positions
            rankToPlayer[currentRank] = playerAbove;
            rankToPlayer[currentRank - 1] = player;
            playerRank[playerAbove] = currentRank;
            playerRank[player] = currentRank - 1;
            
            currentRank--;
        }
        
        emit LeaderboardUpdated(player, playerRank[player], currentRank, playerWinnings);
    }
}
