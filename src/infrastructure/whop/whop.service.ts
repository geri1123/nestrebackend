import {
  Injectable,
  Logger,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import Whop from '@whop/sdk';
import { AppConfigService } from '../config/config.service';

@Injectable()
export class WhopService {
  private readonly logger = new Logger(WhopService.name);
  private readonly client: Whop;

  constructor(private readonly config: AppConfigService) {
    if (!this.config.whopApiKey) {
      this.logger.error('WHOP_API_KEY mungon — çdo thirrje Whop do dështojë me 401.');
    }
    if (!this.config.whopCompanyId) {
      this.logger.error('WHOP_COMPANY_ID mungon.');
    }
    if (!this.config.whopWebhookSecret) {
      this.logger.warn('WHOP_WEBHOOK_SECRET mungon — verifyWebhook do dështojë.');
    }

    this.client = new Whop({
      apiKey: this.config.whopApiKey,
      webhookKey: this.config.whopWebhookSecret,
    });
  }

  async createTopupCheckout(params: {
    userId: number;
    amount: number;
    currency?: string;
  }): Promise<{ checkoutUrl: string; checkoutConfigId: string }> {
    const { userId, amount, currency = 'eur' } = params;

    // Whop e kërkon https:// për redirect_url. Në localhost (http://) e kapërcejmë;
    // user-i thjesht qëndron te Whop pas pagesës, webhook-u kredito wallet-in.
    const redirectUrl = this.config.whopSuccessRedirectUrl;
    const useRedirect = redirectUrl?.startsWith('https://');

    if (redirectUrl && !useRedirect) {
      this.logger.warn(
        `WHOP_SUCCESS_REDIRECT_URL nuk fillon me https:// ("${redirectUrl}"); ` +
          'po dërgohet pa redirect_url. Përdor ngrok për test të plotë në localhost.',
      );
    }

    try {
      const checkoutConfig = await this.client.checkoutConfigurations.create({
        plan: {
          company_id: this.config.whopCompanyId,
          initial_price: amount,
          plan_type: 'one_time',
          currency,
        },
        metadata: {
          user_id: String(userId),
          amount: String(amount),
          type: 'wallet_topup',
        },
        ...(useRedirect ? { redirect_url: redirectUrl } : {}),
      } as any);

      const cfg = checkoutConfig as any;
      const purchaseUrl: string | undefined = cfg.purchase_url ?? cfg.purchaseUrl;

      if (!purchaseUrl) {
        this.logger.error(
          'Whop nuk ktheu purchase_url',
          JSON.stringify(checkoutConfig, null, 2),
        );
        throw new InternalServerErrorException('Whop checkout: purchase_url mungon');
      }

      const checkoutUrl = purchaseUrl.startsWith('http')
        ? purchaseUrl
        : `https://whop.com${purchaseUrl}`;

      this.logger.log(
        `Whop checkout u krijua: id=${cfg.id}, user=${userId}, amount=${amount} ${currency}`,
      );

      return {
        checkoutUrl,
        checkoutConfigId: cfg.id,
      };
    } catch (err: any) {
      const status: number | undefined = err?.status ?? err?.statusCode;
      const whopBody = err?.error ?? err?.response?.data ?? err?.body;
      const whopMessage: string =
        whopBody?.error?.message ?? err?.message ?? 'Unknown Whop error';

      this.logger.error(
        `Whop checkout create failed [status=${status}]: ${whopMessage}`,
        { status, body: whopBody },
      );

      if (status === 400 || status === 422) {
        throw new BadRequestException(`Whop: ${whopMessage}`);
      }

      throw new InternalServerErrorException('Whop checkout failed');
    }
  }

  verifyWebhook(
    rawBody: string,
    rawHeaders: Record<string, string | string[] | undefined>,
  ) {
    const headers: Record<string, string> = {};
    for (const [key, value] of Object.entries(rawHeaders)) {
      if (value === undefined) continue;
      headers[key] = Array.isArray(value) ? value.join(', ') : value;
    }

    return this.client.webhooks.unwrap(rawBody, { headers });
  }
}