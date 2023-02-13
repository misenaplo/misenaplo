const saveModel = require("../plugins/save-model-handler");
const errorGenerator = require("../plugins/error-generator");
const dbError = require("../plugins/dbError");
const { isString, isNumber } = require("../plugins/type-check");
const { Op } = require("sequelize");
const permissions = require("../plugins/permissions/parish");
const parishPermissions = require("../plugins/permissions/parish");
const groupPermissions = require("../plugins/permissions/group")
const { isUUID } = require("validator")

module.exports = function (passport, sequelize, mailer, middlewares, roles, codes) {
    const express = require('express')
    const router = express.Router()

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
        if (req.query.groupId !== undefined && !isUUID(req.query.groupId, 4)) {
            res.status(400)
            return res.json(errorGenerator.FAILED_VALIDATION["groupId"])
        }
        if (req.query.groupId !== undefined && req.query.parishId !== undefined) {
            res.status(400)
            return res.json(errorGenerator.FAILED_VALIDATION["groupId", "parishId"])
        }
        if (req.query.parishId !== undefined) {
            const parish = await sequelize.models.Parish.findOne({
                where: {
                    id: req.query.parishId
                }
            });
            if (!parish) {
                return res.status(404).json(errorGenerator.INSTANCE_NOT_FOUND("Plébánia nem található"));
            }
        }
        if (req.query.groupId !== undefined) {
            const group = await sequelize.models.Group.findOne({
                where: {
                    id: req.query.groupId
                }
            })
            if (!group) {
                return res.status(404).json(errorGenerator.INSTANCE_NOT_FOUND("Ilyen azonosítójú csoport nem található"))
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
                if (req.query.groupId) {
                    options.include.push({
                        model: sequelize.models.Group,
                        where: {
                            id: req.query.groupId,
                        },
                        required: true
                    })
                }
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
                if (req.query.groupId) {
                    options.include.push({
                        model: sequelize.models.Group,
                        where: {
                            id: req.query.groupId
                        },
                        attributes: ['id'],
                        through: { attributes: [] },
                        required: true
                    })
                }
                options.include.push({
                    model: sequelize.models.Parish,
                    where: {
                        id: {
                            [Op.in]: parishes.map(p => p.id)
                        }
                    },
                    required: true,
                    attributes: ['id'],
                    through: { attributes: [] }
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
                        model: sequelize.models.Group,
                        required: true,
                        attributes: ['id'],
                        where: {
                            ...(req.query.groupId? {id: req.query.groupId}:{})
                        },
                        through: { attributes: [] },
                        include: [
                            {
                                model: sequelize.models.User,
                                as: 'Leader',
                                where: {
                                    id: req.user.id
                                },
                                attributes: ['id'],
                                required: true,
                                through: { attributes: [] }
                            }
                        ]

                    }

                )
        }

        options.attributes = [];
        options.distinct = "Candidate.id";
        if (req.query.itemsPerPage > 0) {
            options.limit = (req.query.itemsPerPage == 0 ? null : ((req.query.itemsPerPage * 1.0) || 25));
            options.offset = ((req.query.itemsPerPage * 1.0) || 25) * (((req.query.page * 1.0) - 1) || 0);

        }
        options.order = [req.query.order || "name"];
        if (req.query.attributes == null || req.query.attributes == undefined) req.query.attributes = "list";
        switch (req.query.attributes) {
            default:
            case 'list':
                options.attributes.push("id", "name");
                break;
        }
        const { rows, count } = await sequelize.models.Candidate.findAndCountAll(options);
        return res.json({ success: true, error: null, data: { candidates: rows, totalCandidates: count } })
    })

    router.post('/', middlewares.isAuthenticated, middlewares.roleCheck(roles.catechist), middlewares.requiredField.body(["name", "groupId"]), middlewares.includeToReq.group(sequelize,null,null)["req.body.groupId"],middlewares.hasPermission.group(groupPermissions.addCandidate), async function (req, res, next) {
        var invalidFields = [];
        ["name"].forEach((f) => {
            if (!isString(req.body[f])) {
                invalidFields.push(f)
            }
        });
        if (invalidFields.length != 0) {
            res.status(400);
            return res.json(errorGenerator.FAILED_VALIDATION(invalidFields));
        }
        const candidate = sequelize.models.Candidate.build({
            name: req.body.name
        });

        var [result, err] = await saveModel(candidate);
        if (result !== true) return dbError(res, { result, err })

        const CandidateGroup = sequelize.models.CandidateGroup.build({
            GroupId: req.group.id,
            CandidateId: candidate.id
        })
        var [result, err] = await saveModel(CandidateGroup);
        if (result !== true) return dbError(res, { result, err });

        var CandidateParish = sequelize.models.CandidateParish.build({
            ParishId: req.group.Parish.id,
            CandidateId: candidate.id
        })
        var [result, err] = await saveModel(CandidateParish);
        if (result !== true) return dbError(res, { result, err })

        return res.json({ success: true, error: null, data: { id: candidate.id } })


    })

    return router
}
