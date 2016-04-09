curl -H "Content-Type: application/json" \
     -X POST -d '{"states": ["wy"]}' \
     http://localhost:10101/admin/database/tables/load/states
