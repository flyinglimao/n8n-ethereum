import {
  ICredentialType,
  INodeProperties,
  ICredentialTestRequest,
  ICredentialDataDecryptedObject,
  IHttpRequestOptions,
} from "n8n-workflow";
import { chainOptions } from "../utils/chainConfig";

export class EthereumRpc implements ICredentialType {
  name = "ethereumRpc";
  displayName = "Ethereum RPC";
  documentationUrl = "https://ethereum.org/en/developers/docs/apis/json-rpc/";
  icon = "file:ethereum.svg" as const;
  properties: INodeProperties[] = [
    {
      displayName: "RPC URL",
      name: "rpcUrl",
      type: "string",
      default: "",
      placeholder: "https://mainnet.infura.io/v3/YOUR-API-KEY",
      description:
        "The RPC endpoint URL. Supports HTTP(S) and WebSocket (ws://, wss://) protocols.",
      required: true,
    },
    {
      displayName: "Custom Headers",
      name: "customHeaders",
      type: "json",
      default: "{}",
      placeholder: '{"Authorization": "Bearer token", "X-API-Key": "key"}',
      description:
        "Custom HTTP headers to include in requests (JSON format). Useful for API key authentication.",
    },
    {
      displayName: "Block Limit",
      name: "blockLimit",
      type: "number",
      default: 1000,
      placeholder: "1000",
      description:
        "Maximum number of blocks to query in a single request. Used to prevent timeouts when querying large block ranges.",
    },
  ];

  async authenticate(
    credentials: ICredentialDataDecryptedObject,
    requestOptions: IHttpRequestOptions
  ): Promise<IHttpRequestOptions> {
    // Parse and merge custom headers if provided
    if (
      credentials.customHeaders &&
      typeof credentials.customHeaders === "string" &&
      credentials.customHeaders.trim() !== "" &&
      credentials.customHeaders.trim() !== "{}"
    ) {
      try {
        const customHeaders = JSON.parse(
          credentials.customHeaders as string
        );
        requestOptions.headers = {
          ...requestOptions.headers,
          ...customHeaders,
        };
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        throw new Error(`Invalid custom headers JSON: ${errorMessage}`);
      }
    }
    return requestOptions;
  }

  test: ICredentialTestRequest = {
    request: {
      baseURL: "={{$credentials.rpcUrl}}",
      url: "",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: {
        jsonrpc: "2.0",
        method: "eth_blockNumber",
        params: [],
        id: 1,
      },
    },
    rules: [
      {
        type: "responseSuccessBody",
        properties: {
          key: "result",
          value: "/^0x[0-9a-fA-F]+$/",
          message: "RPC connection successful: received valid block number",
        },
      },
    ],
  };
}
