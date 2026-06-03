import { Body, Controller, Get, Post, Query, Req, UnauthorizedException } from '@nestjs/common';
import { type RequestWithUser } from '../../common/types/request-with-user.interface';
import { t } from '../../locales';
import { WalletTransactionType } from '@prisma/client';
import { TopUpDto } from './dto/topup.dto';

import { CreateWalletUseCase } from './application/use-cases/crreate-wallet.use-case';
import { GetWalletUseCase } from './application/use-cases/get-wallet.use-case';
import { ChangeWalletBalanceUseCase } from './application/use-cases/change-wallet-balance.use-case';
import { CreatePayseraTopupUseCase } from './application/use-cases/create-paysera-topup.use-case';
import { TransferDto } from './dto/transfer.dto';
import { TransferMoneyUseCase } from './application/use-cases/transfer-money.use-case';

@Controller('wallet')
export class WalletController {
  constructor(
    private readonly createWalletUseCase: CreateWalletUseCase,
    private readonly getWalletUseCase: GetWalletUseCase,
    private readonly changeBalanceUseCase: ChangeWalletBalanceUseCase,
    private readonly createPayseraTopup: CreatePayseraTopupUseCase,
    private readonly transferMoneyUseCase: TransferMoneyUseCase,
  ) {}

  @Post('create')
  async createWallet(@Req() req: RequestWithUser) {
    const { userId, language } = req;
    if (!userId) throw new UnauthorizedException(t('userNotAuthenticated', language));

    await this.createWalletUseCase.execute(userId, language);

    return {
      success: true,
      message: t('walletSuccessfullyCreated', language),
    };
  }

  @Get('get')
  async getWallet(@Req() req: RequestWithUser, @Query('page') page = 1) {
    const { userId, language } = req;
    if (!userId) throw new UnauthorizedException(t('userNotAuthenticated', language));

    const limit = 10;
    const walletData = await this.getWalletUseCase.execute(
      userId,
      Number(page),
      limit,
      language,
    );

    return {
      success: true,
      data: walletData,
    };
  }

  // ─── Whop checkout (i vjetri, mbetet si është) ────────────────────────────

  // @Post('topup/checkout')
  // async createWhopCheckout(@Req() req: RequestWithUser, @Body() body: TopUpDto) {
  //   const { userId, language } = req;
  //   if (!userId) throw new UnauthorizedException(t('userNotAuthenticated', language));

  //   const result = await this.createWhopTopupCheckout.execute({
  //     userId,
  //     amount: body.amount,
  //     language,
  //   });

  //   return { success: true, checkoutUrl: result.checkoutUrl };
  // }

  // ─── Paysera checkout ─────────────────────────────────────────────────────
  //
  // Frontend e merr paymentUrl dhe ridrejton userin tek Paysera.
  // Pas pagesës, Paysera dërgon IPN te /wallet/webhooks/paysera.

  @Post('topup/paysera')
  async createPayseraCheckout(@Req() req: RequestWithUser, @Body() body: TopUpDto) {
    const { userId, language } = req;
    if (!userId) throw new UnauthorizedException(t('userNotAuthenticated', language));

    const result = await this.createPayseraTopup.execute({
      userId,
      amount: body.amount,
      language,
    });

    return {
      success: true,
      paymentUrl: result.paymentUrl,
      orderId: result.orderId,
    };
  }

  // ─── Transfer ─────────────────────────────────────────────────────────────

  @Post('transfer')
  async transferMoney(@Req() req: RequestWithUser, @Body() body: TransferDto) {
    const { userId, language } = req;
    if (!userId) throw new UnauthorizedException(t('userNotAuthenticated', language));

    await this.transferMoneyUseCase.execute(
      userId,
      body.receiverWalletId,
      body.amount,
      language,
    );

    return {
      success: true,
      message: t('moneyTransferredSuccessfully', language),
    };
  }

  // ─── Manual topup (test/admin) ────────────────────────────────────────────

  @Post('topup')
  async topUp(@Req() req: RequestWithUser, @Body() body: TopUpDto) {
    const { userId, language } = req;
    if (!userId) throw new UnauthorizedException(t('userNotAuthenticated', language));

    const result = await this.changeBalanceUseCase.execute({
      userId,
      type: WalletTransactionType.topup,
      amount: body.amount,
      language,
    });

    return {
      success: true,
      message: t('amountAddedSuccessfully', language),
      balance: result.balance,
      transactionId: result.transactionId,
    };
  }
}