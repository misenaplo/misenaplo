const saveModel = require("../plugins/save-model-handler");
const errorGenerator = require("../plugins/error-generator");
const dbError = require("../plugins/dbError");
const { Op } = require("sequelize");
const candidatePermissions = require('../plugins/permissions/candidate');
const { isUUID, isDate } = require("validator")

module.exports = function (passport, sequelize, mailer, middlewares, roles, codes) {
    const express = require('express')
    const router = express.Router()

    router.get('/candidate', middlewares.requiredField.query(["begin", "end", 'candidateId']), middlewares.includeToReq.candidate(sequelize,null,null,null)["req.query.candidateId"], async function (req, res, next) {
        const invalidFields =[];
        ["begin", "end"].forEach(p => {
            if(!isDate(req.query[p])) invalidFields.push(`req.query.${p}`)
        });
        if(invalidFields.length>0) {
            return res.status(400).json(errorGenerator.FAILED_VALIDATION(invalidFields));
        }
        const attendances = await req.candidate.getAttendances({
            where: {
                createdAt: {
                    [Op.between]: [req.query.begin, `${req.query.end} 23:59:59`]
                }
            },
            include: [
                {
                    model: sequelize.models.User,
                    as: 'Signer',
                    attributes: ['fullname', 'lastname', 'firstname', 'title', ...(req.user?['id']:[])]
                }
            ],
            attributes: ['id', 'createdAt', 'RewardImageMediumId', 'solutionTime'],
            order: ["createdAt"]
        });
        res.json({success: true, error: null, data: {attendances, ...(req.query.withName?{candidateName: req.candidate.name}:{})}})
    })

    return router
}
