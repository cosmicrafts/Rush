// Backend local de Cosmicrafts Rush — modo "local" (sin cadena).
//
// Identidad via WOU-ID (https://id.worldofunreal.com): login anonimo,
// username y avatar del perfil. El progreso del juego vive en el navegador
// (localStorage, una llave por account_id) hasta la fase 2 (ledger SPIRAL).
//
// Expone la MISMA interfaz que el useWeb3 original (nombres, formas y tipos
// que esperan useBetting, app.vue y los componentes).
//
// El codigo de cadena (useWeb3.ts, useRefactoredWeb3.ts, usePushChain*.ts,
// pushchain/) queda intacto por si un dia se quiere volver a cadena con
// NUXT_PUBLIC_RUSH_MODE=chain.
import { ref, computed } from 'vue'
import { wouAuth } from '@worldofunreal/id'
import type { PlayerAccount } from '@worldofunreal/id'
import { SHIPS_ROSTER } from './useShips'
import {
  generateSimulatedRaceResult,
  reconstructRaceFromBlockchain,
  animateRaceProgression,
} from './useLocalRaceSim'

const STORAGE_KEY = 'rush-local-v1'
const FAUCET_AMOUNT = 1000
const MIN_BET = 10
const MAX_BET = 1000
const WIN_MULTIPLIER = 6

interface LocalMatch {
  raceId: number
  timestamp: number
  spaceship: number
  betAmount: string
  placement: number
  payout: string
  jackpotTier: number
  jackpotAmount: string
}

interface LocalState {
  address: string | null
  credits: number
  raceSeq: number
  totalRaces: number
  totalVolume: number
  totalWinnings: number
  biggestWin: number
  highestJackpotTier: number
  pots: { mini: number; mega: number; super: number }
  matches: LocalMatch[]
  shipWins: Record<number, number>
  shipBets: Record<number, number>
  username: string
  avatarId: number
  achievements: string[]
}

const defaultState = (): LocalState => ({
  address: null,
  credits: 0,
  raceSeq: 1,
  totalRaces: 0,
  totalVolume: 0,
  totalWinnings: 0,
  biggestWin: 0,
  highestJackpotTier: 0,
  pots: { mini: 5000, mega: 25000, super: 100000 },
  matches: [],
  shipWins: {},
  shipBets: {},
  username: '',
  avatarId: 0,
  achievements: [],
})

const stateKey = (accountId: string | null) =>
  accountId ? `${STORAGE_KEY}:${accountId}` : STORAGE_KEY

const readKey = (key: string): LocalState | null => {
  try {
    if (typeof window === 'undefined') return null
    const raw = window.localStorage.getItem(key)
    if (!raw) return null
    return { ...defaultState(), ...(JSON.parse(raw) as Partial<LocalState>) }
  } catch {
    return null
  }
}

const loadState = (accountId: string | null = null): LocalState => {
  // Migra el perfil viejo (llave unica) a la llave por cuenta.
  if (accountId) {
    const keyed = readKey(stateKey(accountId))
    if (keyed) return keyed
    const legacy = readKey(STORAGE_KEY)
    if (legacy) return legacy
  }
  return readKey(stateKey(accountId)) || defaultState()
}

// Ocho naves del roster, orden aleatorio = posiciones de llegada.
const round2 = (v: number) => Math.round(v * 100) / 100

const rollPlacements = (): number[] => {
  const ids = SHIPS_ROSTER.map(s => s.id)
  for (let i = ids.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[ids[i], ids[j]] = [ids[j], ids[i]]
  }
  return ids
}

let globalLocalInstance: ReturnType<typeof createLocalBackend> | null = null

const createLocalBackend = () => {
  if (typeof window !== 'undefined') {
    try {
      wouAuth.setDefaultContext('rush')
    } catch { /* SDK sin ventana: se configura al conectar */ }
  }

  const store = ref<LocalState>(loadState())
  const wouAccount = ref<PlayerAccount | null>(null)

  const persist = () => {
    try {
      window.localStorage.setItem(stateKey(account.value), JSON.stringify(store.value))
    } catch {
      // Navegador sin almacenamiento: el juego sigue en memoria.
    }
  }

  const applyIdentity = (me: PlayerAccount) => {
    wouAccount.value = me
    account.value = me.account_id
    store.value = loadState(me.account_id)
    store.value.address = me.account_id
    if (me.username) store.value.username = me.username
    currentRaceId.value = store.value.raceSeq
    isConnected.value = true
    connectionState.value = 'connected'
    persist()
    // El dinero manda el servidor; se sincroniza en segundo plano.
    ledgerSyncBalance().catch(() => false)
  }

  // ---------- Estado de conexion ----------
  const connectionState = ref('disconnected')
  const isConnected = ref(false)
  const account = ref<string | null>(store.value.address)
  const currentRaceId = ref(store.value.raceSeq)
  const walletType = ref('wou-id')

  if (account.value) {
    isConnected.value = true
    connectionState.value = 'connected'
  }

  const shortAddress = computed(() => {
    if (wouAccount.value?.username) return wouAccount.value.username
    const a = account.value
    return a ? `${a.slice(0, 6)}...${a.slice(-4)}` : ''
  })
  const formattedBalance = computed(() => `${store.value.credits.toFixed(2)} LOCAL`)
  const formattedSpiralBalance = computed(() => `${store.value.credits.toFixed(2)} SPIRAL`)

  const network = {
    currentChainId: ref('wou-id'),
    getNetworkDisplay: computed(() => 'WOU-ID'),
    isCorrectNetwork: computed(() => true),
    getNetworkIndicatorClass: computed(() => 'bg-emerald-500'),
    getNetworkTextClass: computed(() => 'text-emerald-400'),
  }

  // ---------- Persistencia de sesion ----------
  const saveConnectionState = () => persist()
  const loadConnectionState = () => {
    store.value = loadState(account.value)
    currentRaceId.value = store.value.raceSeq
    if (account.value) {
      isConnected.value = true
      connectionState.value = 'connected'
    }
  }
  const clearConnectionState = () => {
    try {
      window.localStorage.removeItem(stateKey(account.value))
    } catch { /* noop */ }
  }
  const autoReconnect = async () => {
    try {
      const cached = wouAuth.loadSession()
      if (cached) {
        const me = await wouAuth.getMe().catch(() => null)
        if (me) {
          applyIdentity(me)
          return true
        }
        wouAuth.logout()
      }
    } catch { /* sin sesion guardada */ }
    isConnected.value = false
    connectionState.value = 'disconnected'
    return false
  }

  // ---------- Guardias ----------
  const isConnectionReady = () => isConnected.value && account.value !== null
  const isProviderReady = () => true
  const isContractReady = () => true
  const isSignerReady = () => isConnectionReady()
  const getSafeProvider = () => null
  const getSafeContract = () => null
  const getSafeSigner = () => null

  // ---------- Conexion (identidad WOU-ID, sin wallet) ----------
  const connectMetaMask = async () => {
    wouAuth.setDefaultContext('rush')
    // Reutiliza la sesion guardada si sigue valida.
    if (wouAuth.getSessionToken()) {
      const me = await wouAuth.getMe().catch(() => null)
      if (me) {
        applyIdentity(me)
        return account.value
      }
      wouAuth.logout()
    }
    const res = await wouAuth.startAnonymous('rush')
    applyIdentity(res.account)
    return account.value
  }
  const connectCoinbaseWallet = async () => connectMetaMask()
  const connectWallet = async () => connectMetaMask()
  const disconnect = () => {
    try {
      wouAuth.logout()
    } catch { /* noop */ }
    wouAccount.value = null
    isConnected.value = false
    connectionState.value = 'disconnected'
  }
  const disconnectWallet = () => disconnect()

  const updateBalance = async () => {
    await ledgerSyncBalance().catch(() => false)
    return store.value.credits.toFixed(2)
  }
  const updateAllBalances = async () => {
    await updateBalance()
  }

  // ---------- Utilidades (sin cache remota: passthrough) ----------
  const clearCache = () => undefined
  const getCachedData = (_key: string) => null
  const setCachedData = (_key: string, _value: unknown) => undefined
  const cachedContractCall = async (_key: string, fn: () => Promise<unknown>) => fn()
  const queuedContractCall = async (_key: string) => {
    throw new Error('Sin cadena en modo local')
  }
  const getOptimizedContract = () => null
  const getNetworkConfig = () => ({ chainId: 'local', name: 'Rush Local' })
  const withRetry = async <T>(fn: () => Promise<T>): Promise<T> => fn()

  // ---------- Ledger SPIRAL (Ionic-Swap server, verdad del dinero) ----------
  const ledgerBase = () => {
    try {
      const { public: { ledgerUrl } } = useRuntimeConfig()
      return (ledgerUrl as string) || ''
    } catch {
      return ''
    }
  }
  // true = el dinero vive en el servidor; false = solo navegador (sin red).
  const ledgerOn = ref(false)

  const offlineError = () => {
    const e = new Error('ledger-offline') as Error & { offline?: boolean }
    e.offline = true
    return e
  }

  const ledgerCall = async (path: string, init?: RequestInit): Promise<Record<string, unknown>> => {
    const token = wouAuth.getSessionToken()
    if (!token) throw offlineError()
    let res: Response
    try {
      res = await fetch(`${ledgerBase()}/api/ledger${path}`, {
        ...init,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          ...(init?.headers || {}),
        },
      })
    } catch {
      throw offlineError()
    }
    const body = (await res.json().catch(() => ({}))) as Record<string, unknown>
    if (res.status === 402 || res.status === 400) {
      throw new Error((body.error as string) || 'Operacion rechazada')
    }
    if (!res.ok) throw offlineError()
    return body
  }

  const ledgerSyncBalance = async () => {
    try {
      const body = await ledgerCall('/balance')
      store.value.credits = Number(body.balance) || 0
      ledgerOn.value = true
      persist()
      return true
    } catch (e) {
      if ((e as { offline?: boolean }).offline) {
        ledgerOn.value = false
        return false
      }
      throw e
    }
  }

  // ---------- Carreras ----------
  const startNewRace = async () => undefined
  const finishRace = async (_winnerId: number) => undefined

  const placeBetAndGetRace = async (shipId: number, amount: string) => {
    if (!isConnectionReady()) throw new Error('Wallet not connected')
    const stake = parseFloat(amount)
    if (!Number.isFinite(stake) || stake < MIN_BET) throw new Error(`Apuesta minima: ${MIN_BET} SPIRAL`)
    if (stake > MAX_BET) throw new Error(`Apuesta maxima: ${MAX_BET} SPIRAL`)

    const raceId = store.value.raceSeq
    const txKey = `${account.value}-${raceId}-${Date.now().toString(36)}`

    // El debito es la verdad: si el servidor dice que no hay fondos, no hay carrera.
    let serverMoney = false
    try {
      const debit = await ledgerCall('/debit', {
        method: 'POST',
        body: JSON.stringify({ amount: stake, key: txKey }),
      })
      store.value.credits = Number(debit.balance) || 0
      serverMoney = true
      ledgerOn.value = true
    } catch (e) {
      if (!(e as { offline?: boolean }).offline) throw e
      ledgerOn.value = false
      if (stake > store.value.credits) throw new Error('Saldo insuficiente. Pide del faucet.')
      store.value.credits -= stake
    }

    store.value.totalVolume += stake
    // Los pozos crecen con cada apuesta.
    store.value.pots.mini += stake * 0.01
    store.value.pots.mega += stake * 0.006
    store.value.pots.super += stake * 0.004

    const placements = rollPlacements()
    const winner = placements[0] as number
    const sim = generateSimulatedRaceResult(winner, placements)
    const raceResult = {
      winner,
      placements,
      totalEvents: sim.totalEvents,
      turnEvents: sim.turnEvents,
    }

    const won = shipId === winner
    let payout = 0
    let jackpotTier = 0
    let jackpotAmount = 0
    if (won) {
      payout = stake * WIN_MULTIPLIER
      // 3% de las victorias pegan jackpot.
      if (Math.random() < 0.03) {
        const roll = Math.random()
        if (roll < 0.6) {
          jackpotTier = 1
          jackpotAmount = store.value.pots.mini * 0.1
          store.value.pots.mini *= 0.9
        } else if (roll < 0.9) {
          jackpotTier = 2
          jackpotAmount = store.value.pots.mega * 0.1
          store.value.pots.mega *= 0.9
        } else {
          jackpotTier = 3
          jackpotAmount = store.value.pots.super * 0.1
          store.value.pots.super *= 0.9
        }
        payout += jackpotAmount
      }
      store.value.totalWinnings += payout
      store.value.biggestWin = Math.max(store.value.biggestWin, payout)
      store.value.highestJackpotTier = Math.max(store.value.highestJackpotTier, jackpotTier)
      store.value.shipWins[shipId] = (store.value.shipWins[shipId] || 0) + 1
    }
    store.value.credits += payout
    if (serverMoney && payout > 0) {
      try {
        const credit = await ledgerCall('/credit', {
          method: 'POST',
          body: JSON.stringify({ amount: round2(payout), key: `win-${txKey}` }),
        })
        store.value.credits = Number(credit.balance) ?? store.value.credits
      } catch (e) {
        if (!(e as { offline?: boolean }).offline) throw e
        ledgerOn.value = false
      }
    }
    store.value.shipBets[shipId] = (store.value.shipBets[shipId] || 0) + 1
    store.value.totalRaces += 1
    store.value.raceSeq += 1
    currentRaceId.value = store.value.raceSeq
    const placement = placements.indexOf(shipId) + 1
    store.value.matches.unshift({
      raceId,
      timestamp: Date.now(),
      spaceship: shipId,
      betAmount: String(stake),
      placement,
      payout: payout.toFixed(2),
      jackpotTier,
      jackpotAmount: jackpotAmount.toFixed(2),
    })
    unlockAchievements(shipId, won, jackpotTier, stake)
    persist()

    const txHash = `local-${raceId}-${Date.now().toString(36)}`
    return {
      receipt: { transactionHash: txHash },
      raceResult,
      actualPayout: payout.toFixed(2),
      jackpotTier,
      jackpotAmount: jackpotAmount.toFixed(2),
      txHash,
    }
  }

  const getCurrentRaceInfo = async () => ({
    raceId: String(store.value.raceSeq),
    totalBets: store.value.totalVolume.toFixed(2),
    totalRaces: String(store.value.totalRaces),
    isActive: true,
  })

  const getGameStats = async () => ({
    gameCurrentRace: String(store.value.raceSeq),
    gameTotalRaces: String(store.value.totalRaces),
    gameTotalVolume: store.value.totalVolume.toFixed(2),
    gameMiniJackpot: store.value.pots.mini.toFixed(2),
    gameMegaJackpot: store.value.pots.mega.toFixed(2),
    gameSuperJackpot: store.value.pots.super.toFixed(2),
  })

  const getShipBets = async (_raceId: number) => {
    // Volumen local de la mesa + bots de ambiente.
    return SHIPS_ROSTER.map(s => {
      const mine = store.value.matches
        .filter(m => m.raceId === store.value.raceSeq && m.spaceship === s.id)
        .reduce((sum, m) => sum + parseFloat(m.betAmount), 0)
      return (mine + Math.random() * 400).toFixed(2)
    })
  }

  const getPlayerBets = async (_player: string, _raceId: number) => ({
    spaceship: 0,
    amount: '0',
    claimed: true,
  })

  const getDebugRaceSimulation = async () => {
    const placements = rollPlacements()
    return generateSimulatedRaceResult(placements[0] as number, placements)
  }

  const getShipName = (shipId: number) => SHIPS_ROSTER.find(s => s.id === shipId)?.name || 'Unknown'
  const getShipColor = (shipId: number) => SHIPS_ROSTER.find(s => s.id === shipId)?.color || '#ffffff'
  const getShip = async (shipId: number) => SHIPS_ROSTER.find(s => s.id === shipId) || null
  const loadContractInfo = async () => undefined

  // ---------- Stats / perfil ----------
  const getPlayerStats = async (_player?: string) => ({
    totalRaces: store.value.totalRaces,
    totalWinnings: store.value.totalWinnings.toFixed(2),
    biggestWin: store.value.biggestWin.toFixed(2),
    highestJackpotTier: store.value.highestJackpotTier,
    achievementRewards: (store.value.achievements.length * 50).toFixed(2),
    spaceshipWins: { ...store.value.shipWins },
  })

  const getPlayerComprehensiveStats = async (_player?: string) => getPlayerStats()
  const getPlayerLastRaceTime = async (_player?: string) =>
    store.value.matches[0] ? store.value.matches[0].timestamp : 0

  const getSpaceshipBetCount = async (_player: string, spaceshipId: number) =>
    store.value.shipBets[spaceshipId] || 0

  const spaceshipPlacementCount = async (_player: string, _spaceshipId: number, placement: number) =>
    store.value.matches.filter(m => m.placement === placement).length

  const getPlayerMatchHistory = async (_player: string, from: number, count: number) => ({
    matches: store.value.matches.slice(from, from + count),
    total: store.value.matches.length,
  })
  const getRecentMatches = async (_player: string, count: number) => store.value.matches.slice(0, count)

  const botRow = (name: string, winnings: number, races: number) => ({ name, winnings, races })
  const getTopPlayersByWinnings = async (limit: number) => {
    const me = store.value.username || (account.value ? `${account.value.slice(0, 6)}...` : 'Tu')
    const rows = [
      botRow(me, store.value.totalWinnings, store.value.totalRaces),
      botRow('Nova', 18400, 312),
      botRow('Vex', 12150, 289),
      botRow('Ion', 8300, 201),
      botRow('Pulsar', 5100, 156),
    ]
      .sort((a, b) => b.winnings - a.winnings)
      .slice(0, limit)
    return {
      players: rows.map(r => r.name),
      usernames: rows.map(r => r.name),
      winnings: rows.map(r => r.winnings.toFixed(2)),
      avatars: rows.map((_, i) => i % 8),
    }
  }

  const getPlayerLeaderboardStats = async (_player?: string) => ({
    rank: 1,
    playerTotalWinnings: store.value.totalWinnings.toFixed(2),
    playerTotalRaces: store.value.totalRaces,
    percentile: 99,
  })
  const getLeaderboardStats = async () => ({
    totalPlayers: 5,
    totalVolume: store.value.totalVolume.toFixed(2),
    totalRaces: store.value.totalRaces,
    averageWinnings: store.value.totalRaces > 0
      ? (store.value.totalWinnings / store.value.totalRaces).toFixed(2)
      : '0',
  })

  // ---------- Perfil (WOU-ID) ----------
  const registerUsername = async (username: string, avatarId: number) => {
    store.value.avatarId = avatarId
    try {
      const updated = await wouAuth.updateProfile({ username })
      applyIdentity(updated)
    } catch {
      // Sin red o nombre tomado: queda local hasta sincronizar.
      store.value.username = username
      persist()
    }
    return { transactionHash: `local-user-${Date.now().toString(36)}` }
  }
  const getUsername = async (_player?: string) =>
    wouAccount.value?.username || store.value.username
  const playerHasUsername = async (_player?: string) =>
    (wouAccount.value?.username || store.value.username).length > 0
  const getPlayerAvatar = async (_player?: string) => store.value.avatarId
  const getAddressByUsername = async (username: string) => {
    if (username === (wouAccount.value?.username || store.value.username) && account.value) {
      return account.value
    }
    try {
      const found = await wouAuth.getUserByUsername(username)
      return found?.account_id || ''
    } catch {
      return ''
    }
  }

  // ---------- Logros ----------
  const ACHIEVEMENTS = [
    { name: 'first-bet', label: 'Primera apuesta', description: 'Coloca tu primera apuesta', reward: '50' },
    { name: 'first-win', label: 'Primera victoria', description: 'Gana tu primera carrera', reward: '50' },
    { name: 'ten-races', label: '10 carreras', description: 'Completa 10 carreras', reward: '50' },
    { name: 'high-roller', label: 'Apuesta de 1000', description: 'Apuesta 1000 SPIRAL', reward: '50' },
    { name: 'jackpot-hit', label: 'Jackpot', description: 'Pega un jackpot', reward: '50' },
  ]

  const unlockAchievements = (shipId: number, won: boolean, jackpotTier: number, stake: number) => {
    void shipId
    const add = (name: string) => {
      if (!store.value.achievements.includes(name)) store.value.achievements.push(name)
    }
    add('first-bet')
    if (won) add('first-win')
    if (store.value.totalRaces >= 10) add('ten-races')
    if (stake >= MAX_BET) add('high-roller')
    if (jackpotTier > 0) add('jackpot-hit')
  }

  const achievementList = () =>
    ACHIEVEMENTS.map(a => ({
      name: a.name,
      label: a.label,
      unlocked: store.value.achievements.includes(a.name),
    }))

  // Forma de cadena que espera app.vue (nftId/name/description/tokenReward).
  const txAchievements = () =>
    ACHIEVEMENTS.filter(a => store.value.achievements.includes(a.name)).map((a, i) => ({
      nftId: `local-${a.name}`,
      name: a.label,
      description: a.description,
      tokenReward: a.reward,
    }))

  const getPlayerAchievementCount = async (_player?: string) => store.value.achievements.length
  const getPlayerAchievementsCount = async (_player?: string) => store.value.achievements.length
  const fetchRecentAchievements = async (_player?: string) => txAchievements()
  const fetchAchievementsFromTx = async (_player?: string) => txAchievements()

  // ---------- Faucet (ledger; recarga cuando te quedas corto) ----------
  const claimFaucet = async () => {
    try {
      const body = await ledgerCall('/faucet', { method: 'POST' })
      store.value.credits = Number(body.balance) || 0
      ledgerOn.value = true
      persist()
    } catch (e) {
      if ((e as { offline?: boolean }).offline) {
        ledgerOn.value = false
        store.value.credits += FAUCET_AMOUNT
        persist()
      } else {
        throw e
      }
    }
    return { transactionHash: `local-faucet-${Date.now().toString(36)}` }
  }
  const hasClaimedFaucet = async (_user?: string) => {
    await ledgerSyncBalance().catch(() => false)
    return store.value.credits >= MIN_BET
  }

  // ---------- Tokens (sin aprobaciones en local) ----------
  const getSpiralBalance = async (_address?: string) => {
    await ledgerSyncBalance().catch(() => false)
    return store.value.credits.toFixed(2)
  }
  const approveSpiralTokens = async (_amount?: string) => ({
    transactionHash: `local-approve-${Date.now().toString(36)}`,
  })
  const approveSpiralToken = async (_spender: string, _amount: string) => ({
    transactionHash: `local-approve-${Date.now().toString(36)}`,
  })
  const checkApprovalNeeded = async (_amount: string) => false
  const claimWinnings = async () => ({ transactionHash: `local-claim-${Date.now().toString(36)}` })

  // ---------- Jackpots ----------
  const getJackpotAmounts = async () => ({
    mini: store.value.pots.mini.toFixed(2),
    mega: store.value.pots.mega.toFixed(2),
    super: store.value.pots.super.toFixed(2),
  })

  // ---------- NFTs (coleccion vacia en local) ----------
  const fetchUserNFTs = async (_userAddress: string) => []

  return {
    connectionState,
    isConnected,
    account,
    network,
    currentRaceId,
    shortAddress,
    formattedBalance,
    formattedSpiralBalance,
    walletType,

    saveConnectionState,
    loadConnectionState,
    clearConnectionState,
    autoReconnect,

    isProviderReady,
    isContractReady,
    isSignerReady,
    isConnectionReady,
    getSafeProvider,
    getSafeContract,
    getSafeSigner,

    connectMetaMask,
    connectCoinbaseWallet,
    connectWallet,
    disconnect,
    disconnectWallet,
    updateBalance,
    updateAllBalances,

    clearCache,
    getCachedData,
    setCachedData,
    cachedContractCall,
    queuedContractCall,
    getOptimizedContract,
    getNetworkConfig,
    withRetry,

    startNewRace,
    finishRace,
    placeBetAndGetRace,
    getCurrentRaceInfo,
    getGameStats,
    getShipBets,
    getPlayerBets,
    getDebugRaceSimulation,
    reconstructRaceFromBlockchain,
    animateRaceProgression,
    getShipName,
    getShipColor,

    getPlayerStats,
    getPlayerAchievementCount,
    getPlayerAchievementsCount,
    spaceshipPlacementCount,
    getSpaceshipBetCount,
    getSpiralBalance,
    getJackpotAmounts,
    claimWinnings,
    claimFaucet,
    hasClaimedFaucet,
    approveSpiralTokens,
    approveSpiralToken,
    getShip,
    loadContractInfo,
    registerUsername,
    getUsername,
    playerHasUsername,
    getPlayerAvatar,
    getAddressByUsername,
    getPlayerMatchHistory,
    getRecentMatches,
    getTopPlayersByWinnings,
    getPlayerLeaderboardStats,
    getLeaderboardStats,
    getPlayerComprehensiveStats,
    getPlayerLastRaceTime,
    fetchRecentAchievements,
    fetchAchievementsFromTx,
    checkApprovalNeeded,
    generateSimulatedRaceResult,
    fetchUserNFTs,
  }
}

export const useLocalBackend = () => {
  if (!globalLocalInstance) globalLocalInstance = createLocalBackend()
  return globalLocalInstance
}
