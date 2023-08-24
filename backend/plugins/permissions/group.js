const roles = require("../roles");

module.exports.getDetails = 0;
module.exports.changeDetails = 1;
module.exports.addCandidate = 2;
module.exports.deleteCandidate = 3;
module.exports.addLeader = 4;
module.exports.deleteLeader = 5;




module.exports.check = async function (group, user, permission) {
    return new Promise(async (resolve, reject) => {
        console.log("GROUP")
        console.log(permission)
        switch (permission) {
            case this.deleteLeader:
            case this.changeDetails:
            case this.addCandidate:
            case this.deleteCandidate:
            case this.addLeader:
            case this.getDetails:
                switch (user.role) {
                    case roles.unauthenticated:
                    case roles.believer:
                    case roles.signer:
                        return resolve(false); 
                    case roles.catechist:
                        group.getLeader({
                            where: {
                                id: user.id
                            },
                            attributes: ['id']
                        }).then(async (user) => {
                            resolve(user!==null);
                        })
                    break;


                    case roles.parishOfficer:
                    case roles.chaplain:
                    case roles.parishPriest:
                        group.getLeader({
                            where: {
                                id: user.id
                            },
                            attributes: ['id']
                        }).then(async (_user) => {
                            if(!_user) {
                                const groupParish = await group.getParish({attributes: ['id']});
                                const userParish = await user.getParishes({where: {id: groupParish.id}});
                                resolve(userParish!==[])
                            } else resolve(true);
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
                        console.log("roles.admin")

                        return resolve(true);
                }
            break;
        }

    })
}