import { ApiProperty } from "@nestjs/swagger";
import type { SupportedLang } from "../../locales";

class NotificationTranslationResponseDto {
  @ApiProperty({ description: "Language code", enum: ["en", "al", "it"], example: "en" })
  languageCode: SupportedLang;

  @ApiProperty({ description: "Notification message in this language", example: "John Smith has confirmed their email." })
  message: string;
}

export class NotificationResponseDto {
  @ApiProperty({ description: "Notification ID", example: 4 })
  id: number;

  @ApiProperty({ description: "Status of the notification", enum: ["read", "unread"], example: "unread" })
  status: "read" | "unread";

  @ApiProperty({ description: "Translations of the notification", type: [NotificationTranslationResponseDto] })
  translations: NotificationTranslationResponseDto[];
}

export class GetNotificationsResponseDto {
  @ApiProperty({ description: "Array of notifications", type: [NotificationResponseDto] })
  notifications: NotificationResponseDto[];

  @ApiProperty({ description: "Number of unread notifications", example: 3 })
  unreadCount: number;
}
