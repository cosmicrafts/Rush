// SPDX-License-Identifier: MIT
pragma solidity 0.8.23;

/**
 * @title IAchievementManager
 * @notice Interface for managing achievements and faucet functionality
 */
interface IAchievementManager {
    // Events
    event AchievementUnlocked(address indexed player, string name, uint256 nftId, uint256 tokenReward);
    event FaucetClaimed(address indexed player, uint256 amount);

    // Achievement checking and minting
    function checkAndMintAchievements(
        address player,
        uint8 placement,
        uint256 betAmount,
        uint256 payout,
        uint8 spaceship,
        uint256 totalRaces,
        uint256 totalWinnings,
        uint256 biggestWin
    ) external;

    function getPlayerAchievementsCount(address player) external view returns (uint256);
    function hasAchievement(address player, string calldata achievementName) external view returns (bool);

    // Faucet functions
    function claimFaucet() external;
    function hasClaimedFaucet(address user) external view returns (bool);
    function getFaucetAmount() external view returns (uint256);

    // Admin functions
    function setFaucetAmount(uint256 newAmount) external;
    function emergencyWithdrawTokens(uint256 amount) external;
}
