# Flow States Documentation

This document explains all state variables returned by the `useBluvoFlow()` hook in plain English. These states help you understand where the user is in their withdrawal journey and what UI elements to show.

## The Withdrawal Journey Overview

When a user wants to withdraw cryptocurrency from a centralized exchange (CEX) to their wallet, they go through several stages:

1. **Exchange Selection** - Choose which exchange to withdraw from
2. **OAuth Authentication** - Connect securely to the exchange (login via popup)
3. **Wallet Connection** - Load their exchange wallet and check balances
4. **Quote Generation** - Get a price quote for the withdrawal
5. **Withdrawal Execution** - Complete the actual withdrawal transaction

Each stage has its own state variables to help you build the right UI for the user's current step.

---

## General Flow States

### `isIdle`
**When it's true**: The flow hasn't started yet. No withdrawal process is in progress.

**What it means**: The user is at the starting point. They haven't selected an exchange or started any authentication. Show your initial UI where users can begin a withdrawal.

### `isFlowCancelled`
**When it's true**: The user or your application has explicitly cancelled the withdrawal flow.

**What it means**: The withdrawal process was stopped before completion. This might happen if the user clicked a "Cancel" button or closed the process. You should clean up the UI and return to the initial state.

---

## Exchange Selection States

### `isExchangesLoading`
**When it's true**: The system is fetching the list of supported exchanges.

**What it means**: Your app is requesting the list of exchanges the user can withdraw from (like Binance, Coinbase, Kraken). Show a loading spinner while this happens.

### `isExchangesReady`
**When it's true**: The list of exchanges has been successfully loaded.

**What it means**: The user can now see and choose which exchange they want to withdraw from. Display the exchange selection UI with logos and names.

### `isExchangesError`
**When it's true**: Something went wrong while loading the exchange list.

**What it means**: The system couldn't fetch the exchanges (maybe network issues or API problems). Show an error message and offer a retry button.

### `exchangesError`
**What it contains**: The specific error that occurred when loading exchanges.

**How to use it**: Display the error message to help users understand what went wrong. Example: "Could not connect to exchange service. Please try again."

---

## OAuth Authentication States

OAuth is how users securely connect to their exchange account. A popup window opens where they log in to the exchange, then the exchange sends back permission to access their wallet.

### `isOAuthPending`
**When it's true**: The OAuth process has started but hasn't finished yet.

**What it means**: The user is in the middle of authenticating. Either the popup window is about to open, or they're actively logging in. Show a "Connecting to exchange..." message.

### `isOAuthWaiting`
**When it's true**: The popup window is open and waiting for the user to log in.

**What it means**: The user sees the exchange's login page in a popup window. They need to enter their username/password there. Show a message like "Please complete login in the popup window."

### `isOAuthProcessing`
**When it's true**: The user completed login in the popup, and now the system is exchanging tokens with the exchange.

**What it means**: The technical handshake is happening between your app and the exchange servers. Show "Authenticating..." with a spinner.

### `isOAuthError`
**When it's true**: Something went wrong during OAuth authentication.

**What it means**: The login failed. This could be wrong credentials, network issues, or the user denied permission. Show an error and let them try again.

### `isOAuthComplete`
**When it's true**: OAuth authentication succeeded!

**What it means**: The user is now authenticated with the exchange. The flow automatically continues to load their wallet. You might briefly show "Connected!" before moving to the next stage.

### `isOAuthWindowBeenClosedByTheUser`
**When it's true**: The user closed the popup window before finishing login.

**What it means**: They cancelled the authentication by closing the popup. Ask if they want to try connecting again, or return to the start.

---

## Wallet Connection States

After successful OAuth, the system connects to the user's exchange wallet to check their balances.

### `isWalletLoading`
**When it's true**: The system is connecting to the user's exchange wallet and fetching their balances.

**What it means**: Behind the scenes, the app is requesting the user's wallet data from the exchange API. Show "Loading your wallet..." with a spinner.

### `isWalletReady`
**When it's true**: The wallet is connected and balance information is available.

**What it means**: You now have the user's wallet balances! Display them so the user can see what cryptocurrencies they have and how much. They can proceed to request a withdrawal quote.

### `isWalletError`
**When it's true**: Failed to connect to the user's wallet.

**What it means**: Something went wrong accessing their wallet data. Maybe the exchange API is down, or there's a credential issue. Show an error and offer to retry or re-authenticate.

### `hasWalletNotFoundError`
**When it's true**: The specific wallet ID or API credentials couldn't find a matching wallet.

**What it means**: The wallet doesn't exist on the exchange, or the user provided invalid wallet credentials. Show a helpful message asking them to verify their wallet information.

### `hasInvalidCredentialsError`
**When it's true**: The API credentials (like API key/secret) are invalid or expired.

**What it means**: The authentication keys the user provided don't work. Ask them to double-check their API credentials and re-enter them.

---

## Quote Generation States

A quote tells the user exactly how much crypto they'll receive, including fees. Quotes expire after a few minutes.

### `isQuoteLoading`
**When it's true**: The system is requesting a withdrawal quote from the exchange.

**What it means**: Your app sent a request asking "how much will it cost to withdraw X amount?" Show "Getting quote..." while waiting for the response.

### `isQuoteReady`
**When it's true**: A valid quote is available and hasn't expired yet.

**What it means**: The user can see the withdrawal details: amount to send, fees, final amount received, and how long the quote is valid. Show a "Confirm Withdrawal" button.

### `isQuoteExpired`
**When it's true**: The quote was valid but too much time passed.

**What it means**: Quotes typically expire after 30-60 seconds because crypto prices change. Show a message like "Quote expired" with a "Get New Quote" button. The SDK can auto-refresh quotes if configured.

### `isQuoteError`
**When it's true**: Couldn't generate a quote.

**What it means**: Something went wrong requesting the quote. Maybe the amount is too small/large, the address is invalid, or there's a network error. Check the error helpers below for specifics.

---

## Withdrawal Execution States

After the user confirms the quote, the actual withdrawal transaction begins.

### `isWithdrawing`
**When it's true**: A withdrawal transaction is actively in progress.

**What it means**: The withdrawal has started but hasn't finished yet. The user should wait. Show "Processing withdrawal..." with a spinner. This could take seconds to minutes.

### `isWithdrawProcessing`
**When it's true**: The withdrawal transaction is being executed on the exchange.

**What it means**: The exchange is processing the transaction right now. Money is moving! Show "Withdrawal in progress..." and disable any action buttons.

### `isWithdrawalComplete`
**When it's true**: The withdrawal finished successfully!

**What it means**: The crypto has been sent from the exchange to the destination wallet. Show a success message with transaction details. The user is done!

### `isWithdrawBlocked`
**When it's true**: The exchange blocked or rejected the withdrawal.

**What it means**: The exchange won't allow this withdrawal for some reason (maybe account restrictions, suspicious activity detection, or exchange-specific rules). Show the error message and explain the user may need to contact the exchange.

### `hasFatalError`
**When it's true**: An unrecoverable error occurred during withdrawal.

**What it means**: Something went seriously wrong and the withdrawal can't continue. This might be an invalid address, amount out of bounds, or system error. Show the error message and let the user start over.

---

## Withdrawal Requirements & Errors

Sometimes exchanges require additional verification during withdrawal. These states tell you what the user needs to provide.

### `requires2FA`
**When it's true**: The exchange needs a 2FA (Two-Factor Authentication) code to continue.

**What it means**: The user needs to open their authenticator app (like Google Authenticator) and enter the 6-digit code. Show a 2FA input field with a "Submit" button. Call `submit2FA(code)` when they enter it.

### `requiresSMS`
**When it's true**: The exchange sent an SMS code to the user's phone and needs it to continue.

**What it means**: The user should check their phone for a text message with a verification code. Show an SMS code input field. Submit it using the appropriate method when they enter it.

### `requiresKYC`
**When it's true**: The exchange requires KYC (Know Your Customer) verification before allowing the withdrawal.

**What it means**: The user must complete identity verification on the exchange before they can withdraw. Show a message explaining they need to verify their identity on the exchange's website first, then come back.

### `requiresValid2FAMethod`
**When it's true**: The user needs to set up or fix their 2FA method on the exchange.

**What it means**: Either they don't have 2FA enabled, or their current 2FA method isn't working. Direct them to the exchange's security settings to configure 2FA properly.

### `requiresEmailVerification`
**When it's true**: The user's email address on the exchange isn't verified.

**What it means**: They need to check their email for a verification link from the exchange and click it. Then they can retry the withdrawal.

### `hasInsufficientBalance`
**When it's true**: The user doesn't have enough crypto in their wallet for this withdrawal.

**What it means**: The wallet balance is lower than the withdrawal amount plus fees. Show a clear message about the shortfall and suggest reducing the withdrawal amount.

### `canRetry`
**When it's true**: The system is automatically retrying the withdrawal after a temporary failure.

**What it means**: Something failed (maybe a network hiccup), but the system thinks it can succeed if it tries again. Show "Retrying..." with a spinner. The SDK handles this automatically.

---

## Error Detection Helpers

These helpers check the error messages to give you specific information about what went wrong. Useful for showing targeted error messages.

### `hasAmountError`
**When it's true**: The error is related to the withdrawal amount.

**What it means**: The amount is either too small (below minimum) or too large (above maximum). Show a message like "Amount must be between X and Y" based on the exchange's limits.

### `hasAddressError`
**When it's true**: The error is related to the destination address.

**What it means**: The wallet address the user wants to send to is invalid or not recognized. Show "Invalid wallet address" and ask them to double-check it.

### `hasNetworkError`
**When it's true**: The error is related to network connectivity.

**What it means**: Internet connection issues or the API servers are unreachable. Show "Network error. Please check your connection" and offer a retry button.

---

## Context Data

These aren't boolean states, but important data you might need:

### `invalid2FAAttempts`
**What it contains**: How many times the user entered an incorrect 2FA code.

**How to use it**: Show a warning if they've tried several times. After too many attempts, you might want to suggest they verify their authenticator app is synced correctly.

### `retryAttempts`
**What it contains**: How many times the system has retried the withdrawal.

**How to use it**: Show retry progress like "Retry attempt 2 of 3" so users know the system is working on it.

### `maxRetryAttempts`
**What it contains**: The maximum number of automatic retries allowed (usually 3).

**How to use it**: Combined with `retryAttempts`, show progress or explain how many attempts remain.

### `exchanges`
**What it contains**: Array of exchange objects with id, name, logoUrl, and status.

**How to use it**: Display the exchange selection UI with logos and names for users to choose from.

### `walletBalances`
**What it contains**: Array of the user's crypto balances (asset, balance, balanceInFiat).

**How to use it**: Show users what cryptocurrencies they own and how much of each. Example: "BTC: 0.5 ($25,000)"

### `quote`
**What it contains**: The withdrawal quote object with amounts, fees, and expiration time.

**How to use it**: Display the quote details to users before they confirm: "Send 0.1 BTC, Fee: 0.0005 BTC, You'll receive: 0.0995 BTC"

### `withdrawal`
**What it contains**: Information about the completed or in-progress withdrawal transaction.

**How to use it**: Show transaction ID, status, amounts, and timestamps. Users can track their withdrawal with this info.

### `valid2FAMethods`
**What it contains**: List of valid 2FA methods the exchange accepts (like 'totp', 'sms').

**How to use it**: If the user needs to set up 2FA, show them which methods are acceptable for this exchange.

---

## Putting It All Together

Here's a typical flow showing which states become true at each stage:

1. **Start**: `isIdle` → User clicks "Start Withdrawal"
2. **Loading Exchanges**: `isExchangesLoading` → `isExchangesReady` → Show exchange list
3. **User Selects Exchange**: `isOAuthWaiting` → Popup opens for login
4. **User Logs In**: `isOAuthProcessing` → `isOAuthComplete`
5. **Loading Wallet**: `isWalletLoading` → `isWalletReady` → Show balances
6. **User Requests Quote**: `isQuoteLoading` → `isQuoteReady` → Show quote details
7. **User Confirms**: `isWithdrawing` → `isWithdrawProcessing`
8. **Possible Interruption**: `requires2FA` → User enters code → Back to `isWithdrawProcessing`
9. **Success**: `isWithdrawalComplete` → Show success message!

By checking these state variables, you can show the right UI at every step and handle any errors gracefully.
