import { ValidationError } from 'class-validator';
import { t, SupportedLang } from '../../locales';
import { BadRequestException } from '@nestjs/common';

export function throwValidationErrors(
  errors: ValidationError[],
  lang: SupportedLang = 'al',
  extraErrors?: Record<string, string[]>, // optional extra errors
) {
  const formatted: Record<string, string[]> = {};

  // DTO validation errors
  errors.forEach(err => {
  if (err.constraints) {
    const messages = Object.values(err.constraints).map(code =>
      translateValidationMessage(code, lang)
    );

   
    formatted[err.property] = Array.from(new Set(messages));
  }
});

  // Merge extra custom errors
  if (extraErrors) {
    Object.assign(formatted, extraErrors);
  }

  if (Object.keys(formatted).length > 0) {
    throw new BadRequestException({
      success: false,
      message: t('validationFailed', lang),
      errors: formatted,
    });
  }
}
export function translateValidationMessage(code: string, lang: SupportedLang): string {
  switch (code) {
    case 'usernameMustBeString': return t('usernameStringError', lang);
    case 'usernameLength': return t('usernameMin', lang);
    case 'usernameInvalidChars': return t('usernameInvalidChars', lang);
    case 'emailRequired': return t('emailRequired', lang);
    case 'emailInvalid': return t('emailInvalid', lang);
    case 'passwordMin': return t('passwordMin', lang);
    case 'passwordsMismatch': return t('passwordsMismatch', lang);
    case 'firstNameRequired': return t('firstNameRequired', lang);
    case 'lastNameRequired': return t('lastNameRequired', lang);
    case 'termsRequired': return t('termsRequired', lang);
        case 'usernameNoSpaces': return t('usernameNoSpaces', lang);
    case 'passwordNoSpaces': return t('passwordNoSpaces', lang);
    case 'usernamePatternError': return t('usernameInvalidChars', lang);
    //agency
    case "noTokenProvided": return t('noTokenProvided', lang);
     case 'agencyNameRequired': return t('agencyNameRequired', lang);
    case 'licenseRequired': return t('licenseRequired', lang);
    case 'addressRequired': return t('addressRequired', lang);
// Agent registration
    case 'publicCodeRequired': return t('publicCodeRequired', lang);
    case 'idCardRequired': return t('idCardRequired', lang);
    case 'agencyRoleRequired': return t('agencyRoleRequired', lang);
    //login
     case 'identifierRequired': return t('identifierRequired', lang);
    case 'passwordRequired': return t('passwordRequired', lang);
    //email
    case 'emailMustBeString': return t('emailMustBeString', lang);
    case 'emailInvalid': return t('emailInvalid', lang);
    case 'emailRequired': return t('emailRequired', lang);
    case 'emailrequired': return t('emailrequired', lang);
     // Reset password
    case 'tokenRequired': return t('tokenRequired', lang);
    case 'passwordRequired': return t('passwordRequired', lang);
    case 'newPasswordMinLength': return t('newPasswordMinLength', lang);
    case 'confirmPasswordRequired': return t('confirmPasswordRequired', lang);
    case 'passwordMustBeString': return t('passwordMustBeString', lang);

    //update
    case 'firstNameMustBeString': return t('firstNameMustBeString', lang);

case 'lastNameMustBeString': return t('lastNameMustBeString', lang);
case 'aboutMeLength': return t('aboutMeLength', lang);
case 'aboutMeMustBeString': return t('aboutMeMustBeString', lang);

case 'phoneMustBeString': return t('phoneMustBeString', lang);
case 'phoneLength': return t('phoneLength', lang);
case "roleInAgencyRequired": return t('roleInAgencyRequired', lang);
case "commissionRateRequired": return t('commissionRateRequired', lang);
case "invalidCommissionRate": return t('invalidCommissionRate', lang);

case "cityId"  :return t('cityId' , lang);
case "subcategoryId"  :return t('subcategoryId' , lang);
case "subcategoryId"  :return t('subcategoryId' , lang);
case "listingTypeId": return t('listingTypeId', lang);
case "buildYearMin": return t('buildYearMin' , lang);
case "buildYearMax": return t('buildYearMax' , lang);
case "buildYearInt": return t('buildYearInt', lang);
case "buildYear": return t('buildYear' ,lang);
case "price": return t("price" , lang);
case "pricePositive": return t("pricePositive" , lang);
case "title": return t("title" , lang);
case "productstatus": return t("productstatus", lang);

case 'endDateInvalid':return t("endDateInvalid", lang);
case "agencyNameRequired":return t("agencyNameRequired",lang)
case "phoneMustBeDigits":return t("phoneMustBeDigits", lang)
case "websiteInvalid":return t("websiteInvalid" , lang);
case 'repeatPasswordRequired':return t('repeatPasswordRequired', lang);
default: return code;
  }
}
