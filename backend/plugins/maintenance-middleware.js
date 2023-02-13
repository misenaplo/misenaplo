const fs = require('fs');
const flag_path = (process.env.MAINTENANCE_FLAG_PATH || "./.maintenance");
var delay = parseInt(process.env.MAINTENANCE_DELAY || "10");

if (isNaN(delay)) {
    var delay = 10;
    console.warn("MAINTENANCE_DELAY is invalid, defaulting to 10 minutes")
}

const delayInMillis = delay * 60 * 1000;

module.exports = function (req, res, next) {
    var countdown = -1;
    if (fs.existsSync(flag_path)) {
        const { mtime } = fs.statSync(flag_path);
        const dateOfMaintenance = new Date(mtime.getTime() + delayInMillis);
        countdown = Math.round((dateOfMaintenance.getTime() - new Date()) / 1000);
        countdown = Math.max(0, countdown);
    }
    res.set("X-Maintenance-In", countdown);
    next();
}