const { isUUID } = require("validator");
const errorGenerator = require("../../error-generator");

module.exports = function (sequelize, attributes, where) {
    if (attributes === null) {
        attributes = ["id", "name"];
    }
    if (where === null) where = {};
    return {
        "req.params.id": async function (req, res, next) {
            if (!isUUID(req.params.id, 4)) {
                res.status(400).json(errorGenerator.FAILED_VALIDATION(["req.params.id"]));
            }
            else {
                sequelize.models.Group.findOne({
                    where: { id: req.params.id, ...where }, 
                    attributes,
                    include: [
                        {
                            model: sequelize.models.Parish,
                            attributes: ["name", "id"]
                        },
                        {
                            model: sequelize.models.User,
                            as: 'Leader',
                            attributes: ['id', 'firstname', 'title', 'lastname', 'fullname'],
                            through: {
                                attributes: []
                            }
                        }
                    ]
                }).then(async (group) => {
                    if (!group) {
                        res.status(404).json(errorGenerator.INSTANCE_NOT_FOUND("Csoport nem található"));
                    }
                    else {
                        req.group = group;
                        next();
                    }
                })
            }
        },
        "req.body.groupId": async function (req, res, next) {
            if (!isUUID(req.body.groupId, 4)) {
                res.status(400).json(errorGenerator.FAILED_VALIDATION(["req.body.groupId"]));
            }
            else {
                sequelize.models.Group.findOne({
                    where: { id: req.body.groupId, ...where }, 
                    attributes,
                    include: [
                        {
                            model: sequelize.models.Parish,
                            attributes: ["name", "id"]
                        },
                        {
                            model: sequelize.models.User,
                            as: 'Leader',
                            attributes: ['id', 'firstname', 'title', 'lastname', 'fullname'],
                            through: {
                                attributes: []
                            }
                        }
                    ]
                }).then(async (group) => {
                    if (!group) {
                        res.status(404).json(errorGenerator.INSTANCE_NOT_FOUND("Csoport nem található"));
                    }
                    else {
                        req.group = group;
                        next();
                    }
                })
            }
        }
    }
}