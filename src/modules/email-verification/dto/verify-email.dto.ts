// import { ApiProperty } from '@nestjs/swagger';
// import { IsNotEmpty, IsString } from 'class-validator';
// import { SupportedLang, t } from '../../../locales';
//  export class VerifyEmailDto {
//     @ApiProperty({
//     description: 'Verification token sent to user email',
//     example: 'abc123def456',
//   })
//   @IsNotEmpty({ message:'noTokenProvided' })

import { IsNotEmpty } from "class-validator";

 

export class VerifyEmailDto {
  @IsNotEmpty({ message: 'tokenRequired' })
  token: string;

 
}