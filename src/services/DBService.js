'use strict'

const http = require('http')
const zlib = require('zlib')

const async = require('async')
const pg = require('pg')
const copyFrom = require('pg-copy-streams').from
const Iconv = require('iconv').Iconv
const _ = require('lodash')

const env = require('process').env
      


// postgresql://[user[:password]@][netloc][:port][/dbname][?param1=value1&...]
const conString = (() => {
    const process = require('process')

    let user   = process.env.POSTGRES_USER
    let passwd = process.env.POSTGRES_PASSWORD || ''
    let netloc = process.env.POSTGRES_NETLOC
    let port   = process.env.POSTGRES_PORT     || ''
    let dbname = process.env.POSTGRES_DB

    return 'postgresql://' + user + (passwd && (':' + passwd)) +'@'+ netloc + (port && (':' + port)) +'/'+ dbname
})()


const censusBaseURL = "http://lehd.ces.census.gov/pub/"
const aggregation = 'gm_ns_op_u'

const loadedStateCodesQuery = "SELECT geography FROM label_geography WHERE char_length(geography) = 2;" 

const attributes = [
    'agegrp',
    'education',
    'ethnicity',
    'firmage',
    'firmsize',
    'geo_level',
    'geography',
    'ind_level',
    'industry',
    'ownercode',
    'periodicity',
    'race',
    'seasonadj',
    'sex',
]

const genericLabelTables = [
    'label_agegrp',
    'label_education',
    'label_ethnicity',
    'label_firmage',
    'label_firmsize',
    'label_geo_level',
    'label_ind_level',
    'label_industry',
    'label_ownercode',
    'label_periodicity',
    'label_race',
    'label_seasonadj',
    'label_sex',
]

const stateToCode = {
   '01' : 'al',
   '02' : 'ak',
   '04' : 'az',
   '05' : 'ar',
   '06' : 'ca',
   '08' : 'co',
   '09' : 'ct',
   '10' : 'de',
   '11' : 'dc',
   '12' : 'fl',
   '13' : 'ga',
   '15' : 'hi',
   '16' : 'id',
   '17' : 'il',
   '18' : 'in',
   '19' : 'ia',
   '20' : 'ks',
   '21' : 'ky',
   '22' : 'la',
   '23' : 'me',
   '24' : 'md',
   '25' : 'ma',
   '26' : 'mi',
   '27' : 'mn',
   '28' : 'ms',
   '29' : 'mo',
   '30' : 'mt',
   '31' : 'ne',
   '32' : 'nv',
   '33' : 'nh',
   '34' : 'nj',
   '35' : 'nm',
   '36' : 'ny',
   '37' : 'nc',
   '38' : 'nd',
   '39' : 'oh',
   '40' : 'ok',
   '41' : 'or',
   '42' : 'pa',
   '44' : 'ri',
   '45' : 'sc',
   '46' : 'sd',
   '47' : 'tn',
   '48' : 'tx',
   '49' : 'ut',
   '50' : 'vt',
   '51' : 'va',
   '53' : 'wa',
   '54' : 'wv',
   '55' : 'wi',
   '56' : 'wy',
}
//const workerCharacteristics = ['sa', 'se', 'rh']
const workerCharacteristics = ['sa']

//const firmCharacteristics = ['fa', 'fs']
const firmCharacteristics = ['fa']

const qwiTableFields = `
	periodicity   char(1),  /* Periodicity of report */
	seasonadj     char(1),  /* Seasonal Adjustment Indicator */
	geo_level     char(1),  /* Group: Geographic level of aggregation */
	geography     char(8),  /* Group: Geography code */
	ind_level     char(1),  /* Group: Industry level of aggregation */
	industry      char(5),  /* Group: Industry code */
	ownercode     char(3),  /* Group: Ownership group code */
	sex           char(1),  /* Group: Gender code */
	agegrp        char(3),  /* Group: Age group code (WIA) */
	race          char(2),  /* Group: race */
	ethnicity     char(2),  /* Group: ethnicity */
	education     char(2),  /* Group: education */
	firmage       char(1),  /* Group: Firm Age group */
	firmsize      char(1),  /* Group: Firm Size group */
	year          bigint,   /* Time: Year */
	quarter       bigint,   /* Time: Quarter */
	Emp           bigint,   /* Employment: Counts */
	EmpEnd        bigint,   /* Employment end-of-quarter: Counts */
	EmpS          bigint,   /* Employment stable jobs: Counts */
	EmpTotal      bigint,   /* Employment reference quarter: Counts */
	EmpSpv        bigint,   /* Employment stable jobs - previous quarter: Counts */
	HirA          bigint,   /* Hires All: Counts */
	HirN          bigint,   /* Hires New: Counts */
	HirR          bigint,   /* Hires Recalls: Counts */
	Sep           bigint,   /* Separations: Counts */
	HirAEnd       bigint,   /* End-of-quarter hires */
	SepBeg        bigint,   /* Beginning-of-quarter separations */
	HirAEndRepl   bigint,   /* Replacement hires */
	HirAEndR      real,     /* End-of-quarter hiring rate */
	SepBegR       real,     /* Beginning-of-quarter separation rate */
	HirAEndReplR  real,     /* Replacement hiring rate */
	HirAS         bigint,   /* Hires All stable jobs: Counts */
	HirNS         bigint,   /* Hires New stable jobs: Counts */
	SepS          bigint,   /* Separations stable jobs: Counts */
	SepSnx        bigint,   /* Separations stable jobs - next quarter: Counts */
	TurnOvrS      real,     /* Turnover stable jobs: Ratio */
	FrmJbGn       bigint,   /* Firm Job Gains: Counts */
	FrmJbLs       bigint,   /* Firm Job Loss: Counts */
	FrmJbC        bigint,   /* Firm jobs change: Net Change */
	FrmJbGnS      bigint,   /* Firm Gain stable jobs: Counts */
	FrmJbLsS      bigint,   /* Firm Loss stable jobs: Counts */
	FrmJbCS       bigint,   /* Firm stable jobs change: Net Change */
	EarnS         bigint,   /* Employees stable jobs: Average monthly earnings */
	EarnBeg       bigint,   /* Employees beginning-of-quarter : Average monthly earnings */
	EarnHirAS     bigint,   /* Hires All stable jobs: Average monthly earnings */
	EarnHirNS     bigint,   /* Hires New stable jobs: Average monthly earnings */
	EarnSepS      bigint,   /* Separations stable jobs: Average monthly earnings */
	Payroll       bigint,   /* Total quarterly payroll: Sum */
	sEmp          bigint,   /* Status: Employment: Counts */
	sEmpEnd       bigint,   /* Status: Employment end-of-quarter: Counts */
	sEmpS         bigint,   /* Status: Employment stable jobs: Counts */
	sEmpTotal     bigint,   /* Status: Employment reference quarter: Counts */
	sEmpSpv       bigint,   /* Status: Employment stable jobs - previous quarter: Counts */
	sHirA         bigint,   /* Status: Hires All: Counts */
	sHirN         bigint,   /* Status: Hires New: Counts */
	sHirR         bigint,   /* Status: Hires Recalls: Counts */
	sSep          bigint,   /* Status: Separations: Counts */
	sHirAEnd      bigint,   /* Status: End-of-quarter hires */
	sSepBeg       bigint,   /* Status: Beginning-of-quarter separations */
	sHirAEndRepl  bigint,   /* Status: Replacement hires */
	sHirAEndR     bigint,   /* Status: End-of-quarter hiring rate */
	sSepBegR      bigint,   /* Status: Beginning-of-quarter separation rate */
	sHirAEndReplR bigint,   /* Status: Replacement hiring rate */
	sHirAS        bigint,   /* Status: Hires All stable jobs: Counts */
	sHirNS        bigint,   /* Status: Hires New stable jobs: Counts */
	sSepS         bigint,   /* Status: Separations stable jobs: Counts */
	sSepSnx       bigint,   /* Status: Separations stable jobs - next quarter: Counts */
	sTurnOvrS     bigint,   /* Status: Turnover stable jobs: Ratio */
	sFrmJbGn      bigint,   /* Status: Firm Job Gains: Counts */
	sFrmJbLs      bigint,   /* Status: Firm Job Loss: Counts */
	sFrmJbC       bigint,   /* Status: Firm jobs change: Net Change */
	sFrmJbGnS     bigint,   /* Status: Firm Gain stable jobs: Counts */
	sFrmJbLsS     bigint,   /* Status: Firm Loss stable jobs: Counts */
	sFrmJbCS      bigint,   /* Status: Firm stable jobs change: Net Change */
	sEarnS        bigint,   /* Status: Employees stable jobs: Average monthly earnings */
	sEarnBeg      bigint,   /* Status: Employees beginning-of-quarter : Average monthly earnings */
	sEarnHirAS    bigint,   /* Status: Hires All stable jobs: Average monthly earnings */
	sEarnHirNS    bigint,   /* Status: Hires New stable jobs: Average monthly earnings */
	sEarnSepS     bigint,   /* Status: Separations stable jobs: Average monthly earnings */
	sPayroll      bigint    /* Status: Total quarterly payroll: Sum */
`

const createLabelTables = callback => {
    var tasks = attributes.map((attribute) => 
        (cb) => runQuery(`DROP TABLE IF EXISTS label_${attribute};
                          CREATE TABLE label_${attribute} (
                              ${attribute} varchar PRIMARY KEY,
                              label            varchar
                          );`, cb)
    )

    return async.parallel(tasks, callback)
}

const createDataTables = callback => {
    let tasks = []

    for (let i = 0; i < workerCharacteristics.length; ++i) {
        for (let j = 0; j < firmCharacteristics.length; ++j) {
            let tableName = `${workerCharacteristics[i]}_${firmCharacteristics[j]}_${aggregation}`

            tasks.push(
                (cb) => runQuery(`DROP TABLE IF EXISTS ${tableName};
                                  CREATE TABLE ${tableName} (
                                      ${qwiTableFields}
                                  );`, cb)
            )
        }
    }


    return async.parallel(tasks, callback)
}

const createTables = callback => {
    return async.parallel([createLabelTables, createDataTables], callback)
}

const loadLabels = callback => {
    
    let loadLabel = (tableName, cb) => {
        // example: http://lehd.ces.census.gov/pub/ny/R2015Q1/DVD-se_fa/label_agegrp.csv
        // We use NY as the default to get the labels, which are the same across states.
        let url = censusBaseURL + '/ny/' + env.QWI_RELEASE + '/DVD-se_fa/' + tableName + '.csv'

        pg.connect(conString, function(err, client, done) {
            var stream = client.query(copyFrom(`COPY ${tableName} FROM STDIN DELIMITER ',' CSV HEADER`))

            http.request(url, res => {
                res.pipe(stream)
                   .on('finish', () => { done(); return cb(null) })
                   .on('error', (err) => { done(); return cb(err) })
            }).end()

        })
    }

    let loaders = genericLabelTables.map(tableName => loadLabel.bind(null, tableName))

    return async.parallel(loaders, callback)
}

const loadStatesData = (states, DDL_lock, callback) => {

    if (!Array.isArray(states)) {
        states = [states]
    }

    states = states.map(s => s.toLowerCase().trim())

    // We need to handle the state geography labels differently.
    let loadGeoLabels = (state, cb) => {

        let url = censusBaseURL + `${state}/` + env.QWI_RELEASE + '/DVD-se_fa/label_geography.csv'
        console.log('Loading geography labels for', state)

        pg.connect(conString, function(err, client, done) {
            let stream = client.query(copyFrom(`COPY label_geography 
                                                FROM STDIN 
                                                DELIMITER ',' 
                                                CSV HEADER 
                                                ENCODING 'UTF8'`))
            let iconv = new Iconv('ISO-8859-1', 'UTF-8')


            http.request(url, res => {
                res.pipe(iconv).pipe(stream)
                   .on('finish', () => { 
                       done()
                       return cb(null) 
                   })
                   .on('error', (err) => { 
                       if (err) { 
                           done()
                           console.error('\n', url, '\n', err.stack) 
                           return cb(err) 
                       }
                   })
            }).end()

        })
    }

    let loadData = (state, workerC, firmC, agg, cb) => {

        let tableName = `${workerC}_${firmC}_${agg}`
        let fileName  = `${tableName}.csv.gz`

        let url = `${censusBaseURL}/${state}/${env.QWI_RELEASE }/DVD-${workerC}_${firmC}/qwi_${state}_${fileName}`

        console.log('Loading data for', state, 'into', tableName)

        let timerLabel = state + ' -> ' + tableName
        console.time(timerLabel)

        return pg.connect(conString, function(err, client, done) {
            let stream = client.query(copyFrom(`COPY ${tableName} FROM STDIN DELIMITER ',' CSV HEADER`))
            let gunzipper = zlib.createGunzip()

            return http.request(url, res => {
                res.pipe(gunzipper)
                   .pipe(stream)
                   .on('finish', () => { 
                       done() 
                       console.timeEnd(timerLabel)
                       DDL_lock.message += `\n${state} loaded into ${tableName}.`
                       return cb(null) 
                   })
                   .on('error', (err) => { 
                       done() 
                       console.timeEnd(timerLabel)
                       DDL_lock.message += `\nERROR while loading ${state} into ${tableName}.`
                       return cb(err) 
                   })
            }).end()
        })
    }



    return getUploadedStates((err, res) => {

        if (err) { return callback(err) }

        let dupeStates = _.intersection(states, res)

        if (dupeStates.length) {
            DDL_lock.message += '\nThe following states aleady were uploaded: ' + JSON.stringify(dupeStates) + '.'
            console.warn('The following states aleady were uploaded:', dupeStates)
        }

        states = _.difference(states, res)

        let geoLabelLoaders = states.map(state => loadGeoLabels.bind(null, state))

        let dataLoaders = states.reduce((acc, state) => {
            for (let i = 0; i < workerCharacteristics.length; ++i) {
                for (let j = 0; j < firmCharacteristics.length; ++j) {
                    acc.push(loadData.bind(null, state, workerCharacteristics[i], firmCharacteristics[j], aggregation))
                }
            }
            return acc 
        }, [])

        // Don't want to anger the host, so we'll do serial.
        return async.series(geoLabelLoaders.concat(dataLoaders), callback)
    })
}

/* code based on example found here: https://github.com/brianc/node-postgres/wiki/Example */
function runQuery (query, callback) {

    // get a pg client from the connection pool
    return pg.connect(conString, function(err, client, done) {

        var handleError = function(err) {
            // no error occurred, continue with the request
            if(!err) {
                return false
            }

            // An error occurred, remove the client from the connection pool.
            // A truthy value passed to done will remove the connection from the pool
            // instead of simply returning it to be reused.
            // In this case, if we have successfully received a client (truthy)
            // then it will be removed from the pool.
            if(client){
                done(client)
            }

            return true
        }

        // handle an error from the connection
        if(handleError(err)) return callback(err)

        // record the visit
        client.query(query, function(err, result) {

            // handle an error from the query
            if(handleError(err)) { 
                return callback(err)
            }

            // return the client to the connection pool for other requests to reuse
            done()
            
            return callback(null, result)
        })
    })
}

const getUploadedStates = (cb => 
    runQuery(loadedStateCodesQuery, (e,res) => (e) ? cb(e) : cb(null, res.rows.map(r => stateToCode[r.geography]))))

const loadAllStates = loadStatesData.bind(null, _.values(stateToCode))


module.exports = {
    runQuery       : runQuery ,
    createTables   : createTables ,
    loadLabels     : loadLabels ,
    loadStatesData : loadStatesData ,
    loadAllStates  : loadAllStates ,
    getUploadedStates : getUploadedStates ,
}



