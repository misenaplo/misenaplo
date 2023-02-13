const codes = require("./error-codes.js");

module.exports = function (err, req, res, next) {
    if (err === "USER_GONE") {
        req.logout();
        res.status(500);
        return res.json({ success: false, error: { code: codes.INSTANCE_NOT_FOUND, message: "A felhasználó eltűnt" }, data: null })
    } else {
        next()
    }
}