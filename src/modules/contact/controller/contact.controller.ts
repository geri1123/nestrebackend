import { Body, Controller, Post, Req } from "@nestjs/common";
import { CreateContactDto, SendMessageToAgencyDto, SendMessageToUserDto } from "../dto/contact.dto";
import { SendContactMessageUseCase } from "../application/use-cases/send-contact-message.use-case";


import {type RequestWithUser } from "../../../common/types/request-with-user.interface";
import { ApiBadRequestResponse, ApiTags, ApiUnauthorizedResponse } from "@nestjs/swagger";
import { ApiSuccessResponse } from "../../../common/swagger/response.helper.ts";
import { Public } from "../../../common/decorators/public.decorator";
import { SendMessageToAgencyUseCase } from "../application/use-cases/send-agency-message.use-case";
import { SendMessageToUserUseCase } from "../application/use-cases/sent-user-message.use-case";
@ApiTags('Contact')
@Public()
@Controller('contact')
export class ContactController {
  constructor(
    private readonly sendContactMessageUseCase: SendContactMessageUseCase,
    private readonly sendMessageToAgency:SendMessageToAgencyUseCase,
    private readonly sendMessageToUser: SendMessageToUserUseCase
  ) {}

@Post()
@ApiBadRequestResponse()
@ApiSuccessResponse('Message send successfully')
async send(@Body() dto: CreateContactDto, @Req() req: RequestWithUser) {
 

  return this.sendContactMessageUseCase.execute(dto, req.language);
}
@Post("/agency/message")
@ApiBadRequestResponse()
@ApiSuccessResponse('Message send successfully')
async sendToAgency(@Body() dto:SendMessageToAgencyDto, @Req() req:RequestWithUser){
  return this.sendMessageToAgency.execute(dto , req.language)
}

@Post("user/message")
@ApiBadRequestResponse()
@ApiSuccessResponse('Message send successfully')
async sendToUser(@Body() dto: SendMessageToUserDto, @Req() req: RequestWithUser) {
  return this.sendMessageToUser.execute(dto, req.language);
}
}