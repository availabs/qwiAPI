#!/bin/bash

set -e

source ../../config/postgres_db.env

TEMPLATE_SCRIPT='./sql_scripts/CREATE_LABEL_TABLE.template.sql'

ATTRIBUTES=(      \
    'agegrp'      \
    'education'   \
    'ethnicity'   \
    'firmage'     \
    'firmsize'    \
    'geo_level'   \
    'geography'   \
    'ind_level'   \
    'industry'    \
    'ownercode'   \
    'periodicity' \
    'race'        \
    'seasonadj'   \
    'sex'         \
);




for attribute in "${ATTRIBUTES[@]}"
do
    cat ${TEMPLATE_SCRIPT} | \
    sed "s/__ATTRIBUTE__/${attribute}/" | \
    psql -q -U ${POSTGRES_USER} -d ${POSTGRES_DB} 
done
