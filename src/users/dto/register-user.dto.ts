// import { Injectable } from '@nestjs/common';
// import { IsString, IsEmail, MinLength, Matches, IsBoolean, IsEnum, Validate, ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';
// import { t, SupportedLang } from '../../locales';
// import { UserRepository } from '../../repositories/user/user.repository';
// export enum UserRole {
//   USER = 'user',
//   AGENCY_OWNER = 'agency_owner',
//   AGENT = 'agent',
// }

// // 1️⃣ Use ValidatorConstraint with DI
// @ValidatorConstraint({ async: true })
// @Injectable()
// export class IsEmailUnique implements ValidatorConstraintInterface {
//   constructor(private readonly userRepo: UserRepository) {}

//   async validate(email: string, args: ValidationArguments) {
//     return !(await this.userRepo.emailExists(email));
//   }

//   defaultMessage(args: ValidationArguments) {
//     const lang: SupportedLang = (args.object as any).language || 'al';
//     return t('emailExists', lang);
//   }
// }

// @ValidatorConstraint({ async: true })
// @Injectable()
// export class IsUsernameUnique implements ValidatorConstraintInterface {
//   constructor(private readonly userRepo: UserRepository) {}

//   async validate(username: string, args: ValidationArguments) {
//     return !(await this.userRepo.usernameExists(username));
//   }

//   defaultMessage(args: ValidationArguments) {
//     const lang: SupportedLang = (args.object as any).language || 'al';
//     return t('usernameExists', lang);
//   }
// }

// export class RegisterUserDto {
//   language?: SupportedLang;

//   @IsString()
//   @MinLength(4, { message: (args) => t('usernameMin', (args.object as any).language) })
//   @Matches(/^\S+$/, { message: (args) => t('usernameNoSpaces', (args.object as any).language) })
//   @Validate(IsUsernameUnique)
//   username: string;

//   @IsEmail({}, { message: (args) => t('emailInvalid', (args.object as any).language) })
//   @Validate(IsEmailUnique)
//   email: string;

//   @IsString()
//   @MinLength(8, { message: (args) => t('passwordMin', (args.object as any).language) })
//   @Matches(/^\S+$/, { message: (args) => t('passwordNoSpaces', (args.object as any).language) })
//   password: string;

//   @IsString({ message: (args) => t('firstNameRequired', (args.object as any).language) })
//   first_name: string;

//   @IsString({ message: (args) => t('lastNameRequired', (args.object as any).language) })
//   last_name: string;

//   @IsBoolean({ message: (args) => t('termsRequired', (args.object as any).language) })
//   terms_accepted: boolean;

//   @IsEnum(UserRole, { message: (args) => t('invalidRole', (args.object as any).language) })
//   role: UserRole;

//   repeatPassword: string; 
// }
