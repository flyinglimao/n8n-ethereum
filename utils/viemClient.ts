import {
  createPublicClient,
  createWalletClient,
  http,
  webSocket,
  type PublicClient,
  type WalletClient,
  type Transport,
  type Chain,
  type Account,
} from "viem";
import { privateKeyToAccount, mnemonicToAccount } from "viem/accounts";
import { getChain, supportedChains } from "./chainConfig";
import type { RpcNodeCredentials, WalletCredentials } from "./types";

export interface ClientOptions {
  credentials: RpcNodeCredentials;
  chainKey?: string;
}

export function createViemPublicClient(options: ClientOptions): PublicClient {
  const { credentials, chainKey } = options;

  // Parse custom headers if provided
  let headers: Record<string, string> = {};
  if (credentials.customHeaders) {
    try {
      headers = JSON.parse(credentials.customHeaders);
    } catch (error) {
      throw new Error(`Invalid custom headers JSON: ${error}`);
    }
  }

  // Determine transport type (HTTP or WebSocket)
  const isWebSocket =
    credentials.rpcUrl.startsWith("ws://") ||
    credentials.rpcUrl.startsWith("wss://");

  const transport: Transport = isWebSocket
    ? webSocket(credentials.rpcUrl, {
        key: "custom",
      })
    : http(credentials.rpcUrl, {
        key: "custom",
        fetchOptions: {
          headers,
        },
      });

  return createPublicClient({
    transport,
  });
}
