## RequestContext (AsyncLocalStorage)

Purpose:
- Store per-request contextual data (currently: user language)
- Make the language accessible deep inside the call stack
  without having to pass it through every function

Technology:
- Uses Node.js `AsyncLocalStorage`
- Context is tied to the async lifecycle of each request

Interface:
- RequestContext {
    language: SupportedLang
  }

Export:
- `requestContext` → AsyncLocalStorage<RequestContext>

Behavior:
- Middleware sets language at start of request
- Any service / helper can later read it
- Removes the need to pass `lang` everywhere manually

Used for:
- Localization helpers
- Error message translation
- Validation messages
- API responses

Why:
- Centralized language context
- Cleaner function signatures
- Works across async operations