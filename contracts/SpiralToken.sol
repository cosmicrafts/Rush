// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title SpiralToken
 * @notice ERC20 token for the Cosmicrafts Rush game
 */
contract SpiralToken is ERC20, Ownable {
    
    constructor() ERC20("Spiral", "SPIRAL") Ownable(msg.sender) {
        // Mint initial supply to deployer
        _mint(msg.sender, 1000000 * 10**8); // 1 million tokens with 8 decimals
    }
    
    /**
     * @notice Override decimals to use 8 instead of 18
     * @return Number of decimals (8)
     */
    function decimals() public pure override returns (uint8) {
        return 8;
    }
    
    /**
     * @notice Mint tokens (owner only)
     * @param to Address to mint tokens to
     * @param amount Amount to mint
     */
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }
    
    /**
     * @notice Burn tokens
     * @param amount Amount to burn
     */
    function burn(uint256 amount) external {
        _burn(msg.sender, amount);
    }
}
