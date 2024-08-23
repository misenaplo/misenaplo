const saveModel = require("../plugins/save-model-handler");
const errorGenerator = require("../plugins/error-generator");
const dbError = require("../plugins/dbError");
const { Op, random } = require("sequelize");
const candidatePermissions = require('../plugins/permissions/candidate');
const { isUUID, isDate } = require("validator")
const multer = require('multer')
var storage = multer.memoryStorage()
const upload = multer({storage: storage})
const contentDisposition = require('content-disposition')

module.exports = function (passport, sequelize, mailer, middlewares, roles, codes) {
    const express = require('express')
    const router = express.Router()

    router.get('/:id', middlewares.requiredField.query(['id']), async function (req, res, next) {
        const invalidFields = [] ;
        if(!isUUID(req.query.id)) invalidFields.push("req.query.id")
        if(invalidFields.length>0) {
            return res.status(400).json(errorGenerator.FAILED_VALIDATION(invalidFields));
        }
        const reward = await sequelize.models.RewardImage.findOne({
            where: {
                id: req.query.id
            },
            include: [
                {
                    model: sequelize.models.Media,
                    as: 'Media',
                    required: true,
                    attributes: ['id', 'metadata', 'buffer']
                }
            ]
        })
        if(reward===null) {
            return res.status(404).json(errorGenerator.INSTANCE_NOT_FOUND("Nem található jutalomkép"));
        }
        res.setHeaders("Content-Type", reward.Media.metadata.mimeType)
        res.setHeaders("Content-Disposition", contentDisposition(reward.Media.metadata.originalName))
        res.send(Buffer.from(reward.Media.buffer, 'base64'))
    })

    router.post('/',middlewares.roleCheck(roles.catechist), upload.single('file'), async (req,res)=> {
        const M = await sequelize.models.Media.create({
          metadata: {
            mimeType: req.file.mimetype,
            originalName: req.file.originalname
          },
          buffer: req.file.buffer,
          public: false
        })
        const R = await sequelize.models.RewardImage.create({
          MediaId: M.id
        })
        return res.json({success: true, error: null, data: null})
      })
    

    return router
}
