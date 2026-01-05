import { defineConfig } from "vitest/config";

export default defineConfig({
    test: {
        // Global setup for n8n environment
        globalSetup: ["./tests/scripts/vitest-setup.mjs"],
        // Test file patterns
        include: ["tests/**/*.test.ts"],
        // Longer timeouts for integration tests
        testTimeout: 30000,
        hookTimeout: 60000,
    },
});
