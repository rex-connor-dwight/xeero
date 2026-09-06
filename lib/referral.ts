const REFERRAL_STORAGE_KEY = "xeero_referral_code";
const REFERRAL_EXPIRY_KEY = "xeero_referral_expires_at";
const REFERRAL_WINDOW_DAYS = 30;

export function captureReferralCode(ref: string) {
  const expiresAt = Date.now() + REFERRAL_WINDOW_DAYS * 24 * 60 * 60 * 1000;
  localStorage.setItem(REFERRAL_STORAGE_KEY, ref);
  localStorage.setItem(REFERRAL_EXPIRY_KEY, String(expiresAt));
}

// Returns the stored referral code if it exists and hasn't expired, otherwise null.
// Call this once at signup time, then clear it so it's never reused for a later signup.
export function consumeReferralCode(): string | null {
  const code = localStorage.getItem(REFERRAL_STORAGE_KEY);
  const expiresAtRaw = localStorage.getItem(REFERRAL_EXPIRY_KEY);

  if (!code || !expiresAtRaw) return null;

  const expiresAt = parseInt(expiresAtRaw, 10);
  localStorage.removeItem(REFERRAL_STORAGE_KEY);
  localStorage.removeItem(REFERRAL_EXPIRY_KEY);

  if (Date.now() > expiresAt) return null;

  return code;
}