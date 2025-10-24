import { IsEnum, IsNotEmpty, IsString } from "class-validator";
import type { SupportedLang } from "../../locales";

export class NotificationTranslationDto {
  @IsEnum(["en" , "al" ,"it"])
  languageCode: SupportedLang;

  @IsString()
  @IsNotEmpty()
  message: string;
}