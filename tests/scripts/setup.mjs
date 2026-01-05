/**
 * Test Setup Script
 *
 * This script initializes the n8n test environment by:
 * 1. Creating credentials via n8n API
 * 2. Importing all workflows via n8n API
 * 3. Activating workflows that need to be active (triggers)
 *
 * Prerequisites:
 * - n8n must be running at http://localhost:5678
 * - Environment variable or API key configured
 */

import { readdir, readFile } from "fs/promises";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { deployContracts } from "./deploy-contracts.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));

const N8N_API_BASE = "http://localhost:5678/api/v1";
const API_KEY =
    process.env.N8N_API_KEY ||
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIzZTdjOTM5Yy02ZGMxLTRjMjEtOWJiNC1kNzJiNzVkMjhiZmMiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzY3NjE2NTgwLCJleHAiOjE3NzAxODEyMDB9.zj5158taNt_qewwg7V4uYd3mUROc6fygC77XN5HPUAw";

const WORKFLOWS_DIR = join(__dirname, "..", "workflows");
const CREDENTIALS_DIR = join(__dirname, "..", "credentials");

/** Stores credential name -> API-assigned ID mapping */
const credentialIdMap = new Map();
/** Stores workflow name -> API-assigned ID mapping */
const workflowIdMap = new Map();

/**
 * Make an API request to n8n
 */
async function apiRequest(method, endpoint, body) {
    const url = `${N8N_API_BASE}${endpoint}`;
    const options = {
        method,
        headers: {
            "Content-Type": "application/json",
            "X-N8N-API-KEY": API_KEY,
        },
    };

    if (body) {
        options.body = JSON.stringify(body);
    }

    const response = await fetch(url, options);

    if (!response.ok) {
        const text = await response.text();
        throw new Error(`API request failed: ${response.status} ${text}`);
    }

    return response.json();
}

/**
 * Delete all existing workflows
 */
async function deleteExistingWorkflows() {
    console.log("Deleting existing workflows...");

    const { data: workflows } = await apiRequest("GET", "/workflows");

    for (const workflow of workflows) {
        try {
            await apiRequest("DELETE", `/workflows/${workflow.id}`);
            console.log(`  Deleted workflow: ${workflow.name}`);
        } catch (error) {
            console.warn(`  Warning: Could not delete workflow ${workflow.name}:`, error.message);
        }
    }
}

/**
 * Delete all existing credentials
 * Note: n8n Community Edition doesn't support GET /credentials endpoint,
 * so we skip this operation and rely on credential name uniqueness or
 * let n8n API reject duplicates.
 */
async function deleteExistingCredentials() {
    console.log("Skipping credential deletion (n8n Community Edition limitation)...");
    console.log("  Note: Credentials will be created fresh. Duplicates may be rejected.");
}


/**
 * Create credentials from JSON files
 */
async function createCredentials() {
    console.log("\nCreating credentials...");

    const files = await readdir(CREDENTIALS_DIR);
    const jsonFiles = files.filter((f) => f.endsWith(".json"));

    for (const file of jsonFiles) {
        const content = await readFile(join(CREDENTIALS_DIR, file), "utf-8");
        const credential = JSON.parse(content);

        // n8n API expects: name, type, data
        const payload = {
            name: credential.name,
            type: credential.type,
            data: credential.data,
        };

        try {
            const result = await apiRequest("POST", "/credentials", payload);
            // Store the API-assigned ID mapped by the original ID from the JSON
            credentialIdMap.set(credential.id, result.id);
            console.log(`  Created credential: ${credential.name} (${credential.id} -> ${result.id})`);
        } catch (error) {
            console.error(`  Error creating credential ${credential.name}:`, error.message);
            throw error;
        }
    }
}

/**
 * Update workflow credential references with actual API-assigned IDs
 */
function updateWorkflowCredentials(workflow) {
    for (const node of workflow.nodes || []) {
        if (node.credentials) {
            for (const [credType, credRef] of Object.entries(node.credentials)) {
                const originalId = credRef.id;
                const newId = credentialIdMap.get(originalId);

                if (newId) {
                    node.credentials[credType] = {
                        ...credRef,
                        id: newId,
                    };
                }
            }
        }
    }

    return workflow;
}

/**
 * Import all workflows from JSON files
 */
async function importWorkflows(deployedAddresses) {
    console.log("\nImporting workflows...");

    const files = await readdir(WORKFLOWS_DIR);
    const jsonFiles = files.filter((f) => f.endsWith(".json"));

    for (const file of jsonFiles) {
        let content = await readFile(join(WORKFLOWS_DIR, file), "utf-8");

        // Replace hardcoded addresses with deployed ones
        if (deployedAddresses && deployedAddresses.TestERC20) {
            // USDC Mainnet: 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48
            content = content.replace(/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/g, deployedAddresses.TestERC20);
        }

        let workflow = JSON.parse(content);

        // Update credential references
        workflow = updateWorkflowCredentials(workflow);

        // Prepare payload for API - only include fields that n8n API accepts
        // n8n API only accepts: name, nodes, connections, settings, staticData
        const workflowPayload = {
            name: workflow.name,
            nodes: workflow.nodes,
            connections: workflow.connections,
            settings: workflow.settings || {},
        };

        // Include staticData if present
        if (workflow.staticData) {
            workflowPayload.staticData = workflow.staticData;
        }

        try {
            const result = await apiRequest("POST", "/workflows", workflowPayload);
            workflowIdMap.set(workflow.name, result.id);
            console.log(`  Imported workflow: ${workflow.name} (id: ${result.id})`);
        } catch (error) {
            console.error(`  Error importing workflow ${workflow.name}:`, error.message);
            throw error;
        }
    }
}


/**
 * Activate all workflows (both trigger and webhook-based)
 */
async function activateAllWorkflows() {
    console.log("\nActivating all workflows...");

    for (const [name, id] of workflowIdMap) {
        try {
            // Use POST to /workflows/{id}/activate endpoint
            await apiRequest("POST", `/workflows/${id}/activate`);
            console.log(`  Activated: ${name}`);
        } catch (error) {
            console.warn(`  Warning: Could not activate ${name}:`, error.message);
        }
    }
}



/**
 * Main setup function
 */
export async function setup() {
    console.log("=".repeat(60));
    console.log("n8n Test Environment Setup");
    console.log("=".repeat(60));

    try {
        // Clean up existing data
        await deleteExistingWorkflows();
        await deleteExistingCredentials();

        // Create fresh credentials and workflows
        await createCredentials();
        const deployedAddresses = await deployContracts();
        await importWorkflows(deployedAddresses);
        await activateAllWorkflows();

        console.log("\n" + "=".repeat(60));
        console.log("Setup completed successfully!");
        console.log("=".repeat(60));
        console.log("\nCredential ID mappings:");
        for (const [original, assigned] of credentialIdMap) {
            console.log(`  ${original} -> ${assigned}`);
        }
        console.log("\nWorkflow ID mappings:");
        for (const [name, id] of workflowIdMap) {
            console.log(`  ${name}: ${id}`);
        }

        return { credentialIdMap, workflowIdMap };
    } catch (error) {
        console.error("\nSetup failed:", error);
        throw error;
    }
}

/**
 * Teardown function for cleaning up after tests
 */
export async function teardown() {
    console.log("\n" + "=".repeat(60));
    console.log("n8n Test Environment Teardown");
    console.log("=".repeat(60));

    try {
        await deleteExistingWorkflows();
        await deleteExistingCredentials();
        console.log("Teardown completed successfully!");
    } catch (error) {
        console.error("Teardown failed:", error);
    }
}

// Allow running directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
    setup().catch((error) => {
        console.error(error);
        process.exit(1);
    });
}
