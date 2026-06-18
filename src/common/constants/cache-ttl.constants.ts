export const CacheTTL = {
  // Verification tokens
  EMAIL_VERIFICATION: 10 * 60 * 1000,        // 10 minuta
  EMAIL_VERIFICATION_USED: 24 * 60 * 60 * 1000, // 24 orë (anti-replay)

  // Auth
  REFRESH_TOKEN: 7 * 24 * 60 * 60 * 1000,   // 7 ditë
  
  // General
  SHORT: 5 * 60 * 1000,                       // 5 min
  MEDIUM: 30 * 60 * 1000,                     // 30 min
  LONG: 60 * 60 * 1000,                       // 1 orë
} as const;