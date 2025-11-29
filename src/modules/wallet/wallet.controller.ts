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
import { TopUpDto } from "./application/dto/topup.dto";
import { WalletService } from "./application/services/wallet.service";

@Controller('wallet')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  // Create wallet for user
  @Post('create')
  async createWallet(@Req() req: RequestWithUser) {
    const { userId, language } = req;
    if (!userId) throw new UnauthorizedException(t('userNotAuthenticated', language));

    await this.walletService.createWallet(userId, language);

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

    const limit = 10; // you can make this dynamic if you want
    const walletData = await this.walletService.getWallet(userId, language, Number(page), limit);

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

    const { balance, transactionId } = await this.walletService.changeWalletBalance(
      userId,
      type,
      amount,
      language
    );

    return {
      success: true,
      message: t('amountAddedSuccessfully', language),
      balance,
      transactionId,
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

