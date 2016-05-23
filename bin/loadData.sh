#!/bin/bash

set -e

# http://stackoverflow.com/a/246128
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

node "${DIR}/lib/3.pullDataFromCensusBureau.js" "$@"
node "${DIR}/lib/4.loadCSVDataIntoPostgres.js" "$@"
