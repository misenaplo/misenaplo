const codes = require("../../error-codes");
const check = require("../../permissions/user").check;
module.exports = function (where, permission) {
    return  async function (req, res, next) {
        if(!req.user2) {
            res.status(500).json({success: false, error: {code: codes.UNKNOWN_ERROR}, data: null})
        } else {
            check(req.user2, req.user, permission).then(async (hasPermission) => {
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