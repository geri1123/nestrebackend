import { Module } from "@nestjs/common";
import { SendContactMessageUseCase } from "./application/use-cases/send-contact-message.use-case";
import { ContactController } from "./controller/contact.controller";
import { ProductModule } from "../product/product.module";
import { SendMessageToAgencyUseCase } from "./application/use-cases/send-agency-message.use-case";
import { AgencyModule } from "../agency/agency.module";
import { UsersModule } from "../users/users.module";
import {SendMessageToUserUseCase} from "./application/use-cases/sent-user-message.use-case";

@Module({
providers:[SendContactMessageUseCase, SendMessageToAgencyUseCase ,SendMessageToUserUseCase ],
controllers:[ContactController],
imports:[ProductModule , AgencyModule , UsersModule]
})
export class ContactModule{};