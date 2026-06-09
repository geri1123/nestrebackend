### Wallet Module Documentation

---

### Overview

The Wallet module manages user digital wallets within the system. It provides functionality for creating wallets, managing balances, processing transactions (top-ups via Paysera, withdrawals, purchases), transferring money between users, and tracking transaction history. The module implements Domain-Driven Design principles and uses idempotent payment processing to prevent duplicate charges.

---

### Architecture

```
wallet/
├── application/
│   └── use-cases/
│       ├── crreate-wallet.use-case.ts
│       ├── get-wallet.use-case.ts
│       ├── change-wallet-balance.use-case.ts
│       ├── transfer-money.use-case.ts
│       ├── create-paysera-topup.use-case.ts
│       └── process-paysera-payment.use-case.ts
├── domain/
│   ├── entities/
│   └── repositories/
├── dto/
├── infrastructure/
│   └── persistence/
├── wallet.controller.ts
├── wallet-webhook.controller.ts
└── wallet.module.ts
```

---

### Domain Model

---

### WalletDomainEntity

A rich domain entity that encapsulates wallet business logic and rules.

**Properties:**
- `id`: Unique wallet identifier
- `userId`: ID of the wallet owner
- `balance`: Current wallet balance (private)
- `createdAt`: Wallet creation timestamp
- `updatedAt`: Last update timestamp
- `currency`: Wallet currency (default: "EUR")

**Business Rules Methods:**

- `canWithdraw(amount)`: Validates if withdrawal is possible
- `topup(amount)`: Adds money to the wallet (amount must be > 0)
- `withdraw(amount)`: Removes money (validates positive amount and sufficient balance)
- `purchase(amount)`: Processes a purchase (alias for withdraw)
- `getBalance()`: Returns current balance

**Factory Methods:**
- `static fromPrisma(data)`: Creates domain entity from database record
- `toPrisma()`: Converts domain entity to database format

---

### Repository Interfaces

---

### IWalletRepository

**Methods:**

- `createWallet(userId, currency)`: Creates a new wallet → `Promise<WalletDomainEntity>`
- `getWalletByUser(userId)`: Retrieves wallet by user ID → `Promise<WalletDomainEntity | null>`
- `findByUserIdTx(tx, userId)`: Retrieves wallet within a transaction → `Promise<WalletDomainEntity | null>`
- `incrementBalanceTx(tx, walletId, amount)`: Atomically adds to balance → `Promise<number>`
- `decrementBalanceIfSufficientTx(tx, walletId, amount)`: Atomically deducts balance if sufficient, returns null if not → `Promise<number | null>`

---

### IWalletTransactionRepository

**Methods:**

- `createTransactionTx(tx, data)`: Records a transaction within a DB transaction → `Promise<WalletTransaction>`
- `findByExternalPaymentIdTx(tx, externalPaymentId)`: Checks for duplicate external payment → `Promise<WalletTransaction | null>`
- `getTransactions(walletId, page, limit)`: Retrieves paginated transaction history → `Promise<WalletTransaction[]>`
- `countTransaction(walletId)`: Counts total transactions → `Promise<number>`

---

### Transaction Types

```typescript
enum WalletTransactionType {
  topup     // Adding money to wallet
  withdraw  // Removing money from wallet
  purchase  // Spending money (treated as withdrawal)
}
```

---

### Use Cases

---

### CreateWalletUseCase

Creates a new wallet for a user. Throws `BadRequestException` if a wallet already exists. Default currency is EUR with 0 balance.

---

### GetWalletUseCase

Retrieves wallet information with paginated transaction history. Fetches wallet and transaction count in parallel for performance.

**Returns:**
```typescript
{
  wallet: WalletDomainEntity,
  transactions: WalletTransaction[],
  page: number,
  totalPages: number,
  totalCount: number
}
```

---

### ChangeWalletBalanceUseCase

Handles all balance modification operations with idempotency support and proper transaction management.

**Input:**
```typescript
interface ChangeBalanceInput {
  userId: number;
  type: WalletTransactionType;
  amount: number;
  language: SupportedLang;
  externalPaymentId?: string;   // For deduplication (e.g. Paysera order ID)
  externalProvider?: string;    // e.g. "paysera"
  description?: string;
}
```

**Returns:**
```typescript
{ balance: number; transactionId: string; alreadyProcessed?: boolean }
```

**Idempotency:** If `externalPaymentId` is provided, the use case first checks whether that payment ID already exists in the transaction log. If it does, it returns the current balance and sets `alreadyProcessed: true` — no double-charge.

**Balance Operations:** Uses atomic DB-level increment/decrement (not read-then-write) to prevent race conditions:
- `topup` → `incrementBalanceTx`
- `withdraw` / `purchase` → `decrementBalanceIfSufficientTx` (returns null → throws `BadRequestException`)

**Transaction Safety:** Accepts an optional `tx` parameter. If provided, runs within the caller's transaction; otherwise creates its own (timeout: 15s).

---

### TransferMoneyUseCase

Transfers money between two users' wallets atomically. Both wallets are fetched in parallel, then a Prisma transaction updates both balances and creates transaction records for both sides.

**Transaction Records Created:**
- Sender: `withdraw` — description "Transfer to user {receiverId}"
- Receiver: `topup` — description "Transfer from user {senderId}"

---

### CreatePayseraTopupUseCase

Initiates a Paysera payment for wallet top-up. Validates amount (1–10,000 EUR), verifies wallet exists, generates a unique `orderId` with format `paysera_{userId}_{uuid}`, and returns a Paysera redirect URL.

**Input:**
```typescript
{ userId: number; amount: number; language: SupportedLang }
```

**Returns:**
```typescript
{ paymentUrl: string; orderId: string }
```

**Validation:**
- Amount must be between 1 and 10,000 EUR
- User must have a wallet

---

### ProcessPayseraPaymentUseCase

Handles incoming Paysera IPN callbacks. Parses the `orderId` to extract `userId`, converts amount from cents to EUR, and calls `ChangeWalletBalanceUseCase` with `externalPaymentId` for idempotency.

**Flow:**
1. Receives `PayseraCallbackData` from the webhook controller
2. Ignores non-successful statuses (`status !== '1'`)
3. Parses `orderId` format `paysera_{userId}_{uuid}` to extract userId
4. Converts amount from centimes (e.g. `5000` → `50.00` EUR)
5. Calls `ChangeWalletBalanceUseCase` — if `alreadyProcessed`, logs and skips

---

### Infrastructure

---

### WalletRepository

Implements `IWalletRepository` using Prisma. Key feature: uses `incrementBalanceTx` and `decrementBalanceIfSufficientTx` for atomic, race-condition-free balance updates. Always returns domain entities, never Prisma models.

---

### WalletTransactionRepository

Implements `IWalletTransactionRepository`. Stores `externalPaymentId` and `externalProvider` for idempotency. All transaction creation runs inside Prisma transactions. Supports pagination (most recent first).

---

### API Endpoints

Two controllers are registered: `WalletController` (authenticated routes) and `WalletWebhookController` (public webhook).

---

### POST /wallet/create

Creates a new wallet for the authenticated user.

**Authentication:** Required

**Response:**
```json
{ "success": true, "message": "Wallet successfully created" }
```

---

### GET /wallet/get

Retrieves wallet balance and paginated transaction history (10 per page, most recent first).

**Authentication:** Required

**Query Parameters:**
- `page` (optional, default: 1)

**Response:**
```json
{
  "success": true,
  "data": {
    "wallet": { "id": "...", "userId": 1, "balance": 150.00, "currency": "EUR", ... },
    "transactions": [...],
    "page": 1,
    "totalPages": 3,
    "totalCount": 25
  }
}
```

---

### POST /wallet/topup/paysera

Initiates a Paysera payment. Frontend receives `paymentUrl` and redirects the user to Paysera. After payment, Paysera calls the IPN webhook.

**Authentication:** Required

**Request Body:** `{ "amount": 50 }` (min: 1, max: 10000)

**Response:**
```json
{ "success": true, "paymentUrl": "https://bank.paysera.com/...", "orderId": "paysera_123_uuid" }
```

---

### POST /wallet/webhooks/paysera

Paysera IPN endpoint. Receives GET/POST with `?data=BASE64&ss1=MD5SIGN` query params. Must return plain text `"OK"`. **Public** (no auth).

**Flow:**
1. Verifies callback signature via `PayseraService.verifyCallback()`
2. Passes `callbackData` to `ProcessPayseraPaymentUseCase`
3. Returns `"OK"` as plain text (required by Paysera protocol)

**Error:** Returns `400 Bad Request` if signature verification fails.

---

### POST /wallet/transfer

Transfers money to another user's wallet by `receiverWalletId`.

**Authentication:** Required

**Request Body:**
```json
{ "receiverWalletId": "wallet_abc", "amount": 30 }
```

**Validation:** `amount` minimum 1, `receiverWalletId` must be a string.

---

### POST /wallet/topup

Manual top-up (test/admin). Directly adds funds without Paysera.

**Authentication:** Required

**Request Body:** `{ "amount": 50 }` (min: 0.01)

---

### DTOs

**TopUpDto:** `amount: number` (min: 0.01)

**TransferDto:** `receiverWalletId: string`, `amount: number` (min: 1)

---

### Module Configuration

**Controllers:** `WalletController`, `WalletWebhookController`

**Providers:**
- `WalletRepository` (token: `WALLET_REPOSITORY_TOKENS.WALLET_REPOSITORY`)
- `WalletTransactionRepository` (token: `WALLET_REPOSITORY_TOKENS.WALLET_TRANSACTION_REPOSITORY`)
- `CreateWalletUseCase`, `GetWalletUseCase`, `ChangeWalletBalanceUseCase`, `TransferMoneyUseCase`
- `CreatePayseraTopupUseCase`, `ProcessPayseraPaymentUseCase`

**Exports:** `ChangeWalletBalanceUseCase`, `TransferMoneyUseCase`, `GetWalletUseCase`

---

### Paysera Integration Flow

```
User → POST /wallet/topup/paysera
         ↓
     CreatePayseraTopupUseCase
     - Validates wallet exists
     - Generates orderId: "paysera_{userId}_{uuid}"
     - Calls PayseraService.createPaymentUrl()
         ↓
     Returns { paymentUrl, orderId }
         ↓
Frontend redirects user to paymentUrl
         ↓
User completes payment on Paysera
         ↓
Paysera → POST /wallet/webhooks/paysera?data=...&ss1=...
         ↓
     WalletWebhookController
     - Verifies signature
     - Calls ProcessPayseraPaymentUseCase
         ↓
     ProcessPayseraPaymentUseCase
     - Checks status === '1'
     - Parses userId from orderId
     - Converts amount (cents → EUR)
     - Calls ChangeWalletBalanceUseCase (with externalPaymentId)
         ↓
     ChangeWalletBalanceUseCase
     - Idempotency check (findByExternalPaymentIdTx)
     - incrementBalanceTx (atomic)
     - createTransactionTx
         ↓
     Returns "OK" to Paysera
```

---

### Idempotency Design

Every Paysera payment carries a unique `orderId` stored as `externalPaymentId` on the `WalletTransaction` record. If Paysera sends the same IPN twice (network retry), `findByExternalPaymentIdTx` finds the existing record and the use case returns `alreadyProcessed: true` without modifying the balance. The unique constraint on `externalPaymentId` at the DB level provides a second safety net.

---

### Security Considerations

1. **Paysera Signature Verification:** All IPN callbacks are verified via `PayseraService.verifyCallback()` before processing
2. **Idempotency:** Duplicate IPN callbacks cannot cause double top-ups
3. **Atomic Balance Updates:** `incrementBalanceTx` / `decrementBalanceIfSufficientTx` prevent race conditions
4. **User Isolation:** Users can only access their own wallets
5. **Positive Amounts:** All amounts validated before processing
6. **Authentication:** All user-facing endpoints require JWT auth; only the webhook is public

---

### Database Schema

**Wallet table:** `id`, `userId` (unique), `balance`, `currency` (default "EUR"), `createdAt`, `updatedAt`

**WalletTransaction table:** `id`, `walletId`, `type` (enum), `amount`, `balanceAfter`, `description`, `externalPaymentId` (unique, nullable), `externalProvider` (nullable), `createdAt`

---

### Future Considerations

- Multi-currency support
- Withdrawal to bank account
- Transaction fees
- Daily/monthly limits
- Pending transaction states
- Refunds and dispute management
- KYC-based wallet limits