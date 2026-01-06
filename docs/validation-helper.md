## Validation Error Handling

Purpose:
- Convert `class-validator` errors into a unified API response format
- Translate validation messages based on user language
- Support attaching custom validation errors

Main function:
- `throwValidationErrors(errors, lang?, extraErrors?)`

Behavior:
- Iterates through `ValidationError[]`
- Maps validator constraint codes → localized messages
- Groups messages by field name
- Removes duplicate messages
- Merges optional `extraErrors`
- Throws `BadRequestException` with structure:
  {
    success: false,
    message: t('validationFailed'),
    errors: { fieldName: [messages...] }
  }

Default language:
- `al`

Translation:
- `translateValidationMessage(code, lang)`
- Maps internal error codes → translation keys in `locales`

Supported codes example:
- username validation
- email validation
- password validation
- agency registration
- agent onboarding
- login fields
- update profile
- product creation fields
- phone / website formatting
- password recovery + reset
- and more…

Why:
- Centralized validation formatting
- Consistent error structure across API
- Multi-language validation support
- Cleaner controller use-cases

Usage example:
- Called after DTO validation fails
- Custom logic may pass `extraErrors`

## Match (Custom Validation Decorator)

Purpose:
- Custom `class-validator` decorator to ensure two DTO fields match
- Commonly used for password confirmation fields

Usage example:
- `@Match('password')`
- Applied on: `confirmPassword`

Behavior:
- Reads the value of another property on the same DTO
- Returns `true` only when:
  targetField === relatedField
- Otherwise triggers a validation error

Parameters:
- `property` → name of the field to compare against
- `validationOptions?` → optional class-validator config (message, groups, etc.)

Why:
- Avoids repeating comparison logic in controllers/services
- Keeps DTO validation declarative and consistent
- Works seamlessly with your localization + validation handler