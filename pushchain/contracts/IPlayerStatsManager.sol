// SPDX-License-Identifier: MIT
pragma solidity 0.8.23;

/**
 * @title IPlayerStatsManager
 * @notice Interface for managing player statistics and leaderboards
 */
interface IPlayerStatsManager {
    // Events
    event LeaderboardUpdated(address indexed player, uint256 oldRank, uint256 newRank, uint256 totalWinnings);
    event JackpotWon(address indexed player, uint8 tier, uint256 amount);

    // Structs
    struct PlayerStats {
        uint256 totalRaces;
        uint256 totalWinnings;
        uint256 biggestWin;
        uint8 highestJackpotTier;
        uint256 achievementRewardsEarned;
        uint256 lastRaceTime;
    }

    struct LeaderboardStats {
        uint256 totalPlayers;
        uint256 totalVolume;
        uint256 totalRaces;
        uint256 averageWinnings;
    }

    struct PlayerRankContext {
        uint256 rank;
        uint256 totalWinnings;
        uint256 totalRaces;
        address abovePlayer;
        address belowPlayer;
        uint256 totalRankedPlayers;
    }

    // Core stats functions
    function updatePlayerStats(
        address player,
        uint256 betAmount,
        uint256 payout,
        uint8 placement,
        uint8 jackpotTier,
        uint256 jackpotAmount,
        uint8 spaceship
    ) external;

    function getPlayerStats(address player) external view returns (
        uint256 playerTotalRaces,
        uint256 playerTotalWinnings,
        uint256 playerBiggestWin,
        uint8 playerHighestJackpotTier,
        uint256 playerAchievementRewards
    );

    // Spaceship-specific stats
    function getSpaceshipStats(address player, uint8 spaceshipId) external view returns (
        uint256 wins,
        uint256 betCount,
        uint256 firstPlace,
        uint256 secondPlace,
        uint256 thirdPlace,
        uint256 fourthPlace
    );

    function spaceshipPlacementCount(address player, uint8 spaceshipId, uint8 placement) external view returns (uint256);

    // Leaderboard functions
    function getTopPlayersByWinnings(uint256 limit) external view returns (
        address[] memory players,
        uint256[] memory winnings,
        uint256[] memory races
    );

    function getPlayerLeaderboardStats(address player) external view returns (
        uint256 rank,
        uint256 totalWinnings,
        uint256 totalRaces,
        uint256 percentile
    );

    function getPlayerRankContext(address player, uint256 context) external view returns (
        PlayerRankContext memory rankContext
    );

    function getLeaderboardStats() external view returns (LeaderboardStats memory stats);

    // Achievement rewards
    function addAchievementReward(address player, uint256 rewardAmount) external;

    // View functions
    function totalJackpotsWon(address player) external view returns (uint256);
    function playerRank(address player) external view returns (uint256);
    function rankToPlayer(uint256 rank) external view returns (address);
    function totalRankedPlayers() external view returns (uint256);
    function isRanked(address player) external view returns (bool);
}
