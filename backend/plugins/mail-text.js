module.exports = {
    user: {
        create: {
            subject: () => "Sikeres regisztráció a MisEnaplóba",
            body: (username, password, fullname) => `Tisztelt ${fullname}!

Sikeresen regisztrálták a MisEnaplóba!

Felhasználóneve: ${username}
Jelszava: ${password}

Bejelentkezni az alábbi linkre kattintva tud:
https://misenaplo.hu

Köszönjük!`
        },

        forgottenpassword: {
            subject: () => "MisEnapló egyszeri jelszó",
            body: (username, password, fullname) => `Tisztelt ${fullname}!
Létrehoztunk az Ön kérésére egy ideiglenes jelszót amivel egyszer bejelentkezhet.
Amennyiben Ön nem kért ideiglenes jelszót, jelentkezzen be eredeti jelszavával és tekintse tárgytalannak levelünket.

Ideiglenes jelszava: ${password}

Bejelentkezni az alábbi linkre kattintva tud:
https://misenaplo.hu
`
        }
    }
}