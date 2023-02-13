const errorGenerator = require("./error-generator");


module.exports = async function (res, errorLog) {
    if (errorLog.result !== true && errorLog.err == "ValidationError") {
        res.status(400)
        return res.json(errorGenerator.FAILED_VALIDATION(errorLog.result));
    } else if (errorLog.result !== true && errorLog.err == "UniqueConstraintError") {
        res.status(400)
        return res.json(errorGenerator.DUPLICATE_ENTRY(errorLog.result));
    }
}