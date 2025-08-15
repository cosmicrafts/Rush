# Notification System

This project uses Nuxt UI's toast system for notifications across all components.

## Setup

The notification system is already set up in `app.vue` with the `<UToaster />` component and the `useNotifications` composable.

## Usage

### Basic Usage

```vue
<script setup>
  import { useNotifications } from '~/composables/useNotifications'

  const { showSuccess, showError, showWarning, showInfo } = useNotifications()

  // Show different types of notifications
  showSuccess('Operation completed!', 'Your action was successful')
  showError('Something went wrong', 'Please try again')
  showWarning('Warning', 'This action cannot be undone')
  showInfo('Information', 'Here is some useful information')
</script>
```

### Game-Specific Notifications

The notification system includes specialized functions for common game events:

```vue
<script setup>
  import { useNotifications } from '~/composables/useNotifications'

  const {
    showRaceNotification,
    showBettingNotification,
    showWalletNotification,
    showAchievementNotification,
    showTransactionNotification,
    showJackpotNotification,
  } = useNotifications()

  // Race updates
  showRaceNotification('Race started!', 'success')
  showRaceNotification('Race completed', 'info')

  // Betting updates
  showBettingNotification('Bet placed successfully!', 'success')
  showBettingNotification('Insufficient balance', 'error')

  // Wallet events
  showWalletNotification('Wallet connected', 'success')
  showWalletNotification('Transaction pending', 'warning')

  // Achievements
  showAchievementNotification('First Win!', '100 SPIRAL')

  // Transactions
  showTransactionNotification('0x1234...5678', 'pending')
  showTransactionNotification('0x1234...5678', 'success')
  showTransactionNotification('0x1234...5678', 'error')

  // Jackpots
  showJackpotNotification(1, '1000 SPIRAL') // Mini Jackpot
  showJackpotNotification(2, '5000 SPIRAL') // Mega Jackpot
  showJackpotNotification(3, '10000 SPIRAL') // Super Jackpot
</script>
```

## Notification Types

- **Success**: emerald notifications with check icon
- **Error**: Red notifications with exclamation icon
- **Warning**: Yellow notifications with warning icon
- **Info**: sky notifications with information icon
- **Achievement**: Purple notifications with trophy icon
- **Jackpot**: Yellow notifications with sparkles icon

## Timeouts

- **All notifications**: 3 seconds (unified timeout system)
- **Transaction pending**: No timeout (manual dismissal required)

The timeout system is unified for better consistency across all notification types. You can modify the `DEFAULT_TIMEOUT` constant in `composables/useNotifications.ts` to change the default duration.

## Examples in Components

### BettingInterface.vue

```vue
<script setup>
  const { showBettingNotification, showError, showSuccess } = useNotifications()

  // Show approval success
  showSuccess('Approval Successful', 'SPIRAL tokens approved for betting')

  // Show bet placement
  showBettingNotification('Bet placed successfully!', 'success')
</script>
```

### app.vue

```vue
<script setup>
  const { showWalletNotification, showAchievementNotification, showJackpotNotification } =
    useNotifications()

  // Wallet connection
  showWalletNotification('Wallet connected successfully!', 'success')

  // Achievement unlocked
  showAchievementNotification('First Win!', '100 SPIRAL')

  // Jackpot won
  showJackpotNotification(2, '5000 SPIRAL')
</script>
```

## Customization

You can customize the notification system by modifying the `useNotifications` composable in `composables/useNotifications.ts`.

### Adding New Notification Types

```typescript
const showCustomNotification = (title: string, description?: string) => {
  toast.add({
    title,
    description,
    color: 'purple', // or any other color
    icon: 'i-heroicons-star',
    timeout: 5000,
  })
}
```

### Modifying Timeouts

```typescript
// Change the default timeout for all notifications
const DEFAULT_TIMEOUT = 5000 // 5 seconds instead of 3

// Or modify individual notification timeouts
const showSuccess = (title: string, description?: string) => {
  toast.add({
    title,
    description,
    color: 'success',
    icon: 'i-heroicons-check-circle',
    duration: 5000, // Custom timeout for this specific notification
  })
}
```
