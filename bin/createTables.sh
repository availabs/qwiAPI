#!/bin/bash

# http://stackoverflow.com/a/246128
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

node "${DIR}/lib/1.createLabelTables.js"
node "${DIR}/lib/2.createDataTables.js"
