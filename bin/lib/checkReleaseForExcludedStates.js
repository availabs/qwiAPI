#!/usr/bin/env node

'use strict'

const http = require('http')

const states = Object.keys(require('../../metadata/geographic/stateAbbreviationToCode')).filter(s => s)

const argv = require('minimist')(process.argv.slice(2))

const release = argv.release

// Make sure the user specified a release version.
if (!release) {
  console.error(`
    USAGE: specify the release with the --release flag

         checkReleaseForExcludedStates --release=R2016Q1
`)
  process.exit(1)
}


// Sends HEAD requests to state/release page as an existence check.
const checkDataExistsForState = (state, cb) => {
  let options = {
    method: 'HEAD',
    host: 'lehd.ces.census.gov',
    path: `/pub/${state}/${release}/`,
  }

  http.request(options, (r) => {
    cb((r.statusCode === 200) ? null : 1) // 400 codes mean D.N.E.
  }).on('error', cb).end()
}


const missingStates = []

const runIt = (i) => {

  if (states[i]) {
    return checkDataExistsForState(states[i], (err) => {
      if (err) {
        missingStates.push(states[i])
      }

      return runIt(++i)
    })
  } 

  missingStates.sort()
  if (missingStates.length) {
    console.error(
      `The following states are missing from the QWI ${release} release:\n` + JSON.stringify(missingStates, null, 4)
    )
  } else {
    console.log(`All states are in the QWI ${release} release.`)
  }
}

runIt(0)
