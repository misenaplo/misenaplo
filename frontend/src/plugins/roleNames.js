import roles from './roles'

var roleNames = []

roleNames[roles.unauthenticated] = "Nem bejelentkezett"
roleNames[roles.believer] = "Hívő"
roleNames[roles.signer] = "Aláíró"
roleNames[roles.catechist] = "Hittantanár"
roleNames[roles.chaplain] = "Káplán"
roleNames[roles.parishOfficer] = "Plébániai irodista"
roleNames[roles.parishPriest] = "Plébános"
roleNames[roles.deanOfficer] = "Esperesi irodista"
roleNames[roles.dean] = "Esperes"
roleNames[roles.bishopOfficer] = "Püspökségi irodista"
roleNames[roles.bishop] = "Püspök"
roleNames[roles.archbishopOfficer] = "Érsekségi irodista"
roleNames[roles.archbishop] = "Érsek"
roleNames[roles.popeOfficer] = "Szentszéki irodista"
roleNames[roles.pope] = "Pápa"
roleNames[roles.admin] = "Rendszergazda"

export default roleNames;
