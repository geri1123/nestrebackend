import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { SupportedLang, t } from '../../../locales';
// export function ResendVeificationEmalFactory(lang: SupportedLang= 'al'){
 export class ResendVerificationEmailDto {
     @ApiProperty({
        description: 'Verification token sent to user email',
        example: 'abc123def456',
      })
  
  @IsString()
  @IsNotEmpty({ message:'emailrequired'})
  identifier!: string;
}
