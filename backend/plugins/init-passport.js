const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcryptjs");
const codes = require("./error-codes");
const { Op } = require("sequelize");

module.exports = function(passport, sequelize) {
	const User = sequelize.models.User


	passport.serializeUser(function(user, done) {
		done(null, user.id);
    });

    passport.deserializeUser(async function(id, done) {
    	var user = await User.findOne({
    		where: {
    			id
			}
    	});
    	if (user === null) {
    		done("USER_GONE")
    	} else {
    		done(null, user);
    	}
    });

    passport.use("local-login", new LocalStrategy(
		async function (username, password, done) {
			if (password.length > 50) {
				return done(null, false, { code: codes.FAILED_VALIDATION, message: "Túl hosszú jelszó!" })
            }
			var user = await User.findOne({
				where: {
					[Op.or]: [
						{username: username},
						{email: username}
					]
				}
			})
			if (user === null)
				return done(null, false, {code: codes.INVALID_CREDENTIALS, message: "Helytelen jelszó vagy felhasználónév!"});
			if (user.username !== username && user.email !== username)
				return done(null, false, {code: codes.INVALID_CREDENTIALS, message: "Helytelen jelszó vagy felhasználónév!"});
			if (bcrypt.compareSync(password, user.password)) {
				if (user.oneTimePassword instanceof String || typeof user.oneTimePassword === 'string') {
					user.oneTimePassword = null
					await user.save()
                }
				return done(null, user);
			} else if ((user.oneTimePassword instanceof String || typeof user.oneTimePassword === 'string' ) && bcrypt.compareSync(password, user.oneTimePassword)) {
				user.oneTimePassword = null
				user.passwordChangeRecommended = true
				await user.save()
				return done(null, user);
			} else {
				return done(null, false, {code: codes.INVALID_CREDENTIALS, message: "Helytelen jelszó vagy felhasználónév!"});
			}
		}
	))
}
