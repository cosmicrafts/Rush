// SPDX-License-Identifier: MIT
pragma solidity 0.8.23;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./IAchievementManager.sol";
import "./IAchievementNFT.sol";
import "./IPlayerStatsManager.sol";

/**
 * @title AchievementManager
 * @notice Manages achievements, NFT minting, and faucet functionality
 */
contract AchievementManager is IAchievementManager, Ownable {
    // Contracts
    IERC20 public immutable spiralToken;
    IAchievementNFT public immutable achievementNFT;
    IPlayerStatsManager public immutable statsManager;

    // Achievement tracking
    mapping(address => mapping(bytes32 => bool)) public achievements;
    mapping(address => uint256) public playerAchievementCount;

    // Faucet
    mapping(address => bool) public hasClaimed;
    uint256 public faucetAmount = 1000 * 10**8; // 1000 SPIRAL (8 decimals)

    // Access control
    mapping(address => bool) public authorizedCallers;

    // Achievement constants
    uint256 public constant FIRST_WIN_REWARD = 50 * 10**8; // 50 SPIRAL
    uint256 public constant MILESTONE_REWARD = 100 * 10**8; // 100 SPIRAL
    uint256 public constant BIG_WIN_REWARD = 200 * 10**8; // 200 SPIRAL

    modifier onlyAuthorized() {
        require(authorizedCallers[msg.sender] || msg.sender == owner(), "Not authorized");
        _;
    }

    constructor(
        address _spiralToken,
        address _achievementNFT,
        address _statsManager
    ) Ownable(msg.sender) {
        spiralToken = IERC20(_spiralToken);
        achievementNFT = IAchievementNFT(_achievementNFT);
        statsManager = IPlayerStatsManager(_statsManager);
    }

    /**
     * @notice Authorize a contract to trigger achievements
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
     * @notice Check and mint achievements for a player after a race
     */
    function checkAndMintAchievements(
        address player,
        uint8 placement,
        uint256 betAmount,
        uint256 payout,
        uint8 spaceship,
        uint256 totalRaces,
        uint256 totalWinnings,
        uint256 biggestWin
    ) external onlyAuthorized {
        // First Win Achievement
        if (totalRaces == 1 && placement == 1) {
            _mintAchievement(player, "First Victory", FIRST_WIN_REWARD);
        }

        // Placement-based achievements
        if (placement == 1) {
            _checkWinMilestones(player, totalRaces);
        }

        // Betting amount achievements
        _checkBettingAchievements(player, betAmount);

        // Winnings achievements
        _checkWinningsAchievements(player, payout, biggestWin);

        // Spaceship-specific achievements
        _checkSpaceshipAchievements(player, spaceship, placement);

        // Milestone achievements
        _checkRaceMilestones(player, totalRaces);
    }

    /**
     * @notice Get total achievements count for a player
     */
    function getPlayerAchievementsCount(address player) external view returns (uint256) {
        return playerAchievementCount[player];
    }

    /**
     * @notice Check if player has specific achievement
     */
    function hasAchievement(address player, string calldata achievementName) external view returns (bool) {
        bytes32 achievementId = keccak256(abi.encodePacked(achievementName));
        return achievements[player][achievementId];
    }

    /**
     * @notice Claim faucet tokens
     */
    function claimFaucet() external {
        require(!hasClaimed[msg.sender], "Faucet already claimed");
        require(spiralToken.balanceOf(address(this)) >= faucetAmount, "Insufficient faucet balance");

        hasClaimed[msg.sender] = true;
        require(spiralToken.transfer(msg.sender, faucetAmount), "Faucet transfer failed");

        emit FaucetClaimed(msg.sender, faucetAmount);
    }

    /**
     * @notice Check if user has claimed faucet
     */
    function hasClaimedFaucet(address user) external view returns (bool) {
        return hasClaimed[user];
    }

    /**
     * @notice Get current faucet amount
     */
    function getFaucetAmount() external view returns (uint256) {
        return faucetAmount;
    }

    /**
     * @notice Set faucet amount (owner only)
     */
    function setFaucetAmount(uint256 newAmount) external onlyOwner {
        faucetAmount = newAmount;
    }

    /**
     * @notice Emergency withdraw tokens (owner only)
     */
    function emergencyWithdrawTokens(uint256 amount) external onlyOwner {
        require(spiralToken.transfer(owner(), amount), "Emergency withdrawal failed");
    }

    // Internal achievement checking functions

    function _checkWinMilestones(address player, uint256 totalRaces) internal {
        if (totalRaces == 10) {
            _mintAchievement(player, "Rookie Racer", MILESTONE_REWARD);
        } else if (totalRaces == 50) {
            _mintAchievement(player, "Seasoned Pilot", MILESTONE_REWARD);
        } else if (totalRaces == 100) {
            _mintAchievement(player, "Veteran Commander", MILESTONE_REWARD * 2);
        }
    }

    function _checkBettingAchievements(address player, uint256 betAmount) internal {
        if (betAmount >= 500 * 10**8) { // 500 SPIRAL
            _mintAchievement(player, "High Roller", BIG_WIN_REWARD);
        }
        if (betAmount >= 1000 * 10**8) { // 1000 SPIRAL (max bet)
            _mintAchievement(player, "All In", BIG_WIN_REWARD * 2);
        }
    }

    function _checkWinningsAchievements(address player, uint256 payout, uint256 biggestWin) internal {
        if (payout >= 2000 * 10**8) { // 2000 SPIRAL
            _mintAchievement(player, "Big Winner", BIG_WIN_REWARD);
        }
        if (biggestWin >= 4000 * 10**8) { // 4000 SPIRAL
            _mintAchievement(player, "Jackpot Hunter", BIG_WIN_REWARD * 3);
        }
    }

    function _checkSpaceshipAchievements(address player, uint8 spaceship, uint8 placement) internal {
        if (placement == 1) {
            // Get spaceship stats to check for achievements
            (uint256 wins, , , , , ) = statsManager.getSpaceshipStats(player, spaceship);
            
            if (wins == 5) {
                string memory shipName = _getSpaceshipName(spaceship);
                string memory achievementName = string(abi.encodePacked(shipName, " Specialist"));
                _mintAchievement(player, achievementName, MILESTONE_REWARD);
            }
        }
    }

    function _checkRaceMilestones(address player, uint256 totalRaces) internal {
        if (totalRaces == 25) {
            _mintAchievement(player, "Quarter Century", MILESTONE_REWARD);
        } else if (totalRaces == 250) {
            _mintAchievement(player, "Racing Legend", MILESTONE_REWARD * 5);
        }
    }

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
     * @notice Internal function to mint achievement NFT and emit event
     */
    function _mintAchievement(address player, string memory name, uint256 tokenReward) internal {
        // Create unique achievement ID
        bytes32 achievementId = keccak256(abi.encodePacked(player, name));
        
        // Check if already earned
        if (achievements[player][achievementId]) {
            return; // Already earned
        }
        
        // Mark as earned
        achievements[player][achievementId] = true;
        playerAchievementCount[player]++;
        
        // Mint NFT
        uint256 nftId = achievementNFT.mintAchievement(
            player,
            name,
            string(abi.encodePacked("Achievement: ", name)),
            "General",
            255, // No specific spaceship
            0    // No threshold
        );
        
        // Transfer token reward
        if (tokenReward > 0 && spiralToken.balanceOf(address(this)) >= tokenReward) {
            spiralToken.transfer(player, tokenReward);
            // Update achievement rewards in stats manager
            statsManager.addAchievementReward(player, tokenReward);
        }
        
        emit AchievementUnlocked(player, name, nftId, tokenReward);
    }
}
