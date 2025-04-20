#!/bin/bash
set -e

# Help function
function show_help {
    echo "SQL Script Executor for PostgreSQL"
    echo ""
    echo "Usage:"
    echo "  docker run --rm sql-executor CONNECTION_STRING"
    echo ""
    echo "Parameters:"
    echo "  CONNECTION_STRING: PostgreSQL connection string (postgres://user:password@host:port/dbname)"
    echo ""
    echo "Example:"
    echo "  docker run --rm sql-executor postgres://user:password@localhost:5432/mydb"
    exit 1
}

# Check if help is requested
if [ "$1" = "--help" ] || [ "$1" = "-h" ]; then
    show_help
fi

# Check if we have enough parameters
if [ "$#" -lt 1 ]; then
    echo "Error: Not enough parameters"
    show_help
fi

echo "Parsing connection string..."

# Parse connection string and SQL file
CONNECTION_STRING=$1

# Extract components using regex patterns more reliably
if [[ $CONNECTION_STRING =~ postgres://(.*?):(.*?)@(.*?):([0-9]+)/(.*) ]]; then
    PGUSER="${BASH_REMATCH[1]}"
    PGPASSWORD="${BASH_REMATCH[2]}"
    PGHOST="${BASH_REMATCH[3]}"
    PGPORT="${BASH_REMATCH[4]}"
    PGDATABASE="${BASH_REMATCH[5]}"
else
    echo "Error: Invalid connection string format."
    echo "Expected format: postgres://user:password@host:port/dbname"
    exit 1
fi

echo "Executing SQL script on $PGHOST:$PGPORT/$PGDATABASE as $PGUSER"

# Execute the SQL script
export PGPASSWORD
psql -q -h "$PGHOST" -p "$PGPORT" -U "$PGUSER" -d "$PGDATABASE" -f "/scripts/migration.sql"

echo "SQL execution completed"