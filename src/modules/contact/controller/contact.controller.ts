import { Body, Controller, Post, Req } from "@nestjs/common";
import { CreateContactDto } from "../dto/contact.dto";
import { SendContactMessageUseCase } from "../application/use-cases/send-contact-message.use-case";


import {type RequestWithUser } from "../../../common/types/request-with-user.interface";
import { ApiBadRequestResponse, ApiTags, ApiUnauthorizedResponse } from "@nestjs/swagger";
import { ApiSuccessResponse } from "../../../common/swagger/response.helper.ts";
import { Public } from "../../../common/decorators/public.decorator";
@ApiTags('Contact')
@Public()
@Controller('contact')
export class ContactController {
  constructor(private readonly sendContactMessageUseCase: SendContactMessageUseCase) {}

@Post()
@ApiBadRequestResponse()
@ApiSuccessResponse('Message sent successfully')
async send(@Body() dto: CreateContactDto, @Req() req: RequestWithUser) {
 

  return this.sendContactMessageUseCase.execute(dto, req.language);
}
}