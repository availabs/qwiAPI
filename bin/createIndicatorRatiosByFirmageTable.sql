DROP TABLE IF EXISTS indicator_ratios_by_firmage;

CREATE TABLE indicator_ratios_by_firmage AS
  SELECT 
    tX.geography as geography,
    tX.year as year, 
    tX.quarter as quarter,
    tX.industry as industry, 
    tX.firmage as firmage, 

    tX.emp/cast(t0.emp AS FLOAT) AS emp_ratio,
    tX.empend/cast(t0.empend AS FLOAT) AS empend_ratio,
    tX.emps/cast(t0.emps AS FLOAT) AS emps_ratio,
    tX.emptotal/cast(t0.emptotal AS FLOAT) AS emptotal_ratio,
    tX.empspv/cast(t0.empspv AS FLOAT) AS empspv_ratio,
    tX.hira/cast(t0.hira AS FLOAT) AS hira_ratio,
    tX.hirn/cast(t0.hirn AS FLOAT) AS hirn_ratio,
    tX.hirr/cast(t0.hirr AS FLOAT) AS hirr_ratio,
    tX.sep/cast(t0.sep AS FLOAT) AS sep_ratio,
    tX.hiraend/cast(t0.hiraend AS FLOAT) AS hiraend_ratio,
    tX.sepbeg/cast(t0.sepbeg AS FLOAT) AS sepbeg_ratio,
    tX.hiraendrepl/cast(t0.hiraendrepl AS FLOAT) AS hiraendrepl_ratio,
    tX.hiraendr/cast(t0.hiraendr AS FLOAT) AS hiraendr_ratio,
    tX.sepbegr/cast(t0.sepbegr AS FLOAT) AS sepbegr_ratio,
    tX.hiraendreplr/cast(t0.hiraendreplr AS FLOAT) AS hiraendreplr_ratio,
    tX.hirns/cast(t0.hirns AS FLOAT) AS hirns_ratio,
    tX.seps/cast(t0.seps AS FLOAT) AS seps_ratio,
    tX.sepsnx/cast(t0.sepsnx AS FLOAT) AS sepsnx_ratio,
    tX.turnovrs/cast(t0.turnovrs AS FLOAT) AS turnovrs_ratio,
    tX.frmjbgn/cast(t0.frmjbgn AS FLOAT) AS frmjbgn_ratio,
    tX.frmjbls/cast(t0.frmjbls AS FLOAT) AS frmjbls_ratio,
    tX.frmjbc/cast(t0.frmjbc AS FLOAT) AS frmjbc_ratio,
    tX.frmjbgns/cast(t0.frmjbgns AS FLOAT) AS frmjbgns_ratio,
    tX.frmjblss/cast(t0.frmjblss AS FLOAT) AS frmjblss_ratio,
    tX.frmjbcs/cast(t0.frmjbcs AS FLOAT) AS frmjbcs_ratio,
    tX.earns/cast(t0.earns AS FLOAT) AS earns_ratio,
    tX.earnbeg/cast(t0.earnbeg AS FLOAT) AS earnbeg_ratio,
    tX.earnhiras/cast(t0.earnhiras AS FLOAT) AS earnhiras_ratio,
    tX.earnhirns/cast(t0.earnhirns AS FLOAT) AS earnhirns_ratio,
    tX.earnseps/cast(t0.earnseps AS FLOAT) AS earnseps_ratio,
    tX.payroll/cast(t0.payroll AS FLOAT) AS payroll_ratio

  FROM (
    SELECT geography, year, quarter, industry,
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
    WHERE (firmage= '0') AND (sex = '0') AND (agegrp = 'A00') AND 
          (emp <> 0)          AND
          (empend <> 0)       AND
          (emps <> 0)         AND
          (emptotal <> 0)     AND
          (empspv <> 0)       AND
          (hira <> 0)         AND
          (hirn <> 0)         AND
          (hirr <> 0)         AND
          (sep <> 0)          AND
          (hiraend <> 0)      AND
          (sepbeg <> 0)       AND
          (hiraendrepl <> 0)  AND
          (hiraendr <> 0)     AND
          (sepbegr <> 0)      AND
          (hiraendreplr <> 0) AND
          (hirns <> 0)        AND
          (seps <> 0)         AND
          (sepsnx <> 0)       AND
          (turnovrs <> 0)     AND
          (frmjbgn <> 0)      AND
          (frmjbls <> 0)      AND
          (frmjbc <> 0)       AND
          (frmjbgns <> 0)     AND
          (frmjblss <> 0)     AND
          (frmjbcs <> 0)      AND
          (earns <> 0)        AND
          (earnbeg <> 0)      AND
          (earnhiras <> 0)    AND
          (earnhirns <> 0)    AND
          (earnseps <> 0)     AND
          (payroll <> 0))  t0
    INNER JOIN (
      SELECT geography, year, quarter, industry, firmage,
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
      WHERE (firmage <> '0') AND (sex = '0') AND (agegrp = 'A00')) tX
    ON ((t0.geography = tX.geography) AND
        (t0.industry  = tX.industry) AND
        (t0.year      = tX.year) AND
        (t0.quarter   = tX.quarter))
;


DROP INDEX IF EXISTS indicator_ratios_by_firmage_index;
CREATE INDEX indicator_ratios_by_firmage_index ON indicator_ratios_by_firmage (geography, year, quarter);

CLUSTER indicator_ratios_by_firmage USING indicator_ratios_by_firmage_index;

