import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { SupportedLang, t } from '../../locales';
export function ResendVeificationEmalFactory(lang: SupportedLang= 'al'){
 class ResendVerificationEmailDto {
     @ApiProperty({
        description: 'Verification token sent to user email',
        example: 'abc123def456',
      })
  
  @IsString()
  @IsNotEmpty({ message: t('emailRequired', lang) })
  identifier: string;
}
return ResendVerificationEmailDto;
}
export type ResendVerificationEmailDto = InstanceType<ReturnType<typeof ResendVeificationEmalFactory>>;

export class ResendEmailSwagerdto{
    @ApiProperty({
         example:"example@gmail.com",
         description:"Email for resend",   
    })
    identifier:string;
}

export class ResendEmailSuccessResponse{
    @ApiProperty({
        example: true,
    description: 'Indicates if the request was successful',
    })
    success:boolean;
 @ApiProperty({
    example: 'Successfully resend',
    description: 'Success message',
  })
  message:string;

}
export class ResendEmailFieldResponse {
  @ApiProperty({ 
    example: false, 
    description: 'Indicates if the request failed' 
  })
  success: boolean;

  @ApiProperty({ 
    example: 'Validation failed', 
    description: 'Error message' 
  })
  message: string;

  @ApiProperty({
    example: {
      identifier: ['Email-i nuk është i vlefshëm.'],
   
    },
    description: 'Field-specific validation errors',
    type: Object,
    additionalProperties: { type: 'array', items: { type: 'string' } },
  })
  errors: Record<string, string[]>;
}