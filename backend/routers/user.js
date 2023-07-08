const saveModel = require("../plugins/save-model-handler");
const bcrypt = require("bcryptjs");
const passwordGenerator = require("generate-password");
const errorGenerator = require("../plugins/error-generator");
const { isString, isNumber } = require("../plugins/type-check");
const { Op, REAL } = require("sequelize");
const mailTexts = require("../plugins/mail-text");
const { isUUID } = require("validator");
const parishPermissions = require("../plugins/permissions/parish");
const permissions = require("../plugins/permissions/user")

module.exports = function (passport, sequelize, mailer, middlewares, roles, codes) {
	const express = require('express')
	const router = express.Router()

	/** POST Bejelentkezés
	 *
	 * Paraméterei: email, password
	 */
	router.post('/login', middlewares.requiredField.body(["email", "password"]),  function (req, res, next) {
		if (!isString(req.body.email) || !isString(req.body.password)) {
			res.status(401)
			return res.json({ success: false, error: { code: codes.MISSING_CREDENTIALS, message: "Hiányzó adatok!" }, data: null });
		}



		passport.authenticate('local-login', function (err, user, info) {
			if (err) { return next(err); }
			if (!user) {
				res.status(401)
				return res.json({ success: false, error: info, data: null });
			}
			req.logIn(user, function (err) {
				if (err) { return next(err); }
				return res.json({ success: true, error: null, data: { user } });
			});
		})(req, res, next);
	});

	/** POST Kijelentkezés */
	router.post('/logout', function (req, res, next) {
		req.session.destroy(); // ide a req.logout() szebb lenne, de érthetetlen okokból NEM működik...
		return res.json({ success: true, error: null, data: null })
	});

	router.put("/:id", middlewares.isAuthenticated, middlewares.roleCheck(roles.parishOfficer), middlewares.requiredField.body(["changed"]), middlewares.includeToReq.user(sequelize, null, null)["req.params.id"], middlewares.hasPermission.user(permissions.changeDetails), async function(req,res,next) {
		const protectedFields = ["id", "role", "password", "passwordChangeRecommended", "oneTimePassword"];

		for (const [key, value] of Object.entries(req.body.changed)) {
			if (key in req.user2 && !(protectedFields.includes(key))) {
				try {
					req.user2[key] = value;
				} catch (err) {
					res.status(400)
					return res.json(errorGenerator.FAILED_VALIDATION([key]));
				}
			}
		}


		const [result, err] = await saveModel(req.user2);
		if (result !== true && err == "ValidationError") {
			res.status(400)
			return res.json(errorGenerator.FAILED_VALIDATION(result));
		}


		return res.json({ success: true, error: null, data: null });

	})


	router.put("/", middlewares.isAuthenticated, middlewares.requiredField.body(["changed"]), async function (req, res, next) {
		const protectedFields = ["id", "role", "passwordChangeRecommended", "oneTimePassword"];

		if ("password" in req.body.changed && req.body.changed.password.length > 50) {
			res.status(400)
			let response = errorGenerator.FAILED_VALIDATION(["changed.password"])
			response.error.message = "Új jelszó túl hosszú!"
			return res.json(response)
		}

		if ("password" in req.body.changed && !isString(req.body.changed.password)) {
			return res.status(400).json(errorGenerator.FAILED_VALIDATION(["changed.password"]))
		}

		// ne ellenőrizze a jelszót, ha elfelejtett jelszóval (vagy első alkalommal)
		// lépnek be és csak jelszót váltanának
		if (req.user.passwordChangeRecommended != true ||
			Object.keys(req.body.changed).length != 1 ||
			Object.keys(req.body.changed)[0] != "password"
		) {
			if (!("password" in req.body)) {
				return res.status(400).json(errorGenerator.MALFORMED_BODY(["password"]))
			}

			if (!isString(req.body.password) || req.body.password.length > 50) {
				return res.status(400).json(errorGenerator.FAILED_VALIDATION(["password"]))
			}

			if (!bcrypt.compareSync(req.body.password, req.user.password)) {
				res.status(403);
				return res.json(errorGenerator.INVALID_CREDENTIALS());
			}
		}

		for (const [key, value] of Object.entries(req.body.changed)) {
			if (key in req.user && !(protectedFields.includes(key))) {
				try {
					req.user[key] = value;
				} catch (err) {
					res.status(400)
					return res.json(errorGenerator.FAILED_VALIDATION([key]));
				}
			}
		}

		if ("password" in req.body.changed && req.user.passwordChangeRecommended) {
			req.user.passwordChangeRecommended = false;
		}

		const [result, err] = await saveModel(req.user);
		if (result !== true && err == "ValidationError") {
			res.status(400)
			return res.json(errorGenerator.FAILED_VALIDATION(result));
		}


		return res.json({ success: true, error: null, data: null });

	});

	/** POST Create
	 *
	 */
	router.post("/", middlewares.requiredField.body(["user"]), async function (req, res, next) {

		const userdata = req.body.user;

		var missingFields = [];
		["email", "firstname", "lastname"].forEach((f) => {
			if (!(f in userdata)) {
				missingFields.push(f)
			}
		})
		if (missingFields.length != 0) {
			res.status(400);
			return res.json(errorGenerator.MALFORMED_BODY(missingFields));
		}

		var invalidFields = [];
		["email", "firstname", "lastname"].forEach((f) => {
			if (!isString(userdata[f])) {
				invalidFields.push(`req.body.user.${f}`)
			}
		});
		if (req.body.parishId && !isUUID(req.body.parishId, 4)) {
			invalidFields.push(["req.body.parishId"])
		}
		if (userdata.role !== undefined && userdata.role !== null && !isNumber(userdata.role)) {
			invalidFields.push(`req.body.user.role`);
		}
		if (invalidFields.length != 0) {
			res.status(400);
			return res.json(errorGenerator.FAILED_VALIDATION(invalidFields));
		}
		if(userdata.role!==undefined&&userdata.role!==null&&!req.user) {
			return res.status(401).json(errorGenerator.NOT_LOGGED_IN());
		}
		if (userdata.role !== undefined && userdata.role !== null) {
			if (userdata.role >= req.user.role) {
				return res.status(403).json(errorGenerator.INSUFFICIENT_PRIVILEGES("Csak önnél kisebb rangú felhasználót adhat hozzá!"));
			}
		}
		else {
			userdata.role = roles.believer;
		}
		if (req.body.parishId) {
			const parish = await sequelize.models.Parish.findOne({
				where: {
					id: req.body.parishId
				}
			});
			if (!parish) {
				return res.status(404).json(errorGenerator.INSTANCE_NOT_FOUND("Plébánia nem található"));
			}
			else {
				const permission = await parishPermissions.check(parish, req.user, parishPermissions.addUser);
				if (!permission) {
					return res.status(403).json(errorGenerator.INSUFFICIENT_PRIVILEGES("Nem adhat hozzá felhasználót ehhez a plébániához"));
				}
			}
		}

		const generatedPass = passwordGenerator.generate({ length: 8, numbers: true });

		const newuser = sequelize.models.User.build({
			email: userdata.email,
			password: generatedPass,
			role: userdata.role,
			firstname: userdata.firstname,
			lastname: userdata.lastname,
			title: userdata.title,

		})

		var [result, err] = await saveModel(newuser);
		if (result !== true && err == "ValidationError") {
			res.status(400)
			return res.json(errorGenerator.FAILED_VALIDATION(result));
		} else if (result !== true && err == "UniqueConstraintError") {
			res.status(400)
			return res.json(errorGenerator.DUPLICATE_ENTRY(result));
		}

		const message = {
			from: process.env.SMTP_FROM,
			to: {
				name: newuser.fullname,
				address: newuser.email
			},
			subject: mailTexts.user.create.subject(),
			text: mailTexts.user.create.body(
				generatedPass,
				newuser.fullname
			)
		}
		mailer.sendMail(message) // async

		if (req.body.parishId) {
			const ParishUser = sequelize.models.ParishUser.build({
				UserId: newuser.id,
				ParishId: req.body.parishId
			})
			var [result, err] = await saveModel(ParishUser);
			if (result !== true && err == "ValidationError") {
				res.status(400)
				return res.json(errorGenerator.FAILED_VALIDATION(result));
			} else if (result !== true && err == "UniqueConstraintError") {
				res.status(400)
				return res.json(errorGenerator.DUPLICATE_ENTRY(result));
			}
		}

		return res.json({ success: true, error: null, data: { id: newuser.id } })



	})

	router.post("/forgottenpassword", middlewares.requiredField.body(["email"]), async function (req, res, next) {
		var user = await sequelize.models.User.findOne({
			where: {
				email: req.body.email
			}
		})

		if (user === null) {
			res.status(404);
			return res.json(errorGenerator.INSTANCE_NOT_FOUND("Az email cím nem létezik."));
		}
		const generatedPass = passwordGenerator.generate({ length: 8, numbers: true, strict: true });
		user.oneTimePassword = generatedPass;
		await saveModel(user);

		const message = {
			from: process.env.SMTP_FROM,
			to: {
				name: user.fullname,
				address: user.email
			},
			subject: mailTexts.user.forgottenpassword.subject(),
			text: mailTexts.user.forgottenpassword.body(
				generatedPass,
				user.fullname
			)
		}
		mailer.sendMail(message)

		return res.json({ success: true, error: null, data: null })
	})



	/** GET kezelhető felhasználók lekérdezése
	 *
	 *  search			Keresendő szöveg
	 *  itemsPerPage	Elemek oldalanként
	 *  page			Lap sorszáma
	 */
	router.get("/list", middlewares.isAuthenticated, middlewares.roleCheck(roles.catechist), async function (req, res, next) {
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
		if (req.query.minRole !== undefined && !isNumber(req.query.minRole)) {
			res.status(400)
			return res.json(errorGenerator.FAILED_VALIDATION(["minRole"]))
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
			else {
				const permission = await parishPermissions.check(parish, req.user, parishPermissions.getUsers);
				if (!permission) {
					return res.status(403).json(errorGenerator.INSUFFICIENT_PRIVILEGES());
				}
			}
		}


		var where = {};
		var include = [];
		var searchQuery = []
		if (req.query.search !== undefined && req.query.search != "") {
			const searchIt = {
				[Op.substring]: req.query.search.toLowerCase()
			}
			searchQuery = [
				// indexelt keresés:
				sequelize.where(sequelize.fn("lower", sequelize.col("email")), searchIt),
				// fullname keresés: (ha semmi sem működött eddig)
				sequelize.where(sequelize.fn("lower", sequelize.fn("concat", sequelize.col("title"), " ", sequelize.col("lastname"), " ", sequelize.col("firstname"))), searchIt)
			]
		}

		switch (req.user.role) {
			case roles.admin:
			case roles.pope:
			case roles.popeOfficer:

				if (req.query.parishId) {
					include.push({
						model: sequelize.models.Parish,
						required: true,
						where: {
							id: req.query.parishId
						}
					})
				}
				break;
			case roles.archbishop:
			case roles.archbishopOfficer:
			case roles.bishop:
			case roles.bishopOfficer:
			case roles.dean:
			case roles.deanOfficer:
			case roles.parishPriest:
			case roles.parishOfficer:
			case roles.chaplain:
			case roles.catechist:
				if ((await req.user.countParishes()) > 0) {
					const parishes = req.query.parishId ? [req.query.parishId] : (await req.user.getParishes({ attributes: ["id"] })).map(p => p.id);
					include.push({
						model: sequelize.models.Parish,
						required: true,
						where: {
							id: {
								[Op.in]: parishes
							}
						}
					})
				}
				else if (req.user.role <= roles.parishPriest) {
					res.status(404).json(errorGenerator.INSTANCE_NOT_FOUND("Önhöz nincs kötve plébánia, vagy az érvénytelen!"));
					return
				}
				if(req.user.role==roles.catechist) {
					where.id=req.user.id;
				}
				break;
		}
		if (searchQuery.length > 0) {
			where[Op.or] = (where[Op.or] === undefined) ? searchQuery : where[Op.or].concat(searchQuery)
		}
		if(req.query.minRole) {
			where.role = {
				[Op.gte]: req.query.minRole
			}
		} 
		const { rows, count } = await sequelize.models.User.findAndCountAll({
			where,
			include: [
				...include
			],
			limit: 1 * req.query.itemsPerPage || 25,
			offset: (req.query.itemsPerPage || 25) * ((req.query.page - 1) || 0),
			order: ["lastname", "firstname"], // TODO: change sorting
		})

		return res.json({
			success: true,
			error: null,
			data: {
				users: rows,
				totalUsers: count
			}
		})
	})

	router.post('/addToOrganizationUnit', middlewares.isAuthenticated, middlewares.roleCheck(roles.parishOfficer), middlewares.requiredField.body(["email"]), async  (req, res, next) => {
		var isOrganizationUnitId = 0;
		var organizationUnit = "";
		var error = false;
		if(req.body.newRole!==null&&req.body.newRole!==undefined&&!isNumber(req.body.newRole)) {
			return res.status(400).json(errorGenerator.FAILED_VALIDATION(["req.body.newRole"]));

		}
		await Promise.all(["parishId"].map(async oui => {
			return new Promise(async (resolve, reject) => {
				if (oui in req.body) {
					isOrganizationUnitId++;
					organizationUnit = oui;
					if (["parishId"].findIndex(f => f === oui) != -1) {
						if (!isUUID(req.body[oui], 4)) {
							res.status(400);
							res.json(errorGenerator.FAILED_VALIDATION([`req.body.${oui}`])); error = true;
							resolve();
						} else resolve();
					} else resolve();
				} else resolve();

			})
		}))
		if (error) return;
		if (isOrganizationUnitId !== 1) {
			res.status(400);
			return res.json(errorGenerator.MALFORMED_BODY());
		}
		if (!isString(req.body.email)) {
			return res.status(400).json(errorGenerator.FAILED_VALIDATION(["req.body.email"]));
		}
		const user = await sequelize.models.User.findOne({
			where: {
				email: req.body.email
			}
		})
		if (!user) {
			return res.status(404).json(errorGenerator.INSTANCE_NOT_FOUND("Ilyen felhasználó nem található."))
		}
		switch (organizationUnit) {
			case 'parishId':
				const parish = await sequelize.models.Parish.findOne({
					where: {
						id: req.body.parishId
					}
				});
				if(!parish) {
					return res.status(404).json(errorGenerator.INSTANCE_NOT_FOUND("Ilyen plébánia nem található."));
				}
				const permission = await parishPermissions.check(parish, req.user, parishPermissions.addUser);
				if(!permission) {
					return res.json(403).json(errorGenerator.INSUFFICIENT_PRIVILEGES("Nincs jogköre, hogy a plébániához hozzáadjon személyt!"))
				}
				else {
					const ParishUser = sequelize.models.ParishUser.build({
						UserId: user.id,
						ParishId: req.body.parishId
					})
					var [result, err] = await saveModel(ParishUser);
					if (result !== true && err == "ValidationError") {
						res.status(400)
						return res.json(errorGenerator.FAILED_VALIDATION(result));
					}
				}
				break;
		}
		var roleMessage="";
		if(req.body.newRole!==null&&req.body.newRole!==undefined) {
			const role = req.body.newRole*1.0;
			if(role>user.role&&role<req.user.role) {
				user.role = role;
				var [result, err] = await saveModel(user);
					if (result !== true && err == "ValidationError") {
						res.status(400)
						return res.json(errorGenerator.FAILED_VALIDATION(result));
					} else if (result !== true && err == "UniqueConstraintError") {
						res.status(400)
						return res.json(errorGenerator.DUPLICATE_ENTRY(result));
					}
				roleMessage="Jogkör sikeresen beállítva!";
			}
			else roleMessage="A felhasználó jogköre magasabb volt a beállítottnál, így maradt az.";
		}
		return res.json({success: true, error: null, data: {user, roleMessage}})


	})
	const getHandler = require('./user-get')(passport, sequelize, mailer, middlewares, roles, codes);
	router.get("/", middlewares.isAuthenticated, getHandler)
	router.get("/:id", middlewares.isAuthenticated, getHandler)

	return router
}
