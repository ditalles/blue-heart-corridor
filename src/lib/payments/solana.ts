/**
 * Solana/USDC Payment Layer
 *
 * For non-Stripe countries (Albania, Bosnia, Kosovo), travelers can pay
 * with USDC on Solana. This provides:
 * - Instant settlement (< 1 second)
 * - Near-zero fees (< $0.01 per transaction)
 * - No dependency on traditional banking infrastructure
 *
 * Architecture:
 * 1. Platform generates a Solana Pay URL with amount + reference
 * 2. Traveler scans QR or clicks link to pay from their wallet
 * 3. Platform monitors the transaction via the reference
 * 4. On confirmation, booking is marked as paid
 *
 * USDC on Solana: EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v
 */

// USDC mint on Solana mainnet
const USDC_MINT = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";

// Platform's USDC receiving wallet
const PLATFORM_WALLET = process.env.SOLANA_PLATFORM_WALLET || "";

// Solana RPC endpoint
const SOLANA_RPC = process.env.SOLANA_RPC_URL || "https://api.mainnet-beta.solana.com";

interface SolanaPayRequest {
  recipientWallet: string;
  amountUSDC: number;
  reference: string; // booking_ref used as on-chain reference
  label: string;
  message: string;
}

/**
 * Generate a Solana Pay URL for USDC payment
 * Follows the Solana Pay specification: https://docs.solanapay.com
 */
export function generateSolanaPayUrl({
  recipientWallet,
  amountUSDC,
  reference,
  label,
  message,
}: SolanaPayRequest): string {
  const params = new URLSearchParams();
  params.set("amount", amountUSDC.toFixed(2));
  params.set("spl-token", USDC_MINT);
  params.set("reference", reference);
  params.set("label", label);
  params.set("message", message);

  return `solana:${recipientWallet}?${params.toString()}`;
}

/**
 * Generate a payment request for a booking
 */
export function createBookingPayment(
  bookingRef: string,
  amountCents: number,
  hostelName: string,
  hostelWallet?: string
): {
  payUrl: string;
  qrData: string;
  amountUSDC: number;
  reference: string;
} {
  // Convert EUR cents to USDC (roughly 1:1 with USD, apply EUR/USD rate)
  // In production, fetch live rate. For now approximate 1 EUR = 1.08 USD
  const EUR_USD_RATE = 1.08;
  const amountUSDC = (amountCents / 100) * EUR_USD_RATE;

  const wallet = hostelWallet || PLATFORM_WALLET;
  const reference = bookingRef;

  const payUrl = generateSolanaPayUrl({
    recipientWallet: wallet,
    amountUSDC,
    reference,
    label: "BalkanHostels",
    message: `Booking ${bookingRef} at ${hostelName}`,
  });

  return {
    payUrl,
    qrData: payUrl,
    amountUSDC: Math.round(amountUSDC * 100) / 100,
    reference,
  };
}

/**
 * Verify a USDC payment on Solana
 * Checks if a transaction with the given reference exists and is confirmed
 */
export async function verifyPayment(
  reference: string
): Promise<{
  verified: boolean;
  signature?: string;
  amount?: number;
  error?: string;
}> {
  if (!SOLANA_RPC) {
    return { verified: false, error: "Solana RPC not configured" };
  }

  try {
    // Use getSignaturesForAddress with the reference as a filter
    // In production, use @solana/web3.js and @solana/pay for proper verification
    const response = await fetch(SOLANA_RPC, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "getSignaturesForAddress",
        params: [reference, { limit: 1 }],
      }),
    });

    const data = await response.json();
    const signatures = data.result;

    if (signatures && signatures.length > 0) {
      const sig = signatures[0];
      if (sig.confirmationStatus === "finalized" || sig.confirmationStatus === "confirmed") {
        return {
          verified: true,
          signature: sig.signature,
        };
      }
    }

    return { verified: false, error: "Transaction not found or not confirmed" };
  } catch (err) {
    console.error("[Solana] Verification error:", err);
    return { verified: false, error: "RPC error" };
  }
}

/**
 * Check if USDC payments are available (configured)
 */
export function isUSDCEnabled(): boolean {
  return !!PLATFORM_WALLET;
}

/**
 * Get exchange rate info for display
 */
export function getExchangeInfo(eurCents: number): {
  eurAmount: string;
  usdcAmount: string;
  networkFee: string;
  savings: string;
} {
  const eurAmount = (eurCents / 100).toFixed(2);
  const usdcAmount = ((eurCents / 100) * 1.08).toFixed(2);
  const bankFee = ((eurCents / 100) * 0.05).toFixed(2); // 5% bank fee they'd pay
  const solanaFee = "< 0.01";

  return {
    eurAmount,
    usdcAmount,
    networkFee: solanaFee,
    savings: bankFee, // What they save vs bank transfer
  };
}
