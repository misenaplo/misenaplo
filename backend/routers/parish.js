const saveModel = require("../plugins/save-model-handler");
const errorGenerator = require("../plugins/error-generator");
const dbError = require("../plugins/dbError");
const { isString, isNumber } = require("../plugins/type-check");
const { Op } = require("sequelize");
const permissions = require("../plugins/permissions/parish");
const parish = require("../plugins/middlewares/hasPermission/parish");


module.exports = function (passport, sequelize, mailer, middlewares, roles, codes) {
    const express = require('express')
    const router = express.Router()

    async function attributeCheck(attributes) {
        const validAttributes = ["id", "name", "phone", "location"];
        return new Promise(async (resolve, reject) => {
            ok = true
            await Promise.all(attributes.map(async (a) => {
                if (validAttributes.findIndex(a) == -1) ok = false;
            }))
            return resolve(ok);
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

        var options = {};
        if(req.user.role<roles.deanOfficer||(true&&req.user.role<roles.popeOfficer) /*Később külön kell választani rangoknak megfelelően*/) {
            options.include = [
                {
                    model: sequelize.models.User,
                    where: {
                        id: req.user.id
                    },
                    attributes: ['id'],
                    required: true
                }
            ]

        }
        options.attributes = [];
        options.distinct="Parish.id";
        if(req.query.itemsPerPage>0) {
            options.limit = (req.query.itemsPerPage==0?null:((req.query.itemsPerPage*1.0)||25));
            options.offset =  ((req.query.itemsPerPage*1.0) || 25) * (((req.query.page*1.0) - 1) || 0);
    
        }
        options.order = [req.query.order || "name"];
        if(req.user.role<roles.parishOfficer) req.query.attributes="list";
        if(req.query.attributes==null||req.query.attributes==undefined) req.query.attributes="list";
        switch(req.query.attributes) {
            case 'full':
                options.attributes.push("email", "phone", "location" );
            case 'list':
                options.attributes.push("id", "name");
            break;
        }
        const {rows, count } = await sequelize.models.Parish.findAndCountAll(options);
        return res.json({ success: true, error: null, data: { parishes: rows, totalParishes: count} } )
    })

    router.post('/', middlewares.isAuthenticated, middlewares.roleCheck(roles.bishopOfficer), middlewares.requiredField.body(["name", "email", "phone", "location"]), async function (req, res, next) {
        var invalidFields = [];
        ["name", "email", "phone", "location"].forEach((f) => {
            if (!isString(req.body[f])) {
                invalidFields.push(f)
            }
        });

        if (invalidFields.length != 0) {
            res.status(400);
            return res.json(errorGenerator.FAILED_VALIDATION(invalidFields));
        }
        const newParish = sequelize.models.Parish.build({
            name: req.body.name,
            email: req.body.email,
            location: req.body.location,
            phone: req.body.phone

        })

        const [result, err] = await saveModel(newParish);
        if (result !== true) return dbError(res, { result, err })
        else {
            return res.json({ success: true, error: null, data: { id: newParish.id } })
        }

    })

    router.get("/:id", middlewares.isAuthenticated, middlewares.roleCheck(roles.parishOfficer), middlewares.includeToReq.parish(sequelize.models.Parish, null, null)["req.params.id"], middlewares.hasPermission.parish(permissions.getDetails), async function (req, res, next) {
        return res.json({ success: true, error: null, data: { parish: req.parish } });
    })

    router.get("/:id/users", middlewares.isAuthenticated, middlewares.roleCheck(roles.parishOfficer), middlewares.includeToReq.parish(sequelize.models.Parish, null, null)["req.params.id"], middlewares.hasPermission.parish(permissions.getUsers), async function (req, res, next) {
        const users = await req.parish.getUsers();
        return res.json({ success: true, error: null, data: { users: users } });
    })

    router.get("/:id/groups", middlewares.isAuthenticated, middlewares.roleCheck(roles.parishOfficer), middlewares.includeToReq.parish(sequelize.models.Parish, null, null)["req.params.id"], middlewares.hasPermission.parish(permissions.getGroups), async function (req, res, next) {
        const groups = await req.parish.getGroups();
        return res.json({ success: true, error: null, data: { groups: groups } });
    })

    return router
}
