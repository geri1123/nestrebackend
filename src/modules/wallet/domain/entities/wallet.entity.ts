
import { Wallet, wallet_transaction_type } from "@prisma/client";

export class WalletDomainEntity {
  constructor(
   public readonly id: string,
    public readonly userId: number,
    private balance: number,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public readonly currency: string
  ) {}


  
  canWithdraw(amount: number): boolean {
    return this.balance >= amount && amount > 0;
  }

  topup(amount: number): number {
    if (amount <= 0) {
      throw new Error("Amount must be positive");
    }
    this.balance += amount;
    return this.balance;
  }

  withdraw(amount: number): number {
    if (amount <= 0) {
      throw new Error("Amount must be positive");
    }
    if (!this.canWithdraw(amount)) {
      throw new Error("Insufficient balance");
    }
    this.balance -= amount;
    return this.balance;
  }

  purchase(amount: number): number {
    return this.withdraw(amount); 
  }

  getBalance(): number {
    return this.balance;
  }

  
   toPrisma(): {
    id: string;
    userId: number;
    balance: number;
    currency: string;
    createdAt: Date;
    updatedAt: Date;
  } {
    return {
      id: this.id,
      userId: this.userId,
      balance: this.balance,
      currency: this.currency,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  static fromPrisma(data: Wallet): WalletDomainEntity {
    return new WalletDomainEntity(
      data.id,
      data.userId,
      data.balance,
      data.createdAt,
      data.updatedAt,
      data.currency
    );
  }
}