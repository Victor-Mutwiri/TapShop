/**
 * Kenyan Phone Number Utilities for TapShop
 *
 * Enforces Kenyan E.164 standard:
 * - Country Code: +254 (Mandatory)
 * - National Significant Number: Exactly 9 digits (starting with 7 or 1, e.g. 712345678 or 110123456)
 * - Formatted for display: +254 7XX XXX XXX
 * - Cleaned for WhatsApp wa.me links: 2547XXXXXXXX
 */

/**
 * Extracts the 9 significant Kenyan mobile digits from any raw user input or pasted string.
 * Automatically strips country codes (+254, 254), leading zeros (07... / 01...), spaces, dashes, and letters.
 *
 * Examples:
 *  "0712 345 678"     => "712345678"
 *  "+254712345678"    => "712345678"
 *  "254712345678"     => "712345678"
 *  "0110 999 888"     => "110999888"
 *  "712345678"        => "712345678"
 */
export function extractKenyaMobileDigits(input: string | undefined | null): string {
  if (!input) return '';
  let digits = input.replace(/\D/g, '');

  // Strip international Kenya code 254 if present at the start
  if (digits.startsWith('254')) {
    digits = digits.slice(3);
  }

  // Strip leading 0 if present (e.g. 0712... -> 712...)
  if (digits.startsWith('0')) {
    digits = digits.slice(1);
  }

  // Kenya mobile numbers have 9 digits
  return digits.slice(0, 9);
}

/**
 * Validates if the given string represents a valid 9-digit Kenyan mobile number.
 * Kenya mobile numbers must be exactly 9 digits and start with 7 or 1 (Safaricom, Airtel, Telcom).
 */
export function isValidKenyaMobile(digits: string): boolean {
  const clean = extractKenyaMobileDigits(digits);
  if (clean.length !== 9) return false;
  // Kenya mobile prefixes start with 7 (e.g. 07XX) or 1 (e.g. 01XX)
  const firstDigit = clean.charAt(0);
  return firstDigit === '7' || firstDigit === '1';
}

/**
 * Formats 9 clean digits into a readable grouped string: "712 345 678"
 */
export function formatKenyaNationalDisplay(digits: string): string {
  const clean = extractKenyaMobileDigits(digits);
  if (clean.length <= 3) return clean;
  if (clean.length <= 6) return `${clean.slice(0, 3)} ${clean.slice(3)}`;
  return `${clean.slice(0, 3)} ${clean.slice(3, 6)} ${clean.slice(6)}`;
}

/**
 * Returns the full international display number with locked +254 country code:
 * "+254 712 345 678"
 */
export function formatKenyaFullDisplay(input: string | undefined | null): string {
  const digits = extractKenyaMobileDigits(input);
  if (!digits) return '+254';
  return `+254 ${formatKenyaNationalDisplay(digits)}`;
}

/**
 * Formats a phone number for storing in database / state as E.164:
 * "+254712345678"
 */
export function toE164KenyaPhone(input: string | undefined | null): string {
  const digits = extractKenyaMobileDigits(input);
  if (!digits) return '';
  return `+254${digits}`;
}

/**
 * Prepares the phone number strictly for WhatsApp API (wa.me/254XXXXXXXXX).
 * Eliminates all spaces, plus signs, dashes, and ensures mandatory 254 prefix.
 *
 * WhatsApp requires no '+' sign and no leading zeros.
 */
export function getWhatsAppCleanNumber(input: string | undefined | null): string {
  const digits = extractKenyaMobileDigits(input);
  if (!digits) return '';
  return `254${digits}`;
}

/**
 * Builds a direct, bulletproof WhatsApp redirect URL.
 * Automatically ensures the correct international 254 prefix is present so WhatsApp
 * never produces the "couldn't look up phone number" error.
 */
export function buildWhatsAppLink(phone: string | undefined | null, messageText?: string): string {
  const cleanNumber = getWhatsAppCleanNumber(phone);
  if (!cleanNumber) return '';
  const baseUrl = `https://wa.me/${cleanNumber}`;
  if (!messageText) return baseUrl;
  return `${baseUrl}?text=${encodeURIComponent(messageText)}`;
}
