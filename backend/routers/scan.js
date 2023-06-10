const saveModel = require("../plugins/save-model-handler");
const errorGenerator = require("../plugins/error-generator");
const dbError = require("../plugins/dbError");
const { Op } = require("sequelize");
const candidatePermissions = require('../plugins/permissions/candidate');
const { isUUID, isDate } = require("validator")

module.exports = function (passport, sequelize, mailer, middlewares, roles, codes) {
    const express = require('express')
    const router = express.Router()

    router.get('/candidate', middlewares.requiredField.query(['candidateId']), middlewares.includeToReq.candidate(sequelize,null,null,null)["req.query.candidateId"], async function (req, res, next) {
        if(req.user && req.user.role>=roles.signer){
            await req.candidate.createAttendance({
                SignerId: req.user.id
            })
    
            return res.send(`<!DOCTYPE html><html><head><title>QR-beolvasás</title><meta charset="UTF-8" /><meta http-equiv="refresh" content="2; URL=https://misenaplo.hu/attendance/${req.query.candidateId}" /></head><body><h1>${req.candidate.name} OK, rögzítve</h1></body></html>`)    
        }
        else {
            return res.send(`<!DOCTYPE html><html><head><title>QR-beolvasás</title><meta charset="UTF-8" /><meta http-equiv="refresh" content="1; URL=https://misenaplo.hu/attendance/${req.query.candidateId}" /></head><body><h1>Átirányítás a miserészvételi adataidhoz folyamatban</h1></body></html>`)    
        }
    })

    router.delete('/candidate/:id', middlewares.roleCheck(roles.signer), middlewares.includeToReq.candidate(sequelize,null,null,null)["req.params.id"], async function (req, res, next) {
        const minutes = 20 * (60 * 1000)
        var attendance = await req.candidate.getAttendances({
            where: {
                SignerId: req.user.id,
                createdAt: {
                   [Op.gte]: new Date(Date.now()-minutes)
                }
            }
        })
        if(attendance.length==0) {
            return res.send({success: false, error: null, data: null})
        }
        attendance.forEach(a => {
            a.destroy();
        });

        res.send({success: true, error: null, data: null})
    })

    return router
}
