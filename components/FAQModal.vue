<template>
  <div
    v-if="show"
    class="modal-overlay"
    @click.self="closeFAQ"
  >
    <div class="modal-container faq-modal-container">
      <!-- Modal Header -->
      <div class="modal-header">
        <div class="layout-flex-between items-center">
          <div class="layout-flex-center space-responsive-xs">
            <h2>Frequently Asked Questions</h2>
          </div>
          <button
            class="btn btn-ghost btn-sm"
            @click="closeFAQ"
          >
            <Icon name="solar:close-circle-bold" class="w-6 h-6" />
          </button>
        </div>
        <div class="separator-line"></div>
      </div>

      <!-- Modal Content -->
      <div class="modal-content faq-content">
        <!-- About On-Chain & Web3 Racing -->
        <section class="faq-section">
          <h3>About On-Chain & Web3 Racing</h3>
          <div class="faq-item">
            <p><strong>What is Onchain gaming?</strong><br>
            Onchain gaming refers to games where all key actions—game logic, state, and rewards—are run directly on the blockchain. Every race, bet, and payout in Cosmicrafts Rush is provably fair, open, and instant thanks to decentralized, onchain execution.</p>
          </div>

          <div class="faq-item">
            <p><strong>Which is best, on-chain or off-chain?</strong><br>
            On-chain games (like Cosmicrafts Rush) offer unmatched transparency, instant crypto payouts, and true digital ownership. Off-chain games may be faster but lack fairness and crypto rewards. For betting and earning, on-chain gaming leads the industry.</p>
          </div>

          <div class="faq-item">
            <p><strong>What are blockchain games?</strong><br>
            Blockchain games use smart contracts to power gameplay, rewards, and digital assets. They enable play-to-earn mechanics where you can own, trade, or even bet on NFTs and win real crypto.</p>
          </div>

          <div class="faq-item">
            <p><strong>What is the Somnia network?</strong><br>
            Somnia is a next-generation, EVM-compatible blockchain network designed for high-speed blockchain games, NFT platforms, and Web3 betting applications. Cosmicrafts Rush runs on Somnia for ultra-fast races and instant settlements.</p>
          </div>

          <div class="faq-item">
            <p><strong>Does Somnia have a token?</strong><br>
            Yes. Somnia's token fuels the network and ecosystem. You can buy, hold, and use it for gaming, staking, and governance.</p>
          </div>

          <div class="faq-item">
            <p><strong>How does Onchain Arcade work?</strong><br>
            Onchain Arcades leverage smart contracts to enable true betting, P2E (play to earn), and verifiable racing outcomes—every move and payout is public and provably fair.</p>
          </div>
        </section>

        <!-- Betting & Earning With Web3 Racing Games -->
        <section class="faq-section">
          <h3>Betting & Earning With Web3 Racing Games</h3>
          <div class="faq-item">
            <p><strong>How do you bet on races?</strong><br>
            Simply select your favorite AI spaceship in Cosmicrafts Rush, place your crypto bet, and watch the race live—winnings are paid out automatically after each race.</p>
          </div>

          <div class="faq-item">
            <p><strong>Can you make money with blockchain games?</strong><br>
            Yes. Games like Cosmicrafts Rush and popular NFT horse racing games allow players and bettors to win actual crypto. Top racers and successful bettors can cash out or reinvest instantly.</p>
          </div>

          <div class="faq-item">
            <p><strong>Which is the No. 1 car racing game?</strong><br>
            In the Web3 space, Cosmicrafts Rush, Zed Run, and similar NFT racing games lead the charts. For traditional gamers, titles like Gran Turismo and Forza remain on top.</p>
          </div>

          <div class="faq-item">
            <p><strong>Are blockchain games legit?</strong><br>
            Legitimate blockchain games are provably fair and secure through their open-source code and transparent smart contracts. Always check for projects with audited code and active communities.</p>
          </div>

          <div class="faq-item">
            <p><strong>Does the bitcoin blast game pay real money?</strong><br>
            Some games advertise payouts but always check user reviews and ensure the game is decentralized. With Cosmicrafts Rush, winnings are paid directly to your crypto wallet, instantly.</p>
          </div>

          <div class="faq-item">
            <p><strong>What crypto game pays the most?</strong><br>
            Top play-to-earn and betting games (like Cosmicrafts Rush or Zed Run) can pay hundreds or thousands in crypto to the most skillful or lucky players, depending on race pools and event frequency.</p>
          </div>

          <div class="faq-item">
            <p><strong>How much can you earn from NFT games?</strong><br>
            Earnings depend on game mechanics, skill, and luck—many earn small amounts, while top winners and racers in games with large community pools can win substantial rewards.</p>
          </div>
        </section>

        <!-- AI, Gameplay, and Winning Strategies -->
        <section class="faq-section">
          <h3>AI, Gameplay, and Winning Strategies</h3>
          <div class="faq-item">
            <p><strong>How do racing games AI work?</strong><br>
            In Cosmicrafts Rush, AI-powered spaceships make real-time racing decisions based on randomness and programmed strategies. Every race outcome is unpredictable and fair, driven by verifiable smart contract code.</p>
          </div>

          <div class="faq-item">
            <p><strong>How can AI be used to gamble?</strong><br>
            AI adds unpredictability and excitement to racing and betting. In our game, you bet on the AI ship you believe will win—outcome is based on fair, random logic, not pre-programmed results.</p>
          </div>

          <div class="faq-item">
            <p><strong>How to win the AI race?</strong><br>
            Study stats, follow your intuition, and use your knowledge of AI ship patterns. Luck plays a big part, but smart analysis can increase your odds.</p>
          </div>
        </section>

        <!-- Getting Started & Additional Info -->
        <section class="faq-section">
          <h3>Getting Started & Additional Info</h3>
          <div class="faq-item">
            <p><strong>How to buy somnia crypto?</strong><br>
            Check the official Somnia Network resources or partner exchanges. Always verify you're using a legitimate, safe platform.</p>
          </div>

          <div class="faq-item">
            <p><strong>How to play Rocket Gambling / Space Race games?</strong><br>
            Rocket gambling and spaceship racing games like Cosmicrafts Rush are easy: sign up, deposit crypto, pick your racer, and place your bet.</p>
          </div>

          <div class="faq-item">
            <p><strong>What makes Cosmicrafts Rush unique?</strong><br>
            It's the only provably fair, on-chain, Web3 spaceship racing game—combining instant payouts, AI-driven races, and support for both gamblers and traditional gamers. Think "Zed Run for space" with real crypto rewards and next-gen gameplay.</p>
          </div>
        </section>

        <!-- Competitive Comparisons & Trust -->
        <section class="faq-section">
          <h3>Competitive Comparisons & Trust</h3>
          <div class="faq-item">
            <p><strong>Cosmicrafts Rush vs Zed Run: What's the difference?</strong><br>
            While Zed Run focuses on NFT horse racing with breeding mechanics, Cosmicrafts Rush offers spaceship racing with AI chaos events, instant payouts, and a more arcade-style experience. Both are provably fair, but Cosmicrafts Rush features faster races, unique chaos mechanics, and a sci-fi theme that appeals to both crypto enthusiasts and traditional gamers.</p>
          </div>

          <div class="faq-item">
            <p><strong>How does Cosmicrafts Rush compare to Photo Finish Live?</strong><br>
            Photo Finish Live offers realistic horse racing simulation, while Cosmicrafts Rush provides arcade-style spaceship racing with AI-driven chaos events. Our game focuses on quick, exciting races with instant crypto payouts, making it perfect for players who want fast-paced action rather than detailed horse management.</p>
          </div>

          <div class="faq-item">
            <p><strong>Cosmicrafts Rush vs Pegaxy: Which is better for earning?</strong><br>
            Both games offer P2E mechanics, but Cosmicrafts Rush features faster races with instant payouts and unique AI chaos events. While Pegaxy focuses on mechanical "Pegas" with breeding tournaments, Cosmicrafts Rush emphasizes quick, exciting races that can be completed in minutes with immediate crypto rewards.</p>
          </div>

          <div class="faq-item">
            <p><strong>How does Cosmicrafts Rush stack up against REVV Racing?</strong><br>
            REVV Racing offers NFT car racing with cross-game rewards, while Cosmicrafts Rush provides spaceship racing with AI chaos and instant payouts. Our game focuses on the unique combination of sci-fi racing, AI-driven unpredictability, and provably fair on-chain execution that sets it apart from traditional car racing games.</p>
          </div>

          <div class="faq-item">
            <p><strong>Is Cosmicrafts Rush legit and safe to play?</strong><br>
            Yes, Cosmicrafts Rush is 100% legitimate and safe. The code is completely open source and auditable - you can check the smart contracts yourself. Each ship has a balanced 8-16% win rate, and races use EVM randomness for fair outcomes. It's your luck and choices that determine the results, not any hidden mechanics.</p>
          </div>

          <div class="faq-item">
            <p><strong>How do I know the races aren't rigged?</strong><br>
            The game uses EVM randomness to determine race outcomes, making it completely fair and unpredictable. Each spaceship has a balanced 8-16% win rate, and all smart contracts are open source and auditable. You can verify the code yourself - there's no way to rig the races as everything runs on transparent blockchain technology.</p>
          </div>

          <div class="faq-item">
            <p><strong>Can I really withdraw my winnings?</strong><br>
            Yes, you can withdraw your winnings at any moment! Simply unlock an achievement by playing a ship 5 times or complete other easy achievements designed to prevent economy exploitation. You also get free tokens upon signup, so it's completely safe to try. If you enjoy the game, you can acquire more tokens to continue playing.</p>
          </div>

          <div class="faq-item">
            <p><strong>What makes Cosmicrafts Rush better than other crypto racing games?</strong><br>
            This is a game you can play right now - we don't pre-sell or create hype before having a working product. You're not funding a scam or ponzi scheme. We give you everything you need to get started for free, including tokens upon signup. Cosmicrafts Rush combines provably fair mechanics, instant payouts, AI-driven chaos events, and a complete, playable experience from day one.</p>
          </div>
        </section>

        <!-- General Web3 Racing & Betting -->
        <section class="faq-section">
          <h3>General Web3 Racing & Betting</h3>
          <div class="faq-item">
            <ul class="faq-keywords">
              <li>web3 betting racing game free</li>
              <li>crypto betting platform</li>
              <li>zed run alternative</li>
              <li>best web3 games 2025</li>
              <li>virtual horse racing game</li>
              <li>web3 games play-to-earn</li>
              <li>best web3 casinos</li>
              <li>crypto betting app</li>
            </ul>
            <p>Search these terms to find Cosmicrafts Rush and other top web3, blockchain, and provably fair crypto betting experiences.</p>
          </div>
        </section>
      </div>

      <!-- Modal Footer -->
      <div class="modal-footer">
        <div class="layout-flex-center">
          <button
            class="btn btn-primary btn-sm"
            @click="closeFAQ"
          >
            <div class="layout-flex-center gap-2">
              <Icon name="solar:rocket-bold" class="w-5 h-5" />
              <span>Ready to Race!</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted } from 'vue'

  interface Props {
    showOnStart?: boolean
  }

  const props = withDefaults(defineProps<Props>(), {
    showOnStart: false,
  })

  const show = ref(false)

  // Close FAQ modal
  const closeFAQ = () => {
    show.value = false
    // Store in localStorage to remember user has seen FAQ
    localStorage.setItem('cosmicrush-faq-seen', 'true')
  }

  // Show FAQ on mount if configured to show on start
  onMounted(() => {
    if (props.showOnStart) {
      const hasSeenFAQ = localStorage.getItem('cosmicrush-faq-seen')
      show.value = !hasSeenFAQ
    }
  })

  defineExpose({
    open: () => {
      show.value = true
    },
    close: () => {
      show.value = false
    },
  })
</script>

<style scoped>
  .faq-modal-container {
    max-width: 90vw;
    max-height: 90vh;
    width: 800px;
  }

  .faq-content {
    max-height: 60vh;
    overflow-y: auto;
    padding: 1.5rem;
  }

  .faq-section {
    margin-bottom: 2rem;
  }

  .faq-section h3 {
    color: var(--cosmic-sky);
    font-size: 1.25rem;
    font-weight: 700;
    margin-bottom: 1rem;
    border-bottom: 1px solid var(--cosmic-sky);
    padding-bottom: 0.5rem;
  }

  .faq-item {
    margin-bottom: 1.5rem;
    padding: 1rem;
    background: rgba(15, 185, 253, 0.05);
    border-radius: 0.5rem;
    border-left: 3px solid var(--cosmic-sky);
  }

  .faq-item p {
    color: var(--text-color);
    line-height: 1.6;
    margin: 0;
  }

  .faq-item strong {
    color: var(--cosmic-pink);
    font-weight: 600;
  }

  .faq-keywords {
    list-style: none;
    padding: 0;
    margin: 1rem 0;
  }

  .faq-keywords li {
    color: var(--cosmic-sky);
    font-weight: 500;
    margin-bottom: 0.5rem;
    padding: 0.5rem;
    background: rgba(15, 185, 253, 0.1);
    border-radius: 0.25rem;
    border-left: 2px solid var(--cosmic-sky);
  }

  /* Responsive adjustments */
  @media (max-width: 768px) {
    .faq-modal-container {
      max-width: 95vw;
      width: 95vw;
    }

    .faq-content {
      max-height: 70vh;
      padding: 1rem;
    }

    .faq-section h3 {
      font-size: 1.1rem;
    }

    .faq-item {
      padding: 0.75rem;
    }
  }
</style>
