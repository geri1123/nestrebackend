import { Module } from "@nestjs/common";
import { SendContactMessageUseCase } from "./application/use-cases/send-contact-message.use-case";
import { ContactController } from "./controller/contact.controller";
import { ProductModule } from "../product/product.module";
import { SendMessageToAgencyUseCase } from "./application/use-cases/send-agency-message.use-case";
import { AgencyModule } from "../agency/agency.module";



@Module({
providers:[SendContactMessageUseCase, SendMessageToAgencyUseCase],
controllers:[ContactController],
imports:[ProductModule , AgencyModule]
})
export class ContactModule{};