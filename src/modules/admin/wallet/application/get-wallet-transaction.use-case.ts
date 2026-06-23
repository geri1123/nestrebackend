import { Inject, Injectable } from "@nestjs/common";
import { WALLET_REPOSITORY_TOKENS } from "../../../wallet/domain/repositories/wallet.repository.token";
import { IWalletTransactionRepository } from "../../../wallet/domain/repositories/wallet-transaction.interface.repository";
import { TransactionPaginationDto } from "../dto/transactions.dto";

const LIMIT = 20;

@Injectable()
export class GetAllTransactionsUseCase {
  constructor(
    @Inject(WALLET_REPOSITORY_TOKENS.WALLET_TRANSACTION_REPOSITORY)
    private readonly walletTransactionRepo: IWalletTransactionRepository,
  ) {}

  async execute(dto: TransactionPaginationDto) {
    const page = dto.page ?? 1;
    const sortBy = dto.sortBy ?? "date";
    const order = dto.order ?? "desc";

    const [data, total] = await Promise.all([
      this.walletTransactionRepo.getAllTransactions(page, sortBy, order),
      this.walletTransactionRepo.countAllTransactions(),
    ]);

    return {
      data,
      meta: { total, page, limit: LIMIT, totalPages: Math.ceil(total / LIMIT) },
    };
  }
}