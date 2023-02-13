const roles = require("../plugins/roles")
const { toDate, isUUID } = require("validator");
const errorGenerator = require("../plugins/error-generator");
const { Op } = require("sequelize");

module.exports = function (passport, sequelize) {
	/** GET Profil
	 *
	 * Lekérdezi a jelenleg bejelentkezett felhasználó adatait az adatbázisból
	 *
	 * IDEA: lekérdezendõ mezõk meghatározásának lehetõsége.
	 */
	return async function (req, res, next) {
		if(req.path!="/"&&req.user.role<roles.admin) return next(); // Ne lehessen még bármelyik usert lekérdezni tetszés szerint, csak adminnak
		if (req.path != "/" && !isUUID(req.params.id, 4)) {
			return next()
        }
		

		const where = {
			deleted: {
				[Op.ne]: true
			}
		};

		let query;

		if (req.path == "/" &&
			req.query.full === undefined) {
			query = null
		} else {
			query = {
				where: {
					id: (req.path == "/") ? req.user.id : req.params.id
				},
				include: [
					
				]
			}
        }

		const user = (query === null) ? req.user : await sequelize.models.User.findOne(query)
		if (user === null) {
			res.status(404)
			return res.json(errorGenerator.INSTANCE_NOT_FOUND("Nincs találat!"))
		}

		if (user.id !== req.user.id) {
			if (user.role >= req.user.role) {
				return res.json(errorGenerator.INSUFFICIENT_PRIVILEGES("Magasabb rangú felhasználó adatai nem kérdezhetőek le."))
			} 
		}

		const full = (req.query.full !== undefined)

		var responseData = user.toJSON();
	


		

		if(full) {
		}
		return res.json({ success: true, error: null, data: responseData });
	}
}
