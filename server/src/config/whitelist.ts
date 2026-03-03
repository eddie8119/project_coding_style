/**
 * Email Whitelist Configuration
 *
 * Only emails listed here or in the WHITELISTED_EMAILS environment variable
 * will be allowed to register or login.
 */

const getWhitelistFromEnv = (): string[] => {
  const rawValue = process.env.WHITELISTED_EMAILS;

  if (!rawValue) {
    return [];
  }

  // Preferred format: JSON array string
  try {
    const parsed = JSON.parse(rawValue);
    if (Array.isArray(parsed)) {
      return parsed.map((email) => String(email).trim().toLowerCase()).filter(Boolean);
    }
  } catch {
    // no-op, fallback to comma-separated parsing below
  }

  // Fallback: comma-separated string
  return rawValue
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
};

export const isEmailWhitelisted = (email: string): boolean => {
  if (!email) return false;

  const normalizedEmail = email.toLowerCase().trim();
  const envWhitelist = getWhitelistFromEnv();

  return envWhitelist.includes(normalizedEmail);
};
