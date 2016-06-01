DROP TABLE IF EXISTS startup_firm_ratios;

CREATE TABLE startup_firm_ratios AS
  SELECT 
    agegrp0.geography as geography,
    agegrp0.year as year, 
    agegrp0.quarter as quarter,
    agegrp0.industry as industry, 

    agegrp1.emp/cast(agegrp0.emp AS FLOAT) AS emp_ratio_1,
    agegrp1.empend/cast(agegrp0.empend AS FLOAT) AS empend_ratio_1,
    agegrp1.emps/cast(agegrp0.emps AS FLOAT) AS emps_ratio_1,
    agegrp1.emptotal/cast(agegrp0.emptotal AS FLOAT) AS emptotal_ratio_1,
    agegrp1.empspv/cast(agegrp0.empspv AS FLOAT) AS empspv_ratio_1,
    agegrp1.hira/cast(agegrp0.hira AS FLOAT) AS hira_ratio_1,
    agegrp1.hirn/cast(agegrp0.hirn AS FLOAT) AS hirn_ratio_1,
    agegrp1.hirr/cast(agegrp0.hirr AS FLOAT) AS hirr_ratio_1,
    agegrp1.sep/cast(agegrp0.sep AS FLOAT) AS sep_ratio_1,
    agegrp1.hiraend/cast(agegrp0.hiraend AS FLOAT) AS hiraend_ratio_1,
    agegrp1.sepbeg/cast(agegrp0.sepbeg AS FLOAT) AS sepbeg_ratio_1,
    agegrp1.hiraendrepl/cast(agegrp0.hiraendrepl AS FLOAT) AS hiraendrepl_ratio_1,
    agegrp1.hiraendr/cast(agegrp0.hiraendr AS FLOAT) AS hiraendr_ratio_1,
    agegrp1.sepbegr/cast(agegrp0.sepbegr AS FLOAT) AS sepbegr_ratio_1,
    agegrp1.hiraendreplr/cast(agegrp0.hiraendreplr AS FLOAT) AS hiraendreplr_ratio_1,
    agegrp1.hirns/cast(agegrp0.hirns AS FLOAT) AS hirns_ratio_1,
    agegrp1.seps/cast(agegrp0.seps AS FLOAT) AS seps_ratio_1,
    agegrp1.sepsnx/cast(agegrp0.sepsnx AS FLOAT) AS sepsnx_ratio_1,
    agegrp1.turnovrs/cast(agegrp0.turnovrs AS FLOAT) AS turnovrs_ratio_1,
    agegrp1.frmjbgn/cast(agegrp0.frmjbgn AS FLOAT) AS frmjbgn_ratio_1,
    agegrp1.frmjbls/cast(agegrp0.frmjbls AS FLOAT) AS frmjbls_ratio_1,
    agegrp1.frmjbc/cast(agegrp0.frmjbc AS FLOAT) AS frmjbc_ratio_1,
    agegrp1.frmjbgns/cast(agegrp0.frmjbgns AS FLOAT) AS frmjbgns_ratio_1,
    agegrp1.frmjblss/cast(agegrp0.frmjblss AS FLOAT) AS frmjblss_ratio_1,
    agegrp1.frmjbcs/cast(agegrp0.frmjbcs AS FLOAT) AS frmjbcs_ratio_1,
    agegrp1.earns/cast(agegrp0.earns AS FLOAT) AS earns_ratio_1,
    agegrp1.earnbeg/cast(agegrp0.earnbeg AS FLOAT) AS earnbeg_ratio_1,
    agegrp1.earnhiras/cast(agegrp0.earnhiras AS FLOAT) AS earnhiras_ratio_1,
    agegrp1.earnhirns/cast(agegrp0.earnhirns AS FLOAT) AS earnhirns_ratio_1,
    agegrp1.earnseps/cast(agegrp0.earnseps AS FLOAT) AS earnseps_ratio_1,
    agegrp1.payroll/cast(agegrp0.payroll AS FLOAT) AS payroll_ratio_1,

    agegrp2.emp/cast(agegrp0.emp AS FLOAT) AS emp_ratio_2,
    agegrp2.empend/cast(agegrp0.empend AS FLOAT) AS empend_ratio_2,
    agegrp2.emps/cast(agegrp0.emps AS FLOAT) AS emps_ratio_2,
    agegrp2.emptotal/cast(agegrp0.emptotal AS FLOAT) AS emptotal_ratio_2,
    agegrp2.empspv/cast(agegrp0.empspv AS FLOAT) AS empspv_ratio_2,
    agegrp2.hira/cast(agegrp0.hira AS FLOAT) AS hira_ratio_2,
    agegrp2.hirn/cast(agegrp0.hirn AS FLOAT) AS hirn_ratio_2,
    agegrp2.hirr/cast(agegrp0.hirr AS FLOAT) AS hirr_ratio_2,
    agegrp2.sep/cast(agegrp0.sep AS FLOAT) AS sep_ratio_2,
    agegrp2.hiraend/cast(agegrp0.hiraend AS FLOAT) AS hiraend_ratio_2,
    agegrp2.sepbeg/cast(agegrp0.sepbeg AS FLOAT) AS sepbeg_ratio_2,
    agegrp2.hiraendrepl/cast(agegrp0.hiraendrepl AS FLOAT) AS hiraendrepl_ratio_2,
    agegrp2.hiraendr/cast(agegrp0.hiraendr AS FLOAT) AS hiraendr_ratio_2,
    agegrp2.sepbegr/cast(agegrp0.sepbegr AS FLOAT) AS sepbegr_ratio_2,
    agegrp2.hiraendreplr/cast(agegrp0.hiraendreplr AS FLOAT) AS hiraendreplr_ratio_2,
    agegrp2.hirns/cast(agegrp0.hirns AS FLOAT) AS hirns_ratio_2,
    agegrp2.seps/cast(agegrp0.seps AS FLOAT) AS seps_ratio_2,
    agegrp2.sepsnx/cast(agegrp0.sepsnx AS FLOAT) AS sepsnx_ratio_2,
    agegrp2.turnovrs/cast(agegrp0.turnovrs AS FLOAT) AS turnovrs_ratio_2,
    agegrp2.frmjbgn/cast(agegrp0.frmjbgn AS FLOAT) AS frmjbgn_ratio_2,
    agegrp2.frmjbls/cast(agegrp0.frmjbls AS FLOAT) AS frmjbls_ratio_2,
    agegrp2.frmjbc/cast(agegrp0.frmjbc AS FLOAT) AS frmjbc_ratio_2,
    agegrp2.frmjbgns/cast(agegrp0.frmjbgns AS FLOAT) AS frmjbgns_ratio_2,
    agegrp2.frmjblss/cast(agegrp0.frmjblss AS FLOAT) AS frmjblss_ratio_2,
    agegrp2.frmjbcs/cast(agegrp0.frmjbcs AS FLOAT) AS frmjbcs_ratio_2,
    agegrp2.earns/cast(agegrp0.earns AS FLOAT) AS earns_ratio_2,
    agegrp2.earnbeg/cast(agegrp0.earnbeg AS FLOAT) AS earnbeg_ratio_2,
    agegrp2.earnhiras/cast(agegrp0.earnhiras AS FLOAT) AS earnhiras_ratio_2,
    agegrp2.earnhirns/cast(agegrp0.earnhirns AS FLOAT) AS earnhirns_ratio_2,
    agegrp2.earnseps/cast(agegrp0.earnseps AS FLOAT) AS earnseps_ratio_2,
    agegrp2.payroll/cast(agegrp0.payroll AS FLOAT) AS payroll_ratio_2
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
          (payroll <> 0))  agegrp0
    INNER JOIN (
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
      WHERE (firmage= '1') AND (sex = '0') AND (agegrp = 'A00')) agegrp1
    ON ((agegrp0.geography = agegrp1.geography) AND
        (agegrp0.industry  = agegrp1.industry) AND
        (agegrp0.year      = agegrp1.year) AND
        (agegrp0.quarter   = agegrp1.quarter))
    INNER JOIN (
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
      WHERE (firmage= '1') AND (sex = '0') AND (agegrp = 'A00')) agegrp2
    ON ((agegrp1.geography = agegrp2.geography) AND
        (agegrp1.industry  = agegrp2.industry) AND
        (agegrp1.year      = agegrp2.year) AND
        (agegrp1.quarter   = agegrp2.quarter))
;


DROP INDEX IF EXISTS startup_firm_ratios_index;
CREATE INDEX startup_firm_ratios_index ON startup_firm_ratios (geography, year, quarter);
