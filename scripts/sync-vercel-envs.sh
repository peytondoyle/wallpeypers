#!/usr/bin/env bash

# ==============================================================================
# Vercel Environment Sync Script for Wallpeypers
# ==============================================================================
# Reads .env.shared and pushes environment variables to Vercel
# for both Preview (LAB) and Production (PROD) environments.
# ==============================================================================

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# ==============================================================================
# Helper Functions
# ==============================================================================

log_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

log_success() {
    echo -e "${GREEN}✓${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}⚠${NC} $1"
}

log_error() {
    echo -e "${RED}✗${NC} $1"
}

# ==============================================================================
# Step 1: Load and Validate .env.shared
# ==============================================================================

# Check for env.shared or .env.shared in multiple locations
if [[ -f "../env.shared" ]]; then
    ENV_SHARED_FILE="../env.shared"
    log_info "Using env.shared from parent directory (Development/)"
elif [[ -f "../.env.shared" ]]; then
    ENV_SHARED_FILE="../.env.shared"
    log_info "Using .env.shared from parent directory (Development/)"
elif [[ -f "env.shared" ]]; then
    ENV_SHARED_FILE="env.shared"
    log_info "Using env.shared from project directory (wallpeypers/)"
elif [[ -f ".env.shared" ]]; then
    ENV_SHARED_FILE=".env.shared"
    log_info "Using .env.shared from project directory (wallpeypers/)"
else
    log_error "env.shared or .env.shared file not found!"
    log_info "Searched locations:"
    log_info "  - $(pwd)/../env.shared"
    log_info "  - $(pwd)/../.env.shared"
    log_info "  - $(pwd)/env.shared"
    log_info "  - $(pwd)/.env.shared"
    log_info "Please create env.shared with all required variables."
    exit 1
fi

log_info "Loading environment variables from .env.shared..."

# Load env vars safely
set -a
source "$ENV_SHARED_FILE"
set +a

log_success "Environment variables loaded"

# ==============================================================================
# Step 2: Validate Required Variables
# ==============================================================================

log_info "Validating required variables..."

REQUIRED_VARS=(
    "SUPABASE_LAB_URL"
    "SUPABASE_LAB_ANON_KEY"
    "SUPABASE_LAB_SERVICE_ROLE_KEY"
    "SUPABASE_PROD_URL"
    "SUPABASE_PROD_ANON_KEY"
    "SUPABASE_PROD_SERVICE_ROLE_KEY"
    "R2_ACCOUNT_ID"
    "R2_ACCESS_KEY_ID"
    "R2_SECRET_ACCESS_KEY"
    "R2_BUCKET"
    "R2_PUBLIC_BASE"
)

MISSING_VARS=()

for var in "${REQUIRED_VARS[@]}"; do
    if [[ -z "${!var:-}" ]]; then
        MISSING_VARS+=("$var")
    fi
done

if [[ ${#MISSING_VARS[@]} -gt 0 ]]; then
    log_error "Missing required variables in .env.shared:"
    for var in "${MISSING_VARS[@]}"; do
        echo "  - $var"
    done
    exit 1
fi

log_success "All required variables present"

# ==============================================================================
# Step 3: Generate Vercel Environment Files
# ==============================================================================

log_info "Generating Vercel environment files..."

# Preview (LAB) environment
cat > .env.vercel.preview <<EOF
NEXT_PUBLIC_SUPABASE_URL=$SUPABASE_LAB_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=$SUPABASE_LAB_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=$SUPABASE_LAB_SERVICE_ROLE_KEY
R2_ACCOUNT_ID=$R2_ACCOUNT_ID
R2_ACCESS_KEY_ID=$R2_ACCESS_KEY_ID
R2_SECRET_ACCESS_KEY=$R2_SECRET_ACCESS_KEY
R2_BUCKET=$R2_BUCKET
NEXT_PUBLIC_R2_PUBLIC_BASE=$R2_PUBLIC_BASE
EOF

log_success "Created .env.vercel.preview"

# Production (PROD) environment
cat > .env.vercel.production <<EOF
NEXT_PUBLIC_SUPABASE_URL=$SUPABASE_PROD_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=$SUPABASE_PROD_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=$SUPABASE_PROD_SERVICE_ROLE_KEY
R2_ACCOUNT_ID=$R2_ACCOUNT_ID
R2_ACCESS_KEY_ID=$R2_ACCESS_KEY_ID
R2_SECRET_ACCESS_KEY=$R2_SECRET_ACCESS_KEY
R2_BUCKET=$R2_BUCKET
NEXT_PUBLIC_R2_PUBLIC_BASE=$R2_PUBLIC_BASE
EOF

log_success "Created .env.vercel.production"

# ==============================================================================
# Step 4: Push to Vercel
# ==============================================================================

log_info "Pushing environment variables to Vercel..."
echo ""

# Function to add a single env var to Vercel
add_vercel_env() {
    local key=$1
    local value=$2
    local environment=$3  # preview, production, or development

    # Add/update the value (--force overwrites if exists)
    printf "%s" "$value" | vercel env add "$key" "$environment" --force 2>&1 | grep -E "(Added|Overrode)" || true
}

# Push Preview environment variables
log_info "Pushing Preview (LAB) environment variables..."

while IFS='=' read -r key value; do
    # Skip empty lines and comments
    [[ -z "$key" || "$key" =~ ^# ]] && continue

    # Remove any quotes from the value
    value=$(echo "$value" | sed -e 's/^"//' -e 's/"$//' -e "s/^'//" -e "s/'$//")

    log_info "  Setting $key for Preview..."
    add_vercel_env "$key" "$value" "preview"

done < .env.vercel.preview

log_success "Preview environment variables pushed"
echo ""

# Push Production environment variables
log_info "Pushing Production (PROD) environment variables..."

while IFS='=' read -r key value; do
    # Skip empty lines and comments
    [[ -z "$key" || "$key" =~ ^# ]] && continue

    # Remove any quotes from the value
    value=$(echo "$value" | sed -e 's/^"//' -e 's/"$//' -e "s/^'//" -e "s/'$//")

    log_info "  Setting $key for Production..."
    add_vercel_env "$key" "$value" "production"

done < .env.vercel.production

log_success "Production environment variables pushed"
echo ""

# ==============================================================================
# Step 5: Verify and Display Results
# ==============================================================================

log_info "Fetching current Vercel environment variables..."
echo ""

vercel env ls

echo ""
log_success "Environment sync complete!"
echo ""
echo "Summary:"
echo "  Preview environment variables:    8 keys (LAB Supabase + R2)"
echo "  Production environment variables: 8 keys (PROD Supabase + R2)"
echo ""
echo "Environment variables set:"
echo "  • NEXT_PUBLIC_SUPABASE_URL"
echo "  • NEXT_PUBLIC_SUPABASE_ANON_KEY"
echo "  • SUPABASE_SERVICE_ROLE_KEY"
echo "  • R2_ACCOUNT_ID"
echo "  • R2_ACCESS_KEY_ID"
echo "  • R2_SECRET_ACCESS_KEY"
echo "  • R2_BUCKET"
echo "  • NEXT_PUBLIC_R2_PUBLIC_BASE"
echo ""
log_info "You can view all environment variables at:"
log_info "https://vercel.com/peyton-doyle/wallpeypers/settings/environment-variables"
echo ""
