const codes = require("./error-codes");

module.exports = function(req, res, next) {
	if (!req.user) {
		res.status(401)
		return res.json({success: false, error: {code: codes.NOT_LOGGED_IN, message: "Nem vagy bejelentkezve!"}, data: null})
	} else {
		return next(null)
	}
}
