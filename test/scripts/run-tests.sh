#!/bin/bash

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test configuration
N8N_URL="http://localhost:5678"
HARDHAT_URL="http://localhost:8545"
TEST_ACCOUNT="0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
TEST_PRIVATE_KEY="0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"

# Result tracking
declare -a PASSED_WORKFLOWS=()
declare -a FAILED_WORKFLOWS=()
TOTAL_WORKFLOWS=0

echo -e "${BLUE}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║         n8n-ethereum Automated Test Suite                     ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Function to print section header
print_header() {
    echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}  $1${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"
}

# Function to wait for service
wait_for_service() {
    local url=$1
    local service_name=$2
    local max_attempts=60
    local attempt=1

    echo -e "${YELLOW}⏳ Waiting for $service_name to be ready...${NC}"

    while [ $attempt -le $max_attempts ]; do
        if curl -s "$url" > /dev/null 2>&1; then
            echo -e "${GREEN}✅ $service_name is ready!${NC}"
            return 0
        fi
        echo -n "."
        sleep 2
        attempt=$((attempt + 1))
    done

    echo -e "${RED}❌ Timeout waiting for $service_name${NC}"
    return 1
}

# Function to create n8n credentials
create_credentials() {
    print_header "Creating n8n Credentials"

    # Create Hardhat RPC credential
    echo -e "${YELLOW}📝 Creating Hardhat RPC credential...${NC}"
    RPC_CRED_ID=$(curl -s -X POST "$N8N_URL/rest/credentials" \
        -H "Content-Type: application/json" \
        -d '{
            "name": "Local Hardhat",
            "type": "ethereumRpc",
            "data": {
                "rpcUrl": "'"$HARDHAT_URL"'",
                "blockLimit": 1000
            }
        }' | jq -r '.id')

    if [ -z "$RPC_CRED_ID" ] || [ "$RPC_CRED_ID" = "null" ]; then
        echo -e "${RED}❌ Failed to create RPC credential${NC}"
        return 1
    fi
    echo -e "${GREEN}✅ RPC Credential created: $RPC_CRED_ID${NC}"

    # Create Account credential
    echo -e "${YELLOW}📝 Creating Test Account credential...${NC}"
    ACCOUNT_CRED_ID=$(curl -s -X POST "$N8N_URL/rest/credentials" \
        -H "Content-Type: application/json" \
        -d '{
            "name": "Test Account",
            "type": "ethereumAccount",
            "data": {
                "privateKey": "'"$TEST_PRIVATE_KEY"'"
            }
        }' | jq -r '.id')

    if [ -z "$ACCOUNT_CRED_ID" ] || [ "$ACCOUNT_CRED_ID" = "null" ]; then
        echo -e "${RED}❌ Failed to create Account credential${NC}"
        return 1
    fi
    echo -e "${GREEN}✅ Account Credential created: $ACCOUNT_CRED_ID${NC}"

    return 0
}

# Function to import workflow
import_workflow() {
    local workflow_file=$1
    local workflow_name=$(basename "$workflow_file" .json)

    echo -e "${YELLOW}📥 Importing workflow: $workflow_name${NC}"

    # Update credential IDs in workflow
    local workflow_content=$(cat "$workflow_file" | \
        jq --arg rpc_id "$RPC_CRED_ID" --arg acc_id "$ACCOUNT_CRED_ID" '
            walk(
                if type == "object" and has("credentials") then
                    .credentials = (
                        .credentials |
                        if has("ethereumRpc") then .ethereumRpc.id = $rpc_id else . end |
                        if has("ethereumAccount") then .ethereumAccount.id = $acc_id else . end
                    )
                else . end
            )
        ')

    # Import workflow
    local result=$(curl -s -X POST "$N8N_URL/rest/workflows" \
        -H "Content-Type: application/json" \
        -d "$workflow_content")

    local workflow_id=$(echo "$result" | jq -r '.id')

    if [ -z "$workflow_id" ] || [ "$workflow_id" = "null" ]; then
        echo -e "${RED}❌ Failed to import workflow: $workflow_name${NC}"
        return 1
    fi

    echo -e "${GREEN}✅ Workflow imported: $workflow_name (ID: $workflow_id)${NC}"
    echo "$workflow_id"
    return 0
}

# Function to execute workflow
execute_workflow() {
    local workflow_id=$1
    local workflow_name=$2

    echo -e "${YELLOW}▶️  Executing workflow: $workflow_name${NC}"

    # Execute workflow
    local execution_result=$(curl -s -X POST "$N8N_URL/rest/workflows/$workflow_id/activate" \
        -H "Content-Type: application/json")

    sleep 2

    local test_result=$(curl -s -X POST "$N8N_URL/rest/workflows/$workflow_id/run" \
        -H "Content-Type: application/json" \
        -d '{}')

    local execution_id=$(echo "$test_result" | jq -r '.data.executionId // .executionId // empty')

    if [ -z "$execution_id" ]; then
        echo -e "${RED}❌ Failed to execute workflow: $workflow_name${NC}"
        FAILED_WORKFLOWS+=("$workflow_name")
        return 1
    fi

    # Wait for execution to complete
    sleep 5

    # Get execution result
    local execution_data=$(curl -s "$N8N_URL/rest/executions/$execution_id")
    local status=$(echo "$execution_data" | jq -r '.finished // false')
    local has_error=$(echo "$execution_data" | jq -r '.data.resultData.error // empty')

    if [ "$status" = "true" ] && [ -z "$has_error" ]; then
        echo -e "${GREEN}✅ Workflow PASSED: $workflow_name${NC}"
        PASSED_WORKFLOWS+=("$workflow_name")
        return 0
    else
        echo -e "${RED}❌ Workflow FAILED: $workflow_name${NC}"
        if [ -n "$has_error" ]; then
            echo -e "${RED}   Error: $has_error${NC}"
        fi
        FAILED_WORKFLOWS+=("$workflow_name")
        return 1
    fi
}

# Function to generate report
generate_report() {
    print_header "Test Results Summary"

    TOTAL_WORKFLOWS=${#PASSED_WORKFLOWS[@]}+${#FAILED_WORKFLOWS[@]}
    local pass_count=${#PASSED_WORKFLOWS[@]}
    local fail_count=${#FAILED_WORKFLOWS[@]}
    local total_count=$((pass_count + fail_count))

    echo -e "${BLUE}╔════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║                    TEST RESULTS REPORT                         ║${NC}"
    echo -e "${BLUE}╠════════════════════════════════════════════════════════════════╣${NC}"
    echo -e "${BLUE}║${NC} Total Workflows:    ${YELLOW}$total_count${NC}"
    echo -e "${BLUE}║${NC} Passed:             ${GREEN}$pass_count${NC}"
    echo -e "${BLUE}║${NC} Failed:             ${RED}$fail_count${NC}"
    echo -e "${BLUE}╚════════════════════════════════════════════════════════════════╝${NC}"

    if [ $pass_count -gt 0 ]; then
        echo -e "\n${GREEN}✅ PASSED WORKFLOWS:${NC}"
        for workflow in "${PASSED_WORKFLOWS[@]}"; do
            echo -e "   ${GREEN}✓${NC} $workflow"
        done
    fi

    if [ $fail_count -gt 0 ]; then
        echo -e "\n${RED}❌ FAILED WORKFLOWS:${NC}"
        for workflow in "${FAILED_WORKFLOWS[@]}"; do
            echo -e "   ${RED}✗${NC} $workflow"
        done
    fi

    echo ""

    # Save report to file
    cat > /tmp/test-report.json <<EOF
{
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "total": $total_count,
  "passed": $pass_count,
  "failed": $fail_count,
  "passedWorkflows": $(printf '%s\n' "${PASSED_WORKFLOWS[@]}" | jq -R . | jq -s .),
  "failedWorkflows": $(printf '%s\n' "${FAILED_WORKFLOWS[@]}" | jq -R . | jq -s .)
}
EOF

    echo -e "${BLUE}📊 Report saved to: /tmp/test-report.json${NC}\n"

    if [ $fail_count -eq 0 ]; then
        echo -e "${GREEN}🎉 All tests passed!${NC}\n"
        return 0
    else
        echo -e "${RED}⚠️  Some tests failed!${NC}\n"
        return 1
    fi
}

# Main execution
main() {
    cd "$(dirname "$0")/.."

    print_header "Step 1: Starting Docker Services"
    echo -e "${YELLOW}🐳 Starting Docker Compose...${NC}"
    docker-compose up -d

    print_header "Step 2: Waiting for Services"
    wait_for_service "$HARDHAT_URL" "Hardhat" || exit 1
    wait_for_service "$N8N_URL/healthz" "n8n" || exit 1

    print_header "Step 3: Deploying Contracts"
    echo -e "${YELLOW}📦 Compiling and deploying contracts...${NC}"
    docker-compose exec -T hardhat sh -c "npx hardhat compile && npx hardhat run scripts/deploy.js --network localhost"

    print_header "Step 4: Funding Test Account"
    echo -e "${YELLOW}💰 Funding test account with ETH...${NC}"
    docker-compose exec -T hardhat npx hardhat run scripts/fund-account.js --network localhost

    print_header "Step 5: Setting up n8n Credentials"
    sleep 5
    create_credentials || exit 1

    print_header "Step 6: Importing Workflows"
    declare -a WORKFLOW_IDS=()
    for workflow_file in workflows/*.json; do
        workflow_id=$(import_workflow "$workflow_file")
        if [ $? -eq 0 ]; then
            WORKFLOW_IDS+=("$workflow_id:$(basename "$workflow_file")")
        fi
    done

    print_header "Step 7: Executing Workflows"
    for item in "${WORKFLOW_IDS[@]}"; do
        IFS=: read -r workflow_id workflow_name <<< "$item"
        execute_workflow "$workflow_id" "$workflow_name"
        sleep 3
    done

    print_header "Step 8: Generating Report"
    generate_report

    local exit_code=$?

    print_header "Step 9: Cleanup"
    echo -e "${YELLOW}🧹 Stopping Docker services...${NC}"
    docker-compose down -v

    exit $exit_code
}

# Run main function
main "$@"
