// SPDX-License-Identifier: MIT
pragma solidity 0.8.23;

/**
 * @title IAchievementNFT
 * @notice Interface for the Achievement NFT contract
 */
interface IAchievementNFT {
    /**
     * @notice Mint a new achievement NFT
     * @param to The address to mint the NFT to
     * @param name The achievement name
     * @param description The achievement description
     * @param achievementType The type of achievement
     * @param spaceshipId The spaceship ID (255 for none)
     * @param threshold The achievement threshold
     * @return The token ID of the minted NFT
     */
    function mintAchievement(
        address to,
        string memory name,
        string memory description,
        string memory achievementType,
        uint8 spaceshipId,
        uint256 threshold
    ) external returns (uint256);
    
    /**
     * @notice Set the spaceship race contract address
     * @param contractAddress The address of the spaceship race contract
     */
    function setSpaceshipRaceContract(address contractAddress) external;
    
    /**
     * @notice Get achievement information
     * @param tokenId The token ID
     * @return name The achievement name
     * @return description The achievement description
     * @return achievementType The achievement type
     * @return spaceshipId The spaceship ID
     * @return threshold The achievement threshold
     */
    function getAchievementInfo(uint256 tokenId) external view returns (
        string memory name,
        string memory description,
        string memory achievementType,
        uint8 spaceshipId,
        uint256 threshold
    );
    
    /**
     * @notice Get total achievements minted
     * @return Total achievements
     */
    function totalAchievements() external view returns (uint256);
    
    /**
     * @notice Get all token IDs owned by an address
     * @param owner The owner address
     * @return Array of token IDs owned by the address
     */
    function getTokensOfOwner(address owner) external view returns (uint256[] memory);
}
