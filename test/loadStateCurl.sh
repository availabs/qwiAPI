curl -H "Content-Type: application/json" \
     -X POST -d '{"states": ["nm" ], "password": "password"}' \
     http://localhost:10101/admin/database/tables/load/states
