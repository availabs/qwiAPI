'use strict'

/*
    The measures available in the QWI include:

        'emp'           ('Employment: Counts')
        'empend'        ('Employment end-of-quarter: Counts')
        'emps'          ('Employment stable jobs: Counts')
        'emptotal'      ('Employment reference quarter: Counts')
        'empspv'        ('Employment stable jobs - previous quarter: Counts')
        'hira'          ('Hires All: Counts')
        'hirn'          ('Hires New: Counts')
        'hirr'          ('Hires Recalls: Counts')
        'sep'           ('Separations: Counts')
        'hiraend'       ('End-of-quarter hires')
        'sepbeg'        ('Beginning-of-quarter separations')
        'hiraendrepl'   ('Replacement hires')
        'hiraendr'      ('End-of-quarter hiring rate')
        'sepbegr'       ('Beginning-of-quarter separation rate')
        'hiraendreplr'  ('Replacement hiring rate')
        'hiras'         ('Hires All stable jobs: Counts')
        'hirns'         ('Hires New stable jobs: Counts')
        'seps'          ('Separations stable jobs: Counts')
        'sepsnx'        ('Separations stable jobs - next quarter: Counts')
        'turnovrs'      ('Turnover stable jobs: Ratio')
        'frmjbgn'       ('Firm Job Gains: Counts')
        'frmjbls'       ('Firm Job Loss: Counts')
        'frmjbc'        ('Firm jobs change: Net Change')
        'frmjbgns'      ('Firm Gain stable jobs: Counts')
        'frmjblss'      ('Firm Loss stable jobs: Counts')
        'frmjbcs'       ('Firm stable jobs change: Net Change')
        'earns'         ('Employees stable jobs: Average monthly earnings')
        'earnbeg'       ('Employees beginning-of-quarter : Average monthly earnings')
        'earnhiras'     ('Hires All stable jobs: Average monthly earnings')
        'earnhirns'     ('Hires New stable jobs: Average monthly earnings')
        'earnseps'      ('Separations stable jobs: Average monthly earnings')
        'payroll'       ('Total quarterly payroll: Sum')

*/



const _ = require('lodash')



const supportedMeasures = [
     'emp',
     'empend' ,
     'emps' ,
     'emptotal' ,
     'empspv' ,
     'hira' ,
     'hirn' ,
     'hirr' ,
     'sep' ,
     'hiraend' ,
     'sepbeg' ,
     'hiraendrepl' ,
     'hiraendr' ,
     'sepbegr' ,
     'hiraendreplr' ,
     'hiras' ,
     'hirns' ,
     'seps' ,
     'sepsnx' ,
     'turnovrs' ,
     'frmjbgn' ,
     'frmjbls' ,
     'frmjbc' ,
     'frmjbgns' ,
     'frmjblss' ,
     'frmjbcs' ,
     'earns' ,
     'earnbeg' ,
     'earnhiras' ,
     'earnhirns' ,
     'earnseps' ,
     'payroll' ,
]


let verifyMeasuresSupported = (requestedMeasures) => {
    let unsupportedMeasures = _.difference(requestedMeasures, supportedMeasures)

    if (unsupportedMeasures.length) {
        return 'The following requested measure' + 
                ((unsupportedMeasures.length > 1) ? 's are ' : ' is ') +
                'not recognized: [' + unsupportedMeasures.join(', ') + '].\n'
    } 

    return ''
}


module.exports = {
    
    validateRequestedMeasures : (requestedMeasures) => {
        
        let errorMessage = verifyMeasuresSupported(requestedMeasures)

        if (errorMessage) {
            throw new Error(errorMessage)
        }   
    }
}

