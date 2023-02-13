const { Sequelize, DataTypes } = require("sequelize");

module.exports = function(sequelize) {
	sequelize.define("Media", {
		id: {
      type: DataTypes.UUID,
			defaultValue: Sequelize.UUIDV4,
			primaryKey: true
		},
		metadata: {
			type: DataTypes.JSON,
      allowNull: false
		},
		buffer: {
			type: DataTypes.BLOB,
			allowNull: false,
			get() {
				const rawValue = this.getDataValue('buffer')
				return rawValue ? rawValue.toString('base64') : null
			}
		},
		public: {
			type: DataTypes.BOOLEAN,
			allowNull: false,
			defaultValue: false
    }
	})
}
