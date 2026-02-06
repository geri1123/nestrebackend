import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length, Matches } from 'class-validator';
import { Transform } from 'class-transformer';


  export class UsernameDto {
    @ApiProperty({ description: 'Username', example: 'john_doe' })
    @Length(4, 30, { message:'usernameLengthError' })
    @IsString({ message:"usernameMustBeString" })
    @Transform(({ value }) => value?.trim())
    
    @Matches(/^[a-zA-Z0-9_]+$/, { message: 'usernamePatternError' })
    username!: string;
  }



