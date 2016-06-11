DROP TABLE IF EXISTS measure_ratios_by_firmage;

CREATE TABLE measure_ratios_by_firmage AS
  SELECT 
    substring(tx.geography FROM 3 for 5) AS geography,
    tX.year as year, 
    tX.quarter as quarter,
    tX.industry as industry, 
    tX.firmage as firmage, 

    CASE WHEN (t0.emp <> 0) THEN tX.emp/cast(t0.emp AS FLOAT) ELSE 0 END AS emp_ratio,
    CASE WHEN (t0.empend <> 0) THEN tX.empend/cast(t0.empend AS FLOAT) ELSE 0 END AS empend_ratio,
    CASE WHEN (t0.emps <> 0) THEN tX.emps/cast(t0.emps AS FLOAT) ELSE 0 END AS emps_ratio,
    CASE WHEN (t0.emptotal <> 0) THEN tX.emptotal/cast(t0.emptotal AS FLOAT) ELSE 0 END AS emptotal_ratio,
    CASE WHEN (t0.empspv <> 0) THEN tX.empspv/cast(t0.empspv AS FLOAT) ELSE 0 END AS empspv_ratio,
    CASE WHEN (t0.hira <> 0) THEN tX.hira/cast(t0.hira AS FLOAT) ELSE 0 END AS hira_ratio,
    CASE WHEN (t0.hirn <> 0) THEN tX.hirn/cast(t0.hirn AS FLOAT) ELSE 0 END AS hirn_ratio,
    CASE WHEN (t0.hirr <> 0) THEN tX.hirr/cast(t0.hirr AS FLOAT) ELSE 0 END AS hirr_ratio,
    CASE WHEN (t0.sep <> 0) THEN tX.sep/cast(t0.sep AS FLOAT) ELSE 0 END AS sep_ratio,
    CASE WHEN (t0.hiraend <> 0) THEN tX.hiraend/cast(t0.hiraend AS FLOAT) ELSE 0 END AS hiraend_ratio,
    CASE WHEN (t0.sepbeg <> 0) THEN tX.sepbeg/cast(t0.sepbeg AS FLOAT) ELSE 0 END AS sepbeg_ratio,
    CASE WHEN (t0.hiraendrepl <> 0) THEN tX.hiraendrepl/cast(t0.hiraendrepl AS FLOAT) ELSE 0 END AS hiraendrepl_ratio,
    CASE WHEN (t0.hiraendr <> 0) THEN tX.hiraendr/cast(t0.hiraendr AS FLOAT) ELSE 0 END AS hiraendr_ratio,
    CASE WHEN (t0.sepbegr <> 0) THEN tX.sepbegr/cast(t0.sepbegr AS FLOAT) ELSE 0 END AS sepbegr_ratio,
    CASE WHEN (t0.hiraendreplr <> 0) THEN tX.hiraendreplr/cast(t0.hiraendreplr AS FLOAT) ELSE 0 END AS hiraendreplr_ratio,
    CASE WHEN (t0.hirns <> 0) THEN tX.hirns/cast(t0.hirns AS FLOAT) ELSE 0 END AS hirns_ratio,
    CASE WHEN (t0.seps <> 0) THEN tX.seps/cast(t0.seps AS FLOAT) ELSE 0 END AS seps_ratio,
    CASE WHEN (t0.sepsnx <> 0) THEN tX.sepsnx/cast(t0.sepsnx AS FLOAT) ELSE 0 END AS sepsnx_ratio,
    CASE WHEN (t0.turnovrs <> 0) THEN tX.turnovrs/cast(t0.turnovrs AS FLOAT) ELSE 0 END AS turnovrs_ratio,
    CASE WHEN (t0.frmjbgn <> 0) THEN tX.frmjbgn/cast(t0.frmjbgn AS FLOAT) ELSE 0 END AS frmjbgn_ratio,
    CASE WHEN (t0.frmjbls <> 0) THEN tX.frmjbls/cast(t0.frmjbls AS FLOAT) ELSE 0 END AS frmjbls_ratio,
    CASE WHEN (t0.frmjbc <> 0) THEN tX.frmjbc/cast(t0.frmjbc AS FLOAT) ELSE 0 END AS frmjbc_ratio,
    CASE WHEN (t0.frmjbgns <> 0) THEN tX.frmjbgns/cast(t0.frmjbgns AS FLOAT) ELSE 0 END AS frmjbgns_ratio,
    CASE WHEN (t0.frmjblss <> 0) THEN tX.frmjblss/cast(t0.frmjblss AS FLOAT) ELSE 0 END AS frmjblss_ratio,
    CASE WHEN (t0.frmjbcs <> 0) THEN tX.frmjbcs/cast(t0.frmjbcs AS FLOAT) ELSE 0 END AS frmjbcs_ratio,
    CASE WHEN (t0.earns <> 0) THEN tX.earns/cast(t0.earns AS FLOAT) ELSE 0 END AS earns_ratio,
    CASE WHEN (t0.earnbeg <> 0) THEN tX.earnbeg/cast(t0.earnbeg AS FLOAT) ELSE 0 END AS earnbeg_ratio,
    CASE WHEN (t0.earnhiras <> 0) THEN tX.earnhiras/cast(t0.earnhiras AS FLOAT) ELSE 0 END AS earnhiras_ratio,
    CASE WHEN (t0.earnhirns <> 0) THEN tX.earnhirns/cast(t0.earnhirns AS FLOAT) ELSE 0 END AS earnhirns_ratio,
    CASE WHEN (t0.earnseps <> 0) THEN tX.earnseps/cast(t0.earnseps AS FLOAT) ELSE 0 END AS earnseps_ratio,
    CASE WHEN (t0.payroll <> 0) THEN tX.payroll/cast(t0.payroll AS FLOAT) ELSE 0 END AS payroll_ratio

  FROM (
    SELECT 
      geography, 
      year, 
      quarter, 
      industry,
      emp,
      empend,
      emps,
      emptotal,
      empspv,
      hira,
      hirn,
      hirr,
      sep,
      hiraend,
      sepbeg,
      hiraendrepl,
      hiraendr,
      sepbegr,
      hiraendreplr,
      hirns,
      seps,
      sepsnx,
      turnovrs,
      frmjbgn,
      frmjbls,
      frmjbc,
      frmjbgns,
      frmjblss,
      frmjbcs,
      earns,
      earnbeg,
      earnhiras,
      earnhirns,
      earnseps,
      payroll
    FROM sa_fa_gm_ns_op_u 
    WHERE (firmage= '0') AND
          (sex = '0') AND 
          (agegrp = 'A00') AND 
          (char_length(geography) <> 2) AND
          (substring(geography FROM 3 for 5)) NOT IN (
            SELECT DISTINCT geography 
            FROM   interstate_msa_view
          )) AS t0
    INNER JOIN (
      SELECT 
        geography,
        year, 
        quarter, 
        industry, 
        firmage,
        emp,
        empend,
        emps,
        emptotal,
        empspv,
        hira,
        hirn,
        hirr,
        sep,
        hiraend,
        sepbeg,
        hiraendrepl,
        hiraendr,
        sepbegr,
        hiraendreplr,
        hirns,
        seps,
        sepsnx,
        turnovrs,
        frmjbgn,
        frmjbls,
        frmjbc,
        frmjbgns,
        frmjblss,
        frmjbcs,
        earns,
        earnbeg,
        earnhiras,
        earnhirns,
        earnseps,
        payroll
      FROM sa_fa_gm_ns_op_u 
      WHERE (firmage <> '0') AND 
            (sex = '0') AND 
            (agegrp = 'A00') AND
            (char_length(geography) <> 2) AND
            (substring(geography FROM 3 for 5)) NOT IN (
              SELECT DISTINCT geography 
              FROM   interstate_msa_view
            )) tX
    ON ((t0.geography = tX.geography) AND
        (t0.industry  = tX.industry) AND
        (t0.year      = tX.year) AND
        (t0.quarter   = tX.quarter)) ; --END CREATE TABLE measure_ratios_by_firmage 


INSERT INTO measure_ratios_by_firmage (
    geography,
    year, 
    quarter,
    industry, 
    firmage, 

    emp_ratio,
    empend_ratio,
    emps_ratio,
    emptotal_ratio,
    empspv_ratio,
    hira_ratio,
    hirn_ratio,
    hirr_ratio,
    sep_ratio,
    hiraend_ratio,
    sepbeg_ratio,
    hiraendrepl_ratio,
    hiraendr_ratio,
    sepbegr_ratio,
    hiraendreplr_ratio,
    hirns_ratio,
    seps_ratio,
    sepsnx_ratio,
    turnovrs_ratio,
    frmjbgn_ratio,
    frmjbls_ratio,
    frmjbc_ratio,
    frmjbgns_ratio,
    frmjblss_ratio,
    frmjbcs_ratio,
    earns_ratio,
    earnbeg_ratio,
    earnhiras_ratio,
    earnhirns_ratio,
    earnseps_ratio,
    payroll_ratio 
) (SELECT 
    tX.geography as geography,
    tX.year as year, 
    tX.quarter as quarter,
    tX.industry as industry, 
    tX.firmage as firmage, 

    CASE WHEN (t0.emp <> 0) THEN tX.emp/cast(t0.emp AS FLOAT) ELSE 0 END AS emp_ratio,
    CASE WHEN (t0.empend <> 0) THEN tX.empend/cast(t0.empend AS FLOAT) ELSE 0 END AS empend_ratio,
    CASE WHEN (t0.emps <> 0) THEN tX.emps/cast(t0.emps AS FLOAT) ELSE 0 END AS emps_ratio,
    CASE WHEN (t0.emptotal <> 0) THEN tX.emptotal/cast(t0.emptotal AS FLOAT) ELSE 0 END AS emptotal_ratio,
    CASE WHEN (t0.empspv <> 0) THEN tX.empspv/cast(t0.empspv AS FLOAT) ELSE 0 END AS empspv_ratio,
    CASE WHEN (t0.hira <> 0) THEN tX.hira/cast(t0.hira AS FLOAT) ELSE 0 END AS hira_ratio,
    CASE WHEN (t0.hirn <> 0) THEN tX.hirn/cast(t0.hirn AS FLOAT) ELSE 0 END AS hirn_ratio,
    CASE WHEN (t0.hirr <> 0) THEN tX.hirr/cast(t0.hirr AS FLOAT) ELSE 0 END AS hirr_ratio,
    CASE WHEN (t0.sep <> 0) THEN tX.sep/cast(t0.sep AS FLOAT) ELSE 0 END AS sep_ratio,
    CASE WHEN (t0.hiraend <> 0) THEN tX.hiraend/cast(t0.hiraend AS FLOAT) ELSE 0 END AS hiraend_ratio,
    CASE WHEN (t0.sepbeg <> 0) THEN tX.sepbeg/cast(t0.sepbeg AS FLOAT) ELSE 0 END AS sepbeg_ratio,
    CASE WHEN (t0.hiraendrepl <> 0) THEN tX.hiraendrepl/cast(t0.hiraendrepl AS FLOAT) ELSE 0 END AS hiraendrepl_ratio,
    CASE WHEN (t0.hiraendr <> 0) THEN tX.hiraendr/cast(t0.hiraendr AS FLOAT) ELSE 0 END AS hiraendr_ratio,
    CASE WHEN (t0.sepbegr <> 0) THEN tX.sepbegr/cast(t0.sepbegr AS FLOAT) ELSE 0 END AS sepbegr_ratio,
    CASE WHEN (t0.hiraendreplr <> 0) THEN tX.hiraendreplr/cast(t0.hiraendreplr AS FLOAT) ELSE 0 END AS hiraendreplr_ratio,
    CASE WHEN (t0.hirns <> 0) THEN tX.hirns/cast(t0.hirns AS FLOAT) ELSE 0 END AS hirns_ratio,
    CASE WHEN (t0.seps <> 0) THEN tX.seps/cast(t0.seps AS FLOAT) ELSE 0 END AS seps_ratio,
    CASE WHEN (t0.sepsnx <> 0) THEN tX.sepsnx/cast(t0.sepsnx AS FLOAT) ELSE 0 END AS sepsnx_ratio,
    CASE WHEN (t0.turnovrs <> 0) THEN tX.turnovrs/cast(t0.turnovrs AS FLOAT) ELSE 0 END AS turnovrs_ratio,
    CASE WHEN (t0.frmjbgn <> 0) THEN tX.frmjbgn/cast(t0.frmjbgn AS FLOAT) ELSE 0 END AS frmjbgn_ratio,
    CASE WHEN (t0.frmjbls <> 0) THEN tX.frmjbls/cast(t0.frmjbls AS FLOAT) ELSE 0 END AS frmjbls_ratio,
    CASE WHEN (t0.frmjbc <> 0) THEN tX.frmjbc/cast(t0.frmjbc AS FLOAT) ELSE 0 END AS frmjbc_ratio,
    CASE WHEN (t0.frmjbgns <> 0) THEN tX.frmjbgns/cast(t0.frmjbgns AS FLOAT) ELSE 0 END AS frmjbgns_ratio,
    CASE WHEN (t0.frmjblss <> 0) THEN tX.frmjblss/cast(t0.frmjblss AS FLOAT) ELSE 0 END AS frmjblss_ratio,
    CASE WHEN (t0.frmjbcs <> 0) THEN tX.frmjbcs/cast(t0.frmjbcs AS FLOAT) ELSE 0 END AS frmjbcs_ratio,
    CASE WHEN (t0.earns <> 0) THEN tX.earns/cast(t0.earns AS FLOAT) ELSE 0 END AS earns_ratio,
    CASE WHEN (t0.earnbeg <> 0) THEN tX.earnbeg/cast(t0.earnbeg AS FLOAT) ELSE 0 END AS earnbeg_ratio,
    CASE WHEN (t0.earnhiras <> 0) THEN tX.earnhiras/cast(t0.earnhiras AS FLOAT) ELSE 0 END AS earnhiras_ratio,
    CASE WHEN (t0.earnhirns <> 0) THEN tX.earnhirns/cast(t0.earnhirns AS FLOAT) ELSE 0 END AS earnhirns_ratio,
    CASE WHEN (t0.earnseps <> 0) THEN tX.earnseps/cast(t0.earnseps AS FLOAT) ELSE 0 END AS earnseps_ratio,
    CASE WHEN (t0.payroll <> 0) THEN tX.payroll/cast(t0.payroll AS FLOAT) ELSE 0 END AS payroll_ratio

  FROM (

    SELECT 
      geography, 
      year, 
      quarter, 
      industry,
      emp,
      empend,
      emps,
      emptotal,
      empspv,
      hira,
      hirn,
      hirr,
      sep,
      hiraend,
      sepbeg,
      hiraendrepl,
      hiraendr,
      sepbegr,
      hiraendreplr,
      hirns,
      seps,
      sepsnx,
      turnovrs,
      frmjbgn,
      frmjbls,
      frmjbc,
      frmjbgns,
      frmjblss,
      frmjbcs,
      earns,
      earnbeg,
      earnhiras,
      earnhirns,
      earnseps,
      payroll
    FROM interstate_msa_view 
    WHERE (firmage= '0')) AS t0

    INNER JOIN (

      SELECT 
        geography,
        year, 
        quarter, 
        industry, 
        firmage,
        emp,
        empend,
        emps,
        emptotal,
        empspv,
        hira,
        hirn,
        hirr,
        sep,
        hiraend,
        sepbeg,
        hiraendrepl,
        hiraendr,
        sepbegr,
        hiraendreplr,
        hirns,
        seps,
        sepsnx,
        turnovrs,
        frmjbgn,
        frmjbls,
        frmjbc,
        frmjbgns,
        frmjblss,
        frmjbcs,
        earns,
        earnbeg,
        earnhiras,
        earnhirns,
        earnseps,
        payroll
      FROM interstate_msa_view 
      WHERE (firmage <> '0')) tX

    ON ((t0.geography = tX.geography) AND
        (t0.industry  = tX.industry) AND
        (t0.year      = tX.year) AND
        (t0.quarter   = tX.quarter)) 
 ); --END INSERT INTO measure_ratios_by_firmage FROM interstate_msa_view


--Insert the average values across all MSAs.
--NOTE: MSA '00000' is used to represent the national average.
INSERT INTO measure_ratios_by_firmage (
    geography,
    year, 
    quarter,
    industry, 
    firmage, 

    emp_ratio,
    empend_ratio,
    emps_ratio,
    emptotal_ratio,
    empspv_ratio,
    hira_ratio,
    hirn_ratio,
    hirr_ratio,
    sep_ratio,
    hiraend_ratio,
    sepbeg_ratio,
    hiraendrepl_ratio,
    hiraendr_ratio,
    sepbegr_ratio,
    hiraendreplr_ratio,
    hirns_ratio,
    seps_ratio,
    sepsnx_ratio,
    turnovrs_ratio,
    frmjbgn_ratio,
    frmjbls_ratio,
    frmjbc_ratio,
    frmjbgns_ratio,
    frmjblss_ratio,
    frmjbcs_ratio,
    earns_ratio,
    earnbeg_ratio,
    earnhiras_ratio,
    earnhirns_ratio,
    earnseps_ratio,
    payroll_ratio 
) (SELECT 
    '00000' as geography,
    year as year, 
    quarter as quarter,
    industry as industry, 
    firmage as firmage, 

    avg(emp_ratio) AS emp_ratio,
    avg(empend_ratio) AS empend_ratio,
    avg(emps_ratio) AS emps_ratio,
    avg(emptotal_ratio) AS emptotal_ratio,
    avg(empspv_ratio) AS empspv_ratio,
    avg(hira_ratio) AS hira_ratio,
    avg(hirn_ratio) AS hirn_ratio,
    avg(hirr_ratio) AS hirr_ratio,
    avg(sep_ratio) AS sep_ratio,
    avg(hiraend_ratio) AS hiraend_ratio,
    avg(sepbeg_ratio) AS sepbeg_ratio,
    avg(hiraendrepl_ratio) AS hiraendrepl_ratio,
    avg(hiraendr_ratio) AS hiraendr_ratio,
    avg(sepbegr_ratio) AS sepbegr_ratio,
    avg(hiraendreplr_ratio) AS hiraendreplr_ratio,
    avg(hirns_ratio) AS hirns_ratio,
    avg(seps_ratio) AS seps_ratio,
    avg(sepsnx_ratio) AS sepsnx_ratio,
    avg(turnovrs_ratio) AS turnovrs_ratio,
    avg(frmjbgn_ratio) AS frmjbgn_ratio,
    avg(frmjbls_ratio) AS frmjbls_ratio,
    avg(frmjbc_ratio) AS frmjbc_ratio,
    avg(frmjbgns_ratio) AS frmjbgns_ratio,
    avg(frmjblss_ratio) AS frmjblss_ratio,
    avg(frmjbcs_ratio) AS frmjbcs_ratio,
    avg(earns_ratio) AS earns_ratio,
    avg(earnbeg_ratio) AS earnbeg_ratio,
    avg(earnhiras_ratio) AS earnhiras_ratio,
    avg(earnhirns_ratio) AS earnhirns_ratio,
    avg(earnseps_ratio) AS earnseps_ratio,
    avg(payroll_ratio) AS payroll_ratio 
  FROM measure_ratios_by_firmage
  GROUP BY year, quarter, industry, firmage 
);


DROP INDEX IF EXISTS measure_ratios_by_firmage_index;

CREATE INDEX measure_ratios_by_firmage_index 
  ON measure_ratios_by_firmage (geography, year, quarter)
  WITH (fillfactor = 100);

CLUSTER VERBOSE measure_ratios_by_firmage USING measure_ratios_by_firmage_index;

