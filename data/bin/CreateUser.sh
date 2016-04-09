#!/bin/bash

set -e

source ../../config/postgres_db.env

# sed new username
cat ./sql_scripts/CREATE_USER.sql | \
    sed "s/__POSTGRES_USER__/${POSTGRES_USER}/" | \
    ${POSTGRES_HOME}/bin/psql -d ${POSTGRES_DB} 

if [ ! -z ${POSTGRES_PASSWORD} ] 
then
    cat ./sql_scripts/ALTER_USER_PASSWORD.sql | \
    sed "s/__POSTGRES_USER__/${POSTGRES_USER}/" | \
    sed "s/__POSTGRES_PASSWORD__/${POSTGRES_PASSWORD}/" | \
    ${POSTGRES_HOME}/bin/psql -d ${POSTGRES_DB} 
fi
