# 🎨 NFT Image Automation Guide for Cosmicrafts Rush

## 📋 **Total NFT Requirements: 59 Images**

### **📁 Directory Structure Required:**
```
your-domain.com/nft-art/images/
├── betting-achievements/           (24 images)
├── placement-achievements/         (32 images) 
└── milestone-achievements/         (3 images)
```

---

## 🚀 **1. Betting Achievements (24 images)**

**Pattern:** `{spaceship}-bet-{threshold}.png`

### **Spaceships:** comet, juggernaut, shadow, phantom, phoenix, vanguard, wildcard, apex
### **Thresholds:** 5, 25, 100

```
betting-achievements/comet-bet-5.png          - "Comet Supporter" (5 bets)
betting-achievements/comet-bet-25.png         - "Comet Enthusiast" (25 bets)  
betting-achievements/comet-bet-100.png        - "Comet Devotee" (100 bets)

betting-achievements/juggernaut-bet-5.png     - "Juggernaut Supporter"
betting-achievements/juggernaut-bet-25.png    - "Juggernaut Enthusiast"
betting-achievements/juggernaut-bet-100.png   - "Juggernaut Devotee"

betting-achievements/shadow-bet-5.png         - "Shadow Supporter"
betting-achievements/shadow-bet-25.png        - "Shadow Enthusiast" 
betting-achievements/shadow-bet-100.png       - "Shadow Devotee"

betting-achievements/phantom-bet-5.png        - "Phantom Supporter"
betting-achievements/phantom-bet-25.png       - "Phantom Enthusiast"
betting-achievements/phantom-bet-100.png      - "Phantom Devotee"

betting-achievements/phoenix-bet-5.png        - "Phoenix Supporter"
betting-achievements/phoenix-bet-25.png       - "Phoenix Enthusiast"
betting-achievements/phoenix-bet-100.png      - "Phoenix Devotee"

betting-achievements/vanguard-bet-5.png       - "Vanguard Supporter"
betting-achievements/vanguard-bet-25.png      - "Vanguard Enthusiast"
betting-achievements/vanguard-bet-100.png     - "Vanguard Devotee"

betting-achievements/wildcard-bet-5.png       - "Wildcard Supporter"
betting-achievements/wildcard-bet-25.png      - "Wildcard Enthusiast"
betting-achievements/wildcard-bet-100.png     - "Wildcard Devotee"

betting-achievements/apex-bet-5.png           - "Apex Supporter"
betting-achievements/apex-bet-25.png          - "Apex Enthusiast"
betting-achievements/apex-bet-100.png         - "Apex Devotee"
```

---

## 🏆 **2. Placement Achievements (32 images)**

**Pattern:** `{spaceship}-{placement}-{threshold}.png`

### **Placements & Thresholds:**
- **1st place:** 3, 15 (times achieved)
- **2nd place:** 10, 50  
- **3rd place:** 25, 100
- **4th place:** 15, 75

```
placement-achievements/comet-1st-3.png        - "Comet Champion" (3x 1st)
placement-achievements/comet-1st-15.png       - "Comet Legend" (15x 1st)
placement-achievements/comet-2nd-10.png       - "Comet Runner-up" (10x 2nd)
placement-achievements/comet-2nd-50.png       - "Comet Consistent" (50x 2nd)
placement-achievements/comet-3rd-25.png       - "Comet Podium" (25x 3rd)
placement-achievements/comet-3rd-100.png      - "Comet Reliable" (100x 3rd)
placement-achievements/comet-4th-15.png       - "Comet Participant" (15x 4th)
placement-achievements/comet-4th-75.png       - "Comet Dedicated" (75x 4th)

placement-achievements/juggernaut-1st-3.png   - "Juggernaut Champion"
placement-achievements/juggernaut-1st-15.png  - "Juggernaut Legend"
placement-achievements/juggernaut-2nd-10.png  - "Juggernaut Runner-up"
placement-achievements/juggernaut-2nd-50.png  - "Juggernaut Consistent"
placement-achievements/juggernaut-3rd-25.png  - "Juggernaut Podium"
placement-achievements/juggernaut-3rd-100.png - "Juggernaut Reliable"
placement-achievements/juggernaut-4th-15.png  - "Juggernaut Participant"
placement-achievements/juggernaut-4th-75.png  - "Juggernaut Dedicated"

placement-achievements/shadow-1st-3.png       - "Shadow Champion"
placement-achievements/shadow-1st-15.png      - "Shadow Legend"
placement-achievements/shadow-2nd-10.png      - "Shadow Runner-up"
placement-achievements/shadow-2nd-50.png      - "Shadow Consistent"
placement-achievements/shadow-3rd-25.png      - "Shadow Podium"
placement-achievements/shadow-3rd-100.png     - "Shadow Reliable"
placement-achievements/shadow-4th-15.png      - "Shadow Participant"
placement-achievements/shadow-4th-75.png      - "Shadow Dedicated"

placement-achievements/phantom-1st-3.png      - "Phantom Champion"
placement-achievements/phantom-1st-15.png     - "Phantom Legend"
placement-achievements/phantom-2nd-10.png     - "Phantom Runner-up"
placement-achievements/phantom-2nd-50.png     - "Phantom Consistent"
placement-achievements/phantom-3rd-25.png     - "Phantom Podium"
placement-achievements/phantom-3rd-100.png    - "Phantom Reliable"
placement-achievements/phantom-4th-15.png     - "Phantom Participant"
placement-achievements/phantom-4th-75.png     - "Phantom Dedicated"
```

---

## 🎯 **3. Milestone Achievements (3 images)**

**Pattern:** `{milestone-name}.png`

```
milestone-achievements/novice-racer.png       - "Novice Racer" (10 total races)
milestone-achievements/experienced-pilot.png  - "Experienced Pilot" (50 total races)
milestone-achievements/veteran-captain.png    - "Veteran Captain" (100 total races)
```

---

## 🛠️ **Automation Scripts**

### **Bash Script to Create Directory Structure:**
```bash
#!/bin/bash
mkdir -p your-domain.com/nft-art/images/betting-achievements
mkdir -p your-domain.com/nft-art/images/placement-achievements  
mkdir -p your-domain.com/nft-art/images/milestone-achievements

echo "NFT directories created successfully!"
```

### **Python Script to Generate Placeholder Images:**
```python
from PIL import Image, ImageDraw, ImageFont
import os

def create_placeholder_nft(text, filename, size=(512, 512)):
    img = Image.new('RGB', size, color='#1a1a2e')
    draw = ImageDraw.Draw(img)
    
    # Try to load a font, fallback to default
    try:
        font = ImageFont.truetype("arial.ttf", 40)
    except:
        font = ImageFont.load_default()
    
    # Center text
    bbox = draw.textbbox((0, 0), text, font=font)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]
    
    x = (size[0] - text_width) // 2
    y = (size[1] - text_height) // 2
    
    draw.text((x, y), text, fill='white', font=font)
    img.save(filename)

# Generate all NFT placeholders
spaceships = ['comet', 'juggernaut', 'shadow', 'phantom', 'phoenix', 'vanguard', 'wildcard', 'apex']

# Betting achievements
for ship in spaceships:
    for threshold in [5, 25, 100]:
        text = f"{ship.title()}\nBet {threshold}"
        filename = f"betting-achievements/{ship}-bet-{threshold}.png"
        create_placeholder_nft(text, filename)

# Placement achievements  
placements = [('1st', [3, 15]), ('2nd', [10, 50]), ('3rd', [25, 100]), ('4th', [15, 75])]
for ship in spaceships:
    for place, thresholds in placements:
        for threshold in thresholds:
            text = f"{ship.title()}\n{place} x{threshold}"
            filename = f"placement-achievements/{ship}-{place}-{threshold}.png"
            create_placeholder_nft(text, filename)

# Milestone achievements
milestones = [
    ('novice-racer', 'Novice\nRacer'),
    ('experienced-pilot', 'Experienced\nPilot'), 
    ('veteran-captain', 'Veteran\nCaptain')
]
for filename, text in milestones:
    create_placeholder_nft(text, f"milestone-achievements/{filename}.png")

print("All NFT placeholder images generated!")
```

---

## 🎨 **Design Guidelines**

### **Recommended Image Specs:**
- **Size:** 512x512px (standard NFT size)
- **Format:** PNG with transparency support
- **Quality:** High resolution for MetaMask display

### **Visual Theme Suggestions:**
- **Betting:** Ship logos with bet counters/badges
- **Placement:** Trophies/medals with ship elements  
- **Milestone:** Pilot ranks/insignia

### **Color Schemes by Ship:**
```
Comet:      #34d399 (green)
Juggernaut: #f87171 (red)
Shadow:     #a78bfa (purple)  
Phantom:    #60a5fa (blue)
Phoenix:    #facc15 (yellow)
Vanguard:   #f3f4f6 (gray)
Wildcard:   #fb923c (orange)
Apex:       #ec4899 (pink)
```

---

## 🚀 **Deployment Steps:**

1. **Generate images** using the Python script above
2. **Upload to your domain** at `your-domain.com/nft-art/images/`  
3. **Update contract** baseURI to `https://your-domain.com/nft-art/`
4. **Deploy contracts** with the fixed baseURI
5. **Test NFT display** in MetaMask

---

## ✅ **Verification Checklist:**

- [ ] All 59 image files created
- [ ] Directory structure matches contract expectations
- [ ] Images accessible via HTTPS
- [ ] MetaMask displays NFTs correctly
- [ ] Achievement unlocking triggers NFT minting
- [ ] Each NFT has unique metadata and image

**Total Images Required: 59**
**Estimated Upload Size: ~30MB (512x512 PNGs)**
