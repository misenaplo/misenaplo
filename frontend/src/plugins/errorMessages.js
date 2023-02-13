var errorMessages = [];


errorMessages[9999] = "Ismeretlen hiba történt"
errorMessages[500] = errorMessages[9999]

errorMessages[404] = "A funkció vagy a keresett oldal nem elérhető."
errorMessages[1001] = "Nem megfelelő bejelentkezési adatokat adott meg. Kérem próbálja újra!"
errorMessages[1002] = "Az oldal megtekintéséhez kérem jelentkezzen be!"
errorMessages[401] = errorMessages[1002];
errorMessages[1003] = errorMessages[1001]; // Hiányzó adatok
errorMessages[1004] = "Az oldal megtekintéséhez nincs joga!"
errorMessages[1005] = "A kliens hibás kérést küldött"
errorMessages[400] = errorMessages[1005];
errorMessages[1006] = "Helytelen adatokat adott meg!"
errorMessages[1007] = "A példány nem található"
errorMessages[1008] = "Már létezik!"
errorMessages[1009] = "Hiba történt a \"Nem vagyok robot\" próba ellenőrzésekor!"

errorMessages[403] = "Nem engedélyezett művelet"

export default errorMessages;