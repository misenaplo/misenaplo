const codes = require("./error-codes");
const errorGenerator = require("./error-generator");
var bodyFieldChecks = {}

module.exports.body = function (fields) {
    return bodyFieldChecks[fields] || (bodyFieldChecks[fields] = function (req, res, next) {
        var missingFields = [];
        fields.forEach((f) => {
            if (!(f in req.body)) {
                missingFields.push(f)
            }
        })
        if (missingFields.length > 0) {
            return res.status(400).json(errorGenerator.MALFORMED_BODY(missingFields))
        } else {
            next();
        }
    })
}

var queryFieldChecks = {}

module.exports.query = function (fields) {
    return queryFieldChecks[fields] || (queryFieldChecks[fields] = function (req, res, next) {
        var missingFields = [];
        fields.forEach((f) => {
            if (!(f in req.query)) {
                missingFields.push(f)
            }
        })
        if (missingFields.length > 0) {
            return res.status(400).json(errorGenerator.MALFORMED_BODY(missingFields));
        } else {
            next();
        }
    })
}

var paramsFieldChecks = {}

module.exports.params = function (fields) {
    return paramsFieldChecks[fields] || (paramsFieldChecks[fields] = function (req, res, next) {
        var missingFields = [];
        fields.forEach(f => {
            if (!(f in req.params)) missingFields.push(f)
        })
        if (missingFields.length > 0) {
            return res.status(400).json(errorGenerator.MALFORMED_BODY(missingFields));
        } else next()
    })
}
