import {
  Injectable,
  Logger,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import * as crypto from 'crypto';
import { AppConfigService } from '../config/config.service';

export interface PayseraCallbackData {
  orderid: string;
  amount: string;
  currency: string;
  status: string;
  requestid: string;
  payamount?: string;
  paycurrency?: string;
  payment?: string;
  [key: string]: string | undefined;
}

@Injectable()
export class PayseraService {
  private readonly logger = new Logger(PayseraService.name);

  constructor(private readonly config: AppConfigService) {
    if (!this.config.payseraProjectId) {
      this.logger.error('PAYSERA_PROJECT_ID mungon.');
    }
    if (!this.config.payseraSignPassword) {
      this.logger.error('PAYSERA_SIGN_PASSWORD mungon.');
    }
  }

  /**
   * Gjeneron URL-në e pagesës Paysera.
   * @param userId   ID e userit (ruhet në orderid)
   * @param amount   Shuma në EUR (p.sh. 10.50)
   * @param orderId  ID unike e porosisë (UUID ose çdo string unik)
   */
  createPaymentUrl(params: {
    userId: number;
    amount: number;
    orderId: string;
  }): string {
    const { userId, amount, orderId } = params;

    const amountInCents = Math.round(amount * 100);

    const data: Record<string, string> = {
      projectid: this.config.payseraProjectId,
      orderid: orderId,
      lang: 'ALB',
      amount: String(amountInCents),
      currency: 'EUR',
      country: 'AL',
      accepturl: this.config.payseraSuccessUrl,
      cancelurl: this.config.payseraCancelUrl,
      callbackurl: this.config.payseraCallbackUrl,
      // Metadata e fshehur — e ruajmë në description si fallback
      // Paysera nuk ka fushë metadata si Whop; e kodojmë në orderid
      // Formati: "uid_{userId}_{orderId}" ose thjesht orderId + e lexojmë nga DB
      version: '1.6',
      test: this.config.nodeEnv !== 'production' ? '1' : '0',
    };

    const encoded = this.encodeData(data);
    const sign = this.generateSign(encoded);

    return `https://www.paysera.com/pay/?data=${encoded}&sign=${sign}`;
  }

  /**
   * Verifikon dhe parseton IPN callback nga Paysera.
   * Hedh BadRequestException nëse signature është e gabuar.
   */
  verifyCallback(query: Record<string, string>): PayseraCallbackData {
    const { data, ss1, ss2 } = query;

    if (!data || (!ss1 && !ss2)) {
      throw new BadRequestException('Paysera callback: parametra të papërfunduar');
    }

    // Verifiko ss1 (MD5) ose ss2 (SHA1)
    const valid = this.verifySign(data, ss1, ss2);
    if (!valid) {
      this.logger.warn('Paysera IPN: signature e gabuar');
      throw new BadRequestException('Paysera: signature e pavlefshme');
    }

    // Dekodo dhe parseto
    const decoded = Buffer.from(data, 'base64').toString('utf8');
    const parsed: Record<string, string> = {};
    for (const pair of decoded.split('&')) {
      const [key, ...rest] = pair.split('=');
      if (key) parsed[decodeURIComponent(key)] = decodeURIComponent(rest.join('=') || '');
    }

    // Verifiko që projekti është i joni
    if (parsed.projectid !== this.config.payseraProjectId) {
      this.logger.error(
        `Paysera: projectid nuk përputhet (${parsed.projectid} vs ${this.config.payseraProjectId})`,
      );
      throw new BadRequestException('Paysera: projectid i gabuar');
    }

    return parsed as PayseraCallbackData;
  }

  // ─── Helpers private ────────────────────────────────────────────────────────

  private encodeData(data: Record<string, string>): string {
    const qs = Object.entries(data)
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
      .join('&');
    return Buffer.from(qs).toString('base64').replace(/\+/g, '-').replace(/\//g, '_');
  }

  private generateSign(encodedData: string): string {
    return crypto
      .createHash('md5')
      .update(encodedData + this.config.payseraSignPassword)
      .digest('hex');
  }

  private verifySign(data: string, ss1?: string, ss2?: string): boolean {
    if (ss1) {
      const expected = crypto
        .createHash('md5')
        .update(data + this.config.payseraSignPassword)
        .digest('hex');
      if (expected === ss1) return true;
    }
    if (ss2) {
      const expected = crypto
        .createHash('sha1')
        .update(data + this.config.payseraSignPassword)
        .digest('hex');
      if (expected === ss2) return true;
    }
    return false;
  }
}