const roles = require("../roles");

module.exports.changeDetails = 0;

module.exports.check = async function (user2, user, permission) {
    return new Promise(async (resolve, reject) => {
        switch (permission) {
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
                        const parishes = await Promise.all((await user.getParishes({attributes: ['id']})).map(async p => p.id))
                        const u2parishes = await user2.getParishes({
                            where: {
                                id: {
                                    [Op.in]: parishes
                                }
                            }
                        })
                        resolve(u2parishes.length>0 && user2.role<user.role)
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
        }

    })
}