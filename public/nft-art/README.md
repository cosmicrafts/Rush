# 🎨 NFT Art Structure for Cosmicrafts Rush

This folder contains the structure for all achievement NFT artwork and metadata.

## 📁 Folder Structure

```
public/nft-art/
├── betting-achievements/          # Betting milestone achievements
├── placement-achievements/        # Placement achievements (1st, 2nd, 3rd, 4th)
├── milestone-achievements/        # General milestone achievements
└── images/
    ├── betting-achievements/      # PNG images for betting achievements
    ├── placement-achievements/    # PNG images for placement achievements
    └── milestone-achievements/    # PNG images for milestone achievements
```

## 🚀 Spaceship Achievements

### Betting Achievements (24 total)

Each spaceship has 3 betting milestones:

- **Bet 5 times** on [Spaceship] → NFT + 50 SPIRAL
- **Bet 25 times** on [Spaceship] → NFT + 200 SPIRAL
- **Bet 100 times** on [Spaceship] → NFT + 500 SPIRAL

**File naming convention:**

- `comet-bet-5.json` / `comet-bet-5.png`
- `comet-bet-25.json` / `comet-bet-25.png`
- `comet-bet-100.json` / `comet-bet-100.png`
- `juggernaut-bet-5.json` / `juggernaut-bet-5.png`
- etc.

### Placement Achievements (32 total)

Each spaceship has 4 placement achievements:

- **Win 1st place 3 times** with [Spaceship] → NFT + 150 SPIRAL
- **Win 1st place 10 times** with [Spaceship] → NFT + 500 SPIRAL
- **Win 2nd place 5 times** with [Spaceship] → NFT + 100 SPIRAL
- **Win 2nd place 20 times** with [Spaceship] → NFT + 300 SPIRAL
- **Win 3rd place 10 times** with [Spaceship] → NFT + 75 SPIRAL
- **Win 3rd place 50 times** with [Spaceship] → NFT + 250 SPIRAL
- **Win 4th place 15 times** with [Spaceship] → NFT + 50 SPIRAL
- **Win 4th place 75 times** with [Spaceship] → NFT + 200 SPIRAL

**File naming convention:**

- `comet-1st-3.json` / `comet-1st-3.png`
- `comet-1st-10.json` / `comet-1st-10.png`
- `comet-2nd-5.json` / `comet-2nd-5.png`
- etc.

### Milestone Achievements (5 total)

General game milestones:

- **Complete 10 races** → NFT + 100 SPIRAL
- **Complete 50 races** → NFT + 300 SPIRAL
- **Complete 100 races** → NFT + 500 SPIRAL
- **Win 1000+ SPIRAL in single race** → NFT + 1000 SPIRAL
- **Hit any jackpot** → NFT + 1000 SPIRAL

**File naming convention:**

- `races-10.json` / `races-10.png`
- `races-50.json` / `races-50.png`
- `races-100.json` / `races-100.png`
- `high-roller.json` / `high-roller.png`
- `cosmic-luck.json` / `cosmic-luck.png`

## 🎯 How to Replace Placeholders

1. **Replace PNG files** in the `images/` subfolders
2. **Update JSON metadata** files with correct image URLs
3. **Ensure image URLs** point to your hosted images
4. **Test NFT display** in MetaMask

## 📋 Total Achievements: 61

- **Betting Achievements**: 24 (8 spaceships × 3 milestones)
- **Placement Achievements**: 32 (8 spaceships × 4 placements × 2 thresholds)
- **Milestone Achievements**: 5 (general game milestones)

## 🔗 Metadata Structure

Each JSON file contains:

```json
{
  "name": "Achievement Name",
  "description": "Achievement Description",
  "image": "https://your-domain.com/nft-art/images/path/to/image.png",
  "external_url": "https://cosmicrafts-rush.com",
  "attributes": [
    { "trait_type": "Type", "value": "Betting/Placement/Milestone" },
    { "trait_type": "Game", "value": "Cosmicrafts Rush" },
    { "trait_type": "Spaceship", "value": "Spaceship Name" },
    { "trait_type": "Threshold", "value": "Achievement Threshold" },
    { "trait_type": "Rarity", "value": "Common/Uncommon/Rare/Epic/Legendary" }
  ]
}
```

## 🚀 Ready for Production

Replace all placeholder files with your actual artwork and update the base URI in the smart contract to point to your hosted images.
