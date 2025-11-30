// import { Body, Controller, Get, Post, Query, Req, UnauthorizedException } from "@nestjs/common";
// import { WalletService } from "./wallet.service";
// import {type RequestWithUser } from "../../common/types/request-with-user.interface";
// import { t } from "../../locales";
// import { wallet_transaction_type } from "@prisma/client";
// import { TopUpDto } from "./dto/topup.dto";

// @Controller("wallet")
// export class WalletController{
//     constructor(private readonly walletService:WalletService){

//     }
//  @Post('create')
//  async createWallet(
//     @Req() req:RequestWithUser
//  ){
//    const {userId , language}=req;
//    if(!userId){
//     throw new UnauthorizedException(t("userNotAuthenticated",language))
//    }
//    await this.walletService.createWallet(userId ,language)
//    return{
//     success:true,
//     message: t("walletSuccessfullyCreated", language),
//    }
//  }

// @Get("get")
// async getWalletWithUserId(
//   @Req() req: RequestWithUser,
//   @Query("page") page = 1,
// ) {
//   const { userId, language } = req;
//   const limit = 10;
//   if (!userId) throw new UnauthorizedException(t("userNotAuthenticated", language));

//   const wallet = await this.walletService.getWallet(userId, language, Number(page), Number(limit));

//   return wallet;
// }

//   @Post("topup")
// async addBalanceToWallet(
//   @Req() req: RequestWithUser,
//   @Body() body: TopUpDto
// ) {
//   const { userId, language } = req;
//   if (!userId) {
//     throw new UnauthorizedException(t("userNotAuthenticated", language));
//   }

//   const amount = body.amount;
//   const type = wallet_transaction_type.topup;

//   await this.walletService.changeWalletBalance(
//     userId,
//     type,
//     amount,
//     language
//   );

//   return {
//     success: true,
//     message: t("amountAddedSuccessfully", language),
//   };
// }
// }

import { Body, Controller, Get, Post, Query, Req, UnauthorizedException } from "@nestjs/common";

import {type RequestWithUser } from "../../common/types/request-with-user.interface";
import { t } from "../../locales";
import { wallet_transaction_type } from "@prisma/client";
import { TopUpDto } from "./dto/topup.dto";

import { CreateWalletUseCase } from "./application/use-cases/crreate-wallet.use-case";
import { GetWalletUseCase } from "./application/use-cases/get-wallet.use-case";
import { ChangeWalletBalanceUseCase } from "./application/use-cases/change-wallet-balance.use-case";

@Controller('wallet')
export class WalletController {
  constructor(
    
        private readonly createWalletUseCase: CreateWalletUseCase,
    private readonly getWalletUseCase: GetWalletUseCase,
    private readonly changeBalanceUseCase: ChangeWalletBalanceUseCase,

  ) {}

  // Create wallet for user
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

  // Get wallet info + transactions (with pagination)
  @Get('get')
  async getWallet(@Req() req: RequestWithUser, @Query('page') page = 1) {
    const { userId, language } = req;
    if (!userId) throw new UnauthorizedException(t('userNotAuthenticated', language));

    const limit = 10; 
   const walletData = await this.getWalletUseCase.execute(
      userId,
      Number(page),
      limit,
      language
    );


    return {
      success: true,
      data: walletData,
    };
  }

  // Top-up wallet
  @Post('topup')
  async topUp(@Req() req: RequestWithUser, @Body() body: TopUpDto) {
    const { userId, language } = req;
    if (!userId) throw new UnauthorizedException(t('userNotAuthenticated', language));

    const amount = body.amount;
    const type = wallet_transaction_type.topup;

    const result = await this.changeBalanceUseCase.execute({
      userId,
      type: wallet_transaction_type.topup,
      amount,
      language,
    });

    return {
      success: true,
      message: t('amountAddedSuccessfully', language),
      balance: result.balance,
      transactionId: result.transactionId,
    };
  }

  // Transfer money between users
  // @Post('transfer')
  // async transfer(@Req() req: RequestWithUser, @Body() body: { receiverId: number; amount: number }) {
  //   const { userId, language } = req;
  //   if (!userId) throw new UnauthorizedException(t('userNotAuthenticated', language));

  //   await this.walletService.transferMoney(userId, body.receiverId, body.amount, language);

  //   return {
  //     success: true,
  //     message: t('transferSuccessful', language),
  //   };
  // }
}

  // Optional: transfer money endpoint
  // @Post('transfer')
  // async transfer(
  //   @Req() req: RequestWithUser,
  //   @Body() body: { receiverId: number; amount: number },
  // ) {
  //   const { userId, language } = req;
  //   if (!userId) throw new UnauthorizedException(t('userNotAuthenticated', language));

  //   await this.walletService.transferMoney(userId, body.receiverId, body.amount, language);

  //   return {
  //     success: true,
  //     message: t('transferSuccessful', language),
  //   };
  // }

