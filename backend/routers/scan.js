const saveModel = require("../plugins/save-model-handler");
const errorGenerator = require("../plugins/error-generator");
const dbError = require("../plugins/dbError");
const { Op, random } = require("sequelize");
const candidatePermissions = require('../plugins/permissions/candidate');
const { isUUID, isDate } = require("validator")

module.exports = function (passport, sequelize, mailer, middlewares, roles, codes) {
    const express = require('express')
    const router = express.Router()

    router.get('/candidate', middlewares.requiredField.query(['candidateId']), middlewares.includeToReq.candidate(sequelize,null,null,null)["req.query.candidateId"], async function (req, res, next) {
        const minutes = 20 * (60 * 1000)
        if(req.user && req.user.role>=roles.signer){
            if(req.session.selectedGroup) {
                const group = await sequelize.models.Group.findOne({where: {
                    id: req.session.selectedGroup.id
                }})
                await req.candidate.addGroup(group);
                return res.send(`<!DOCTYPE html><html><head><title>QR-beolvasás</title><meta charset="UTF-8" /><meta http-equiv="refresh" content="2; URL=https://misenaplo.hu/group/${req.session.selectedGroup.id}" /></head><body><h1>${req.candidate.name} OK, hozzáadva a(z) ${req.session.selectedGroup.name} csoporthoz.</h1></body></html>`)    

            }
            var attendance = await req.candidate.getAttendances({
                where: {
                    SignerId: req.user.id,
                    createdAt: {
                       [Op.gte]: new Date(Date.now()-minutes)
                    }
                }
            })
            if(attendance.length!=0) {
                return res.send(`<!DOCTYPE html><html><head><title>QR-beolvasás</title><meta charset="UTF-8" /></head><body><h1>${req.candidate.name} HIBA! 20 percen belüli dupla rögzítés</h1></body></html>`)    
            }

            const rewardCount = await sequelize.models.RewardImage.count()
            let reward = await sequelize.models.RewardImage.findAll({
                limit: 1,
                offset: Math.floor(Math.random() * rewardCount)
            })

            reward = reward.length === 0 ? null : reward[0].MediumId
            await req.candidate.createAttendance({
                SignerId: req.user.id,
                RewardImageMediumId: reward,
                solutionTime: null
            })
            //todo: algoritmus kiszedése
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
    router.get('/task', middlewares.isAuthenticated, middlewares.roleCheck(roles.catechist), async function (req,res,next) {
        return res.json({success: true, error: null, data: {selectedGroup: req.session.selectedGroup?.id}})
    })

    router.post('/task', middlewares.isAuthenticated,  middlewares.roleCheck(roles.catechist), middlewares.requiredField.body(["groupId"]), async function (req,res,next) {
        if(req.body.groupId==null) {
            delete req.session.selectedGroup;
            return res.json({success: true, error: null, data: null})
        }
        const group = await sequelize.models.Group.findOne({
            where: {
                id: req.body.groupId
            },
            include: [
                {
                    model: sequelize.models.User,
                    as: 'Leader',
                    where: {
                        id: req.user.id
                    },
                    attributes: ['id'],
                    required: true
                }
            ],
            attributes: ["id", "name"]
        })

        if(!group) {
            return res.status(404).json(errorGenerator.INSTANCE_NOT_FOUND("Ön által vezetett csoport nem található"))
        }

        req.session.selectedGroup = group;

        return res.json({success: true, error: null, data: null})
    })


    return router
}
