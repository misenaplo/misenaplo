// check envvars before loading any modules:
let envvarsCorrect = true;
["COOKIE_SECRET", "MUSER", "MPASSWORD", "MHOST", "MDATABASE", "MPORT",
	"SMTP_USER", "SMTP_FROM", "SMTP_HOST", "SMTP_PASS"]
	.forEach((envvar) => {
		if (process.env[envvar] === undefined) {
			console.log(envvar + " missing!");
			envvarsCorrect = false;
        }
	})


const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const passport = require('passport');
const sequelize = require("./plugins/db-connection");
                  require("./plugins/db-models")(sequelize);
const mailer = require("./plugins/mail");
const path = require('path');

const app = express();

require("./plugins/init-passport")(passport, sequelize);

const middlewares = {includeToReq: require("./plugins/middlewares/includeToReq/includeToReq"),hasPermission: require("./plugins/middlewares/hasPermission/hasPermission"),isAuthenticated: require("./plugins/isauthenticated-middleware"), roleCheck: require('./plugins/rolecheck-middleware'), requiredField: require('./plugins/requiredField-middleware')};
const roles = require('./plugins/roles')
const codes = require('./plugins/error-codes')

app.disable("x-powered-by");

if (!(process.env.NO_LOG || false)) {
	app.use(morgan('tiny'));
}
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors({
	origin: ['http://localhost:8081'],
	methods: ['GET', 'POST', 'DELETE', 'PUT'],
	credentials: true,
	exposedHeaders: ["X-Maintenance-In"]
}));
app.use(require('helmet')({
	"hsts": ((process.env.NODE_ENV || "").toLowerCase() == "production"),
	"expectCt": ((process.env.NODE_ENV || "").toLowerCase() == "production"),
	contentSecurityPolicy: false,
	referrerPolicy: false
}));

app.use('/api', require('./plugins/maintenance-middleware'));
app.use('/api', function (req, res, next) {
	res.set("Cache-Control", "no-store"); // Ne mentsen API kéréseket a gyorsítótárba
	next();
})

app.use('/api', require('./plugins/session')(sequelize));
app.use('/api', passport.initialize());
app.use('/api', passport.session());

app.use('/api', require("./routers/api")(passport, sequelize, mailer, middlewares, roles, codes));

app.use("/", express.static('public'));
app.get(/.*/, (req, res) => res.sendFile(path.join(__dirname, 'public/index.html')))

app.use(require("./plugins/general-error-handler"));

const port = process.env.PORT || 3000;
var server = app.listen(port, () => {
    console.log(`listening on ${port}`);
})


module.exports.app = app
module.exports.server = server
module.exports.sequelize = sequelize

