const hre = require("hardhat");

async function main() {
    console.log("🎨 Testing NFT Metadata Structure");
    console.log("==================================");

    // Get deployed contracts
    const achievementNFT = await hre.ethers.getContractAt("AchievementNFT", "0x9E545E3C0baAB3E08CdfD552C960A1050f373042");

    console.log("\n📋 Contract Information:");
    console.log(`Achievement NFT Contract: ${achievementNFT.address}`);
    
    const totalAchievements = await achievementNFT.totalAchievements();
    console.log(`Total NFTs Minted: ${totalAchievements}`);

    if (totalAchievements.toNumber() === 0) {
        console.log("\n❌ No NFTs minted yet. Run the achievement test first!");
        return;
    }

    console.log("\n🔍 Analyzing NFT Metadata Structure...");

    // Get the first few NFTs and analyze their metadata
    const maxNFTs = Math.min(totalAchievements.toNumber(), 5);
    
    for (let i = 1; i <= maxNFTs; i++) {
        try {
            console.log(`\n🎯 NFT #${i}:`);
            
            // Get achievement info
            const [name, description, type, shipId, threshold] = await achievementNFT.getAchievementInfo(i);
            console.log(`  📝 Name: "${name}"`);
            console.log(`  📄 Description: "${description}"`);
            console.log(`  🏷️  Type: ${type}`);
            console.log(`  🚀 Ship ID: ${shipId}`);
            console.log(`  🎯 Threshold: ${threshold}`);

            // Get token URI (base64 metadata)
            const tokenURI = await achievementNFT.tokenURI(i);
            console.log(`  🔗 Token URI: ${tokenURI.substring(0, 100)}...`);

            // Decode and display the metadata
            const metadata = decodeMetadata(tokenURI);
            console.log(`  🖼️  Image URL: ${metadata.image}`);
            console.log(`  🌐 External URL: ${metadata.external_url}`);
            console.log(`  📊 Attributes:`);
            metadata.attributes.forEach(attr => {
                console.log(`    • ${attr.trait_type}: ${attr.value}`);
            });

        } catch (error) {
            console.log(`  ❌ Error loading NFT #${i}: ${error.message}`);
        }
    }

    console.log("\n📋 NFT Image Structure:");
    console.log("The images are referenced by file paths in your public/nft-art directory:");
    console.log("");
    console.log("🎯 Betting Achievements:");
    console.log("  • images/betting-achievements/{spaceship}-bet-{threshold}.png");
    console.log("  • Example: images/betting-achievements/comet-bet-5.png");
    console.log("");
    console.log("🏆 Placement Achievements:");
    console.log("  • images/placement-achievements/{spaceship}-{placement}-{threshold}.png");
    console.log("  • Example: images/placement-achievements/comet-1st-3.png");
    console.log("");
    console.log("🌟 Milestone Achievements:");
    console.log("  • images/milestone-achievements/{milestone}.png");
    console.log("  • Example: images/milestone-achievements/races-10.png");

    console.log("\n🔗 MetaMask Integration:");
    console.log("Users can add NFTs to MetaMask in two ways:");
    console.log("");
    console.log("1️⃣ Manual Import:");
    console.log("   • MetaMask → NFTs → Import NFT");
    console.log(`   • Contract: ${achievementNFT.address}`);
    console.log("   • Token ID: 1, 2, 3, etc.");
    console.log("");
    console.log("2️⃣ Automated Import (Frontend):");
    console.log("   • Use wallet_watchAsset API");
    console.log("   • One-click import from your dApp");
    console.log("   • Bulk import all user's NFTs");

    console.log("\n📊 Base64 Metadata Example:");
    const exampleMetadata = {
        name: "The Rising Star of Comet",
        description: "First steps to glory with Comet",
        image: "http://localhost:3000/nft-art/images/betting-achievements/comet-bet-5.png",
        external_url: "https://cosmicrafts-rush.com",
        attributes: [
            {"trait_type": "Type", "value": "Betting"},
            {"trait_type": "Game", "value": "Cosmicrafts Rush"},
            {"trait_type": "Spaceship", "value": "Comet"},
            {"trait_type": "Threshold", "value": 5},
            {"trait_type": "Rarity", "value": "Common"}
        ]
    };

    const jsonString = JSON.stringify(exampleMetadata, null, 2);
    const base64String = Buffer.from(jsonString).toString('base64');
    
    console.log("Raw JSON:");
    console.log(jsonString);
    console.log("");
    console.log("Base64 Encoded:");
    console.log(`data:application/json;base64,${base64String}`);

    console.log("\n✅ NFT Metadata Test Complete!");
    console.log("🎉 Your NFTs are ready for MetaMask integration!");
}

function decodeMetadata(uri) {
    try {
        const jsonStr = Buffer.from(uri.replace('data:application/json;base64,', ''), 'base64').toString();
        return JSON.parse(jsonStr);
    } catch (error) {
        console.error('Error decoding metadata:', error);
        return {
            name: 'Unknown NFT',
            description: 'Metadata unavailable',
            image: '/nft-art/placeholder.png',
            external_url: '',
            attributes: []
        };
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
