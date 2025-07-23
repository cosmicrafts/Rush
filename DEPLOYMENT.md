# 🚀 Deployment Guide - Cosmicrafts Rush

## Quick Deployment Checklist

### ✅ Prerequisites
- [ ] Node.js v18+ installed
- [ ] MetaMask wallet with Somnia Testnet
- [ ] STT tokens (request from Discord)
- [ ] Private key for deployment

### 🔧 Smart Contract Deployment

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure environment**
   ```bash
   cp env.example .env
   # Add your private key to .env
   ```

3. **Deploy contract**
   ```bash
   npm run deploy:contract
   ```

4. **Save contract address**
   - Copy the deployed address from output
   - Update frontend configuration

### 🌐 Frontend Deployment

1. **Build application**
   ```bash
   npm run build
   ```

2. **Deploy to hosting**
   - Vercel: `vercel --prod`
   - Netlify: `netlify deploy --prod`
   - Or any static hosting service

3. **Update contract address**
   - Set environment variable or config file
   - Ensure frontend connects to deployed contract

## 🎯 Somnia Hackathon Requirements

### ✅ Submission Checklist
- [ ] **Playable demo** - Race simulation with betting
- [ ] **README** - Complete setup and gameplay instructions
- [ ] **Deployed Web3 game** - Live on Somnia Testnet
- [ ] **Demo video** - 2-minute gameplay showcase
- [ ] **GitHub repo** - Public repository with source code

### 🏆 Judging Criteria Alignment

1. **Creativity & Originality** ✅
   - Unique chaos factor system
   - 8 distinct spaceships with different strategies
   - Unpredictable race outcomes

2. **Technical Excellence** ✅
   - Deployed on Somnia Testnet
   - Smart contract with betting and payouts
   - Gas-optimized for high TPS

3. **User Experience** ✅
   - Intuitive betting interface
   - Real-time race visualization
   - Responsive design for all devices

4. **Onchain Impact** ✅
   - 100% on-chain betting system
   - Transparent payout mechanism
   - Minimal off-chain dependency

5. **Community Fit** ✅
   - Quick, exciting race rounds
   - Perfect for Somnia's gaming ecosystem
   - Engaging for community participation

## 🔗 Important Links

- **Somnia Testnet**: https://testnet.somnia.network
- **Discord**: https://discord.com/invite/somnia
- **Documentation**: https://docs.somnia.network
- **Faucet**: Request STT in Discord #dev-chat

## 📞 Support

For deployment issues:
- Discord: `#dev-chat` @emma_odia
- Email: developers@somnia.network
- GitHub Issues: [Your Repository]

---

**Ready for Somnia v1 Mini-Games Hackathon! 🚀** 