const vLens = require('../../metadata/indentifiers').valueLengths

module.exports = (dataTableName) => 

  `DROP TABLE IF EXISTS ${dataTableName};
   CREATE TABLE ${dataTableName} (
       periodicity   char(${vLens.periodicity}),  /* Periodicity of report */
       seasonadj     char(${vLens.seasonadj}),  /* Seasonal Adjustment Indicator */
       geo_level     char(${vLens.geo_level}),  /* Group: Geographic level of aggregation */
       geography     char(${vLens.geography}),  /* Group: Geography code */
       ind_level     char(${vLens.ind_level}),  /* Group: Industry level of aggregation */
       industry      char(${vLens.industry}),  /* Group: Industry code */
       ownercode     char(${vLens.ownercode}),  /* Group: Ownership group code */
       sex           char(${vLens.sex}),  /* Group: Gender code */
       agegrp        char(${vLens.agegrp}),  /* Group: Age group code (WIA) */
       race          char(${vLens.race}),  /* Group: race */
       ethnicity     char(${vLens.ethnicity}),  /* Group: ethnicity */
       education     char(${vLens.education}),  /* Group: education */
       firmage       char(${vLens.firmage}),  /* Group: Firm Age group */
       firmsize      char(${vLens.firmsize}),  /* Group: Firm Size group */
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
  );`

