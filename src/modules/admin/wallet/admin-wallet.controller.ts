import { Body, Controller, Get, Param, ParseIntPipe, Post, Query, UseGuards } from "@nestjs/common";
import { Public } from "../../../common/decorators/public.decorator";
import { AdminJwtGuard } from "../auth/guard/admin-jwt.guard";
import { GetAllWalletsUseCase } from "./application/get-all-wallets.use-case";
import { GetAllTransactionsUseCase } from "./application/get-wallet-transaction.use-case";
import { GetUserTransactionsUseCase } from "./application/get-user-transactions.use-case";
import { GetAllWalletsDto } from "./dto/getallwallets.dto";
import { TransactionPaginationDto } from "./dto/transactions.dto";
import { AddBalanceDto } from "./dto/add-balance.dto";
import { WalletTransactionType } from "@prisma/client";
import { ChangeWalletBalanceUseCase } from "../../wallet/application/use-cases/change-wallet-balance.use-case";
 
@Public()
@UseGuards(AdminJwtGuard)
@Controller("admin/wallets")
export class AdminWalletController {
  constructor(
    private readonly getAllWalletsUseCase: GetAllWalletsUseCase,
    private readonly getAllTransactionsUseCase: GetAllTransactionsUseCase,
    private readonly getUserTransactionsUseCase: GetUserTransactionsUseCase,
    private readonly changeWalletBalanceUseCase:ChangeWalletBalanceUseCase
  ) {}
 
  @Get()
  getAll(@Query() query: GetAllWalletsDto) {
    return this.getAllWalletsUseCase.execute(query);
  }
 
  @Get("transactions")
  getAllTransactions(@Query() query: TransactionPaginationDto) {
    return this.getAllTransactionsUseCase.execute(query);
  }
 
  @Get("transactions/:userId")  
getUserTransactions(
  @Param("userId", ParseIntPipe) userId: number,
  @Query() query: TransactionPaginationDto,
) {
  return this.getUserTransactionsUseCase.execute(userId, query);
}
  @Post("add-balance")
  addBalance(@Body() dto: AddBalanceDto) {
    return this.changeWalletBalanceUseCase.execute({
      userId:      dto.userId,
      amount:      dto.amount,
      type:        WalletTransactionType.topup,
      language:    "en",
      description: dto.description ?? `Admin top-up of ${dto.amount} EUR`,
    });
  }
}
 