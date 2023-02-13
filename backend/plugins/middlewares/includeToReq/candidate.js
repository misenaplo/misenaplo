const { isUUID } = require("validator");
const errorGenerator = require("../../error-generator");

module.exports = function (sequelize, attributes, where, include) {
    if (attributes === null) {
        attributes = ["id", "name"];
    }
    if (where === null) where = {};
    if(include===null||include===undefined) include=[];
    return {
        "req.params.id": async function (req, res, next) {
            if (!isUUID(req.params.id, 4)) {
                res.status(400).json(errorGenerator.FAILED_VALIDATION(["req.params.id"]));
            }
            else {
                sequelize.models.Candidate.findOne({
                    where: { id: req.params.id, ...where }, 
                    attributes,
                    include
                }).then(async (candidate) => {
                    if (!candidate) {
                        res.status(404).json(errorGenerator.INSTANCE_NOT_FOUND("Csoporttag nem található"));
                    }
                    else {
                        req.candidate = candidate;
                        next();
                    }
                })
            }
        },
        "req.body.candidateId": async function (req, res, next) {
            if (!isUUID(req.body.candidateId, 4)) {
                res.status(400).json(errorGenerator.FAILED_VALIDATION(["req.body.candidateId"]));
            }
            else {
                    sequelize.models.Candidate.findOne({
                        where: { id: req.body.candidateId, ...where }, 
                        attributes,
                        include
                    }).then(async (candidate) => {
                        if (!candidate) {
                            res.status(404).json(errorGenerator.INSTANCE_NOT_FOUND("Csoporttag nem található"));
                        }
                        else {
                            req.candidate = candidate;
                            next();
                        }
                    })
            }
        },
        "req.query.candidateId": async function (req, res, next) {
            if (!isUUID(req.query.candidateId, 4)) {
                res.status(400).json(errorGenerator.FAILED_VALIDATION(["req.query.candidateId"]));
            }
            else {
                    sequelize.models.Candidate.findOne({
                        where: { id: req.query.candidateId, ...where }, 
                        attributes,
                        include
                    }).then(async (candidate) => {
                        if (!candidate) {
                            res.status(404).json(errorGenerator.INSTANCE_NOT_FOUND("Csoporttag nem található"));
                        }
                        else {
                            req.candidate = candidate;
                            next();
                        }
                    })
            }
        }
    }
}