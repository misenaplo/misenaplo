const { Sequelize, DataTypes } = require("sequelize");

module.exports = function (sequelize) {
    sequelize.define("RewardImage", {
        MediumId: {
            type: DataTypes.UUID,
            allowNull: false,
            primaryKey: true
        },
        width: {
            type: DataTypes.INTEGER,
            allowNull: false,
            default: 3
        },
    })
}
