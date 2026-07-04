import type { Abi, AbiFunction, AbiEvent } from "viem";
import type { INodePropertyOptions } from "n8n-workflow";

/**
 * Parse an ABI provided as a JSON string (or already-parsed array) and
 * validate its basic shape.
 */
export function parseAbiJson(raw: unknown): Abi {
  let abi: unknown;

  if (typeof raw === "string") {
    const trimmed = raw.trim();
    if (trimmed === "") {
      throw new Error("ABI is empty. Paste the contract ABI JSON array.");
    }
    try {
      abi = JSON.parse(trimmed);
    } catch (error) {
      throw new Error(
        `Invalid ABI JSON: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  } else {
    abi = raw;
  }

  if (!Array.isArray(abi)) {
    throw new Error("ABI must be a JSON array");
  }

  return abi as Abi;
}

/**
 * Canonical signature used as the stored parameter value,
 * e.g. "transfer(address,uint256)". Stable across param renames and
 * unambiguous for overloaded functions.
 */
export function canonicalSignature(item: AbiFunction | AbiEvent): string {
  const types = (item.inputs ?? []).map((input) => input.type).join(",");
  return `${item.name}(${types})`;
}

/** Human-friendly signature shown in the dropdown, with parameter names. */
function displayInputs(item: AbiFunction | AbiEvent): string {
  return (item.inputs ?? [])
    .map((input) => (input.name ? `${input.type} ${input.name}` : input.type))
    .join(", ");
}

export function isReadFunction(fn: AbiFunction): boolean {
  return fn.stateMutability === "view" || fn.stateMutability === "pure";
}

/**
 * Build dropdown options for the functions contained in an ABI.
 * The option value is the canonical signature so overloads stay distinct.
 */
export function getFunctionOptions(
  raw: unknown,
  filter: "read" | "write" | "all" = "all"
): INodePropertyOptions[] {
  const abi = parseAbiJson(raw);

  return abi
    .filter((item): item is AbiFunction => item.type === "function")
    .filter((fn) => {
      if (filter === "read") return isReadFunction(fn);
      if (filter === "write") return !isReadFunction(fn);
      return true;
    })
    .map((fn) => {
      const outputs = (fn.outputs ?? []).map((o) => o.type).join(", ");
      return {
        name: `${fn.name}(${displayInputs(fn)})`,
        value: canonicalSignature(fn),
        description: `${fn.stateMutability}${outputs ? ` → (${outputs})` : ""}`,
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name));
}

/** Build dropdown options for the events contained in an ABI. */
export function getEventOptions(raw: unknown): INodePropertyOptions[] {
  const abi = parseAbiJson(raw);

  return abi
    .filter((item): item is AbiEvent => item.type === "event")
    .map((event) => {
      const inputs = (event.inputs ?? [])
        .map((input) => {
          const indexed = input.indexed ? " indexed" : "";
          return input.name
            ? `${input.type}${indexed} ${input.name}`
            : `${input.type}${indexed}`;
        })
        .join(", ");
      return {
        name: `${event.name}(${inputs})`,
        value: canonicalSignature(event),
        description: "event",
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Resolve a function selected in the UI back to its ABI entry.
 * Accepts a canonical signature ("transfer(address,uint256)") or, for
 * backwards compatibility with workflows created before the dropdown
 * existed, a plain function name ("transfer").
 */
export function findAbiFunction(abi: Abi, selector: string): AbiFunction {
  const functions = abi.filter(
    (item): item is AbiFunction => item.type === "function"
  );

  const match = selector.includes("(")
    ? functions.find((fn) => canonicalSignature(fn) === selector)
    : functions.find((fn) => fn.name === selector);

  if (!match) {
    throw new Error(`Function "${selector}" not found in the provided ABI`);
  }
  return match;
}

/**
 * Resolve an event selected in the UI back to its ABI entry.
 * Accepts a canonical signature or a plain event name (legacy workflows).
 */
export function findAbiEvent(abi: Abi, selector: string): AbiEvent {
  const events = abi.filter((item): item is AbiEvent => item.type === "event");

  const match = selector.includes("(")
    ? events.find((event) => canonicalSignature(event) === selector)
    : events.find((event) => event.name === selector);

  if (!match) {
    throw new Error(`Event "${selector}" not found in the provided ABI`);
  }
  return match;
}

/**
 * Narrow a full ABI down to a single resolved function while keeping
 * non-function entries (errors, structs) so viem can still decode reverts.
 */
export function abiWithSingleFunction(abi: Abi, fn: AbiFunction): Abi {
  return [...abi.filter((item) => item.type !== "function"), fn];
}
