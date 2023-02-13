const https = require('https');
const SECRET_KEY = process.env.RECAPTCHA_SECRET_KEY;
const errorGenerator = require('./error-generator');

module.exports = function (req, res, next) {
    if (!SECRET_KEY) { // Ha nincs megadva kulcs, akkor vegye letiltottnak a funkciót
        return next()
    }
    if (req.body.captcha) {
        try {
            const verifyReq = https.request(
                {
                    hostname: "www.google.com",
                    path: "/recaptcha/api/siteverify?secret=" + encodeURIComponent(SECRET_KEY) + "&response=" + encodeURIComponent(req.body.captcha),
                    method: "POST",
                    port: 443,
                },
                (response) => {
                    var raw = '';

                    response.on('data', function (chunk) {
                        raw += chunk;
                    });
                    response.on('end', function () {
                        var verifyData;
                        try {
                            verifyData = JSON.parse(raw)
                        } catch (err) {
                            return res.status(403).json(errorGenerator.INVALID_RECAPTCHA())
                        }
                        if (verifyData.success) {
                            next()
                        } else {
                            return res.status(403).json(errorGenerator.INVALID_RECAPTCHA())
                        }
                    });
                }
            );
            verifyReq.end();
        } catch (err) {
            console.error(err)
            return res.status(403).json(errorGenerator.INVALID_RECAPTCHA())
        }
    } else {
        return res.status(403).json(errorGenerator.INVALID_RECAPTCHA())
    }
}