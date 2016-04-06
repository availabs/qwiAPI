'use strict'

/*
    This API is build to support only the Metropolitan/Micropolitan level data.
    
        This entails the following tables:

            rh_fa_gm_ns_op_u
            rh_fs_gm_ns_op_u

            sa_fa_gm_ns_op_u
            sa_fs_gm_ns_op_u

            se_fa_gm_ns_op_u
            se_fs_gm_ns_op_u

    At the Metro/Micropolitan level, only sector level data ('ns') is available.
*/


module.exports = {

    // NOTE: Assumes the requested categories were already validated.
    getTableName : (categories) => {

        let reqCatObj = categories.reduce((acc, cat) => { 
                                      acc[cat] = 1
                                      return acc 
                                  }, {}) 

        let tableName
       

        // Worker characteristics
        if (reqCatObj.agegrp) {
            tableName = 'sa'
        } else if (reqCatObj.education) {
            tableName = 'se'
        } else if (reqCatObj.race || reqCatObj.ethnicity) {
            tableName = 'rh'
        } else  {
            tableName = 'sa' 
        }

        // Firm characteristics
        if (reqCatObj.firmage) {
            tableName += '_fa'
        } else {
            tableName += '_fs'
        }

        return (tableName + '_gm_ns_op_u')
    }

}
