// http://lehd.ces.census.gov/data/schema/latest/lehd_public_use_schema.html#_identifiers_for_qwi
// The following table of identifiers to value lengths is used in database table CREATE commands
// as well as in the API server to know how long each query predicate value should be in the 
// dynamic routes. 


module.exports = {
  periodicity: 1, // Periodicity of report
  seasonadj:   1, // Seasonal Adjustment Indicator
  geo_level:   1, // Group: Geographic level of aggregation
  geography:   7, // Group: Geography code
  ind_level:   1, // Group: Industry level of aggregation
  industry:    5, // Group: Industry code
  ownercode:   3, // Group: Ownership group code
  sex:         1, // Group: Gender code
  agegrp:      3, // Group: Age group code (WIA)
  race:        2, // Group: race
  ethnicity:   2, // Group: ethnicity
  education:   2, // Group: education
  firmage:     1, // Group: Firm Age group
  firmsize:    1, // Group: Firm Size group
  year:        4, // Time: Year
  quarter:     1, // Time: Quarter
}

