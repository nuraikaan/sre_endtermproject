SERVICES=("authservice" "orderservice" "productservice" "userservice" "chatservice" "paymentservice")
LOG_FILE="troubleshoot_$(date +%Y%m%d_%H%M%S).log"
 
echo "  Log-Based Troubleshooting Automation"

# centralized logs from all containers
echo ">>> Centralized Container Logs (last 20 lines each)"

for service in "${SERVICES[@]}"; do
    echo ""
    echo "--- $service ---"
    docker-compose logs --tail=20 "$service" 2>/dev/null
done
 
 
# database connection failures
echo ">>> Scanning for Database Connection Failures..."
echo "--------------------------------------------------------"
DB_ERRORS=$(docker-compose logs 2>/dev/null | grep -iE "database|connection refused|ECONNREFUSED|connect ETIMEDOUT|pg error|sequelize|knex|prisma.*error|could not connect")
 
if [ -z "$DB_ERRORS" ]; then
    echo "  ✓ No database connection failures found."
else
    echo "  ✗ DATABASE ERRORS DETECTED:"
    echo "$DB_ERRORS"
fi
 

# service restart loops
echo ">>> Scanning for Service Restart Loops"
echo "--------------------------------------------------------"
for service in "${SERVICES[@]}"; do
    RESTARTS=$(docker inspect "webbackendfinal-${service}-1" 2>/dev/null | grep -i '"RestartCount"' | grep -oE '[0-9]+')
    if [ ! -z "$RESTARTS" ] && [ "$RESTARTS" -gt 0 ]; then
        echo "  ✗ $service has restarted $RESTARTS time(s) — possible restart loop!"
    else
        echo "  ✓ $service — no restart loop detected"
    fi
done
 

 
# container health status ─
echo ">>> Container Health Status"
echo "--------------------------------------------------------"
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.RunningFor}}"
 
echo ""
echo "========================================"
echo "  Log saved to: $LOG_FILE"
echo "========================================"
 
{
    echo "Troubleshoot Report - $(date)"
    echo ""
    docker-compose logs 2>/dev/null
} > "$LOG_FILE"
 