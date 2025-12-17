#!/bin/bash

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}============================================${NC}"
echo -e "${BLUE}   Vercel Deployment Pre-Check Script     ${NC}"
echo -e "${BLUE}============================================${NC}"
echo ""

# Check counter
CHECKS_PASSED=0
CHECKS_FAILED=0
WARNINGS=0

# Function to print check result
check_pass() {
    echo -e "${GREEN}✓${NC} $1"
    ((CHECKS_PASSED++))
}

check_fail() {
    echo -e "${RED}✗${NC} $1"
    ((CHECKS_FAILED++))
}

check_warn() {
    echo -e "${YELLOW}⚠${NC} $1"
    ((WARNINGS++))
}

echo "Running pre-deployment checks..."
echo ""

# 1. Check if vercel.json exists
echo "1. Checking vercel.json..."
if [ -f "vercel.json" ]; then
    check_pass "vercel.json exists"
else
    check_fail "vercel.json not found"
fi

# 2. Check if client directory exists
echo "2. Checking client directory..."
if [ -d "client" ]; then
    check_pass "Client directory exists"
else
    check_fail "Client directory not found"
fi

# 3. Check if api directory exists
echo "3. Checking api directory..."
if [ -d "api" ]; then
    check_pass "API directory exists"
    
    # Check for required API files
    if [ -f "api/auth/verify.js" ] && [ -f "api/files/upload.js" ]; then
        check_pass "Required API endpoints exist"
    else
        check_fail "Some API endpoints are missing"
    fi
else
    check_fail "API directory not found"
fi

# 4. Check package.json files
echo "4. Checking package.json files..."
if [ -f "package.json" ]; then
    check_pass "Root package.json exists"
else
    check_fail "Root package.json not found"
fi

if [ -f "client/package.json" ]; then
    check_pass "Client package.json exists"
else
    check_fail "Client package.json not found"
fi

# 5. Check .env (should exist locally but won't be deployed)
echo "5. Checking environment configuration..."
if [ -f ".env" ]; then
    check_pass ".env file exists locally"
    
    # Check if .env is in .gitignore
    if grep -q "^\.env$" .gitignore 2>/dev/null; then
        check_pass ".env is in .gitignore (won't be deployed)"
    else
        check_warn ".env might not be in .gitignore"
    fi
else
    check_warn ".env file not found (you'll need to set env vars in Vercel)"
fi

# 6. Check required environment variables in .env (if exists)
if [ -f ".env" ]; then
    echo "6. Checking required environment variables..."
    
    required_vars=("MONGODB_URI" "AWS_REGION" "AWS_ACCESS_KEY_ID" "AWS_SECRET_ACCESS_KEY" "AWS_BUCKET_NAME" "DEFAULT_PASSWORD")
    
    for var in "${required_vars[@]}"; do
        if grep -q "^${var}=" .env; then
            value=$(grep "^${var}=" .env | cut -d '=' -f2-)
            if [ -n "$value" ] && [ "$value" != "your_aws_access_key_id" ] && [ "$value" != "your_aws_secret_access_key" ] && [ "$value" != "your-bucket-name" ]; then
                check_pass "$var is configured"
            else
                check_warn "$var exists but may need configuration"
            fi
        else
            check_fail "$var is missing from .env"
        fi
    done
else
    echo "6. Skipping .env check (file not found)"
fi

# 7. Check if node_modules are in .gitignore
echo "7. Checking .gitignore..."
if [ -f ".gitignore" ]; then
    if grep -q "node_modules" .gitignore; then
        check_pass "node_modules is in .gitignore"
    else
        check_fail "node_modules should be in .gitignore"
    fi
else
    check_warn ".gitignore file not found"
fi

# 8. Check if Vercel CLI is installed
echo "8. Checking Vercel CLI..."
if command -v vercel &> /dev/null; then
    check_pass "Vercel CLI is installed"
    vercel_version=$(vercel --version)
    echo "   Version: $vercel_version"
else
    check_warn "Vercel CLI not installed (you can still deploy via Git or Dashboard)"
    echo "   Install with: npm install -g vercel"
fi

# 9. Check Git status (if using Git deployment)
echo "9. Checking Git status..."
if [ -d ".git" ]; then
    check_pass "Git repository initialized"
    
    # Check if there are uncommitted changes
    if [ -n "$(git status --porcelain)" ]; then
        check_warn "You have uncommitted changes"
        echo "   Run 'git status' to see what's not committed"
    else
        check_pass "All changes are committed"
    fi
    
    # Check if remote is configured
    if git remote -v | grep -q "origin"; then
        check_pass "Git remote 'origin' is configured"
    else
        check_warn "Git remote 'origin' not configured (needed for Git deployment)"
    fi
else
    check_warn "Not a Git repository (you can still deploy via CLI)"
fi

# 10. Try to validate vercel.json syntax
echo "10. Validating vercel.json syntax..."
if command -v python3 &> /dev/null; then
    if python3 -c "import json; json.load(open('vercel.json'))" 2>/dev/null; then
        check_pass "vercel.json syntax is valid"
    else
        check_fail "vercel.json has syntax errors"
    fi
elif command -v node &> /dev/null; then
    if node -e "require('./vercel.json')" 2>/dev/null; then
        check_pass "vercel.json syntax is valid"
    else
        check_fail "vercel.json has syntax errors"
    fi
else
    check_warn "Cannot validate JSON syntax (Python or Node.js needed)"
fi

echo ""
echo -e "${BLUE}============================================${NC}"
echo -e "${BLUE}              Summary                       ${NC}"
echo -e "${BLUE}============================================${NC}"
echo ""
echo -e "Checks passed:  ${GREEN}${CHECKS_PASSED}${NC}"
echo -e "Checks failed:  ${RED}${CHECKS_FAILED}${NC}"
echo -e "Warnings:       ${YELLOW}${WARNINGS}${NC}"
echo ""

if [ $CHECKS_FAILED -eq 0 ]; then
    echo -e "${GREEN}✓ All critical checks passed!${NC}"
    echo ""
    echo "You're ready to deploy!"
    echo ""
    echo "Next steps:"
    echo "  1. Make sure environment variables are set in Vercel Dashboard"
    echo "  2. Deploy using one of these methods:"
    echo "     • Git: Push to GitHub and import to Vercel"
    echo "     • CLI: Run 'npm run vercel:prod'"
    echo "     • Dashboard: Import project at vercel.com"
    echo ""
    echo "See VERCEL_DEPLOYMENT.md for detailed instructions."
    exit 0
else
    echo -e "${RED}✗ Some checks failed. Please fix the issues above before deploying.${NC}"
    echo ""
    echo "Check VERCEL_DEPLOYMENT.md for help."
    exit 1
fi
