DROP MATERIALIZED VIEW IF EXISTS msa_eea_view;

CREATE MATERIALIZED VIEW msa_eea_view
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
  (2 * SUM(hiraend) / cast((SUM(emp) + SUM(empend)) AS FLOAT)) AS hiraendr,
  ((2 * SUM(sepbeg)) / cast((SUM(emp) + SUM(empend)) AS FLOAT)) AS sepbegr,
  ((2 * (SUM(hiraend) - SUM(frmjbgn))) / cast((SUM(emp) + SUM(empend)) AS FLOAT )) AS hiraendreplr,
  SUM(hiras) AS hiras,
  SUM(hirns) AS hirns,
  SUM(seps) AS seps,
  SUM(sepsnx) AS sepsnx,
  ((SUM(hiras) + SUM(sepsnx)) / cast((2 * SUM(emps)) AS FLOAT)) AS turnovrs,
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
WHERE (sex = '0') AND (agegrp = 'A00') and (char_length(geography) > 2)
GROUP BY substring(geography, 3, 5), year, quarter, industry, firmage
HAVING COUNT(emp) > 1;

