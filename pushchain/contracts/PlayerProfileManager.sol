// SPDX-License-Identifier: MIT
pragma solidity 0.8.23;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./IPlayerProfileManager.sol";

/**
 * @title PlayerProfileManager
 * @notice Manages player profiles, usernames, avatars, and match history
 */
contract PlayerProfileManager is IPlayerProfileManager, Ownable {
    // Username and avatar management
    mapping(address => string) public playerUsernames;
    mapping(string => address) public usernameToAddress;
    mapping(address => bool) public hasUsername;
    mapping(address => uint8) public playerAvatars;
    mapping(address => bool) public hasAvatar;
    mapping(address => uint256) public registrationTime;

    // Match history
    mapping(address => MatchRecord[]) public playerMatchHistory;
    mapping(address => uint256) public playerMatchCount;

    // Access control
    mapping(address => bool) public authorizedCallers;

    // Constants
    uint256 public constant MAX_USERNAME_LENGTH = 20;
    uint256 public constant MAX_AVATAR_ID = 7;

    modifier onlyAuthorized() {
        require(authorizedCallers[msg.sender] || msg.sender == owner(), "Not authorized");
        _;
    }

    constructor() Ownable(msg.sender) {}

    /**
     * @notice Authorize a contract to update profiles
     */
    function authorizeCaller(address caller) external onlyOwner {
        authorizedCallers[caller] = true;
    }

    /**
     * @notice Revoke authorization for a contract
     */
    function revokeCaller(address caller) external onlyOwner {
        authorizedCallers[caller] = false;
    }

    /**
     * @notice Register username and avatar for a player
     * @param username Desired username (must be unique)
     * @param avatarId Avatar ID (0-7)
     */
    function registerUsername(string calldata username, uint8 avatarId) external {
        require(bytes(username).length > 0 && bytes(username).length <= MAX_USERNAME_LENGTH, "Invalid username length");
        require(avatarId <= MAX_AVATAR_ID, "Invalid avatar ID");
        require(!hasUsername[msg.sender], "Username already registered");
        require(usernameToAddress[username] == address(0), "Username already taken");

        // Validate username contains only allowed characters
        bytes memory usernameBytes = bytes(username);
        for (uint256 i = 0; i < usernameBytes.length; i++) {
            bytes1 char = usernameBytes[i];
            require(
                (char >= 0x30 && char <= 0x39) || // 0-9
                (char >= 0x41 && char <= 0x5A) || // A-Z
                (char >= 0x61 && char <= 0x7A) || // a-z
                char == 0x5F, // underscore
                "Invalid character in username"
            );
        }

        // Register username and avatar
        playerUsernames[msg.sender] = username;
        usernameToAddress[username] = msg.sender;
        hasUsername[msg.sender] = true;
        
        playerAvatars[msg.sender] = avatarId;
        hasAvatar[msg.sender] = true;
        
        registrationTime[msg.sender] = block.timestamp;

        emit UsernameRegistered(msg.sender, username, avatarId);
    }

    /**
     * @notice Get complete player profile
     */
    function getPlayerProfile(address player) external view returns (
        string memory username,
        uint8 avatarId,
        bool hasUsernameRegistered,
        bool hasAvatarSet,
        uint256 matchCount,
        uint256 playerRegistrationTime
    ) {
        return (
            playerUsernames[player],
            playerAvatars[player],
            hasUsername[player],
            hasAvatar[player],
            playerMatchCount[player],
            registrationTime[player]
        );
    }

    /**
     * @notice Get username for a player
     */
    function getUsername(address player) external view returns (string memory username) {
        return playerUsernames[player];
    }

    /**
     * @notice Get address by username
     */
    function getAddressByUsername(string calldata username) external view returns (address player) {
        return usernameToAddress[username];
    }

    /**
     * @notice Check if player has registered username
     */
    function playerHasUsername(address player) external view returns (bool hasRegistered) {
        return hasUsername[player];
    }

    /**
     * @notice Get player's avatar ID
     */
    function getPlayerAvatar(address player) external view returns (uint8 avatarId) {
        return playerAvatars[player];
    }

    /**
     * @notice Check if player has set avatar
     */
    function playerHasAvatar(address player) external view returns (bool hasRegistered) {
        return hasAvatar[player];
    }

    /**
     * @notice Record a match result for a player
     */
    function recordMatch(
        address player,
        uint256 raceId,
        uint8 spaceship,
        uint256 betAmount,
        uint8 placement,
        uint256 payout,
        uint8 jackpotTier,
        uint256 jackpotAmount
    ) external onlyAuthorized {
        MatchRecord memory newMatch = MatchRecord({
            raceId: raceId,
            timestamp: block.timestamp,
            spaceship: spaceship,
            betAmount: betAmount,
            placement: placement,
            payout: payout,
            jackpotTier: jackpotTier,
            jackpotAmount: jackpotAmount
        });

        playerMatchHistory[player].push(newMatch);
        playerMatchCount[player]++;

        emit MatchRecorded(player, raceId, placement, payout);
    }

    /**
     * @notice Get recent matches for a player
     * @param player Player address
     * @param count Number of recent matches to return
     */
    function getRecentMatches(address player, uint256 count) external view returns (MatchRecord[] memory matches) {
        uint256 totalMatches = playerMatchHistory[player].length;
        if (totalMatches == 0) {
            return new MatchRecord[](0);
        }

        uint256 returnCount = count > totalMatches ? totalMatches : count;
        matches = new MatchRecord[](returnCount);

        // Return most recent matches (from end of array)
        for (uint256 i = 0; i < returnCount; i++) {
            matches[i] = playerMatchHistory[player][totalMatches - 1 - i];
        }

        return matches;
    }

    /**
     * @notice Get total match count for a player
     */
    function getPlayerMatchCount(address player) external view returns (uint256) {
        return playerMatchCount[player];
    }

    /**
     * @notice Get specific match by index
     * @param player Player address
     * @param index Match index (0 = oldest, length-1 = newest)
     */
    function getMatchByIndex(address player, uint256 index) external view returns (MatchRecord memory) {
        require(index < playerMatchHistory[player].length, "Match index out of bounds");
        return playerMatchHistory[player][index];
    }

    /**
     * @notice Get all matches for a player (use with caution for gas)
     */
    function getAllMatches(address player) external view returns (MatchRecord[] memory) {
        return playerMatchHistory[player];
    }
}
