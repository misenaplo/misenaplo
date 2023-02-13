const roles = require("../roles");

module.exports.getDetails = 0;
module.exports.changeDetails = 1;
module.exports.addUser = 2;
module.exports.getUsers = 3;
module.exports.getGroups = 4;
module.exports.deleteUser = 5;
module.exports.addGroup = 6;
module.exports.deleteGroup = 7;
module.exports.deleteParish = 8;



module.exports.check = async function (parish, user, permission) {
    return new Promise(async (resolve, reject) => {
        switch (permission) {
            case this.addGroup:
                if(user.role==roles.catechist) {
                    parish.getUsers({
                        where: {
                            id: user.id
                        },
                        attributes: ['id']
                    }).then(async (user) => {
                        resolve(user !== null);
                    })
                    break;
                }
            case this.getGroups:
            case this.getUsers:
                if(user.role==roles.catechist) {
                    parish.getUsers({
                        where: {
                            id: user.id
                        },
                        attributes: ['id']
                    }).then(async (user) => {
                        resolve(user !== null);
                    })
                    return;
                    break;
                }
            case this.addUser:
            case this.getDetails:
                switch (user.role) {
                    case roles.unauthenticated:
                    case roles.believer:
                    case roles.signer:
                    case roles.catechist:
                        return resolve(false); 
                    break;


                    case roles.parishOfficer:
                    case roles.chaplain:
                    case roles.parishPriest:
                        parish.getUsers({
                            where: {
                                id: user.id
                            },
                            attributes: ['id']
                        }).then(async (user) => {
                            resolve(user !== null);
                        })
                        break;
                    

                    case roles.deanOfficer:
                    case roles.dean:
                        return resolve(false); //Még ki kell egészíteni
                    break;

                    case roles.bishopOfficer:
                    case roles.bishop:
                        return resolve(false); //Még ki kell egészíteni
                    break;

                    case roles.archbishopOfficer:
                    case roles.archbishop:
                        return resolve(false); //Még ki kell egészíteni
                    break;

                    case roles.popeOfficer:
                    case roles.pope:
                    case roles.admin:
                        return resolve(true);
                }
            break;
            case this.changeDetails: 
                switch (user.role) {
                    case roles.unauthenticated:
                    case roles.believer:
                    case roles.signer:
                    case roles.catechist:
                        return resolve(false);
                    break;


                    case roles.parishOfficer:
                    case roles.chaplain:
                    case roles.parishPriest:
                        return resolve(false)
                    break;
                    

                    case roles.deanOfficer:
                    case roles.dean:
                        return resolve(false);
                    break;

                    case roles.bishopOfficer:
                    case roles.bishop:
                        return resolve(false);
                    break;

                    case roles.archbishopOfficer:
                    case roles.archbishop:
                        return resolve(false);
                    break;

                    case roles.popeOfficer:
                    case roles.pope:
                    case roles.admin:
                        return resolve(true);
                }
            break;
        }

    })
}