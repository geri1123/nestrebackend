import { Controller, Get, Param, ParseIntPipe, Query, UseGuards } from "@nestjs/common";
import { Public } from "../../../common/decorators/public.decorator";
import { AdminJwtGuard } from "../auth/guard/admin-jwt.guard";
import { GetAllWalletsUseCase } from "./application/get-all-wallets.use-case";
import { GetAllTransactionsUseCase } from "./application/get-wallet-transaction.use-case";
import { GetUserTransactionsUseCase } from "./application/get-user-transactions.use-case";
import { GetAllWalletsDto } from "./dto/getallwallets.dto";
import { TransactionPaginationDto } from "./dto/transactions.dto";
 
@Public()
@UseGuards(AdminJwtGuard)
@Controller("admin/wallets")
export class AdminWalletController {
  constructor(
    private readonly getAllWalletsUseCase: GetAllWalletsUseCase,
    private readonly getAllTransactionsUseCase: GetAllTransactionsUseCase,
    private readonly getUserTransactionsUseCase: GetUserTransactionsUseCase,
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
}
 