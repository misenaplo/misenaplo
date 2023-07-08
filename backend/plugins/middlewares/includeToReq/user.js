const {isUUID}  = require("validator");
const errorGenerator = require("../../error-generator");

module.exports = function (sequelize, attributes, where) {
    if(attributes===null) {
        attributes = ["id", "email", "role", "title", "fullname", "lastname", "firstname"];
    }
    if(where===null) where = {};
    return {
        "req.params.id": async function (req,res,next) {
            if(!isUUID(req.params.id,4)) {
                res.status(400).json(errorGenerator.FAILED_VALIDATION(["req.params.id"]));
            }
            else {
                sequelize.models.User.findOne({where: {id: req.params.id, ...where}, attributes}).then(async (user) => {
                    if(!user) {
                        res.status(404).json(errorGenerator.INSTANCE_NOT_FOUND("Felhasználó nem található"));
                    }
                    else {
                        req.user2 = user;
                        next();
                    }
                })
            }
        },
        "req.body.userId": async function (req,res,next) {
            if(!isUUID(req.body.userId,4)) {
                res.status(400).json(errorGenerator.FAILED_VALIDATION(["req.body.userId"]));
            }
            else {
                sequelize.models.User.findOne({where: {id: req.body.userId, ...where}, attributes}).then(async (user) => {
                    if(!user) {
                        res.status(404).json(errorGenerator.INSTANCE_NOT_FOUND("Felhasználó nem található"));
                    }
                    else {
                        req.user2 = user;
                        next();
                    }
                })
            }
        }
    }
}