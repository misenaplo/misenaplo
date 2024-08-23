module.exports = function (sequelize) {

    const {
        Media,
        User,
        Group,
        Parish,
        Candidate,
        Attendance,
        RewardImage
    } = sequelize.models;

    Group.belongsTo(Parish);
    Parish.hasMany(Group);

    Group.belongsToMany(User, {as: "Leader", through: "GroupLeaders"});
    User.belongsToMany(Group, {as: "ledGroup", through: "GroupLeaders"});

    User.belongsToMany(Parish, {through: "ParishUser"});
    Parish.belongsToMany(User, {through: "ParishUser"});

    Candidate.belongsToMany(Group, {through: "CandidateGroup"})
    Group.belongsToMany(Candidate, {through: "CandidateGroup"})

    Candidate.belongsToMany(Parish, {through: "CandidateParish"})
    Parish.belongsToMany(Candidate, {through: "CandidateParish"})


    Attendance.belongsTo(Parish);
    Parish.hasMany(Attendance);

    Attendance.belongsTo(User, {as: "Signer"});
    User.hasMany(Attendance, {foreignKey: "SignerId"});

    Attendance.belongsTo(RewardImage, {key: "MediaId"}),
    RewardImage.hasMany(Attendance)

    Attendance.belongsTo(Candidate);
    Candidate.hasMany(Attendance);

    RewardImage.belongsTo(Media)
    Media.hasMany(RewardImage)
    

}
