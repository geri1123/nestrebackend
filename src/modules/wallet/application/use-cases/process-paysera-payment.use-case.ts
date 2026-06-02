import { Injectable, Logger } from '@nestjs/common';
import { WalletTransactionType } from '@prisma/client';
import { PayseraCallbackData } from '../../../../infrastructure/paysera/paysera.service';
import { ChangeWalletBalanceUseCase } from './change-wallet-balance.use-case';

@Injectable()
export class ProcessPayseraPaymentUseCase {
  private readonly logger = new Logger(ProcessPayseraPaymentUseCase.name);

  constructor(private readonly changeBalance: ChangeWalletBalanceUseCase) {}

  async execute(data: PayseraCallbackData): Promise<void> {
    const { orderid, status, amount, requestid } = data;

    // Paysera status: 1 = pagesa u krye me sukses
    if (status !== '1') {
      this.logger.log(`Paysera IPN: status=${status} për order=${orderid} — injorohet`);
      return;
    }

    // Parseto userId nga orderid (formati: "paysera_{userId}_{uuid}")
    const parts = orderid.split('_');
    if (parts.length < 3 || parts[0] !== 'paysera') {
      this.logger.error(`Paysera IPN: orderid format i gabuar: ${orderid}`);
      return;
    }

    const userId = Number(parts[1]);
    // Shuma nga Paysera vjen në centesima
    const amountEur = Number(amount) / 100;

    if (!userId || isNaN(amountEur) || amountEur <= 0) {
      this.logger.error('Paysera IPN: të dhëna të pavlefshme', { orderid, amount });
      return;
    }

    const result = await this.changeBalance.execute({
      userId,
      amount: amountEur,
      type: WalletTransactionType.topup,
      language: 'en' as any,
      externalPaymentId: orderid,
      externalProvider: 'paysera',
      description: `Paysera top-up ${orderid}`,
    });

    if (result.alreadyProcessed) {
      this.logger.log(`Paysera: order ${orderid} ishte proceseuar më parë — skip`);
      return;
    }

    this.logger.log(
      `Paysera Topup OK: user=${userId} amount=${amountEur}€ order=${orderid} newBalance=${result.balance}`,
    );
  }
}