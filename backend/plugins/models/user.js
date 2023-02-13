const { Sequelize, DataTypes } = require("sequelize");
const bcrypt = require("bcryptjs");

module.exports = function(sequelize) {
	sequelize.define("User", {
		id: {
			type: DataTypes.UUID,
			defaultValue: Sequelize.UUIDV4,
			primaryKey: true
		},
		username: {
			type: DataTypes.STRING(300),
			allowNull: false,
			unique: true
		},
		passwordChangeRecommended: {
			type: DataTypes.BOOLEAN,
			defaultValue: true
		},
		password: {
			type: DataTypes.STRING(60),
			allowNull: false,
			set(value) {
				this.setDataValue("password", bcrypt.hashSync(value, 12))
			}
		},
		oneTimePassword: {
			type: DataTypes.STRING(60),
			allowNull: true,
			set(value) {
				if (value instanceof String || typeof value === 'string') {
					this.setDataValue("oneTimePassword", bcrypt.hashSync(value, 12))
				} else {
					this.setDataValue("oneTimePassword", value)
				}
			}
		},
		email: {
			type: DataTypes.STRING(300),
			allowNull: false,
			unique: true,
			validate: {
				isEmail: true
			}
		},
		role: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
		title: DataTypes.TEXT,
		firstname: {
			type: DataTypes.TEXT,
			allowNull: true // Majd lehetne false
		},
		lastname: {
			type: DataTypes.TEXT,
			allowNull: true // Majd lehetne false
		},
		notes: DataTypes.TEXT,


		fullname: {
			type: DataTypes.VIRTUAL,
			get() {
				return [
					this.getDataValue("title") || "",
					this.getDataValue("lastname") || "",
					this.getDataValue("firstname") || ""
				].join(' ').trim()
			}
		}
	})
	// Ne jelenjen meg a jelszó mező kimenő adatokban, de belül elérhető maradjon
	sequelize.models.User.prototype.toJSON = function () {
		var values = Object.assign({}, this.get());

		delete values.password;
		delete values.oneTimePassword;
		return values;
	};
}
