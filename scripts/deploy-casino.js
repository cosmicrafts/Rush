const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
    console.log("🚀 Deploying Casino-Style Spaceship Racing Game");
    console.log("================================================");

    // Get the network information
    const network = await ethers.provider.getNetwork();
    const networkName = network.name === "unknown" ? "hardhat" : network.name;
    const chainId = network.chainId;
    console.log(`📡 Network: ${networkName} (Chain ID: ${chainId})`);

    // Get deployer account
    const [deployer] = await ethers.getSigners();
    console.log(`👤 Deployer: ${deployer.address}`);
    console.log(`💰 Deployer Balance: ${ethers.utils.formatEther(await deployer.getBalance())} ETH`);

    // Deploy SpiralToken first
    console.log("\n📦 Deploying SpiralToken...");
    const SpiralToken = await ethers.getContractFactory("contracts/SpiralToken.sol:SpiralToken");
    const spiralToken = await SpiralToken.deploy();
    console.log(`⏳ Waiting for SpiralToken deployment confirmation...`);
    await spiralToken.deployed();
    console.log(`✅ SpiralToken deployed to: ${spiralToken.address}`);

    // Verify SpiralToken deployment
    const tokenCode = await ethers.provider.getCode(spiralToken.address);
    if (tokenCode === "0x") {
        throw new Error("SpiralToken deployment failed - no code at address");
    }
    console.log("✅ SpiralToken code verified successfully");

    // Get initial token state
    console.log("\n📊 SpiralToken Initial State:");
    console.log(` - Name: ${await spiralToken.name()}`);
    console.log(` - Symbol: ${await spiralToken.symbol()}`);
    console.log(` - Decimals: ${await spiralToken.decimals()}`);
    console.log(` - Total Supply: ${ethers.utils.formatUnits(await spiralToken.totalSupply(), await spiralToken.decimals())} SPIRAL`);
    console.log(` - Deployer Balance: ${ethers.utils.formatUnits(await spiralToken.balanceOf(deployer.address), await spiralToken.decimals())} SPIRAL`);

    // Deploy SpaceshipRace
    console.log("\n📦 Deploying SpaceshipRace...");
    const SpaceshipRace = await ethers.getContractFactory("contracts/SpaceshipRace.sol:SpaceshipRace");
    const spaceshipRace = await SpaceshipRace.deploy(spiralToken.address);
    console.log(`⏳ Waiting for SpaceshipRace deployment confirmation...`);
    await spaceshipRace.deployed();
    console.log(`✅ SpaceshipRace deployed to: ${spaceshipRace.address}`);

    // Verify SpaceshipRace deployment
    const raceCode = await ethers.provider.getCode(spaceshipRace.address);
    if (raceCode === "0x") {
        throw new Error("SpaceshipRace deployment failed - no code at address");
    }
    console.log("✅ SpaceshipRace code verified successfully");

    // Get initial game state
    console.log("\n📊 SpaceshipRace Initial State:");
    console.log(` - Min Bet: ${ethers.utils.formatEther(await spaceshipRace.MIN_BET())} SPIRAL`);
    console.log(` - Max Bet: ${ethers.utils.formatEther(await spaceshipRace.MAX_BET())} SPIRAL`);
    console.log(` - House Edge: ${await spaceshipRace.HOUSE_EDGE()}%`);
    console.log(` - Jackpot Trigger Chance: 1 in ${1000 / await spaceshipRace.JACKPOT_TRIGGER_CHANCE()}`);
    console.log(` - Race Pool Percentage: ${await spaceshipRace.RACE_POOL_PERCENTAGE()}%`);
    console.log(` - Current Race ID: ${await spaceshipRace.currentRaceId()}`);
    console.log(` - Current Jackpot: ${ethers.utils.formatEther(await spaceshipRace.jackpot())} SPIRAL`);

    // Display spaceship information
    console.log("\n🚀 Spaceship Information:");
    for (let i = 0; i < 8; i++) {
        const info = await spaceshipRace.getSpaceshipInfo(i);
        console.log(` ${i}. ${info.name}: ${info.odds / 100}x odds (${info.winRate / 10}% win rate)`);
    }

    // Transfer some tokens to the game contract for achievement rewards
    console.log("\n💰 Setting up game contract with tokens for achievements...");
    const achievementRewardPool = ethers.utils.parseEther("100000"); // 100k SPIRAL for achievements
    await spiralToken.transfer(spaceshipRace.address, achievementRewardPool);
    console.log(`✅ Transferred ${ethers.utils.formatEther(achievementRewardPool)} SPIRAL to game contract for achievements`);

    // Save deployment information
    const deploymentInfo = {
        network: networkName,
        chainId: chainId,
        deployer: deployer.address,
        deploymentTime: new Date().toISOString(),
        contracts: {
            spiralToken: {
                address: spiralToken.address,
                transactionHash: spiralToken.deployTransaction.hash,
                blockNumber: spiralToken.deployTransaction.blockNumber,
                gasUsed: spiralToken.deployTransaction.gasLimit?.toString(),
                tokenInfo: {
                    name: await spiralToken.name(),
                    symbol: await spiralToken.symbol(),
                    decimals: await spiralToken.decimals(),
                    totalSupply: ethers.utils.formatUnits(await spiralToken.totalSupply(), await spiralToken.decimals()),
                    deployerBalance: ethers.utils.formatUnits(await spiralToken.balanceOf(deployer.address), await spiralToken.decimals())
                }
            },
            spaceshipRace: {
                address: spaceshipRace.address,
                transactionHash: spaceshipRace.deployTransaction.hash,
                blockNumber: spaceshipRace.deployTransaction.blockNumber,
                gasUsed: spaceshipRace.deployTransaction.gasLimit?.toString(),
                gameInfo: {
                    minBet: ethers.utils.formatEther(await spaceshipRace.MIN_BET()),
                    maxBet: ethers.utils.formatEther(await spaceshipRace.MAX_BET()),
                    houseEdge: await spaceshipRace.HOUSE_EDGE(),
                    jackpotTriggerChance: await spaceshipRace.JACKPOT_TRIGGER_CHANCE(),
                    racePoolPercentage: await spaceshipRace.RACE_POOL_PERCENTAGE(),
                    currentRaceId: await spaceshipRace.currentRaceId(),
                    currentJackpot: ethers.utils.formatEther(await spaceshipRace.jackpot()),
                    achievementRewardPool: ethers.utils.formatEther(achievementRewardPool)
                }
            }
        }
    };

    // Create deployments directory if it doesn't exist
    const deploymentsDir = path.join(__dirname, "..", "deployments");
    if (!fs.existsSync(deploymentsDir)) {
        fs.mkdirSync(deploymentsDir, { recursive: true });
    }

    // Save deployment info to file
    const deploymentFile = path.join(deploymentsDir, `casino-game-${networkName}-${chainId}.json`);
    fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));
    console.log(`💾 Deployment info saved to: ${deploymentFile}`);

    // Network-specific post-deployment actions
    if (networkName !== "hardhat") {
        console.log("\n🔗 Network-specific actions:");
        
        if (chainId === 11155111) { // Sepolia
            console.log("📝 To verify on Sepolia Etherscan:");
            console.log(` npx hardhat verify --network sepolia ${spiralToken.address}`);
            console.log(` npx hardhat verify --network sepolia ${spaceshipRace.address} "${spiralToken.address}"`);
        } else if (chainId === 128123) { // Somnia Testnet
            console.log("📝 To verify on Somnia Testnet Explorer:");
            console.log(` npx hardhat verify --network somniaTestnet ${spiralToken.address}`);
            console.log(` npx hardhat verify --network somniaTestnet ${spaceshipRace.address} "${spiralToken.address}"`);
        }
    }

    // Test the contracts with basic interactions
    console.log("\n🧪 Running basic contract tests...");
    try {
        // Test SpiralToken
        const tokenName = await spiralToken.name();
        const tokenSymbol = await spiralToken.symbol();
        const tokenDecimals = await spiralToken.decimals();
        const tokenSupply = await spiralToken.totalSupply();
        console.log(` ✅ Token Name: ${tokenName}`);
        console.log(` ✅ Token Symbol: ${tokenSymbol}`);
        console.log(` ✅ Token Decimals: ${tokenDecimals}`);
        console.log(` ✅ Token Supply: ${ethers.utils.formatUnits(tokenSupply, tokenDecimals)} SPIRAL`);

        // Test SpaceshipRace
        const minBet = await spaceshipRace.MIN_BET();
        const maxBet = await spaceshipRace.MAX_BET();
        const houseEdge = await spaceshipRace.HOUSE_EDGE();
        const currentRace = await spaceshipRace.currentRaceId();
        console.log(` ✅ Min Bet: ${ethers.utils.formatEther(minBet)} SPIRAL`);
        console.log(` ✅ Max Bet: ${ethers.utils.formatEther(maxBet)} SPIRAL`);
        console.log(` ✅ House Edge: ${houseEdge}%`);
        console.log(` ✅ Current Race ID: ${currentRace}`);

        // Test spaceship info
        const shipInfo = await spaceshipRace.getSpaceshipInfo(0);
        console.log(` ✅ Spaceship 0: ${shipInfo.name} (${shipInfo.odds / 100}x odds)`);

        console.log("✅ All basic tests passed!");
    } catch (error) {
        console.log(`⚠️ Basic test failed: ${error.message}`);
    }

    console.log("\n🎉 Casino-style spaceship racing game deployment completed successfully!");
    console.log("================================================================");
    console.log(`📋 SpiralToken Address: ${spiralToken.address}`);
    console.log(`📋 SpaceshipRace Address: ${spaceshipRace.address}`);
    console.log(`🌐 Network: ${networkName} (Chain ID: ${chainId})`);
    console.log(`👤 Deployer: ${deployer.address}`);
    console.log(`🪙 Token: ${await spiralToken.name()} (${await spiralToken.symbol()})`);
    console.log(`🎮 Game: Casino-Style Spaceship Racing`);
    console.log("================================================================");

    return {
        spiralTokenAddress: spiralToken.address,
        spaceshipRaceAddress: spaceshipRace.address,
        deployer: deployer.address,
        network: networkName,
        chainId: chainId,
        transactionHashes: {
            spiralToken: spiralToken.deployTransaction.hash,
            spaceshipRace: spaceshipRace.deployTransaction.hash
        }
    };
}

// Handle errors
main()
    .then((result) => {
        console.log("\n✅ Casino game deployment script completed successfully");
        process.exit(0);
    })
    .catch((error) => {
        console.error("\n❌ Casino game deployment failed:");
        console.error(error);
        process.exit(1);
    });
