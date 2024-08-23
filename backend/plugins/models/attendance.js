const { Sequelize, DataTypes } = require("sequelize");

module.exports = function(sequelize) {
	sequelize.define("Attendance", {
		id: {
			type: DataTypes.UUID,
			defaultValue: Sequelize.UUIDV4,
			primaryKey: true
		},
		solutionTime: {
			type: DataTypes.DOUBLE,
			allowNull: true
		}
    	}, 
        {
            timestamps: true,
            updatedAt: false
        }
	)

}