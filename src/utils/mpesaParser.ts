export interface ParsedMpesaMessage {
  transactionCode: string | null;
  amount: number | null;
  recipientOrOrg: string | null;
  dateTime: string | null;
  raw: string;
  hasContent: boolean;
  isValid: boolean;
  validationError?: string;
}

/**
 * Words that might accidentally match a 10-letter regex but are NOT M-Pesa codes
 */
const COMMON_NON_CODES = new Set([
  'CONFIRMED',
  'TRANSACT',
  'TRANSACTION',
  'COMPLETED',
  'STATEMENT',
  'CUSTOMERS',
  'EVERYTHING',
  'NOTIFICATION',
  'YESTERDAY',
  'SOLARIUMS',
  'BALANCES',
  'TRANSFERS',
]);

/**
 * Extracts and verifies Kenyan M-Pesa SMS confirmation text.
 * Safaricom transaction reference rules:
 * - 10 characters long, alphanumeric (e.g., QA72KL491X, SL19PL440K, RK84NN921M).
 * - Must contain letters and digits (never all letters, never all digits).
 * - Usually at the very beginning of the SMS followed by "Confirmed." or "Ref:".
 *
 * If the user pastes a standard WhatsApp message or invalid text, it safely flags it
 * without extracting bogus words.
 */
export function parseMpesaMessage(rawText: string): ParsedMpesaMessage {
  const clean = rawText.trim();
  if (!clean) {
    return {
      transactionCode: null,
      amount: null,
      recipientOrOrg: null,
      dateTime: null,
      raw: '',
      hasContent: false,
      isValid: false,
    };
  }

  // 1. Transaction Code Detection
  // Genuine Safaricom M-Pesa codes start with 2 uppercase letters followed by 8 alphanumeric chars (e.g. QA72KL491X)
  // Or match 10-char alphanumeric tokens with at least 1 digit and 1 letter.
  let transactionCode: string | null = null;

  // Pattern A: Classic start of Safaricom SMS: "QA72KL491X Confirmed." or "RK84NN921M Confirmed"
  const startMatch = clean.match(/^([A-Z0-9]{10})\s+Confirmed\b/i);
  if (startMatch) {
    const candidate = startMatch[1].toUpperCase();
    if (isValidCodeStructure(candidate)) {
      transactionCode = candidate;
    }
  }

  // Pattern B: Look for 10-char alphanumeric word anywhere with both letters & numbers
  if (!transactionCode) {
    const words = clean.split(/[\s,.;:()]+/);
    for (const w of words) {
      const candidate = w.trim().toUpperCase();
      if (candidate.length === 10 && isValidCodeStructure(candidate)) {
        transactionCode = candidate;
        break;
      }
    }
  }

  // 2. Amount regex: "Ksh" or "KSh" followed by numbers with optional commas and decimals
  const amountMatch = clean.match(/(?:Ksh\.?|KSh\.?)\s*([0-9]{1,3}(?:,[0-9]{3})*(?:\.[0-9]{2})?)/i);
  let amount: number | null = null;
  if (amountMatch) {
    const sanitizedNumber = amountMatch[1].replace(/,/g, '');
    amount = parseFloat(sanitizedNumber);
  }

  // 3. Recipient / Merchant match
  const paidToMatch = clean.match(/paid to\s+([^.]+?)(?:\s+on|\.|$)/i) ||
                      clean.match(/sent to\s+([^.]+?)(?:\s+on|\.|$)/i);
  const recipientOrOrg = paidToMatch ? paidToMatch[1].trim() : null;

  // 4. Date and time match: "on 24/10/26 at 3:15 PM" or similar
  const dateMatch = clean.match(/on\s+(\d{1,2}\/\d{1,2}\/\d{2,4})\s+at\s+(\d{1,2}:\d{2}\s*(?:AM|PM)?)/i);
  const dateTime = dateMatch ? `${dateMatch[1]} at ${dateMatch[2]}` : null;

  // Validation verdict
  const isValid = Boolean(transactionCode && isValidCodeStructure(transactionCode));

  let validationError: string | undefined = undefined;
  if (!isValid) {
    validationError =
      'No valid 10-character M-Pesa transaction reference found in this text. Please paste the official Safaricom confirmation SMS (e.g. QA72KL491X) or enter the code manually.';
  }

  return {
    transactionCode,
    amount,
    recipientOrOrg,
    dateTime,
    raw: clean,
    hasContent: true,
    isValid,
    validationError,
  };
}

/**
 * Validates if candidate token follows authentic Safaricom reference structure
 */
function isValidCodeStructure(code: string): boolean {
  if (code.length !== 10) return false;
  if (COMMON_NON_CODES.has(code)) return false;

  // Must only contain uppercase A-Z and 0-9
  if (!/^[A-Z0-9]{10}$/.test(code)) return false;

  // Safaricom codes ALWAYS contain at least one digit AND at least one letter
  const hasLetter = /[A-Z]/.test(code);
  const hasDigit = /[0-9]/.test(code);
  if (!hasLetter || !hasDigit) return false;

  // Must start with a letter (Safaricom references start with alpha characters like QA, RK, SL, etc.)
  if (!/^[A-Z]/.test(code)) return false;

  return true;
}

/**
 * Helper to generate a realistic sample M-Pesa SMS for quick testing
 */
export function getSampleMpesaMessage(storeName: string, amount: number, tillNumber: string): string {
  const randomChars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let randomCode = 'SK';
  for (let i = 0; i < 8; i++) {
    randomCode += randomChars.charAt(Math.floor(Math.random() * randomChars.length));
  }

  const now = new Date();
  const dateStr = `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear().toString().slice(-2)}`;
  const hours = now.getHours();
  const minutes = now.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  const timeStr = `${displayHours}:${minutes} ${ampm}`;

  const formattedAmount = amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return `${randomCode} Confirmed. Ksh${formattedAmount} paid to ${storeName.toUpperCase()} (Till ${tillNumber}) on ${dateStr} at ${timeStr}. New M-PESA balance is Ksh14,850.00. Transaction cost, Ksh0.00.`;
}
