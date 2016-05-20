/*
 * This table associates aggregation categories with the category label 
 * that represents the total across all of the category groups. 
 * 
 * For example, for agegrp, using "WHERE agegrp = 'A00'" in a query 
 * will return the measure values summed across all age groups.  
*/

module.exports = { 
  'agegrp'      : 'A00',
  'education'   : 'E0',
  'ethnicity'   : 'A0',
  'firmage'     : '0',
  'firmsize'    : '0',
  'industry'    : '00',  // All NAICS Sectors
  'ownercode'   : 'A05', // Only private in QWI.
  'periodicity' : 'Q',   // Annual not part of QWI
  'race'        : 'A0',  
  'seasonadj'   : 'U',   // Only unadjusted available in QWI.
  'sex'         : '0',
}
