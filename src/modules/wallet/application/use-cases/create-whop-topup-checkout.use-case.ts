import { Injectable, BadRequestException, Inject, NotFoundException } from '@nestjs/common';
import { WhopService } from '../../../../infrastructure/whop/whop.service';
import { SupportedLang, t } from '../../../../locales';
import { type IWalletRepository } from '../../domain/repositories/wallet.interface.repository';
import { WALLET_REPOSITORY_TOKENS } from '../../domain/repositories/wallet.repository.token';

interface Input {
  userId: number;
  amount: number;
  language: SupportedLang;
}

@Injectable()
export class CreateWhopTopupCheckoutUseCase {
  constructor(
    private readonly whop: WhopService,
    @Inject(WALLET_REPOSITORY_TOKENS.WALLET_REPOSITORY)
    private readonly walletRepo: IWalletRepository,
  ) {}

  async execute(input: Input): Promise<{ checkoutUrl: string }> {
    const { userId, amount, language } = input;

    if (amount < 1 || amount > 10000) {
      throw new BadRequestException(t('invalidTopupAmount', language));
    }

    // Sigurohu që wallet-i ekziston
    const wallet = await this.walletRepo.getWalletByUser(userId);
    if (!wallet) throw new NotFoundException(t('walletNotFound', language));

    const result = await this.whop.createTopupCheckout({ userId, amount });
    return { checkoutUrl: result.checkoutUrl };
  }
}