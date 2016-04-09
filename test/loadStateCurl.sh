curl -H "Content-Type: application/json" \
     -X POST -d '{"states": ["ri"]}' \
     http://localhost:10101/admin/database/tables/load/states
