const { Sequelize, DataTypes } = require("sequelize");

module.exports = function(sequelize) {
	sequelize.define("Attendance", {
		id: {
			type: DataTypes.UUID,
			defaultValue: Sequelize.UUIDV4,
			primaryKey: true
		},
    	}, 
        {
            timestamps: true,
            updatedAt: false
        }
	)

}