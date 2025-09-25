import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function replaceUrlParams(data: Record<string, string | undefined>) {
  const params = new URLSearchParams(window.location.search);

  const keysWithUndefinedValues: string[] = [];

  Object.entries(data).forEach(([key, value]) => {
    if (value === undefined || value === "") {
      params.delete(key);
      if (value === undefined) {
        keysWithUndefinedValues.push(key);
      }
    } else {
      params.set(key, value);
    }
  });

  let queryString = params.toString();
  if (keysWithUndefinedValues.length > 0) {
    queryString +=
      (queryString.length > 0 ? "&" : "") + keysWithUndefinedValues.join("&");
  }

  window.history.replaceState({}, "", `?${queryString}`);
}

// Blockchain scan URL generator function
export const getBlockchainScanUrl = (
  network: string,
  transactionId: string,
): string => {
  const networkLower = network.toLowerCase();

  switch (networkLower) {
    case "ethereum":
    case "eth":
      return `https://etherscan.io/tx/${transactionId}`;
    case "bitcoin":
    case "btc":
      return `https://blockstream.info/tx/${transactionId}`;
    case "binance":
    case "bsc":
    case "bnb":
      return `https://bscscan.com/tx/${transactionId}`;
    case "polygon":
    case "matic":
      return `https://polygonscan.com/tx/${transactionId}`;
    case "arbitrum":
      return `https://arbiscan.io/tx/${transactionId}`;
    case "optimism":
      return `https://optimistic.etherscan.io/tx/${transactionId}`;
    case "avalanche":
    case "avax":
      return `https://snowtrace.io/tx/${transactionId}`;
    case "solana":
    case "sol":
      return `https://solscan.io/tx/${transactionId}`;
    case "cardano":
    case "ada":
      return `https://cardanoscan.io/transaction/${transactionId}`;
    case "polkadot":
    case "dot":
      return `https://polkascan.io/polkadot/transaction/${transactionId}`;
    case "cosmos":
    case "atom":
      return `https://www.mintscan.io/cosmos/txs/${transactionId}`;
    case "chainlink":
    case "link":
      return `https://etherscan.io/tx/${transactionId}`;
    case "litecoin":
    case "ltc":
      return `https://blockchair.com/litecoin/transaction/${transactionId}`;
    case "dogecoin":
    case "doge":
      return `https://blockchair.com/dogecoin/transaction/${transactionId}`;
    case "ripple":
    case "xrp":
      return `https://xrpscan.com/tx/${transactionId}`;
    case "tron":
    case "trx":
      return `https://tronscan.org/#/transaction/${transactionId}`;
    case "near":
      return `https://nearblocks.io/txns/${transactionId}`;
    case "algorand":
    case "algo":
      return `https://algoexplorer.io/tx/${transactionId}`;
    case "tezos":
    case "xtz":
      return `https://tzkt.io/${transactionId}`;
    case "stellar":
    case "xlm":
      return `https://stellar.expert/explorer/public/tx/${transactionId}`;
    case "monero":
    case "xmr":
      return `https://xmrchain.net/tx/${transactionId}`;
    case "zcash":
    case "zec":
      return `https://explorer.zcha.in/transactions/${transactionId}`;
    case "dash":
      return `https://blockchair.com/dash/transaction/${transactionId}`;
    case "bitcoin-cash":
    case "bch":
      return `https://blockchair.com/bitcoin-cash/transaction/${transactionId}`;
    case "eos":
      return `https://bloks.io/transaction/${transactionId}`;
    case "tron":
    case "trx":
      return `https://tronscan.org/#/transaction/${transactionId}`;
    default:
      // Fallback to a generic blockchain explorer or search
      return `https://www.google.com/search?q=${network}+${transactionId}+blockchain+explorer`;
  }
};
