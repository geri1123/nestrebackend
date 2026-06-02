import { Injectable, BadRequestException, Inject, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { PayseraService } from '../../../../infrastructure/paysera/paysera.service';
import { SupportedLang, t } from '../../../../locales';
import { type IWalletRepository } from '../../domain/repositories/wallet.interface.repository';
import { WALLET_REPOSITORY_TOKENS } from '../../domain/repositories/wallet.repository.token';
 
interface Input {
  userId: number;
  amount: number;
  language: SupportedLang;
}
 
@Injectable()
export class CreatePayseraTopupUseCase {
  constructor(
    private readonly paysera: PayseraService,
    @Inject(WALLET_REPOSITORY_TOKENS.WALLET_REPOSITORY)
    private readonly walletRepo: IWalletRepository,
  ) {}
 
  async execute(input: Input): Promise<{ paymentUrl: string; orderId: string }> {
    const { userId, amount, language } = input;
 
    if (amount < 1 || amount > 10000) {
      throw new BadRequestException(t('invalidTopupAmount', language));
    }
 
    const wallet = await this.walletRepo.getWalletByUser(userId);
    if (!wallet) throw new NotFoundException(t('walletNotFound', language));
 
    
    const orderId = `paysera_${userId}_${randomUUID()}`;
 
    const paymentUrl = this.paysera.createPaymentUrl({ userId, amount, orderId });
 
    return { paymentUrl, orderId };
  }
}
 