const errorGenerator = require("../plugins/error-generator");
const { isString } = require("../plugins/type-check");
const bcrypt = require("bcryptjs");


module.exports = function (req, res, next) {
  if (!isString(req.body.password)||req.body.password.length>50||!bcrypt.compareSync(req.body.password, req.user.password)) {
    res.status(403);
    return res.json(errorGenerator.INVALID_CREDENTIALS());
  }
  else next()
}
