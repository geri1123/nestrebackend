import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { SupportedLang, t } from '../../locales';
export function VerificationEmalFactory(lang: SupportedLang= 'al'){
 class VerifyEmailDto {
    @ApiProperty({
    description: 'Verification token sent to user email',
    example: 'abc123def456',
  })
  @IsNotEmpty({ message: t('noTokenProvided', lang) })
  
  token: string;
}
return VerifyEmailDto;
}
export type VerifyEmailDto = InstanceType<ReturnType<typeof VerificationEmalFactory>>;

export class VerifyEmailDtoSwagger{
@ApiProperty({
    description: 'Verification token sent to user email',
    example: 'abc123def456',
  })
    token: string;
}
export class VerifyEmailSwagerSuccessResponse{
    @ApiProperty({
        example: true,
    description: 'Indicates if the request was successful',
    })
    success:boolean;
 @ApiProperty({
    example: 'Successfully verified',
    description: 'Success message',
  })
  message:string;

}


export class VerifyEmailFieldResponseSwagger {
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
      token: [
            "Invalid or expired verification token."
        ]
   
    },
    description: 'Field-specific validation errors',
    type: Object,
    additionalProperties: { type: 'array', items: { type: 'string' } },
  })
  errors: Record<string, string[]>;
}