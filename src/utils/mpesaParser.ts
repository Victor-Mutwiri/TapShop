export interface ParsedMpesaMessage {
  transactionCode: string | null;
  amount: number | null;
  recipientOrOrg: string | null;
  dateTime: string | null;
  raw: string;
  isValid: boolean;
}

/**
 * Parses Kenyan M-Pesa SMS confirmation text.
 * Common formats:
 * 1. "QA72KL491X Confirmed. Ksh2,400.00 paid to SOLARIUM SUNGLASSES on 24/10/26 at 3:15 PM. New M-PESA balance is..."
 * 2. "RK84NN921M Confirmed. Ksh 3,200.00 sent to 0712345678 JOHN DOE on 24/10/26 at 1:45 PM."
 * 3. "SL19PL440K Confirmed. On 24/10/26 at 5:02 PM Ksh1,800.00 paid to Till 849201."
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
      isValid: false,
    };
  }

  // 1. Transaction Code (Usually 10 uppercase alphanumeric chars starting at the beginning or before 'Confirmed')
  const codeMatch = clean.match(/^([A-Z0-9]{8,12})\b/i) || clean.match(/\b([A-Z0-9]{10})\b/);
  const transactionCode = codeMatch ? codeMatch[1].toUpperCase() : null;

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

  const isValid = Boolean(transactionCode && transactionCode.length >= 8);

  return {
    transactionCode,
    amount,
    recipientOrOrg,
    dateTime,
    raw: clean,
    isValid,
  };
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
