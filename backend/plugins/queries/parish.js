const { isString } = require("../type-check");
const saveModel = require("../save-model-handler");

module.exports = async function(sequelize) {
    async function attributeCheck(attributes) {
        const validAttributes = ["id", "name", "phone", "location"];
        return new Promise(async(resolve, reject)=> {
            ok = true
            await Promise.all(attributes.map(async (a) => {
                if(validAttributes.findIndex(a)==-1) ok = false;
            }))
            return resolve(ok);
        })
    }
    return {
        parishesOfUser: async function(user, attributes) {
            return new Promise(async (resolve, reject) => {
                if(attributes === true) attributes = ['id', 'name'];
                else {
                    const ok = await attributeCheck(attributes);
                    if(!ok) return reject(new Error("Nem megfelelő attribútumokat adott meg!"))
                }
                try {
                    const parishes = await user.getParishes({attributes});
                    resolve(parishes);
                } catch(err) {
                    reject(err)
                }
            })
            
        },
        newParish: async function(name, email, location, phone) {
            return new Promise(async(resolve, reject) => {
                if(!isString(name)||!isString(email)||!isString(location)||!isString(phone)||name==""||email==""||location==""||phone=="") {
                    return reject(new Error("Nincsenek megadva a szükséges mezők"));
                }
                else {
                    const newParish = sequelize.models.Parish.build({
                        name,
                        email,
                        location,
                        phone
        
                    })
        
                    const [result, err] = await saveModel(newParish);
                    if(result!==true) return reject({result, err});
                    else {
                        return resolve(newParish);
                    }
                }
            })
        }
    }
}