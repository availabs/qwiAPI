#!/bin/bash

# Temporary way to get the labels into the sails app.

ATTRIBUTES=( \
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

MODULE_CODE_START="'use strict';\n\nmodule.exports = {\n\n";
MODULE_CODE_END="\n\n};"

for attr in "${ATTRIBUTES[@]}"
do
    FILE_NAME="${attr}.js"

    rm -f ${FILE_NAME} 

    T=$(echo "SELECT row_to_json(t) \
              FROM (SELECT ${attr}, label FROM label_${attr} ) t;" | \
        psql -d qwi -t   | \
        sed 's/,/:/'     | \
        cut -d':' -f2,4  | \
        sed 's/}/,/'     | \
        sed 's/^/\t/'    | \
        sed 's/:/@:\t/'  | \
        column -t -s "@" ) ;

    printf "${MODULE_CODE_START}" >> ${FILE_NAME}
    printf "${T}"                 >> ${FILE_NAME}
    printf "${MODULE_CODE_END}"   >> ${FILE_NAME}
    printf "\n\n"                 >> ${FILE_NAME}

done
