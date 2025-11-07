import { IsEnum, IsNotEmpty, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import type { SupportedLang } from "../../../locales";

export class NotificationTranslationDto {
  @ApiProperty({
    description: "Language code for this translation",
    enum: ["en", "al", "it"],
    example: "en",
  })
  @IsEnum(["en", "al", "it"])
  languageCode: SupportedLang;

  @ApiProperty({
    description: "The notification message in this language",
    example: "John Smith has confirmed their email and wants to join your agency.",
  })
  @IsString()
  @IsNotEmpty()
  message: string;
}
