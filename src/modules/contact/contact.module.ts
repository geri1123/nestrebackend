import { Module } from "@nestjs/common";
import { SendContactMessageUseCase } from "./application/use-cases/send-contact-message.use-case";
import { ContactController } from "./controller/contact.controller";
import { ProductModule } from "../product/product.module";



@Module({
providers:[SendContactMessageUseCase],
controllers:[ContactController],
imports:[ProductModule]
})
export class ContactModule{};