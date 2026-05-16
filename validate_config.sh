PASS="✓"
FAIL="✗"
ERRORS=0
 
# check .env file exists ──
echo ">>> Checking .env file..."
if [ -f ".env" ]; then
    echo "  $PASS .env file found"
else
    echo "  $FAIL .env file MISSING — copy from .env.template"
    ERRORS=$((ERRORS + 1))
fi
echo ""
 
echo ">>> Validating Environment Variables..."
 
REQUIRED_VARS="JWT_SECRET POSTGRES_USER POSTGRES_PASSWORD POSTGRES_DB DATABASE_URL NODE_ENV"
 
for var in $REQUIRED_VARS; do
    value=$(grep "^${var}=" .env 2>/dev/null | cut -d '=' -f2)
    if [ -z "$value" ]; then
        echo "  $FAIL $var is MISSING or EMPTY"
        ERRORS=$((ERRORS + 1))
    else
        masked="${value:0:3}***"
        echo "  $PASS $var = $masked"
    fi
done
echo ""
 
# validate database connection string ──
echo ">>> Validating Database Connection String..."
 
DATABASE_URL=$(grep "^DATABASE_URL=" .env 2>/dev/null | cut -d '=' -f2)
 
if [ -z "$DATABASE_URL" ]; then
    echo "  $FAIL DATABASE_URL is MISSING"
    ERRORS=$((ERRORS + 1))
else
    if echo "$DATABASE_URL" | grep -qE "^postgresql://"; then
        echo "  $PASS DATABASE_URL format is valid"
        echo "  $PASS Value: $(echo $DATABASE_URL | sed 's/:\/\/[^:]*:[^@]*@/:\/\/***:***@/')"
    else
        echo "  $FAIL DATABASE_URL format invalid (must start with postgresql://)"
        ERRORS=$((ERRORS + 1))
    fi
fi
echo ""
 
# validate service endpoints ──
echo ">>> Validating Service Endpoints..."
 
for port in 3001 3002 3003 3004 3005 3006; do
    case $port in
        3001) name="authservice" ;;
        3002) name="orderservice" ;;
        3003) name="productservice" ;;
        3004) name="userservice" ;;
        3005) name="chatservice" ;;
        3006) name="paymentservice" ;;
    esac
    response=$(curl -s -o /dev/null -w "%{http_code}" --max-time 3 "http://localhost:$port/health" 2>/dev/null)
    if [ "$response" = "200" ]; then
        echo "  $PASS $name:$port/health — OK (HTTP 200)"
    else
        echo "  $FAIL $name:$port/health — UNREACHABLE (HTTP $response)"
        ERRORS=$((ERRORS + 1))
    fi
done
echo ""
 
# check docker-compose.yml ──
echo ">>> Checking docker-compose.yml..."
if [ -f "docker-compose.yml" ]; then
    echo "  $PASS docker-compose.yml found"
    grep -q "healthcheck" docker-compose.yml && echo "  $PASS healthcheck defined" || { echo "  $FAIL healthcheck missing"; ERRORS=$((ERRORS + 1)); }
    grep -q "restart" docker-compose.yml && echo "  $PASS restart policy defined" || { echo "  $FAIL restart policy missing"; ERRORS=$((ERRORS + 1)); }
else
    echo "  $FAIL docker-compose.yml NOT FOUND"
    ERRORS=$((ERRORS + 1))
fi
echo ""

if [ "$ERRORS" -eq 0 ]; then
    echo "  $PASS ALL CHECKS PASSED — Safe to deploy"
else
    echo "  $FAIL $ERRORS ERROR(S) FOUND — Fix before deploying"
fi
