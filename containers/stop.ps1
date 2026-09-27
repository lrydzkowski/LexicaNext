docker compose --env-file .env `
    -f compose.standalone.yaml `
    -p lexicanext-standalone `
    down --volumes
