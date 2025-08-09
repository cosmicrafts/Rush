const { ethers } = require("hardhat");

async function main() {
    console.log("🧪 Testing 10 Races - Base Stats Only");
    console.log("=====================================");
    
    const [deployer] = await ethers.getSigners();
    
    // Deploy contracts
    const SpiralToken = await ethers.getContractFactory("contracts/SpiralToken.sol:SpiralToken");
    const spiralToken = await SpiralToken.deploy();
    
    const AchievementNFT = await ethers.getContractFactory("contracts/AchievementNFT.sol:AchievementNFT");
    const achievementNFT = await AchievementNFT.deploy();
    
    const SpaceshipRace = await ethers.getContractFactory("contracts/SpaceshipRace.sol:SpaceshipRace");
    const spaceshipRace = await SpaceshipRace.deploy(spiralToken.address, achievementNFT.address);
    
    await achievementNFT.setSpaceshipRaceContract(spaceshipRace.address);
    
    // Fund contracts
    await spiralToken.transfer(spaceshipRace.address, ethers.utils.parseUnits("10000", 8));
    await spiralToken.transfer(deployer.address, ethers.utils.parseUnits("1000", 8));
    await spiralToken.approve(spaceshipRace.address, ethers.utils.parseUnits("1000", 8));
    
    console.log("✅ Contracts deployed and funded");
    
    const shipNames = ["The Comet", "The Juggernaut", "The Shadow", "The Phantom", "The Phoenix", "The Vanguard", "The Wildcard", "The Apex"];
    const wins = [0, 0, 0, 0, 0, 0, 0, 0];
    
    console.log("\n🏁 Running 10 races...");
    
    for (let i = 0; i < 10; i++) {
        try {
            const betAmount = ethers.utils.parseUnits("10", 8);
            const raceResult = await spaceshipRace.callStatic.placeBet(0, betAmount);
            
            wins[raceResult.winner]++;
            console.log(`Race ${i + 1}: ${shipNames[raceResult.winner]} won`);
            
        } catch (error) {
            console.log(`Race ${i + 1} failed: ${error.message}`);
        }
    }
    
    console.log("\n📊 Results:");
    console.log("============");
    for (let i = 0; i < 8; i++) {
        console.log(`${shipNames[i]}: ${wins[i]} wins`);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
