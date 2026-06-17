import { Transform } from 'class-transformer';
import {
  IsEmail,
  isNotEmpty,
  IsNotEmpty,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';


export class CreateAdminDto {
  @IsEmail({}, { message: 'Email is not valid' })
  @IsNotEmpty({ message: 'Email is required' })
  email!: string;

  @IsString({ message: 'Name must be a string' })
  @IsNotEmpty({ message: 'Name is required' })
  name!: string;

  @IsString({ message: 'Password must be a string' })
  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(6, { message: 'Password must be at least 6 characters' })
  password!: string;
}