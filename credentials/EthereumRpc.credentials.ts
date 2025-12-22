import { ICredentialType, INodeProperties } from "n8n-workflow";
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
}
