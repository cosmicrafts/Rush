const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
    console.log("🚀 Starting Enhanced Cosmicrafts Rush Deployment");
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
    
    // Deploy contracts in order
    console.log("\n📦 Deploying contracts...");
    
    // 1. Deploy SpiralToken
    console.log("\n1️⃣ Deploying SpiralToken...");
    const SpiralToken = await ethers.getContractFactory("contracts/SpiralToken.sol:SpiralToken");
    const spiralToken = await SpiralToken.deploy();
    await spiralToken.deployed();
    console.log(`✅ SpiralToken deployed to: ${spiralToken.address}`);
    
    // 2. Deploy AchievementNFT
    console.log("\n2️⃣ Deploying AchievementNFT...");
    const AchievementNFT = await ethers.getContractFactory("contracts/AchievementNFT.sol:AchievementNFT");
    const achievementNFT = await AchievementNFT.deploy();
    await achievementNFT.deployed();
    console.log(`✅ AchievementNFT deployed to: ${achievementNFT.address}`);
    
    // 3. Deploy SpaceshipRace
    console.log("\n3️⃣ Deploying SpaceshipRace...");
    const SpaceshipRace = await ethers.getContractFactory("contracts/SpaceshipRace.sol:SpaceshipRace");
    const spaceshipRace = await SpaceshipRace.deploy(spiralToken.address, achievementNFT.address);
    await spaceshipRace.deployed();
    console.log(`✅ SpaceshipRace deployed to: ${spaceshipRace.address}`);
    
    // Set the game contract address in the NFT contract
    console.log("\n4️⃣ Configuring NFT contract...");
    await achievementNFT.setSpaceshipRaceContract(spaceshipRace.address);
    console.log(`✅ Set SpaceshipRace contract address in AchievementNFT`);
    
    // Verify deployments
    console.log("\n🔍 Verifying deployments...");
    const spiralTokenCode = await ethers.provider.getCode(spiralToken.address);
    const achievementNFTCode = await ethers.provider.getCode(achievementNFT.address);
    const spaceshipRaceCode = await ethers.provider.getCode(spaceshipRace.address);
    
    if (spiralTokenCode === "0x" || achievementNFTCode === "0x" || spaceshipRaceCode === "0x") {
        throw new Error("Contract deployment failed - no code at address");
    }
    console.log("✅ All contracts verified successfully");
    
    // Fund the game contract
    console.log("\n💰 Funding game contract...");
    const gamePool = ethers.utils.parseUnits("500000", 8); // 500,000 SPIRAL
    await spiralToken.transfer(spaceshipRace.address, gamePool);
    console.log(`✅ Funded game contract with ${ethers.utils.formatUnits(gamePool, 8)} SPIRAL`);
    
    // Get initial contract states
    console.log("\n📊 Initial Contract States:");
    
    // SpiralToken state
    console.log(`\n🪙 SpiralToken:`);
    console.log(`   - Name: ${await spiralToken.name()}`);
    console.log(`   - Symbol: ${await spiralToken.symbol()}`);
    console.log(`   - Decimals: ${await spiralToken.decimals()}`);
    console.log(`   - Total Supply: ${ethers.utils.formatUnits(await spiralToken.totalSupply(), 8)} SPIRAL`);
    console.log(`   - Deployer Balance: ${ethers.utils.formatUnits(await spiralToken.balanceOf(deployer.address), 8)} SPIRAL`);
    console.log(`   - Game Contract Balance: ${ethers.utils.formatUnits(await spiralToken.balanceOf(spaceshipRace.address), 8)} SPIRAL`);
    
    // AchievementNFT state
    console.log(`\n🎨 AchievementNFT:`);
    console.log(`   - Name: ${await achievementNFT.name()}`);
    console.log(`   - Symbol: ${await achievementNFT.symbol()}`);
    console.log(`   - Total Achievements: ${await achievementNFT.totalAchievements()}`);
    console.log(`   - Owner: ${await achievementNFT.owner()}`);
    
    // SpaceshipRace state
    console.log(`\n🏁 SpaceshipRace:`);
    console.log(`   - SpiralToken: ${await spaceshipRace.spiralToken()}`);
    console.log(`   - AchievementNFT: ${await spaceshipRace.achievementNFT()}`);
    console.log(`   - Current Race: ${await spaceshipRace.currentRaceId()}`);
    console.log(`   - Total Races: ${await spaceshipRace.totalRacesPlayed()}`);
    console.log(`   - Total Volume: ${ethers.utils.formatUnits(await spaceshipRace.totalVolume(), 8)} SPIRAL`);
    console.log(`   - Mini Jackpot: ${ethers.utils.formatUnits(await spaceshipRace.miniJackpot(), 8)} SPIRAL`);
    console.log(`   - Mega Jackpot: ${ethers.utils.formatUnits(await spaceshipRace.megaJackpot(), 8)} SPIRAL`);
    console.log(`   - Super Jackpot: ${ethers.utils.formatUnits(await spaceshipRace.superJackpot(), 8)} SPIRAL`);
    
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
                    totalSupply: ethers.utils.formatUnits(await spiralToken.totalSupply(), 8),
                    deployerBalance: ethers.utils.formatUnits(await spiralToken.balanceOf(deployer.address), 8),
                    gameContractBalance: ethers.utils.formatUnits(await spiralToken.balanceOf(spaceshipRace.address), 8)
                }
            },
            achievementNFT: {
                address: achievementNFT.address,
                transactionHash: achievementNFT.deployTransaction.hash,
                blockNumber: achievementNFT.deployTransaction.blockNumber,
                gasUsed: achievementNFT.deployTransaction.gasLimit?.toString(),
                nftInfo: {
                    name: await achievementNFT.name(),
                    symbol: await achievementNFT.symbol(),
                    totalAchievements: (await achievementNFT.totalAchievements()).toString(),
                    owner: await achievementNFT.owner()
                }
            },
            spaceshipRace: {
                address: spaceshipRace.address,
                transactionHash: spaceshipRace.deployTransaction.hash,
                blockNumber: spaceshipRace.deployTransaction.blockNumber,
                gasUsed: spaceshipRace.deployTransaction.gasLimit?.toString(),
                gameInfo: {
                    spiralToken: await spaceshipRace.spiralToken(),
                    achievementNFT: await spaceshipRace.achievementNFT(),
                    currentRace: (await spaceshipRace.currentRaceId()).toString(),
                    totalRaces: (await spaceshipRace.totalRacesPlayed()).toString(),
                    totalVolume: ethers.utils.formatUnits(await spaceshipRace.totalVolume(), 8),
                    miniJackpot: ethers.utils.formatUnits(await spaceshipRace.miniJackpot(), 8),
                    megaJackpot: ethers.utils.formatUnits(await spaceshipRace.megaJackpot(), 8),
                    superJackpot: ethers.utils.formatUnits(await spaceshipRace.superJackpot(), 8)
                }
            }
        },
        gameConfiguration: {
            minBet: ethers.utils.formatUnits(await spaceshipRace.MIN_BET(), 8),
            maxBet: ethers.utils.formatUnits(await spaceshipRace.MAX_BET(), 8),
            houseEdge: (await spaceshipRace.HOUSE_EDGE()).toString(),
            racePoolPercentage: (await spaceshipRace.RACE_POOL_PERCENTAGE()).toString(),
            miniJackpotChance: (await spaceshipRace.MINI_JACKPOT_CHANCE()).toString(),
            megaJackpotChance: (await spaceshipRace.MEGA_JACKPOT_CHANCE()).toString(),
            superJackpotChance: (await spaceshipRace.SUPER_JACKPOT_CHANCE()).toString()
        },
        spaceshipOdds: await spaceshipRace.spaceshipOdds(),
        spaceshipWinRates: await spaceshipRace.spaceshipWinRates()
    };
    
    // Create deployments directory if it doesn't exist
    const deploymentsDir = path.join(__dirname, "..", "deployments");
    if (!fs.existsSync(deploymentsDir)) {
        fs.mkdirSync(deploymentsDir, { recursive: true });
    }
    
    // Save deployment info to file
    const deploymentFile = path.join(deploymentsDir, `cosmicrafts-rush-${networkName}-${chainId}.json`);
    fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));
    console.log(`💾 Deployment info saved to: ${deploymentFile}`);
    
    // Network-specific post-deployment actions
    if (networkName !== "hardhat") {
        console.log("\n🔗 Network-specific actions:");
        
        if (chainId === 11155111) { // Sepolia
            console.log("📝 To verify on Sepolia Etherscan:");
            console.log(` npx hardhat verify --network sepolia ${spiralToken.address}`);
            console.log(` npx hardhat verify --network sepolia ${achievementNFT.address}`);
            console.log(` npx hardhat verify --network sepolia ${spaceshipRace.address} "${spiralToken.address}" "${achievementNFT.address}"`);
        }
    }
    
    // Test the contracts with a simple interaction
    console.log("\n🧪 Running basic contract test...");
    try {
        // Test basic functionality
        const name = await spiralToken.name();
        const symbol = await spiralToken.symbol();
        const nftName = await achievementNFT.name();
        const nftSymbol = await achievementNFT.symbol();
        const gameCurrentRace = await spaceshipRace.currentRaceId();
        
        console.log(` ✅ SpiralToken: ${name} (${symbol})`);
        console.log(` ✅ AchievementNFT: ${nftName} (${nftSymbol})`);
        console.log(` ✅ SpaceshipRace: Current Race ${gameCurrentRace}`);
        console.log("✅ All contracts are ready for use!");
    } catch (error) {
        console.log(`⚠️ Basic test failed: ${error.message}`);
    }
    
    console.log("\n🎉 Enhanced deployment completed successfully!");
    console.log("================================================");
    console.log(`📋 Contract Addresses:`);
    console.log(`   🪙 SpiralToken: ${spiralToken.address}`);
    console.log(`   🎨 AchievementNFT: ${achievementNFT.address}`);
    console.log(`   🏁 SpaceshipRace: ${spaceshipRace.address}`);
    console.log(`🌐 Network: ${networkName} (Chain ID: ${chainId})`);
    console.log(`👤 Deployer: ${deployer.address}`);
    console.log("================================================");
    
    return {
        contracts: {
            spiralToken: spiralToken.address,
            achievementNFT: achievementNFT.address,
            spaceshipRace: spaceshipRace.address
        },
        deployer: deployer.address,
        network: networkName,
        chainId: chainId,
        deploymentFile: deploymentFile
    };
}

// Handle errors
main()
    .then((result) => {
        console.log("\n✅ Enhanced deployment script completed successfully");
        process.exit(0);
    })
    .catch((error) => {
        console.error("\n❌ Enhanced deployment failed:");
        console.error(error);
        process.exit(1);
    });
