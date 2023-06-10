const session = require('express-session');
const SequelizeStore = require("connect-session-sequelize")(session.Store);

module.exports = (sequelize) => {
	return session({ 
		secret: process.env.COOKIE_SECRET || 'vuHosgodfuwuc1QuanandyicEywod7', 
		store: new SequelizeStore({
			db: sequelize
		}),
		resave: true, 
		saveUninitialized: false, 
		cookie: {maxAge: 12*60*60*1000}
	})
}
