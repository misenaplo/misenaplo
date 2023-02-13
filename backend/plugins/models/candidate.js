const { Sequelize, DataTypes } = require("sequelize");

module.exports = function(sequelize) {
	sequelize.define("Candidate", { //A szó ötlete Tóth Lillától származik
		id: {
			type: DataTypes.UUID,
			defaultValue: Sequelize.UUIDV4,
			primaryKey: true
		},
		name: {
			type: DataTypes.TEXT,
			allowNull: false,
			unique: false
		},
    	}
	)

}