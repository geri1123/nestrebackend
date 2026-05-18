import {
  Controller,
  Post,
  Req,
  Headers,
  HttpCode,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { RawBodyRequest } from '@nestjs/common';
import { Request } from 'express';
import { Public } from '../../common/decorators/public.decorator';
import { WhopService } from '../../infrastructure/whop/whop.service';
import { ProcessWhopPaymentUseCase } from './application/use-cases/process-whop-payment.use-case';

@Controller('wallet/webhooks')
export class WalletWebhookController {
  private readonly logger = new Logger(WalletWebhookController.name);

  constructor(
    private readonly whop: WhopService,
    private readonly processPayment: ProcessWhopPaymentUseCase,
  ) {}

  @Public()
  @Post('whop')
  @HttpCode(200)
  async handleWhop(
    @Req() req: RawBodyRequest<Request>,
    @Headers() headers: Record<string, string>,
  ) {
    if (!req.rawBody) {
      throw new BadRequestException('Raw body missing');
    }

    let event: any;
    try {
      event = this.whop.verifyWebhook(req.rawBody.toString('utf8'), headers);
    } catch (err) {
      this.logger.warn('Invalid Whop webhook signature', err);
      throw new BadRequestException('Invalid signature');
    }

    // Whop API v1 përdor "type", versionet e vjetra "action"
    const eventType = event.type ?? event.action;

    this.logger.log(`Whop webhook received: ${eventType}`);

    if (eventType === 'payment.succeeded') {
      await this.processPayment.execute(event.data);
    }
    // Eventet e tjera mund të injorohen ose log-ohen

    return { received: true };
  }
}