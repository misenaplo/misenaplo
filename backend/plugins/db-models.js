const { Sequelize, DataTypes } = require("sequelize");

module.exports = function (sequelize) {

	require('./models/parish')(sequelize)

	require('./models/media')(sequelize)
	require("./models/user")(sequelize)

	require('./models/group')(sequelize)
	require('./models/candidate')(sequelize)
	require('./models/attendance')(sequelize)
	
	require('./models/rewardImage')(sequelize)

	require('./models/associations')(sequelize) // Kapcsolatok létrehozása és betöltése

	function logAssociations() {
		var models = sequelize.models
		for (let model of Object.keys(models)) {
			if(!models[model].name)
				continue;

			console.log("\n\n----------------------------------\n",
			models[model].name,
			"\n----------------------------------");
			if(models[model].attributes!==null&&models[model].attribtues!==undefined) {
				console.log("\nAttributes");
				for (let attr of Object.keys(models[model].attributes)) {
						console.log(models[model].name + '.' + attr);
				}
			}

			if(models[model].associations!==null&&models[model].associations!==undefined) {

				console.log("\nAssociations");
				for (let assoc of Object.keys(models[model].associations)) {
					for (let accessor of Object.keys(models[model].associations[assoc].accessors)) {
						console.log(models[model].name + '.' + models[model].associations[assoc].accessors[accessor]+'()');
					}
				}
			}


		}

	}
	// NOTE: Ez egy async függvény, azaz a program folytatja az
	//       operációt miközben a háttérben szinkronizálja a táblákat
	switch (process.env.SQL_SYNC_MODE) {
		case "none":
			break;
		case "alter":
			sequelize.sync({ alter: true }).then(() =>{
				console.log(sequelize.models);
			})
			break;
		case "force":
			sequelize.sync({ force: true }).then(() =>{
				console.log(sequelize.models);
			})
			break;
		default:
			sequelize.sync().then(() => {
				console.log(sequelize.models);
				logAssociations()
			})
			break;
    }

}
