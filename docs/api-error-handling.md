## AllExceptionsFilter

Purpose:
- Global exception handler for the API
- Ensures all errors return a consistent JSON structure

Behavior:
- Catches all thrown exceptions (`@Catch()`)
- If exception is HttpException:
  - Uses its HTTP status
  - Reads `message` and optional `errors` from exception response
- Otherwise:
  - Status → 500
  - Message → "Internal server error"

Response format:
{
  success: false,
  message: string,
  errors?: Record<string, string[]>
}

Status codes:
- Taken from HttpException when available
- Default: 500 (Internal Server Error)

Why:
- Unified error format across backend
- Frontend doesn’t need to handle different shapes
- Works together with validation helper (`throwValidationErrors`)