import { Injectable, Logger } from '@nestjs/common';
import { WalletTransactionType } from '@prisma/client';
import { PrismaService } from '../../../../infrastructure/prisma/prisma.service';
import { ChangeWalletBalanceUseCase } from './change-wallet-balance.use-case';

interface WhopPaymentSucceededData {
  id: string;
  metadata?: {
    user_id?: string;
    amount?: string;
    type?: string;
  };
  final_amount?: number;
}

@Injectable()
export class ProcessWhopPaymentUseCase {
  private readonly logger = new Logger(ProcessWhopPaymentUseCase.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly changeBalance: ChangeWalletBalanceUseCase,
  ) {}

  async execute(payment: WhopPaymentSucceededData): Promise<void> {
    const { id: paymentId, metadata } = payment;

    if (metadata?.type !== 'wallet_topup') {
      this.logger.log(`Ignoring non-topup payment ${paymentId}`);
      return;
    }

    const userId = Number(metadata.user_id);
    const amount = Number(metadata.amount);

    if (!userId || !amount || amount <= 0) {
      this.logger.warn(`Invalid metadata on payment ${paymentId}`, metadata);
      return;
    }

    // IDEMPOTENCY — kontrollo nëse e kemi proceseuar tashmë
    const existing = await this.prisma.walletTransaction.findUnique({
      where: { externalPaymentId: paymentId },
    });
    if (existing) {
      this.logger.log(`Payment ${paymentId} already processed, skipping`);
      return;
    }

    // Krediton balancën
    const result = await this.changeBalance.execute({
      userId,
      amount,
      type: WalletTransactionType.topup,
      language: 'en' as any, // ose merre nga user-i nëse e ke në DB
    });

    // Shëno se ky payment u proceseua (lidh me transaction-in e fundit)
    // ChangeBalanceUseCase tashmë ka krijuar transaction-in. E përditësojmë me ID-në e jashtme:
    await this.prisma.walletTransaction.update({
      where: { id: result.transactionId },
      data: {
        externalPaymentId: paymentId,
        externalProvider: 'whop',
      },
    });

    this.logger.log(`Topup successful: user=${userId} amount=${amount} payment=${paymentId}`);
  }
}