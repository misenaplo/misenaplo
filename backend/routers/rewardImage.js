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

    router.get('/:id', async function (req, res, next) {
        const invalidFields = [] ;
        if(!isUUID(req.params.id, 4)) invalidFields.push("req.params.id")
        if(invalidFields.length>0) {
            return res.status(400).json(errorGenerator.FAILED_VALIDATION(invalidFields));
        }
        const reward = await sequelize.models.RewardImage.findOne({
            where: {
                MediumId: req.params.id
            },
            include: [
                {
                    model: sequelize.models.Media,
                    required: true,
                    attributes: ['id', 'metadata', 'buffer']
                }
            ]
        })
        if(reward===null) {
            return res.status(404).json(errorGenerator.INSTANCE_NOT_FOUND("Nem található jutalomkép"));
        }
        res.setHeader("Content-Type", reward.Medium.metadata.mimeType)
        res.setHeader("Content-Disposition", contentDisposition(reward.Medium.metadata.originalName, {type: 'inline'}))
        res.send(Buffer.from(reward.Medium.buffer, 'base64'))
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
          MediumId: M.id,
          width: 4
        })
        return res.json({success: true, error: null, data: null})
      })
    

    return router
}
