module.exports.isString = function (value) {
    return ((value instanceof String || typeof value === 'string') && value.length > 0)
}

module.exports.isNumber = function (value) {
    return (typeof value == "number" || (module.exports.isString(value) && !isNaN(value)))
}
