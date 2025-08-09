const { ethers } = require("hardhat");

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Diagnosing faucet with account:", deployer.address);

    // Use fresh deployment addresses from modular deploy
    const spiralTokenAddress = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0";
    const gameContractAddress = "0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9";
    
    console.log("SPIRAL Token Address:", spiralTokenAddress);
    console.log("Game Contract Address:", gameContractAddress);
    
    // Get contracts with proper factories
    const spiralToken = await ethers.getContractAt("SpiralToken", spiralTokenAddress);
    const gameContract = await ethers.getContractAt("SpaceshipRace", gameContractAddress);
    
    // Check token details
    console.log("\n=== TOKEN DETAILS ===");
    try {
        const decimals = await spiralToken.decimals();
        const totalSupply = await spiralToken.totalSupply();
        console.log("SPIRAL Decimals:", decimals.toString());
        console.log("SPIRAL Total Supply:", ethers.utils.formatUnits(totalSupply, decimals), "SPIRAL");
        
        // Check balances
        const deployerBalance = await spiralToken.balanceOf(deployer.address);
        const gameBalance = await spiralToken.balanceOf(gameContractAddress);
        
        console.log("Deployer Balance:", ethers.utils.formatUnits(deployerBalance, decimals), "SPIRAL");
        console.log("Game Contract Balance:", ethers.utils.formatUnits(gameBalance, decimals), "SPIRAL");
        
    } catch (error) {
        console.log("Error getting token details:", error.message);
    }
    
    // Check game contract details
    console.log("\n=== GAME CONTRACT DETAILS ===");
    try {
        const faucetAmount = await gameContract.FAUCET_AMOUNT();
        const minBet = await gameContract.MIN_BET();
        const maxBet = await gameContract.MAX_BET();
        
        console.log("Faucet Amount (raw):", faucetAmount.toString());
        console.log("Min Bet (raw):", minBet.toString());
        console.log("Max Bet (raw):", maxBet.toString());
        
        // Try to interpret with different decimals
        console.log("Faucet Amount (8 decimals):", ethers.utils.formatUnits(faucetAmount, 8), "tokens");
        console.log("Faucet Amount (18 decimals):", ethers.utils.formatUnits(faucetAmount, 18), "tokens");
        
        // Check if deployer has claimed faucet
        const hasClaimed = await gameContract.hasClaimedFaucet(deployer.address);
        console.log("Deployer has claimed faucet:", hasClaimed);
        
    } catch (error) {
        console.log("Error getting game contract details:", error.message);
    }
    
    // Try to claim faucet if not claimed
    console.log("\n=== ATTEMPTING FAUCET CLAIM ===");
    try {
        const hasClaimed = await gameContract.hasClaimedFaucet(deployer.address);
        if (!hasClaimed) {
            console.log("Attempting to claim faucet...");
            const tx = await gameContract.claimFaucet();
            await tx.wait();
            console.log("Faucet claimed successfully!");
            
            // Check balance after claim
            const newBalance = await spiralToken.balanceOf(deployer.address);
            const decimals = await spiralToken.decimals();
            console.log("New balance:", ethers.utils.formatUnits(newBalance, decimals), "SPIRAL");
        } else {
            console.log("Faucet already claimed by this address");
        }
    } catch (error) {
        console.log("Error claiming faucet:", error.message);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
