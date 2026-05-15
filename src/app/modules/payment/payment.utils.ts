import { v4 as uuidv4 } from "uuid";

/**
 * Generates a unique transaction ID in the format:
 * TXN-<timestamp>-<random-8-chars>
 * e.g.  TXN-1716300000000-A3F9B21C
 */
export const generateTransactionId = (): string => {
  const timestamp = Date.now();
  const random = uuidv4().replace(/-/g, "").slice(0, 8).toUpperCase();
  return `txn-${timestamp}-${random}`;
};