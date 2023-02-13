const codes = require("../../error-codes");
const check = require("../../permissions/parish").check;
module.exports = function (where, permission) {
    return  async function (req, res, next) {
        if(!req.parish) {
            res.status(500).json({success: false, error: {code: codes.UNKNOWN_ERROR}, data: null})
        } else {
            check(req.parish, req.user, permission).then(async (hasPermission) => {
                if(hasPermission) {
                    next();
                }
                else {
                    res.status(403).json({success: false, error: {code: codes.INSUFFICIENT_PRIVILEGES}, data: null})
                }
            })    
        }


    }
}