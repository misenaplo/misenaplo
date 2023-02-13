const codes = require("./error-codes");

var roleCheck = [];
module.exports = function (minRole) {
    return roleCheck[minRole] || (roleCheck[minRole] = function (req, res, next) {
        if (req.user.role >= minRole) next();
        else {
            res.status(403)
            return res.json({ success: false, error: { code: codes.INSUFFICIENT_PRIVILEGES }, data: null })
        }
    })
}
