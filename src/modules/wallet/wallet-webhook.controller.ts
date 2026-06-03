import {
  Controller,
  Post,
  Req,
  Query,
  Headers,
  HttpCode,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { RawBodyRequest } from '@nestjs/common';
import { Request } from 'express';
import { Public } from '../../common/decorators/public.decorator';
import { WhopService } from '../../infrastructure/whop/whop.service';
import { PayseraService } from '../../infrastructure/paysera/paysera.service';
import { ProcessPayseraPaymentUseCase } from './application/use-cases/process-paysera-payment.use-case';

@Controller('wallet/webhooks')
export class WalletWebhookController {
  private readonly logger = new Logger(WalletWebhookController.name);

  constructor(
    private readonly whop: WhopService,
    private readonly paysera: PayseraService,
    private readonly processPayseraPayment: ProcessPayseraPaymentUseCase,
  ) {}

  // ─── Whop ────────────────────────────────────────────────────────────────────

  // @Public()
  // @Post('whop')
  // @HttpCode(200)
  // async handleWhop(
  //   @Req() req: RawBodyRequest<Request>,
  //   @Headers() headers: Record<string, string>,
  // ) {
  //   if (!req.rawBody) {
  //     throw new BadRequestException('Raw body missing');
  //   }

  //   let event: any;
  //   try {
  //     event = this.whop.verifyWebhook(req.rawBody.toString('utf8'), headers);
  //   } catch (err) {
  //     this.logger.warn('Invalid Whop webhook signature', err);
  //     throw new BadRequestException('Invalid signature');
  //   }

  //   const eventType = event.type ?? event.action;
  //   this.logger.log(`Whop webhook received: ${eventType}`);

  //   if (eventType === 'payment.succeeded') {
  //     await this.processWhopPayment.execute(event.data);
  //   }

  //   return { received: true };
  // }

  // ─── Paysera IPN ─────────────────────────────────────────────────────────────
  //
  // Paysera dërgon GET/POST me query params: ?data=BASE64&ss1=MD5SIGN
  // Duhet t'i kthejmë "OK" si plaintext — çdo gjë tjetër trajtohet si dështim.

  @Public()
  @Post('paysera')
  @HttpCode(200)
  async handlePaysera(@Query() query: Record<string, string>) {
    let callbackData: ReturnType<PayseraService['verifyCallback']>;

    try {
      callbackData = this.paysera.verifyCallback(query);
    } catch (err) {
      this.logger.warn('Paysera IPN: verifikim i dështuar', err);
      throw new BadRequestException('Invalid Paysera callback');
    }

    this.logger.log(
      `Paysera IPN received: order=${callbackData.orderid} status=${callbackData.status}`,
    );

    await this.processPayseraPayment.execute(callbackData);

    // Paysera kërkon pikërisht "OK" si body — jo JSON
    return 'OK';
  }
}