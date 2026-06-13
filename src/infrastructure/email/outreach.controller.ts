import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { SendOutreachDto } from './dto/outreach.dto';
import { OutreachSummary, SendAgencyOutreachUseCase } from './use-cases/send-agency-outreach.use-case';
import { Public } from '../../common/decorators/public.decorator';
@ApiTags('Outreach')
@Controller('outreach')
export class OutreachController {
  constructor(private readonly sendAgencyOutreachUseCase: SendAgencyOutreachUseCase) {}
    @Public()
  @Post('agencies')
  @ApiOperation({ summary: 'Send outreach email to a list of unregistered agencies' })
  async sendAgencyOutreach(@Body() dto: SendOutreachDto): Promise<OutreachSummary> {
    return this.sendAgencyOutreachUseCase.execute(dto.agencies);
  }
}