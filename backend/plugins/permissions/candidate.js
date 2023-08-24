const roles = require("../roles");
const groupPermissionCheck = require('./group');
module.exports.getDetails = groupPermissionCheck.getDetails;
module.exports.changeDetails = groupPermissionCheck.changeDetails;




module.exports.check = async function (candidate, user, permission) {
    console.log(permission)
    return new Promise(async (resolve, reject) => {
        switch (permission) {
            case module.exports.getDetails:
            case module.exports.changeDetails:
                const groups = await candidate.getGroups();
                var ok = false;
                await Promise.all(groups.map(async (group) => {
                    return new Promise(async (resolveGP, reject) => {
                        if(ok) return resolveGP();
                        else {
                            const hasPermission = await groupPermissionCheck.check(group, user, permission);
                            if(hasPermission) ok = true;
                            resolveGP();
                        }
                    })
                }))
                return resolve(ok);
            break;
        }

    })
}