const generateCard = require('./generateCard');
const JSZip = require("jszip")

module.exports = async function(candidates) {
    return new Promise(async (resolve, reject) => {
        if(!Array.isArray(candidates)) resolve(new Error("Nem tömböt adott meg paraméternek"));
        var zip = new JSZip();
        var finish = () => {
            zip.generateAsync({type: 'base64'}).then(b64 => {
              resolve(b64);
      
            }).catch(err => {
              reject(err)
            })
          }
          itemsProcessed=0;
          candidates.forEach(async c => {
            const C = await  generateCard(c.name,c.id);
            if(C!==null)
               zip.file(`${c.name}.png`, C.split('base64,')[1],{ base64: true})
            itemsProcessed++;
            if(itemsProcessed===candidates.length) finish()
          })
    })

};