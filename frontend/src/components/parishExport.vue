<template>
    <div>
        <v-card>
            <v-card-title>
                <v-icon left>fa-file-excel</v-icon>
                Ministrálási adatok exportálása
            </v-card-title>
            <v-card-text>
                <v-row align="start">
                    <v-col cols="12" :sm="3">
                        <v-menu v-model="dateMenus.begin" :close-on-content-click="false" :nudge-right="40"
                            transition="scale-transition" offset-y min-width="auto">
                            <template v-slot:activator="{ on, attrs }">
                                <v-text-field v-model="params.begin" label="Kezdő időpont"
                                    prepend-inner-icon="fa-calendar" readonly v-bind="attrs" v-on="on" rounded outlined />
                            </template>
                            <v-date-picker v-model="params.begin" :first-day-of-week="1"
                                @input="dateMenus.begin = false" />
                        </v-menu>
                    </v-col>
                    <v-col cols="12" :sm="3">
                        <v-menu v-model="dateMenus.end" :close-on-content-click="false" :nudge-right="40"
                            transition="scale-transition" offset-y min-width="auto">
                            <template v-slot:activator="{ on, attrs }">
                                <v-text-field v-model="params.end" label="Befejező időpont"
                                    prepend-inner-icon="fa-calendar" readonly v-bind="attrs" v-on="on" rounded outlined />
                            </template>
                            <v-date-picker v-model="params.end" :first-day-of-week="1"
                                @input="dateMenus.end = false" />
                        </v-menu>
                    </v-col>
                    <v-col cols="12" :sm="3">
                        <v-checkbox label="Csak akiknek volt jelenlétük a periódusban" v-model="params.hasAttendance" />
                        <v-checkbox label="Csak akik ministráltak a periódusban" v-model="params.hasServed" />
                    </v-col>
                    <v-col cols="12" :sm="2">
                        <v-checkbox label="Részletes miserészvételi adatok" v-model="params.details" />
                    </v-col>
                    <v-col cols="12" :sm="1">
                        <v-tooltip top>
                            Ministrálási adatok letöltése xlsx formátumban
                            <template v-slot:activator="{ on, attrs }">
                                <v-btn color="warning" fab v-on="on" v-bind="attrs"
                                    :href="`${this.axios.defaults.baseURL}parish/${parishId}/xlsx/attendance/${params.begin}/${params.end}/0/${params.details ? 1 : 0}?hasAttendance=${params.hasAttendance ? 1 : 0}&hasServed=${params.hasServed ? 1 : 0}`"
                                    target="_blank"><v-icon>fa-file-excel</v-icon></v-btn>
                            </template>
                        </v-tooltip>
                    </v-col>
                </v-row>
            </v-card-text>
        </v-card>
    </div>
</template>

<script>
export default {
    props: ['parishId'],
    data: function () {
        return {
            params: {
                begin: this.monthAgo().substring(0, 10),
                end: (new Date()).toISOString().substring(0, 10),
                hasAttendance: false,
                hasServed: false,
                details: false
            },
            dateMenus: {
                begin: false,
                end: false
            }
        }
    },
    methods: {
        monthAgo: function () {
            var d = new Date();
            var day = d.getDate();
            d.setMonth(d.getMonth() - 1);
            if (d.getDate() !== day) d.setDate(0);
            return d.toISOString();
        }
    }
}
</script>