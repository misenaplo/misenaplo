<template>
    <div>
        <template>
            <v-data-table :headers="headers" :items="attendances">
                <template v-slot:top>
                    <v-row>
                        <v-col cols="12" :sm="4">
                            <h2>{{ candidateName }} részvételei szentmiséken</h2>
                        </v-col>
                        <v-col cols="12" :sm="4">
                            <v-menu v-model="dateMenus.begin" :close-on-content-click="false" :nudge-right="40"
                                transition="scale-transition" offset-y min-width="auto">
                                <template v-slot:activator="{ on, attrs }">
                                    <v-text-field v-model="begin" label="Kezdő időpont"
                                        prepend-inner-icon="fa-calendar" readonly v-bind="attrs" v-on="on" rounded
                                        outlined />
                                </template>
                                <v-date-picker v-model="begin" :first-day-of-week="1"
                                    @input="dateMenus.begin = false" />
                            </v-menu>
                        </v-col>
                        <v-col cols="12" :sm="4">
                            <v-menu v-model="dateMenus.end" :close-on-content-click="false" :nudge-right="40"
                                transition="scale-transition" offset-y min-width="auto">
                                <template v-slot:activator="{ on, attrs }">
                                    <v-text-field v-model="end" label="Befejező időpont"
                                        prepend-inner-icon="fa-calendar" readonly v-bind="attrs" v-on="on" rounded
                                        outlined />
                                </template>
                                <v-date-picker v-model="end" :first-day-of-week="1"
                                    @input="dateMenus.end = false" />
                            </v-menu>
                        </v-col>
                    </v-row>
                </template>
                <template v-slot:item.signer="{item}">
                    {{item.Signer.fullname}}
                </template>
                <template v-slot:item.createdAt="{item}">
                    {{(new Date(item.createdAt)).toLocaleString('hu-HU')}}
                </template>
            </v-data-table>
        </template>
    </div>
</template>

<script>
export default {
    props: {
        candidateId: null,
        begin: {
            type: null,
            default: (function (date, months) {
                    var d = date.getDate();
                    date.setMonth(date.getMonth() + +months);
                    if (date.getDate() != d) {
                        date.setDate(0);
                    }
                    return date;
                    })(new Date(), -1).toISOString().substring(0,10)
        },
        end: {
            type: null,
            default: (new Date()).toISOString().substring(0,10)
        },
        attributes: {
            type: null,
            default: 'full'
        }
    },
    data: function () {
        return {
            candidateName: [],
            attendances: [],
            headers: [
                {
                    text: "Dátum",
                    align: "center",
                    sortable: false,
                    filterable: false,
                    value: "createdAt"
                },
                {
                    text: "Aláíró",
                    align: "center",
                    sortable: false,
                    filterable: false,
                    value: "signer"
                },
            ],
            dateMenus: {
                begin: false,
                end: false
            }
        }
    },
    computed: {

    },
    watch: {
        'candidateId': function () {
            this.getAttendance(false);
        },
        'begin': function () {
            this.getAttendance(false);
        },
        'end': function () {
            this.getAttendance(false);
        },
        'attributes': function () {
            this.getAttendance(false);
        },
        '$route.params.candidateId': function () {
            this.candidateId = this.$route.params.candidateId;
        },
        '$route.params.begin': function () {
            this.begin = this.$route.params.begin;
        },
        '$route.params.end': function () {
            this.end = this.$route.params.end;
        },
        '$route.params.attributes': function () {
            this.attributes = this.$route.params.attributes;
        },


    },
    methods: {
        getAttendance: function (name) {
            this.axios({ url: `attendance/${this.candidateId?'candidate':''}`, method: "GET", params: { candidateId: this.candidateId, begin: this.begin, end: this.end, attributes: this.attributes, ...(name ? { withName: 1 } : {}) } }).then((response) => {
                if (response.data.success) {
                    if (name) this.candidateName = response.data.data.candidateName
                    this.attendances = response.data.data.attendances
                }
            })
        },

    },
    mounted() {
        if(this.$route.params.candidateId) this.candidateId=this.$route.params.candidateId;
        this.getAttendance(true)
    }
}
</script>
