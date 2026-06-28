import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { SendOutreachDto } from '../../../infrastructure/email/dto/outreach.dto';
import { OutreachSummary, SendAgencyOutreachUseCase } from './send-agency-outreach.use-case';
import { Public } from '../../../common/decorators/public.decorator';
import { AdminJwtGuard } from '../auth/guard/admin-jwt.guard';
@ApiTags('Outreach')
@Controller('admin/outreach')
export class OutreachController {
  constructor(private readonly sendAgencyOutreachUseCase: SendAgencyOutreachUseCase) {}
    @Public()
    @UseGuards(AdminJwtGuard)
  @Post('agencies')
  @ApiOperation({ summary: 'Send outreach email to a list of unregistered agencies' })
  async sendAgencyOutreach(@Body() dto: SendOutreachDto): Promise<OutreachSummary> {
    return this.sendAgencyOutreachUseCase.execute(dto.agencies);
  }
}