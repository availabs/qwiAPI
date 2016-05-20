#!/usr/bin/env node

'use strict'

const fs = require('fs')
const path = require('path')
const http = require('http')

const mkdirp = require('mkdirp')
const async = require('async')
const _ = require('lodash')

const projectRoot = path.join(__dirname, '../../')

const envFile = require('node-env-file')
envFile(path.join(projectRoot, 'config/qwi.env'))
const env = require('process').env

const dataDir = path.join(projectRoot, 'data/metros')
mkdirp.sync(dataDir)

const states = Object.keys(require(path.join(projectRoot, 'metadata/geographic/stateAbbreviationToCode')))


const demoCategories = ['sa', 'se', 'rh']
const firmCategories = ['fa', 'fs']

const censusBaseURL = "http://lehd.ces.census.gov/pub"
const aggregation = 'gm_ns_op_u'



let pullTheData = (state, workerC, firmC, cb) => {

    let tableName = `${workerC}_${firmC}_${aggregation}`
    let fileName  = `${tableName}.csv.gz`
    let filePath  = path.join(dataDir, `${state}_${fileName}`)

    let fileStream = fs.createWriteStream(filePath) 

    let url = `${censusBaseURL}/${state}/${env.QWI_RELEASE }/DVD-${workerC}_${firmC}/qwi_${state}_${fileName}`

    http.request(url, res => {
      res.pipe(fileStream)
        .on('finish', () => {
          console.log("Downloaded", fileName)
          cb(null)
        })
        .on('error', (err) => {
          console.error('\tERROR downloading the file')
            fs.unlink(filePath, (fErr) => {
              if (fErr) {
                console.error('\tCould not delete the file.')
                return cb(err)
              }    
              console.error('\tThe download file has been deleted.')
            })
          cb(err)
        })
     }).end()
}


const scrapers = _.flatMapDeep(states, s => _.map(demoCategories, d => _.map(firmCategories, f => 
  pullTheData.bind(null, s, d, f)
)))


console.time('Download all metro files.')
async.series(scrapers, (err) => {
  console.timeEnd('Download all metro files.')

  if (err) { return console.error(err) }

  console.log('\nDONE.')
})
