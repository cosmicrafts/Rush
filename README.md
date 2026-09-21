# Cosmic Rush

AI spaceship racing on Cosmicrafts' own infrastructure. Live at
**https://rush.cosmicrafts.com**.

## Architecture (no external chains)

| Piece | Where | What |
|---|---|---|
| Identity | `wou-id` (`id.worldofunreal.com`) | Anonymous login, username, avatar via `@worldofunreal/id` |
| Money | `Ionic-Swap` server (`/api/ledger/*`) | SPIRAL balances, faucet, idempotent debit/credit, JWT auth |
| Cards | `nftropoly` (`rush` collection) | Achievements minted as collectible cards, Apex gating |
| Game | this repo (Nuxt 4, static) | Betting UI, race animation, local progress cache |

Flow: Jugar → WOU-ID account → faucet SPIRAL → bet (server debit) →
animated race → winnings credited → achievement cards claimed.

## Backend switchboard

- `composables/useLocalBackend.ts` — the only backend: WOU-ID + ledger + cards.
- `composables/useBackend.ts` — re-export as `useWeb3` (name kept so components don't change).
- `composables/useLocalRaceSim.ts` — pure race animation (no network).

## Develop

```bash
npm install
npm run dev      # needs ledger: NUXT_PUBLIC_LEDGER_URL=http://127.0.0.1:8081
npm run generate # static bundle -> .output/public
```

## Deploy

Push to `main` → `.github/workflows/deploy.yml` generates the static bundle
and ships it to `/var/www/rush.cosmicrafts.com` (immutable release + atomic
symlink flip, keeps 5). Requires secrets `SSH_PRIVATE_KEY`, `SSH_HOST`,
`SSH_USER`.

## To-Do

- Improve race visual effects, chaos factors and movement
- Mobile layout polish
