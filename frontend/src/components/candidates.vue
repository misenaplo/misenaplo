<template>
    <div>
        <template>
            <v-data-table :headers="tables.candidates.headers" :items="candidates">
                <template v-slot:top>
                    <v-row>
                        <!--<v-col cols="12" :sm="3">
                            <v-switch v-model="tables.candidates.options.showLink"
                                label="Szkennelő link mutatása (ideiglenes)"></v-switch>
                            <v-switch v-model="tables.candidates.options.showQR" label="QR mutatása"></v-switch>
                        </v-col>-->
                        <v-col cols="12" :sm="4">
                            <v-menu v-model="dateMenus.begin" :close-on-content-click="false" :nudge-right="40"
                                transition="scale-transition" offset-y min-width="auto">
                                <template v-slot:activator="{ on, attrs }">
                                    <v-text-field v-model="dialogs.attendanceForCandidate.params.begin"
                                        label="Kezdő időpont" prepend-inner-icon="fa-calendar" readonly v-bind="attrs"
                                        v-on="on" rounded outlined />
                                </template>
                                <v-date-picker v-model="dialogs.attendanceForCandidate.params.begin"
                                    :first-day-of-week="1" @input="dateMenus.begin = false" />
                            </v-menu>
                        </v-col>
                        <v-col cols="12" :sm="4">
                            <v-menu v-model="dateMenus.end" :close-on-content-click="false" :nudge-right="40"
                                transition="scale-transition" offset-y min-width="auto">
                                <template v-slot:activator="{ on, attrs }">
                                    <v-text-field v-model="dialogs.attendanceForCandidate.params.end"
                                        label="Befejező időpont" prepend-inner-icon="fa-calendar" readonly
                                        v-bind="attrs" v-on="on" rounded outlined />
                                </template>
                                <v-date-picker v-model="dialogs.attendanceForCandidate.params.end"
                                    :first-day-of-week="1" @input="dateMenus.end = false" />
                            </v-menu>
                        </v-col>
                        <v-col cols="12" :sm="2">
                            <v-checkbox label="Részletes miserészvételi adatok" v-model="attendanceXLSX.details"/>
                            <v-text-field v-model="attendanceXLSX.minAttendance" :rules="[fieldRules.isNumber]" label="Minimum jelenlét (db)" rounded outlined prepend-inner-icon="fa-church"/>
                        </v-col>
                        <v-col cols="12" :sm="1">
                            <v-tooltip top v-if="fieldRules.isNumber(attendanceXLSX.minAttendance)===true">
                                Miserészvételi adatok letöltése xlsx formátumban
                                <template v-slot:activator="{ on, attrs }">
                                    <v-btn color="warning" fab v-on="on" v-ind="attrs" :href="`${axios.defaults.baseURL}group/${$route.params.id}/xlsx/attendance/${dialogs.attendanceForCandidate.params.begin}/${dialogs.attendanceForCandidate.params.end}/${attendanceXLSX.minAttendance}/${attendanceXLSX.details?1:0}`" target="_blank"><v-icon>fa-file-excel</v-icon></v-btn>
                                </template>
                            </v-tooltip>
                        </v-col>
                        <v-col cols="12" :sm="1">
                            <v-tooltip top>
                                Hozzáadás
                                <template v-slot:activator="{ on, attrs }">
                                    <v-btn fab color="success" v-on="on" v-bind="attrs"
                                        @click="dialogs.newCandidate.show = true">
                                        <v-icon>fa-plus</v-icon>
                                    </v-btn>
                                </template>
                            </v-tooltip>
                        </v-col>
                    </v-row>
                </template>
                <template v-for="slot in dateSlots" v-slot:[slot.slot]="{ item }">
                    <span>
                        <v-checkbox v-model="item[slot.value]" readonly @click="informations(item, slot)" />
                    </span>
                </template>
                <template v-slot:item.actions="{ item }">
                    <v-btn icon @click="dialogs.attendanceForCandidate.params.id = item.id">
                        <v-icon>fa-calendar</v-icon>
                    </v-btn>
                </template>
                <template v-slot:item.url="{ item }">
                    <a :href="scanURL(item.id)" target="_blank">{{scanURL(item.id)}}</a>
                </template>
                <template v-slot:item.QR="{ item }">
                    <qr-code :text="scanURL(item.id)" ></qr-code>
                </template>
            </v-data-table>
            <v-row justify="center">
                <v-dialog v-model="dialogs.newCandidate.show" persistent max-width="600px">

                    <v-card>
                        <v-card-title>
                            <span class="headline">Új gyerek</span>
                        </v-card-title>
                        <v-card-text>
                            <v-container>
                                <v-text-field prepend-inner-icon="fa-praying-hands" label="Név"
                                    v-model="dialogs.newCandidate.candidate.name" rounded outlined />
                            </v-container>
                        </v-card-text>
                        <v-card-actions>
                            <v-spacer></v-spacer>
                            <v-btn color="blue darken-1" text @click="dialogs.newCandidate.show = false">
                                Mégsem
                            </v-btn>
                            <v-btn color="blue darken-1" text @click="newCandidate()"
                                v-if="dialogs.newCandidate.candidate.name">
                                Hozzáadás
                            </v-btn>
                        </v-card-actions>
                    </v-card>
                </v-dialog>

            </v-row>
            <v-row justify="center">
                <v-dialog v-model="dialogs.attendanceForCandidate.show" persistent max-width="1000px">
                    <v-card>

                        <v-card-text>
                            <v-container>
                                <attendanceForCandidate v-if="dialogs.attendanceForCandidate.show"
                                    :candidateId="dialogs.attendanceForCandidate.params.id"
                                    :begin="dialogs.attendanceForCandidate.params.begin"
                                    :end="dialogs.attendanceForCandidate.params.end"
                                    :attributes="dialogs.attendanceForCandidate.params.attributes" />
                            </v-container>
                        </v-card-text>
                        <v-card-actions>
                            <v-spacer></v-spacer>
                            <v-btn color="blue darken-1" text @click="dialogs.attendanceForCandidate.params.id = ''">
                                Bezárás
                            </v-btn>

                        </v-card-actions>
                    </v-card>

                </v-dialog>

            </v-row>
        </template>
    </div>
</template>

<script>
import roles from '../plugins/roles';
import attendanceForCandidate from './attendanceForCandidate.vue';
export default {
    components: {
        attendanceForCandidate
    },
    props: ['groupId'],
    data: function () {
        return {
            candidates: [],
            dateSlots: [],
            options: {
                page: 1,
                itemsPerPage: 25,
                search: "",
                attributes: 'list'
            },
            totalCandidates: 1,
            tables: {
                candidates: {
                    options: {
                        showLink: false,
                        showQR: false
                    },
                    headers: [
                        {
                            text: "Név",
                            align: "center",
                            sortable: false,
                            filterable: false,
                            value: "name"
                        },
                        /*{
                            text: 'Létszám',
                            align: "center",
                            sortable: false,
                            filterable: false,
                            value: "candidateCount"
                        },*/
                        /*{
                            text: 'Qr',
                            align: "center",
                            sortable: false,
                            filterable: false,
                            value: "QR"
                        },*/
                        /*{
                            text: 'Link',
                            align: "center",
                            sortable: false,
                            filterable: false,
                            value: "url"
                        },*/
                        {
                            text: "Műveletek",
                            align: "center",
                            sortable: false,
                            filterable: false,
                            value: "actions"
                        }
                    ]
                }
            },
            dialogs: {
                newCandidate: {
                    show: false,
                    candidate: {
                        name: ''
                    }
                },
                attendanceForCandidate: {
                    show: false,
                    params: {
                        id: '',
                        begin: this.addMonths(new Date(), -1).toISOString().substring(0,10),
                        end: (new Date()).toISOString().substring(0,10),
                        attributes: 'full'
                    },
                }
            },
            dateMenus: {
                begin: false,
                end: false
            },
            attendanceXLSX: {
                details: false,
                minAttendance: 0
            }
        }
    },
    computed: {
        candidateTableHeaders() {

        },

    },
    watch: {
        'dialogs.newCandidate.show': function () {
            this.dialogs.newCandidate.candidate.name = '';
        },
        'dialogs.attendanceForCandidate.params.id': function (newVal, oldVal) {
            this.dialogs.attendanceForCandidate.show = newVal != '';
        }
    },
    methods: {
        scanURL(id) {
            return ((new URL(`${this.axios.defaults.baseURL}scan/candidate?candidateId=${id}`, window.location.origin)).href)

        },
        newCandidate() {
            console.log({ url: "candidate", method: "POST", data: { ...this.dialogs.newCandidate.candidate, ...(this.groupId ? { groupId: this.groupId } : {}) } })
            this.axios({ url: "candidate", method: "POST", data: { ...this.dialogs.newCandidate.candidate, ...(this.groupId ? { groupId: this.groupId } : {}) } }).then((response) => {
                if (response.data.success) {
                    this.candidates.push({
                        id: response.data.data.id,
                        name: this.dialogs.newCandidate.candidate.name
                    });
                    this.dialogs.newCandidate.show = false;
                }
            })
        },
        search: function () {
            this.options.page = 1;
            this.getCandidates()
        },
        changePage: function (plus) {
            this.options.page += (plus ? 1 : -1)
            this.getCandidates()
        },
        getCandidates: function () {
            this.axios({ url: "candidate", method: "GET", params: { ...this.options, ...(this.groupId || this.$route.params.groupId ? { groupId: this.groupId || this.$route.params.groupId } : {}) } }).then((response) => {
                if (response.data.success) {
                    this.candidates = response.data.data.candidates
                    this.totalCandidates = response.data.data.totalCandidates
                }
            })
        },

    },
    mounted() {
        this.getCandidates()
    }
}
</script>
