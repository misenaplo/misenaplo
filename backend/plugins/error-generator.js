const codes = require("./error-codes");

module.exports = {

    generic: function (params) {
        const code = params.code || codes.UNKNOWN_ERROR;
        const message = params.message || "Ismeretlen hiba történt.";

        var result = { success: false, error: { code, message }, data: null };

        if (params.extraFields instanceof Object) {
            Object.assign(result.error, params.extraFields)
        }

        console.log(result) // log error messages
        return result;
    },

    UNKNOWN_ERROR: this.generic,

    INVALID_CREDENTIALS: function (notice) {
        const message = notice || "A megadott felhasználónév, email vagy jelszó helytelen."
        return this.generic({ code: codes.INVALID_CREDENTIALS, message })
    },

    NOT_LOGGED_IN: function () {
        return this.generic({ code: codes.NOT_LOGGED_IN, message: "Nincs bejelentkezve!" })
    },

    INSUFFICIENT_PRIVILEGES: function (notice) {
        const message = notice || "Ehhez nincs jogosultsága!";
        return this.generic({ code: codes.INSUFFICIENT_PRIVILEGES, message })
    },

    FAILED_VALIDATION: function (malformedFields) {
        return this.generic({ code: codes.FAILED_VALIDATION, message: "Rosszul formázott adatok!", extraFields: { malformedFields } })
    },

    MALFORMED_BODY: function(missingFields) {
        return this.generic({ code: codes.MALFORMED_BODY, message: "Rosszul formázott kérés!", extraFields: { missingFields } })
    },

    INSTANCE_NOT_FOUND: function (notice) {
        const message = notice || "Nincs ilyen tag!";
        return this.generic({ code: codes.INSTANCE_NOT_FOUND, message })
    },

    DUPLICATE_ENTRY: function (duplicateFields) {
        const message = /*notice ||*/ "Már létezik!";
        return this.generic({ code: codes.DUPLICATE_ENTRY, message, extraFields: { duplicateFields } })
    },

    INVALID_RECAPTCHA: function(notice) {
        const message = notice || "Érvénytelen reCaptcha!";
        return this.generic({ code: codes.INVALID_RECAPTCHA, message })
    }

}
