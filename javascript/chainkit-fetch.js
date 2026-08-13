// Method 2: The ChainKit SDK
//
// Avalanche's official on-chain data SDK. Structured, paginated results,
// no manual RPC parsing. Needs a free Glacier API key from avacloud.io.

import "dotenv/config";
import { AvalancheSDK } from "@avalanche-sdk/chainkit";
import { normalizeMany } from "./normalize.js";

// ChainKit's NativeTransaction shape doesn't match normalize.js's expected
// fields (txHash vs hash, blockTimestamp vs timestamp, txStatus as a string
// vs status as 0/1, and from/to as nested { address } objects vs flat
// strings). Map into the canonical shape here, at the fetch layer, rather
// than teaching normalize.js multiple raw shapes.
function mapChainkitTx(tx) {
  return {
    hash: tx.txHash,
    value: tx.value,
    from: tx.from?.address,
    to: tx.to?.address,
    timestamp: tx.blockTimestamp,
    status: tx.txStatus === "success" ? 1 : 0,
  };
}

async function main() {
  const walletAddress = process.env.WALLET_ADDRESS;
  const apiKey = process.env.GLACIER_API_KEY;
  if (!walletAddress) throw new Error("Set WALLET_ADDRESS in your .env first.");
  if (!apiKey) throw new Error("Set GLACIER_API_KEY in your .env first. Get a free one at avacloud.io.");

  const avalancheSDK = new AvalancheSDK({ apiKey });

  const { transactions } = await avalancheSDK.data.evm.transactions.listTransactions({
    chainId: "43113", // Fuji testnet
    address: walletAddress,
    pageSize: 10,
  });

  console.log(`Found ${transactions.length} transactions\n`);

  const normalized = normalizeMany(transactions.map(mapChainkitTx));
  for (const tx of normalized) {
    console.log(`${tx.status === "success" ? "OK" : "FAILED"}  ${tx.amount} ${tx.token}  ${tx.timestamp}  ${tx.hash}`);
  }
}

main().catch((err) => {
  console.error("ChainKit fetch error:", err.message);
  process.exit(1);
});
