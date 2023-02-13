const QRCode = require('qrcode');
const opts = {
    errorCorrectionLevel: 'H',
    quality: 1,
    margin: 0,

  }
module.exports = async function(text) {
    return new Promise(async (resolve, reject) => {
        QRCode.toDataURL(text, opts, async function (err, url) {
            if(err) return reject(err);
            resolve(url);
        })
    })
};

