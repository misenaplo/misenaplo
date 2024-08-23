/**
 * /api
 *
 * Minden válasz a következő formában van
 *
 * 	{
 *		"success": true|false,
 *		"error": null|{"code": <hibakód>, "message": <hibaüzenet>},
 *		 data: {...}
 *	}
 *
 * Hibakódok a plugins/error-codes.js fájlban találhatóak.
 *
 */

module.exports = function(passport, sequelize, mailer, middlewares, roles, codes) {
	const express = require('express')
	const router = express.Router()
	const expressListRoutes = require('express-list-routes');
	

	var nodeLastUsed = new Date(); // STATE!!!
	router.get('/lastused', (req, res) => {
		return res.send(nodeLastUsed.toString())
    })

	router.use('/', function (req, res, next) {
		nodeLastUsed = new Date();
		return next()
    })

	router.use('/user', require("./user")(passport, sequelize, mailer, middlewares, roles, codes));
	router.use('/parish', require("./parish")(passport, sequelize, mailer, middlewares, roles, codes));
	router.use('/group', require("./group")(passport, sequelize, mailer, middlewares, roles, codes));
	router.use('/candidate', require("./candidate")(passport, sequelize, mailer, middlewares, roles, codes));
	router.use('/attendance', require("./attendance")(passport, sequelize, mailer, middlewares, roles, codes));
	router.use('/scan', require("./scan")(passport, sequelize, mailer, middlewares, roles, codes));
	router.use('/rewardImage', require("./rewardImage")(passport, sequelize, mailer, middlewares, roles, codes));

	router.get('/checkdbconnection', (req, res) => {
		if (req.session.views) {
			req.session.views++;
		}
		else {
			req.session.views = 1;
		}
		res.send(`${req.session.views} views`);
	})

	router.use('/', function (req, res, next) {
		res.sendStatus(404)
		// TODO: Finomabb hibakezelés a catch-all résznél
	})
	expressListRoutes(router);
	return router
}
