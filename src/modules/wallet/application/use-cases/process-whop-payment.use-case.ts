import { Injectable, Logger } from '@nestjs/common';
import { WalletTransactionType } from '@prisma/client';
import { ChangeWalletBalanceUseCase } from './change-wallet-balance.use-case';

interface WhopPaymentSucceededData {
  id: string;
  final_amount?: number;
  currency?: string;
  metadata?: {
    user_id?: string;
    amount?: string;
    type?: string;
  };
}

@Injectable()
export class ProcessWhopPaymentUseCase {
  private readonly logger = new Logger(ProcessWhopPaymentUseCase.name);

  constructor(private readonly changeBalance: ChangeWalletBalanceUseCase) {}

  async execute(payment: WhopPaymentSucceededData): Promise<void> {
    const { id: paymentId, metadata, final_amount } = payment;

    // 1. Vetëm top-ups na interesojnë (mos prek pagesa të tjera p.sh. abonim)
    if (metadata?.type !== 'wallet_topup') {
      this.logger.log(`Ignoring non-topup payment ${paymentId} (type=${metadata?.type})`);
      return;
    }

    // 2. Përdor SHUMËN REALE nga Whop, jo metadata (që mund të mos përputhet
    //    p.sh. nëse përdoruesi ka aplikuar promo code).
    const userId = Number(metadata.user_id);
    const amount = Number(final_amount ?? metadata.amount);

    if (!userId || !amount || amount <= 0) {
      this.logger.error(
        `Whop payment ${paymentId} ka metadata të pavlefshme — nuk kreditohet`,
        { metadata, final_amount },
      );
      return; // mos hidh exception — Whop do bëjë retry pa fund
    }

    // 3. Krediton brenda një single $transaction me externalPaymentId.
    //    Nëse paymentId-ja ekziston tashmë → unique constraint hidh P2002
    //    → use-case kthen alreadyProcessed=true. Asnjë double-credit.
    const result = await this.changeBalance.execute({
      userId,
      amount,
      type: WalletTransactionType.topup,
      language: 'en' as any,
      externalPaymentId: paymentId,
      externalProvider: 'whop',
      description: `Whop top-up ${paymentId}`,
    });

    if (result.alreadyProcessed) {
      this.logger.log(`Payment ${paymentId} ishte proceseuar më parë — skip`);
      return;
    }

    this.logger.log(
      `Topup OK: user=${userId} amount=${amount} payment=${paymentId} newBalance=${result.balance}`,
    );
  }
}