"use strict"


const envFile = require('node-env-file')
envFile(__dirname + '/config/node_server.env')
envFile(__dirname + '/config/postgres_db.env')
envFile(__dirname + '/config/qwi.env')

const env = require('process').env

const app = require('express')()
const bodyParser = require('body-parser')

const async = require('async')

const labels = require('./metadata/labels')

const parseRequest = require('./src/services/QueryParsingService').parse
const buildSQLString = require('./src/builders/SQLStringBuilder').buildSQLString

const parseMeasureRatiosByFirmageRequest = 
        require('./src/services/MeasureRatiosByFirmageQueryParsingService').parse
const buildMeasureRatiosByFirmageSQLString = 
        require('./src/builders/MeasureRatiosByFirmageSQLStringBuilder').buildSQLString

const parseAtlasMSAViewRequest =
        require('./src/services/AtlasMSAViewQueryParsingService').parse
const buildAtlasMSAViewSQLString = 
        require('./src/builders/AtlasMSAViewSQLStringBuilder').buildSQLString


const handleParsedQueryObject = require('./src/services/DBService').handleParsedQueryObject
const buildNestedResponseObject = require('./src/builders/nestedResponseObjectBuilder').build

const port = (env.PORT || 10101)


app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*")
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")
  next()
})


app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())



const handleError = (res, err) => {
  console.error(err.stack)
  res.status(500).send({ error: err.message })
}

app.get('/', (req, res) => res.status(200).send({
  message: "Documentation page not yet created. Route structures follows the patterns in the BDS API (http://bds.availabs.org/), while sticking to the QWI variable names (http://lehd.ces.census.gov/data/schema/latest/lehd_public_use_schema.html)",
  sampleURLs: [
    'http://qwi.availabs.org/data/geography3410900/industry31-33/year20102015/quarter?fields=emp&fields=payroll&dense=true',
    'http://qwi.availabs.org/derived-data/measure-ratios-by-firmage/geography0110700/year/quarter/industry/firmage?fields=emp_ratio&fields=payroll_ratio',
  ]
}))

app.get('/metadata/labels', (req, res) => {
  return res.status(200).send(labels)
})


app.get('/data/*', (req, res) => {

    let chain = [
      parseRequest.bind(null, req),
      buildSQLString,
      handleParsedQueryObject,
      buildNestedResponseObject,
    ]

    async.waterfall(chain, (err, data) => {
      if (err) {
        return handleError(res, err)
      }

      return res.status(200).send({ data: data })
    })
})



app.get('/derived-data/measure-ratios-by-firmage/*', (req, res) => {

    let chain = [
      parseMeasureRatiosByFirmageRequest.bind(null, req),
      buildMeasureRatiosByFirmageSQLString,
      handleParsedQueryObject,
      buildNestedResponseObject,
    ]

    async.waterfall(chain, (err, data) => {
      if (err) {
        return handleError(res, err)
      }

      return res.status(200).send({ data: data })
    })
})


app.get('/derived-data/msa-eea/*', (req, res) => {

    let chain = [
      parseAtlasMSAViewRequest.bind(null, req),
      buildAtlasMSAViewSQLString,
      handleParsedQueryObject,
      buildNestedResponseObject,
    ]

    async.waterfall(chain, (err, data) => {
      if (err) {
        return handleError(res, err)
      }

      return res.status(200).send({ data: data })
    })
})



app.listen(port, function () {
    console.log('App listening on port ' + port)
})
