### Wallet Module Documentation

---

### Overview

The Wallet module manages user digital wallets within the system. It provides functionality for creating wallets, managing balances, processing transactions (top-ups, withdrawals, purchases), transferring money between users, and tracking transaction history. The module implements Domain-Driven Design principles with rich domain entities that encapsulate business logic.

---

### Architecture

This module follows Domain-Driven Design (DDD) with a focus on domain logic encapsulation:

```
wallet/
├── application/
│   └── use-cases/              # Business use cases
├── controller/
│   └── wallet.controller.ts
├── domain/
│   ├── entities/               # Rich domain entities
│   └── repositories/           # Repository interfaces
├── dto/                        # Data transfer objects
├── infrastructure/
│   └── persistence/            # Data persistence layer
└── wallet.module.ts
```

---

### Domain Model

---

### Entities

---

### WalletDomainEntity

A rich domain entity that encapsulates wallet business logic and rules.

**Properties:**
- `id`: Unique wallet identifier
- `userId`: ID of the wallet owner
- `balance`: Current wallet balance (private)
- `createdAt`: Wallet creation timestamp
- `updatedAt`: Last update timestamp
- `currency`: Wallet currency (e.g., "EUR")

**Business Rules Methods:**

- `canWithdraw(amount)`: Validates if withdrawal is possible
  - Returns: `boolean`
  - Rules: Balance must be sufficient and amount must be positive

- `topup(amount)`: Adds money to the wallet
  - Returns: `number` (new balance)
  - Throws: Error if amount is not positive
  - Business Rule: Amount must be > 0

- `withdraw(amount)`: Removes money from the wallet
  - Returns: `number` (new balance)
  - Throws: Error if insufficient balance or invalid amount
  - Business Rules: Amount must be positive, balance must be sufficient

- `purchase(amount)`: Processes a purchase (alias for withdraw)
  - Returns: `number` (new balance)
  - Same rules as withdraw

- `getBalance()`: Returns current balance
  - Returns: `number`

**Factory Methods:**

- `static fromPrisma(data)`: Creates domain entity from database record
- `toPrisma()`: Converts domain entity to database format

**Key Design Pattern:**
This entity follows the **Rich Domain Model** pattern where business logic lives in the entity rather than in services. This ensures that wallet rules (like "can't withdraw more than balance") are enforced at the domain level.

---

### Repository Interfaces

---

### IWalletRepository

Defines the contract for wallet data operations.

**Methods:**

- `createWallet(userId, currency)`: Creates a new wallet
  - Returns: `Promise<WalletDomainEntity>`

- `updateWalletBalanceTx(tx, walletId, newBalance)`: Updates balance within transaction
  - Parameters: Transaction client, wallet ID, new balance
  - Returns: `Promise<void>`

- `getWalletByUser(userId)`: Retrieves wallet by user ID
  - Returns: `Promise<WalletDomainEntity | null>`

- `getWalletForTx(tx, userId)`: Retrieves wallet within transaction context
  - Returns: `Promise<WalletDomainEntity | null>`

---

### IWalletTransactionRepository

Defines the contract for transaction history operations.

**Methods:**

- `createTransactionTx(tx, walletId, type, amount, balanceAfter, description?)`: Records a transaction
  - Parameters: Transaction client, wallet ID, transaction type, amount, balance after, optional description
  - Returns: `Promise<WalletTransaction>`

- `getTransactions(walletId, page, limit)`: Retrieves paginated transaction history
  - Returns: `Promise<WalletTransaction[]>`

- `countTransaction(walletId)`: Counts total transactions for a wallet
  - Returns: `Promise<number>`

---

### Transaction Types

```typescript
enum wallet_transaction_type {
  topup     // Adding money to wallet
  withdraw  // Removing money from wallet
  purchase  // Spending money (treated as withdrawal)
}
```

---

### Use Cases

---

### CreateWalletUseCase

Creates a new wallet for a user.

**Purpose:** Initialize a wallet when a user joins the platform.

**Dependencies:**
- `IWalletRepository`

**Method:**
```typescript
execute(userId: number, language: SupportedLang): Promise<WalletDomainEntity>
```

**Business Logic:**
1. Checks if wallet already exists for user
2. Throws `BadRequestException` if wallet exists
3. Creates new wallet with 0 balance and EUR currency

**Throws:**
- `BadRequestException`: Wallet already exists

---

### GetWalletUseCase

Retrieves wallet information with paginated transaction history.

**Purpose:** Display wallet balance and transaction history to users.

**Dependencies:**
- `IWalletRepository`
- `IWalletTransactionRepository`

**Method:**
```typescript
execute(userId: number, page: number, limit: number, lang: SupportedLang): Promise<WalletWithTransactions>
```

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

**Business Logic:**
1. Fetches wallet by user ID
2. Throws `NotFoundException` if wallet doesn't exist
3. Fetches transactions and count in parallel for performance
4. Calculates pagination metadata

**Throws:**
- `NotFoundException`: Wallet not found

---

### ChangeWalletBalanceUseCase

Modifies wallet balance for top-ups, withdrawals, or purchases.

**Purpose:** Handle all balance modification operations with proper transaction management.

**Dependencies:**
- `IWalletRepository`
- `IWalletTransactionRepository`
- `PrismaService`

**Input:**
```typescript
interface ChangeBalanceInput {
  userId: number;
  type: wallet_transaction_type;
  amount: number;
  language: SupportedLang;
}
```

**Method:**
```typescript
execute(input: ChangeBalanceInput, tx?: any): Promise<{ balance: number; transactionId: string }>
```

**Business Logic:**
1. Retrieves wallet (within transaction if provided)
2. Applies business rules via domain entity methods:
   - **topup**: Adds amount to balance
   - **withdraw**: Removes amount if sufficient balance
   - **purchase**: Same as withdraw
3. Records transaction in history
4. Updates wallet balance
5. Returns new balance and transaction ID

**Transaction Handling:**
- If `tx` parameter provided: Uses existing transaction
- If no `tx`: Creates new transaction automatically
- Ensures atomicity: both balance update and transaction record succeed or fail together

**Throws:**
- `NotFoundException`: Wallet not found
- `BadRequestException`: Insufficient balance or invalid transaction type

**Key Feature:** Supports nested transactions via optional `tx` parameter, allowing this use case to be part of larger transactional workflows.

---

### TransferMoneyUseCase

Transfers money between two users' wallets.

**Purpose:** Enable peer-to-peer money transfers.

**Dependencies:**
- `IWalletRepository`
- `IWalletTransactionRepository`
- `PrismaService`

**Method:**
```typescript
execute(senderId: number, receiverId: number, amount: number, language: SupportedLang): Promise<void>
```

**Business Logic:**
1. Fetches both sender and receiver wallets in parallel
2. Validates both wallets exist
3. Uses domain entity methods to:
   - Withdraw from sender (validates sufficient balance)
   - Top-up receiver wallet
4. Executes atomic database transaction:
   - Updates both wallet balances
   - Creates transaction records for both wallets
5. If any step fails, entire operation rolls back

**Transaction Records Created:**
- Sender: "withdraw" transaction with description "Transfer to user {receiverId}"
- Receiver: "topup" transaction with description "Transfer from user {senderId}"

**Throws:**
- `NotFoundException`: One or both wallets not found
- `BadRequestException`: Insufficient balance

**Critical Feature:** Uses Prisma transaction to ensure atomicity - either both wallets are updated or neither is.

---

### Infrastructure

---

### WalletRepository

Implements `IWalletRepository` using Prisma ORM.

**Key Features:**
- Creates wallets with default EUR currency and 0 balance
- Supports transaction-aware operations via `tx` parameter
- Maps Prisma models to domain entities
- Updates wallet balance within transaction context

**Implementation Notes:**
- `getWalletForTx`: Used within transactions to ensure isolation
- `updateWalletBalanceTx`: Updates balance in transaction context
- Always returns domain entities, never Prisma models

---

### WalletTransactionRepository

Implements `IWalletTransactionRepository` using Prisma ORM.

**Key Features:**
- Records all balance changes as transactions
- Stores balance after each transaction for audit trail
- Supports pagination for transaction history
- Orders transactions by creation date (most recent first)

**Implementation Notes:**
- All transaction creation happens within Prisma transactions
- Includes amount, type, balance after, and optional description
- Skip/take pagination for efficient large dataset handling

---

### API Endpoints

---

### POST /wallet/create

Creates a new wallet for the authenticated user.

**Authentication:** Required

**Response:**
```json
{
  "success": true,
  "message": "Wallet successfully created"
}
```

**Errors:**
- `401 Unauthorized`: User not authenticated
- `400 Bad Request`: Wallet already exists

---

### GET /wallet/get

Retrieves wallet information with transaction history.

**Authentication:** Required

**Query Parameters:**
- `page` (optional): Page number for transaction history (default: 1)

**Response:**
```json
{
  "success": true,
  "data": {
    "wallet": {
      "id": "wallet_123",
      "userId": 456,
      "balance": 150.50,
      "currency": "EUR",
      "createdAt": "2024-01-15T10:00:00Z",
      "updatedAt": "2024-01-20T14:30:00Z"
    },
    "transactions": [
      {
        "id": "tx_789",
        "walletId": "wallet_123",
        "type": "topup",
        "amount": 100,
        "balanceAfter": 150.50,
        "description": "topup 100 EUR",
        "createdAt": "2024-01-20T14:30:00Z"
      }
    ],
    "page": 1,
    "totalPages": 3,
    "totalCount": 25
  }
}
```

**Features:**
- 10 transactions per page
- Transactions ordered by most recent first
- Includes pagination metadata

**Errors:**
- `401 Unauthorized`: User not authenticated
- `404 Not Found`: Wallet not found

---

### POST /wallet/topup

Adds money to user's wallet.

**Authentication:** Required

**Request Body:**
```json
{
  "amount": 50.00
}
```

**Validation:**
- `amount`: Must be a number, minimum 0.01

**Response:**
```json
{
  "success": true,
  "message": "Amount added successfully",
  "balance": 200.50,
  "transactionId": "tx_abc123"
}
```

**Errors:**
- `401 Unauthorized`: User not authenticated
- `400 Bad Request`: Invalid amount
- `404 Not Found`: Wallet not found

---

### DTOs

---

### TopUpDto

Validates top-up requests.

**Properties:**
- `amount`: number (min: 0.01)

**Validation:**
- Must be a number
- Must be at least 0.01

---

### Module Configuration

---

### Dependencies
- `PrismaModule`: For database access (implicit)

---

### Providers
- `WalletRepository`: Implements `IWalletRepository`
- `WalletTransactionRepository`: Implements `IWalletTransactionRepository`
- `CreateWalletUseCase`: Wallet creation logic
- `GetWalletUseCase`: Wallet retrieval logic
- `ChangeWalletBalanceUseCase`: Balance modification logic
- `TransferMoneyUseCase`: Money transfer logic

---

### Exports
The following use cases are exported for use in other modules:
- `ChangeWalletBalanceUseCase` (for product purchases, payments)
- `TransferMoneyUseCase` (for peer-to-peer transfers)
- `GetWalletUseCase` (for wallet information)

---

### Database Schema Considerations

---

### Wallet Table

**Fields:**
- `id` (primary key, UUID/string)
- `userId` (unique, foreign key)
- `balance` (decimal/float)
- `currency` (string, default "EUR")
- `createdAt` (timestamp)
- `updatedAt` (timestamp)

**Constraints:**
- Unique constraint on `userId` (one wallet per user)

---

### WalletTransaction Table

**Fields:**
- `id` (primary key)
- `walletId` (foreign key)
- `type` (enum: topup, withdraw, purchase)
- `amount` (decimal/float)
- `balanceAfter` (decimal/float)
- `description` (string, optional)
- `createdAt` (timestamp)

**Indexes:**
- `walletId` for efficient transaction history queries

---

### Usage Examples

---

### Create a Wallet
```typescript
await createWalletUseCase.execute(userId: 123, language: 'en');
```

---

### Top-up Wallet
```typescript
const result = await changeWalletBalanceUseCase.execute({
  userId: 123,
  type: wallet_transaction_type.topup,
  amount: 50.00,
  language: 'en'
});

console.log(`New balance: ${result.balance}`);
console.log(`Transaction ID: ${result.transactionId}`);
```

---

### Process a Purchase
```typescript
try {
  await changeWalletBalanceUseCase.execute({
    userId: 123,
    type: wallet_transaction_type.purchase,
    amount: 25.99,
    language: 'en'
  });
} catch (error) {
  // Handle insufficient balance
}
```

---

### Transfer Money Between Users
```typescript
await transferMoneyUseCase.execute(
  senderId: 123,
  receiverId: 456,
  amount: 30.00,
  language: 'en'
);
```

---

### Get Wallet with Transaction History
```typescript
const walletData = await getWalletUseCase.execute(
  userId: 123,
  page: 1,
  limit: 10,
  language: 'en'
);

console.log(`Balance: ${walletData.wallet.balance}`);
console.log(`Total transactions: ${walletData.totalCount}`);
```

---

### Using Within a Transaction (Advanced)
```typescript
await prisma.$transaction(async (tx) => {
  // Part of larger business operation
  await changeWalletBalanceUseCase.execute({
    userId: 123,
    type: wallet_transaction_type.purchase,
    amount: 10.00,
    language: 'en'
  }, tx);
  
  // Other operations...
});
```

---

### Design Patterns

---

### Rich Domain Model

The `WalletDomainEntity` encapsulates business logic:
- **Validation**: Checks amount positivity
- **Business Rules**: Enforces sufficient balance
- **Encapsulation**: Balance is private, modified only through methods
- **Invariants**: Ensures wallet is always in valid state

**Benefits:**
- Business rules enforced at domain level
- Cannot bypass rules by direct property access
- Easy to test business logic in isolation
- Single source of truth for wallet behavior

---

### Repository Pattern

Separates domain logic from data access:
- Domain entities don't know about database
- Repositories handle persistence concerns
- Easy to swap implementations (e.g., different ORMs)

---

### Transaction Script Pattern

Use cases orchestrate operations:
- Each use case represents a business transaction
- Handles cross-entity operations
- Manages database transactions
- Coordinates between repositories

---

### Best Practices

1. **Always Use Domain Entity Methods**: Never modify balance directly
   ```typescript
   //  Bad
   wallet.balance += 50;
   

   wallet.topup(50);
   ```

2. **Transaction Safety**: Use Prisma transactions for multi-step operations
   ```typescript
   await prisma.$transaction(async (tx) => {
     // Multiple operations that must succeed together
   });
   ```

3. **Balance Updates**: Always record transaction before updating balance

4. **Nested Transactions**: Pass `tx` parameter when use case is part of larger transaction

5. **Error Handling**: Let domain entity throw errors, catch at use case level

6. **Audit Trail**: Every balance change creates a transaction record

7. **Immutability**: Domain entity ID, userId, currency should never change

8. **Currency**: Currently hardcoded to EUR, consider parameterizing for multi-currency

---

### Security Considerations

1. **User Isolation**: Users can only access their own wallets
2. **Transaction Atomicity**: All balance changes are atomic
3. **Audit Trail**: Complete history of all transactions
4. **Balance Validation**: Cannot withdraw more than available balance
5. **Positive Amounts**: All amounts must be positive numbers
6. **Authentication Required**: All endpoints require authentication

---

### Performance Considerations

1. **Parallel Queries**: GetWalletUseCase fetches wallet and transactions in parallel
2. **Pagination**: Transaction history supports pagination (10 per page default)
3. **Indexed Queries**: WalletId indexed for fast transaction lookups
4. **Transaction Ordering**: Most recent transactions first (DESC order)

---

### Error Scenarios

---

### Insufficient Balance
```typescript
// Throws BadRequestException
await changeWalletBalanceUseCase.execute({
  userId: 123,
  type: 'withdraw',
  amount: 1000,  // User only has 50
  language: 'en'
});
```

---

### Wallet Not Found
```typescript
// Throws NotFoundException
await getWalletUseCase.execute(
  userId: 999,  // No wallet exists
  page: 1,
  limit: 10,
  language: 'en'
);
```

---

### Duplicate Wallet
```typescript
// Throws BadRequestException
await createWalletUseCase.execute(
  userId: 123,  // Already has wallet
  language: 'en'
);
```

---

### Future Considerations

- **Multi-currency Support**: Allow wallets in different currencies
- **Exchange Rates**: Handle currency conversions
- **Transaction Fees**: Implement fee calculation and deduction
- **Withdrawal Limits**: Daily/monthly withdrawal limits
- **Pending Transactions**: Hold funds during pending operations
- **Recurring Payments**: Schedule automatic transactions
- **Transaction Categories**: Add categories/tags to transactions
- **Export Functionality**: Export transaction history to CSV/PDF
- **Refunds**: Handle refund transactions
- **Dispute Management**: Track disputed transactions
- **KYC Integration**: Wallet limits based on verification level
- **Notifications**: Alert users of low balance, large transactions
- **Analytics**: Spending patterns, balance trends