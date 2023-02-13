const { Sequelize } = require("sequelize");

const database 	= process.env.MDATABASE
const username 	= process.env.MUSER
const password 	= process.env.MPASSWORD
const port 		= process.env.MPORT
const host 		= process.env.MHOST
const logging	= ((process.env.NO_SQL_LOG || false) || (process.env.NO_LOG || false)) ? false : console.log

const sequelize = new Sequelize({host, port, database, username, password, logging, dialect: 'mariadb' });


sequelize.authenticate().then(
	() => { // on fullfillment
		console.log('Connection has been established successfully.')
	},
	(error) => { // on error
		console.error('Unable to connect to the database:', error);
		process.exit(-1)
	}
)

module.exports = sequelize
