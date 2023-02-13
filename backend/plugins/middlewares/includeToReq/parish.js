const {isUUID}  = require("validator");
const errorGenerator = require("../../error-generator");

module.exports = function (parishModel, attributes, where) {
    if(attributes===null) {
        attributes = ["id", "name", "email", "phone", "location"];
    }
    if(where===null) where = {};
    return {
        "req.params.id": async function (req,res,next) {
            if(!isUUID(req.params.id,4)) {
                res.status(400).json(errorGenerator.FAILED_VALIDATION(["req.params.id"]));
            }
            else {
                parishModel.findOne({where: {id: req.params.id, ...where}, attributes}).then(async (parish) => {
                    if(!parish) {
                        res.status(404).json(errorGenerator.INSTANCE_NOT_FOUND("Plébánia nem található"));
                    }
                    else {
                        req.parish = parish;
                        next();
                    }
                })
            }
        },
        "req.body.parishId": async function (req,res,next) {
            if(!isUUID(req.body.parishId,4)) {
                res.status(400).json(errorGenerator.FAILED_VALIDATION(["req.params.id"]));
            }
            else {
                parishModel.findOne({where: {id: req.body.parishId, ...where}, attributes}).then(async (parish) => {
                    if(!parish) {
                        res.status(404).json(errorGenerator.INSTANCE_NOT_FOUND("Plébánia nem található"));
                    }
                    else {
                        req.parish = parish;
                        next();
                    }
                })
            }
        }
    }
}