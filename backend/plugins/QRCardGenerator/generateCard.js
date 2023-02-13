const { createCanvas, loadImage } = require('canvas')
const generateQR = require('./generateQR');
const canvasOpts = {
    height: 800,
    width: 800,
    fontSizes: {
        title: 60,
        name: 43
    },
    QR: {
        coordX: 100,
        coordY: 100,
        sizeWidth: 600,
        sizeHeight: 600
    },
    title: "MisEnapló",
}
const APIURL = process.env.APIURL || "https://misenaplo.hu/api/"
function url(id) {
    return `${APIURL}scan/candidate?candidateId=${id}`;
}
module.exports = async function(name, id) {
    return new Promise(async (resolve, reject) => {
        const canvas = createCanvas(canvasOpts.width, canvasOpts.height)
        const ctx = canvas.getContext('2d');
        const QRDataURL = await generateQR(url(id));
        const image = await loadImage(QRDataURL)
        ctx.drawImage(image,canvasOpts.QR.coordX,canvasOpts.QR.coordY,canvasOpts.QR.sizeWidth,canvasOpts.QR.sizeHeight);
        ctx.font = `${canvasOpts.fontSizes.title}px Impact`
        ctx.textAlign = "center";
        await ctx.fillText(canvasOpts.title, canvasOpts.width/2, canvasOpts.fontSizes.title+5)
        ctx.font = `${canvasOpts.fontSizes.name}px Impact`
        await ctx.fillText(name,canvasOpts.width/2,canvasOpts.height-canvasOpts.fontSizes.name-5);
    
    
        return resolve(canvas.toDataURL())
        console.log(canvas.toDataURL());
        const fs = require('fs')
        const out = fs.createWriteStream(__dirname + '/test.png')
        const stream = canvas.createPNGStream()
        stream.pipe(out)
        out.on('finish', () =>  console.log('The PNG file was created.'))
    
    })

};

