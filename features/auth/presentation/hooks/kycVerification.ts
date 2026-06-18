import { api } from "@/lib/api";

export type DiditSession = {
  url: string;
  session_id: string;
};

/**
 * Starts a Didit hosted identity-verification session for the logged-in user.
 *
 * Requires an authenticated session (the gateway reads the `access_token` cookie),
 * so the user must be logged in before calling this. Returns the hosted `url` the
 * browser should be redirected to; the final approve/reject decision arrives later
 * via the backend's Didit webhook, so the caller should treat the result as
 * "pending review" and poll `getKycStatus()` if it needs the outcome.
 */
export async function startDiditVerification(): Promise<DiditSession> {
  return api.post<DiditSession>("/kyc/didit/session");
}

export type KycStatus = {
  status?: string; // "unverified" | "pending" | "approved" | "rejected"
  didit_status?: string;
  [key: string]: unknown;
};

/** Reads the current KYC submission/status for the logged-in user. */
export async function getKycStatus(): Promise<KycStatus> {
  return api.get<KycStatus>("/kyc/status");
}
