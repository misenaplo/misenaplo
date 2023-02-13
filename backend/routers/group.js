const saveModel = require("../plugins/save-model-handler");
const errorGenerator = require("../plugins/error-generator");
const dbError = require("../plugins/dbError");
const { isString, isNumber } = require("../plugins/type-check");
const { Op } = require("sequelize");
const permissions = require("../plugins/permissions/parish");
const parishPermissions = require("../plugins/permissions/parish");
const { isUUID, isDate } = require("validator")
const multipleCardGenerator = require('../plugins/QRCardGenerator/multipleCardGenerator');
const contentDisposition = require('content-disposition')
const groupAttendanceXLSX = require("../plugins/xlsx-templates/groupAttendance");

module.exports = function (passport, sequelize, mailer, middlewares, roles, codes) {
    const express = require('express')
    const router = express.Router()

    async function addGroupLeader(parish, user, newLeader) {
        return new Promise(async (resolve, reject) => {
            if (user.id == newLeader.id) return resolve(true);
            else if (user.role <= roles.catechist) return resolve("Másnak nem hozhat létre csoportot, hisz Ön nem láthatja.");
            else {
                const checkParish = await sequelize.models.Parish.findOne({
                    where: {
                        id: parish.id,
                    },
                    include: [
                        {
                            model: sequelize.models.User,
                            where: {
                                id: newLeader.id,
                                role: {
                                    [Op.gte]: roles.catechist
                                }
                            },
                            attributes: ['id'],
                            required: true
                        }
                    ]
                });
                if (!checkParish) return resolve("Csoportvezetőként beállítani kívánt felhasználó nem tagja a plébániának.");
                else return resolve(true);
            }
        })
    }

    router.get('/', middlewares.isAuthenticated, middlewares.roleCheck(roles.catechist), async function (req, res, next) {
        if (req.query.search !== undefined && (!isString(req.query.search) && req.query.search != "")) {
            res.status(400)
            return res.json(errorGenerator.FAILED_VALIDATION(["search"]))
        }
        if (req.query.itemsPerPage !== undefined && !isNumber(req.query.itemsPerPage)) {
            res.status(400)
            return res.json(errorGenerator.FAILED_VALIDATION(["itemsPerPage"]))
        }
        if (req.query.page !== undefined && !isNumber(req.query.page)) {
            res.status(400)
            return res.json(errorGenerator.FAILED_VALIDATION(["page"]))
        }
        if (req.query.parishId !== undefined && !isUUID(req.query.parishId, 4)) {
            res.status(400)
            return res.json(errorGenerator.FAILED_VALIDATION(["parishId"]))
        }
        if (req.query.parishId != undefined) {
            const parish = await sequelize.models.Parish.findOne({
                where: {
                    id: req.query.parishId
                }
            });
            if (!parish) {
                return res.status(404).json(errorGenerator.INSTANCE_NOT_FOUND("Plébánia nem található"));
            }
        }

        var options = {};
        options.include = [];
        switch (req.user.role) {
            case roles.admin:
            case roles.pope:
            case roles.popeOfficer:
                if (req.query.parishId)
                    options.include.push({
                        model: sequelize.models.Parish,
                        where: {
                            id: req.query.parishId
                        },
                        required: true
                    })
                break;


            case roles.archbishop:
            case roles.archbishopOfficer:
                break;


            case roles.bishop:
            case roles.bishopOfficer:
                break;


            case roles.dean:
            case roles.deanOfficer:
                break;


            case roles.parishPriest:
            case roles.chaplain:
            case roles.parishOfficer:
                const parishes = await req.user.getParishes({
                    attributes: ['id'], ...(req.query.parishId ? {
                        where: {
                            id: req.query.parishId
                        }
                    } : {})
                });
                options.include.push({
                    model: sequelize.models.Parish,
                    where: {
                        id: {
                            [Op.in]: parishes.map(p => p.id)
                        }
                    },
                    required: true
                })

                break;
            case roles.catechist:
                if (req.query.parishId)
                    options.include.push({
                        model: sequelize.models.Parish,
                        where: {
                            id: req.query.parishId
                        },
                        required: true
                    })
                options.include.push(
                    {
                        model: sequelize.models.User,
                        as: 'Leader',
                        where: {
                            id: req.user.id
                        },
                        attributes: ['id'],
                        required: true
                    }
                )
        }
        if (req.query.onlyLedByMe !== undefined && req.query.onlyLedByMe !== null && req.query.onlyLedByMe === "true") {
            options.include.push({
                model: sequelize.models.User,
                as: 'Leader',
                where: {
                    id: req.user.id
                },
                attributes: ['id'],
                required: true
            })
        }
        options.attributes = [];
        options.distinct = "Group.id";
        if (req.query.itemsPerPage > 0) {
            options.limit = (req.query.itemsPerPage == 0 ? null : ((req.query.itemsPerPage * 1.0) || 25));
            options.offset = ((req.query.itemsPerPage * 1.0) || 25) * (((req.query.page * 1.0) - 1) || 0);

        }
        options.order = [req.query.order || "name"];
        if (req.user.role < roles.parishOfficer) req.query.attributes = "list";
        if (req.query.attributes == null || req.query.attributes == undefined) req.query.attributes = "list";
        switch (req.query.attributes) {
            default:
            case 'list':
                options.attributes.push("id", "name");
                break;
        }
        const { rows, count } = await sequelize.models.Group.findAndCountAll(options);
        return res.json({ success: true, error: null, data: { groups: rows, totalGroups: count } })
    })

    router.post('/', middlewares.isAuthenticated, middlewares.roleCheck(roles.catechist), middlewares.requiredField.body(["name", "parishId", "leaderId"]), middlewares.includeToReq.parish(sequelize.models.Parish,null,null)["req.body.parishId"], middlewares.hasPermission.parish(parishPermissions.addGroup), async function (req, res, next) {
        var invalidFields = [];
        ["name", "leaderId"].forEach((f) => {
            if (!isString(req.body[f])) {
                invalidFields.push(f)
            }
        });
        ["leaderId"].forEach((f) => {
            if (!isUUID(req.body[f], 4)) {
                invalidFields.push(f);
            }
        })
        if (invalidFields.length != 0) {
            res.status(400);
            return res.json(errorGenerator.FAILED_VALIDATION(invalidFields));
        }

        const newLeader = await sequelize.models.User.findOne({
            where: {
                id: req.body.leaderId
            }
        });
        if (!newLeader) {
            return res.status(404).json(errorGenerator.INSTANCE_NOT_FOUND("Csoportvezetőként beállítani kívánt felhasználó nem található"))
        }
        const groupLeaderPermission = await addGroupLeader(req.parish, req.user, newLeader);
        if (groupLeaderPermission !== true) {
            return res.status(403).json(errorGenerator.INSUFFICIENT_PRIVILEGES(groupLeaderPermission));
        }

        const newGroup = sequelize.models.Group.build({
            name: req.body.name,
            ParishId: req.parish.id
        })

        var [result, err] = await saveModel(newGroup);
        if (result !== true) return dbError(res, { result, err })

        const newGroupLeader = sequelize.models.GroupLeaders.build({
            GroupId: newGroup.id,
            UserId: newLeader.id
        })
        var [result, err] = await saveModel(newGroupLeader);
        if (result !== true) return dbError(res, { result, err })

        return res.json({ success: true, error: null, data: { id: newGroup.id } })


    })

    router.get("/:id", middlewares.isAuthenticated, middlewares.roleCheck(roles.catechist), middlewares.includeToReq.group(sequelize, null, null)["req.params.id"], middlewares.hasPermission.group(permissions.getDetails), async function (req, res, next) {
        return res.json({ success: true, error: null, data: { group: req.group } });
    })

    router.get("/:id/generateCards",middlewares.isAuthenticated,middlewares.roleCheck(roles.catechist),middlewares.includeToReq.group(sequelize,null,null)["req.params.id"], middlewares.hasPermission.group(permissions.getDetails), async function(req,res,next) {
        const candidates = await req.group.getCandidates({attributes: ['id', 'name'], through: {attributes: []}})
        const zip = await multipleCardGenerator(candidates);
        res.setHeader('Content-Disposition', contentDisposition(`Kártyák ${req.group.name}.zip`.replace(/[#<>%&*{}?/\\$+!`~|"=:@]/g,""),  {type: "attachment"}))
        return res.send(Buffer.from(zip, 'base64'));
    })

    router.get("/:id/xlsx/attendance/:startDate/:endDate/:minimalAttendance/:details", middlewares.isAuthenticated,middlewares.roleCheck(roles.catechist), middlewares.includeToReq.group(sequelize,null,null)["req.params.id"], middlewares.hasPermission.group(permissions.getDetails), async function (req,res,next) {
        const invalidFields =[];
        ["startDate", "endDate"].forEach(p => {
            if(!isDate(req.params[p])) invalidFields.push(`req.query.${p}`)
        });
        ["minimalAttendance", "details"].forEach(p => {
            if(!isNumber(req.params[p])) invalidFields.push(`req.query.${p}`)
        });
        if(invalidFields.length>0) {
            return res.status(400).json(errorGenerator.FAILED_VALIDATION(invalidFields));
        }
        const xlsx = await groupAttendanceXLSX(sequelize, req.group,req.params.startDate,req.params.endDate,req.params.minimalAttendance,req.params.details!=0)
        res.setHeader('Content-Disposition', contentDisposition(`Miserészvételi adatok -  ${req.group.name}.xlsx`.replace(/[#<>%&*{}?/\\$+!`~|"=:@]/g,""),  {type: "attachment"}))
        return res.send(Buffer.from(xlsx, 'base64'));
    })
    return router
}
