

import { IsNotEmpty } from "class-validator";

 

export class VerifyEmailDto {
  @IsNotEmpty({ message: 'tokenRequired' })
  token: string;

 
}