DROP MATERIALIZED VIEW IF EXISTS interstate_msa_view_2;

CREATE MATERIALIZED VIEW interstate_msa_view_2
AS SELECT 
    substring(geography FROM 3 for 5) AS geography, 
    year, 
    quarter, 
    industry,
    firmage,

    SUM(emp) AS emp,
    SUM(empend) AS empend,
    SUM(emps) AS emps,
    SUM(emptotal) AS emptotal,
    SUM(empspv) AS empspv,
    SUM(hira) AS hira,
    SUM(hirn) AS hirn,
    SUM(hirr) AS hirr,
    SUM(sep) AS sep,
    SUM(hiraend) AS hiraend,
    SUM(sepbeg) AS sepbeg,
    (SUM(hiraend) - SUM(frmjbgn)) AS hiraendrepl,
    (2 * SUM(hiraend) / nullif(cast((SUM(emp) + SUM(empend)) AS FLOAT), 0)) AS hiraendr,
    ((2 * SUM(sepbeg)) / nullif(cast((SUM(emp) + SUM(empend)) AS FLOAT), 0)) AS sepbegr,
    ((2 * (SUM(hiraend) - SUM(frmjbgn))) / nullif(cast((SUM(emp) + SUM(empend)) AS FLOAT ),0)) AS hiraendreplr,
    SUM(hiras) AS hiras,
    SUM(hirns) AS hirns,
    SUM(seps) AS seps,
    SUM(sepsnx) AS sepsnx,
    ((SUM(hiras) + SUM(sepsnx)) / nullif(cast((2 * SUM(emps)) AS FLOAT), 0)) AS turnovrs,
    SUM(frmjbgn) AS frmjbgn,
    SUM(frmjbls) AS frmjbls,
    SUM(frmjbc) AS frmjbc,
    SUM(frmjbgns) AS frmjbgns,
    SUM(frmjblss) AS frmjblss,
    SUM(frmjbcs) AS frmjbcs,
    SUM(earns) AS earns,
    SUM(earnbeg) AS earnbeg,
    SUM(earnhiras) AS earnhiras,
    SUM(earnhirns) AS earnhirns,
    SUM(earnseps) AS earnseps,
    SUM(payroll) AS payroll 

  FROM sa_fa_gm_ns_op_u 
  WHERE (sex = '0') AND (agegrp = 'A00') and (substring(geography, 3, 5) IN (
    SELECT substring(geography, 3, 5)
    FROM (select distinct t.geography from sa_fa_gm_ns_op_u as t) AS t2 
    GROUP BY substring(geography, 3, 5)
    HAVING COUNT(*) > 1 
    ORDER BY substring(geography, 3, 5)
  ))
  GROUP BY substring(geography, 3, 5), year, quarter, industry, firmage;

DROP INDEX IF EXISTS interstate_msa_view_index;
CREATE INDEX interstate_msa_view_index ON interstate_msa_view_2 (geography, year, quarter) WITH (fillfactor = 100);

CLUSTER VERBOSE interstate_msa_view_2 USING interstate_msa_view_index;
 
