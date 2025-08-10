// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

/**
 * @title AchievementNFT
 * @notice ERC-721 NFT contract for Cosmicrafts Rush achievements
 * @dev MetaMask compatible with proper metadata structure
 */
contract AchievementNFT is ERC721, ERC721URIStorage, Ownable {
    using Strings for uint256;
    
    uint256 private _tokenIds;
    
    // Achievement metadata
    mapping(uint256 => string) public achievementNames;
    mapping(uint256 => string) public achievementDescriptions;
    mapping(uint256 => string) public achievementTypes;
    mapping(uint256 => uint8) public achievementSpaceshipId;
    mapping(uint256 => uint256) public achievementThreshold;
    
    // Base URI for metadata
    string public baseURI;
    
    // Game contract address
    address public spaceshipRaceContract;
    
    // Achievement type constants
    string public constant ACHIEVEMENT_TYPE_BETTING = "Betting";
    string public constant ACHIEVEMENT_TYPE_PLACEMENT = "Placement";
    string public constant ACHIEVEMENT_TYPE_MILESTONE = "Milestone";
    
    // Spaceship names
    string[8] public spaceshipNames = [
        "Comet",
        "Juggernaut", 
        "Shadow",
        "Phantom",
        "Phoenix",
        "Vanguard",
        "Wildcard",
        "Apex"
    ];
    
    constructor() ERC721("Cosmicrafts Achievements", "COSMIC") Ownable(msg.sender) {
        baseURI = "http://localhost:3000/nft-art/";
    }
    
    /**
     * @notice Set the game contract address (only owner)
     * @param _spaceshipRaceContract The game contract address
     */
    function setSpaceshipRaceContract(address _spaceshipRaceContract) external onlyOwner {
        spaceshipRaceContract = _spaceshipRaceContract;
    }
    
    /**
     * @notice Mint achievement NFT
     * @param to Recipient address
     * @param name Achievement name
     * @param description Achievement description
     * @param achievementType Type of achievement
     * @param spaceshipId Spaceship ID (0-7, 255 for none)
     * @param threshold Achievement threshold
     * @return tokenId The minted token ID
     */
    function mintAchievement(
        address to,
        string memory name,
        string memory description,
        string memory achievementType,
        uint8 spaceshipId,
        uint256 threshold
    ) external returns (uint256) {
        require(msg.sender == owner() || msg.sender == spaceshipRaceContract, "Only owner or game contract can mint");
        
        _tokenIds++;
        uint256 newTokenId = _tokenIds;
        
        _mint(to, newTokenId);
        
        achievementNames[newTokenId] = name;
        achievementDescriptions[newTokenId] = description;
        achievementTypes[newTokenId] = achievementType;
        achievementSpaceshipId[newTokenId] = spaceshipId;
        achievementThreshold[newTokenId] = threshold;
        
        // Set token URI with metadata
        string memory metadataURI = _generateTokenURI(newTokenId);
        _setTokenURI(newTokenId, metadataURI);
        
        return newTokenId;
    }
    
    /**
     * @notice Generate token URI with metadata
     * @param tokenId The token ID
     * @return Token URI
     */
    function _generateTokenURI(uint256 tokenId) internal view returns (string memory) {
        string memory achievementType = achievementTypes[tokenId];
        string memory spaceshipName = "";
        string memory imagePath = "";
        
        if (achievementSpaceshipId[tokenId] < 8) {
            spaceshipName = spaceshipNames[achievementSpaceshipId[tokenId]];
        }
        
        // Generate image path based on achievement type
        if (keccak256(bytes(achievementType)) == keccak256(bytes(ACHIEVEMENT_TYPE_BETTING))) {
            imagePath = string(abi.encodePacked("images/betting-achievements/", _toLowerCase(spaceshipName), "-bet-", achievementThreshold[tokenId].toString(), ".png"));
        } else if (keccak256(bytes(achievementType)) == keccak256(bytes(ACHIEVEMENT_TYPE_PLACEMENT))) {
            imagePath = string(abi.encodePacked("images/placement-achievements/", _toLowerCase(spaceshipName), "-", _getPlacementString(achievementThreshold[tokenId]), ".png"));
        } else if (keccak256(bytes(achievementType)) == keccak256(bytes(ACHIEVEMENT_TYPE_MILESTONE))) {
            imagePath = string(abi.encodePacked("images/milestone-achievements/", _getMilestoneString(tokenId), ".png"));
        }
        
        string memory imageURI = string(abi.encodePacked(baseURI, imagePath));
        
        return string(abi.encodePacked(
            "data:application/json;base64,",
            _base64Encode(bytes(string(abi.encodePacked(
                '{"name":"', achievementNames[tokenId], '",',
                '"description":"', achievementDescriptions[tokenId], '",',
                '"image":"', imageURI, '",',
                '"external_url":"https://cosmicrafts-rush.com",',
                '"attributes":[',
                '{"trait_type":"Type","value":"', achievementType, '"},',
                '{"trait_type":"Game","value":"Cosmicrafts Rush"},',
                '{"trait_type":"Spaceship","value":"', spaceshipName, '"},',
                '{"trait_type":"Threshold","value":', achievementThreshold[tokenId].toString(), '},',
                '{"trait_type":"Rarity","value":"', _getRarityString(achievementThreshold[tokenId]), '"}',
                ']}'
            ))))
        ));
    }
    
    /**
     * @notice Get placement string for metadata
     * @param threshold The threshold value
     * @return Placement string
     */
    function _getPlacementString(uint256 threshold) internal pure returns (string memory) {
        if (threshold == 3) return "1st-3";
        if (threshold == 10) return "1st-10";
        if (threshold == 5) return "2nd-5";
        if (threshold == 20) return "2nd-20";
        if (threshold == 10) return "3rd-10";
        if (threshold == 50) return "3rd-50";
        if (threshold == 15) return "4th-15";
        if (threshold == 75) return "4th-75";
        return "unknown";
    }
    
    /**
     * @notice Get milestone string for metadata
     * @param tokenId The token ID
     * @return Milestone string
     */
    function _getMilestoneString(uint256 tokenId) internal view returns (string memory) {
        string memory name = achievementNames[tokenId];
        if (keccak256(bytes(name)) == keccak256(bytes("Initiate of the Cosmos"))) return "races-10";
        if (keccak256(bytes(name)) == keccak256(bytes("Strategist in Training"))) return "races-50";
        if (keccak256(bytes(name)) == keccak256(bytes("Guardian of the Galaxy"))) return "races-100";
        if (keccak256(bytes(name)) == keccak256(bytes("High Roller"))) return "high-roller";
        if (keccak256(bytes(name)) == keccak256(bytes("Cosmic Luck"))) return "cosmic-luck";
        return "unknown";
    }
    
    /**
     * @notice Get rarity string based on threshold
     * @param threshold The threshold value
     * @return Rarity string
     */
    function _getRarityString(uint256 threshold) internal pure returns (string memory) {
        if (threshold <= 5) return "Common";
        if (threshold <= 15) return "Uncommon";
        if (threshold <= 50) return "Rare";
        if (threshold <= 100) return "Epic";
        return "Legendary";
    }
    
    /**
     * @notice Convert string to lowercase
     * @param str Input string
     * @return Lowercase string
     */
    function _toLowerCase(string memory str) internal pure returns (string memory) {
        bytes memory bStr = bytes(str);
        bytes memory bLower = new bytes(bStr.length);
        for (uint i = 0; i < bStr.length; i++) {
            if ((uint8(bStr[i]) >= 65) && (uint8(bStr[i]) <= 90)) {
                bLower[i] = bytes1(uint8(bStr[i]) + 32);
            } else {
                bLower[i] = bStr[i];
            }
        }
        return string(bLower);
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
    
    /**
     * @notice Update base URI
     * @param newBaseURI New base URI
     */
    function setBaseURI(string memory newBaseURI) external onlyOwner {
        baseURI = newBaseURI;
    }
    
    /**
     * @notice Get achievement info
     * @param tokenId The token ID
     * @return name Achievement name
     * @return description Achievement description
     * @return achievementType Achievement type
     * @return spaceshipId Spaceship ID
     * @return threshold Achievement threshold
     */
    function getAchievementInfo(uint256 tokenId) external view returns (
        string memory name,
        string memory description,
        string memory achievementType,
        uint8 spaceshipId,
        uint256 threshold
    ) {
        require(ownerOf(tokenId) != address(0), "Token does not exist");
        return (
            achievementNames[tokenId],
            achievementDescriptions[tokenId],
            achievementTypes[tokenId],
            achievementSpaceshipId[tokenId],
            achievementThreshold[tokenId]
        );
    }
    
    /**
     * @notice Get total achievements minted
     * @return Total achievements
     */
    function totalAchievements() external view returns (uint256) {
        return _tokenIds;
    }
    
    /**
     * @notice Get all token IDs owned by an address
     * @param owner The owner address
     * @return Array of token IDs owned by the address
     */
    function getTokensOfOwner(address owner) external view returns (uint256[] memory) {
        uint256 tokenCount = balanceOf(owner);
        uint256[] memory tokens = new uint256[](tokenCount);
        
        uint256 tokenIndex = 0;
        for (uint256 i = 1; i <= _tokenIds; i++) {
            if (ownerOf(i) == owner) {
                tokens[tokenIndex] = i;
                tokenIndex++;
                if (tokenIndex == tokenCount) break;
            }
        }
        
        return tokens;
    }
    
    // Override required functions
    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }
    
    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721URIStorage) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
