const { ValidationError, UniqueConstraintError } = require("sequelize");

module.exports = async function (modelInstance) {
	try {
		await modelInstance.save();
		return [true, null];
	} catch (err) {
		if (err instanceof UniqueConstraintError) {
			var malformedFields = []
			err.errors.forEach((e) => malformedFields.push(e.path))
			return [malformedFields, "UniqueConstraintError"]
		} else if (err instanceof ValidationError) {
			var malformedFields = []
			err.errors.forEach((e) => malformedFields.push(e.path))
			return [malformedFields, "ValidationError"]
		} else {
			throw err
		}
	}
}