#!/bin/bash

set -e;


source ../../config/postgres_db.env


if [[ -n $(ps -A | grep postgres) ]]; 
then 
    echo "Shutdown postgres before running this script."
    exit
fi

if [ -d "${PGDATA}/${POSTGRES_DB}/" ];
then
    #echo "Deleting the old database directory."
    rm -rf "${PGDATA}/${POSTGRES_DB}/"
fi

#echo "Create the QWI data directory."
mkdir -p "${PGDATA}/${POSTGRES_DB}/"
${POSTGRES_HOME}/bin/initdb --encoding="UTF8" -D "${PGDATA}/${POSTGRES_DB}/"

#echo "Starting up Postgres in background."
${POSTGRES_HOME}/bin/postgres -D "${PGDATA}/${POSTGRES_DB}/" &
echo 

sleep 5

#echo "Create the qwi database."
${POSTGRES_HOME}/bin/createdb ${POSTGRES_DB}
echo

echo 
echo "Database now running."
echo 
