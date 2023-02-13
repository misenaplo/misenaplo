const { Sequelize, DataTypes } = require("sequelize");

module.exports = function(sequelize) {
	sequelize.define("Parish", {
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
		email: {
			type: DataTypes.TEXT,
			allowNull: true,
			unique: false,
			validate: {
				isEmail: true
			}
		},
        phone: {
            type: DataTypes.TEXT,
            allowNull: true,
            unique: false,
        },
        location: {
            type: DataTypes.TEXT,
            allowNull: false,
            unique: true
        }
	}
	)

}
