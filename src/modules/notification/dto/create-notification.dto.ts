import { IsArray, IsNotEmpty, IsNumber, IsString, ValidateNested } from "class-validator";
import { Type } from "class-transformer";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { NotificationTranslationDto } from "./notification-translation.dto";

export class CreateNotificationDto {
  @ApiProperty({
    description: "The ID of the user who will receive the notification",
    example: 123,
  })
  @IsNumber()
  userId!: number;

  @ApiProperty({
    description: "Type/category of the notification",
    example: "agent_pending",
  })
  @IsString()
  @IsNotEmpty()
  type!: string;

  @ApiProperty({
    description: "Notification messages in multiple languages",
    type: [NotificationTranslationDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => NotificationTranslationDto)
  translations!: NotificationTranslationDto[];
}
