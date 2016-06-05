DROP TABLE IF EXISTS indicator_ratios_by_firmage;
DROP MATERIALIZED VIEW IF EXISTS indicator_ratios_by_firmage_view;

CREATE MATERIALIZED VIEW indicator_ratios_by_firmage_view AS
  SELECT 
    tX.geography as geography,
    tX.year as year, 
    tX.quarter as quarter,
    tX.industry as industry, 
    tX.firmage as firmage, 

    tX.emp/NULLIF(cast(t0.emp AS FLOAT), 0) AS emp_ratio,
    tX.empend/NULLIF(cast(t0.empend AS FLOAT), 0) AS empend_ratio,
    tX.emps/NULLIF(cast(t0.emps AS FLOAT), 0) AS emps_ratio,
    tX.emptotal/NULLIF(cast(t0.emptotal AS FLOAT), 0) AS emptotal_ratio,
    tX.empspv/NULLIF(cast(t0.empspv AS FLOAT), 0) AS empspv_ratio,
    tX.hira/NULLIF(cast(t0.hira AS FLOAT), 0) AS hira_ratio,
    tX.hirn/NULLIF(cast(t0.hirn AS FLOAT), 0) AS hirn_ratio,
    tX.hirr/NULLIF(cast(t0.hirr AS FLOAT), 0) AS hirr_ratio,
    tX.sep/NULLIF(cast(t0.sep AS FLOAT), 0) AS sep_ratio,
    tX.hiraend/NULLIF(cast(t0.hiraend AS FLOAT), 0) AS hiraend_ratio,
    tX.sepbeg/NULLIF(cast(t0.sepbeg AS FLOAT), 0) AS sepbeg_ratio,
    tX.hiraendrepl/NULLIF(cast(t0.hiraendrepl AS FLOAT), 0) AS hiraendrepl_ratio,
    tX.hiraendr/NULLIF(cast(t0.hiraendr AS FLOAT), 0) AS hiraendr_ratio,
    tX.sepbegr/NULLIF(cast(t0.sepbegr AS FLOAT), 0) AS sepbegr_ratio,
    tX.hiraendreplr/NULLIF(cast(t0.hiraendreplr AS FLOAT), 0) AS hiraendreplr_ratio,
    tX.hirns/NULLIF(cast(t0.hirns AS FLOAT), 0) AS hirns_ratio,
    tX.seps/NULLIF(cast(t0.seps AS FLOAT), 0) AS seps_ratio,
    tX.sepsnx/NULLIF(cast(t0.sepsnx AS FLOAT), 0) AS sepsnx_ratio,
    tX.turnovrs/NULLIF(cast(t0.turnovrs AS FLOAT), 0) AS turnovrs_ratio,
    tX.frmjbgn/NULLIF(cast(t0.frmjbgn AS FLOAT), 0) AS frmjbgn_ratio,
    tX.frmjbls/NULLIF(cast(t0.frmjbls AS FLOAT), 0) AS frmjbls_ratio,
    tX.frmjbc/NULLIF(cast(t0.frmjbc AS FLOAT), 0) AS frmjbc_ratio,
    tX.frmjbgns/NULLIF(cast(t0.frmjbgns AS FLOAT), 0) AS frmjbgns_ratio,
    tX.frmjblss/NULLIF(cast(t0.frmjblss AS FLOAT), 0) AS frmjblss_ratio,
    tX.frmjbcs/NULLIF(cast(t0.frmjbcs AS FLOAT), 0) AS frmjbcs_ratio,
    tX.earns/NULLIF(cast(t0.earns AS FLOAT), 0) AS earns_ratio,
    tX.earnbeg/NULLIF(cast(t0.earnbeg AS FLOAT), 0) AS earnbeg_ratio,
    tX.earnhiras/NULLIF(cast(t0.earnhiras AS FLOAT), 0) AS earnhiras_ratio,
    tX.earnhirns/NULLIF(cast(t0.earnhirns AS FLOAT), 0) AS earnhirns_ratio,
    tX.earnseps/NULLIF(cast(t0.earnseps AS FLOAT), 0) AS earnseps_ratio,
    tX.payroll/NULLIF(cast(t0.payroll AS FLOAT), 0) AS payroll_ratio

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
    WHERE (firmage= '0') AND (sex = '0') AND (agegrp = 'A00')) t0
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


DROP INDEX IF EXISTS indicator_ratios_by_firmage_view_index;

CREATE INDEX indicator_ratios_by_firmage_view_index 
ON indicator_ratios_by_firmage_view (geography, year, quarter)
WITH (fillfactor = 100);

CLUSTER indicator_ratios_by_firmage_view USING indicator_ratios_by_firmage_view_index;

