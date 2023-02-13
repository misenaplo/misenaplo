const { Sequelize, DataTypes } = require("sequelize");

module.exports = function(sequelize) {
	sequelize.define("Group", {
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
