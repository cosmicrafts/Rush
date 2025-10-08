// SPDX-License-Identifier: MIT
pragma solidity 0.8.23;

/**
 * @title IPlayerProfileManager
 * @notice Interface for managing player profiles, usernames, avatars, and match history
 */
interface IPlayerProfileManager {
    // Events
    event UsernameRegistered(address indexed player, string username, uint8 avatarId);
    event MatchRecorded(address indexed player, uint256 raceId, uint8 placement, uint256 payout);

    // Structs
    struct MatchRecord {
        uint256 raceId;
        uint256 timestamp;
        uint8 spaceship;
        uint256 betAmount;
        uint8 placement;
        uint256 payout;
        uint8 jackpotTier;
        uint256 jackpotAmount;
    }

    struct PlayerProfile {
        string username;
        uint8 avatarId;
        bool hasUsername;
        bool hasAvatar;
        uint256 matchCount;
        uint256 registrationTime;
    }

    // Profile management
    function registerUsername(string calldata username, uint8 avatarId) external;
    
    function getPlayerProfile(address player) external view returns (
        string memory username,
        uint8 avatarId,
        bool hasUsernameRegistered,
        bool hasAvatarSet,
        uint256 matchCount,
        uint256 registrationTime
    );

    // Username functions
    function getUsername(address player) external view returns (string memory username);
    function getAddressByUsername(string calldata username) external view returns (address player);
    function playerHasUsername(address player) external view returns (bool hasRegistered);

    // Avatar functions
    function getPlayerAvatar(address player) external view returns (uint8 avatarId);
    function playerHasAvatar(address player) external view returns (bool hasRegistered);

    // Match history
    function recordMatch(
        address player,
        uint256 raceId,
        uint8 spaceship,
        uint256 betAmount,
        uint8 placement,
        uint256 payout,
        uint8 jackpotTier,
        uint256 jackpotAmount
    ) external;

    function getRecentMatches(address player, uint256 count) external view returns (MatchRecord[] memory matches);
    function getPlayerMatchCount(address player) external view returns (uint256);
}
