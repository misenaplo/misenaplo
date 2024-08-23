<template>
    <div>
        <template>
            <v-data-table :headers="headers" :items="attendances">
                <template v-slot:top>
                    <v-row>
                        <v-col cols="12" :sm="3">
                            <h2>{{ candidateName }} részvételei szentmiséken</h2>
                        </v-col>
                        <v-col v-if="$store.getters.userRole >= roles.signer" cols="12" :sm="3">
                            <v-btn color="red accent-4" rounded @click="undo()"><v-icon>fa-undo</v-icon>Visszavonás (20
                                percen belül)</v-btn>
                        </v-col>
                        <v-col cols="12" :sm="$store.getters.userRole >= roles.signer ? 3 : 4">
                            <v-menu v-model="dateMenus.begin" :close-on-content-click="false" :nudge-right="40"
                                transition="scale-transition" offset-y min-width="auto">
                                <template v-slot:activator="{ on, attrs }">
                                    <v-text-field v-model="begin" label="Kezdő időpont" prepend-inner-icon="fa-calendar"
                                        readonly v-bind="attrs" v-on="on" rounded outlined />
                                </template>
                                <v-date-picker v-model="begin" :first-day-of-week="1"
                                    @input="dateMenus.begin = false" />
                            </v-menu>
                        </v-col>
                        <v-col cols="12" :sm="$store.getters.userRole >= roles.signer ? 3 : 4">
                            <v-menu v-model="dateMenus.end" :close-on-content-click="false" :nudge-right="40"
                                transition="scale-transition" offset-y min-width="auto">
                                <template v-slot:activator="{ on, attrs }">
                                    <v-text-field v-model="end" label="Befejező időpont"
                                        prepend-inner-icon="fa-calendar" readonly v-bind="attrs" v-on="on" rounded
                                        outlined />
                                </template>
                                <v-date-picker v-model="end" :first-day-of-week="1" @input="dateMenus.end = false" />
                            </v-menu>
                        </v-col>
                    </v-row>
                </template>
                <template v-slot:item.signer="{ item }">
                    {{ item.Signer.fullname }}
                </template>
                <template v-slot:item.createdAt="{ item }">
                    {{ (new Date(item.createdAt)).toLocaleString('hu-HU') }}
                </template>
                <template v-slot:item.reward="{ item }" v-if="!($store.getters.userRole >= roles.signer)">
                    <span v-if="item.solutionTime">
                        <v-img :src="rewardImage(item.RewardImageId)" />
                    </span>
                    <span v-else-if="new Date(item.createdAt) > yesterday && item.RewardImageId !== null">
                        <v-tooltip top>
                        Jutalomjáték elkezdése
                        <template v-slot:activator="{ on, attrs }">
                            <v-btn icon @click="rewardPuzzle.attendanceId = item.id, rewardPuzzle.rewardImageId = item.RewardImageMediumId, rewardPuzzle.show = true" v-on="on"
                                v-bind="attrs">
                                <v-icon>fa-puzzle-piece</v-icon>
                            </v-btn>
                        </template>
                    </v-tooltip>
                    </span>
                </template>
            </v-data-table>
            <v-dialog v-model="rewardPuzzle.show" persistent max-width="600px">

                <v-card>
                    <v-card-text>
                        <span class="headline">Jutalom</span>
                    </v-card-text>
                    <v-card-text>
                        <v-container>
                            <reward-puzzle :attendanceId="rewardPuzzle.attendanceId" :rewardImageId="rewardPuzzle.rewardImageId" @finish="rewardPuzzle.show = false, rewardPuzzle.attendanceId = false"/>
                        </v-container>
                    </v-card-text>
                    <v-card-actions>
                        <v-spacer></v-spacer>
                        <v-btn color="blue darken-1" text @click="rewardPuzzle.show = false, rewardPuzzle.attendanceId = null">
                            Ok
                        </v-btn>
                    </v-card-actions>
                </v-card>
            </v-dialog>
        </template>
    </div>
</template>

<script>
import roles from '../plugins/roles';
import rewardPuzzle from './rewardPuzzle.vue';
export default {
    components: {
        rewardPuzzle
    },
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
            })(new Date(), -1).toISOString().substring(0, 10)
        },
        end: {
            type: null,
            default: (new Date()).toISOString().substring(0, 10)
        },
        attributes: {
            type: null,
            default: 'full'
        }
    },
    data: function () {
        return {
            rewardPuzzle: {
                show: false,
                attendanceId: null,
                rewardImageId: null
            },
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
                {
                    text: "Jutalom",
                    align: "center",
                    sortable: false,
                    filterable: false,
                    value: "reward"
                }
            ],
            dateMenus: {
                begin: false,
                end: false
            },
            roles
        }
    },
    computed: {
        yesterday: function () {
            var d = new Date();
            d.setDate(d.getDate() - 1);
            return d;
        }
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
        undo: function () {
            this.axios({ url: `scan/candidate/${this.candidateId}`, method: "DELETE" }).then(response => {
                this.getAttendance(true)
                this.$store.commit('setSnack', response.data.success ? "Visszavonva." : "Már nem lehet visszavonni.")
            })
        },
        getAttendance: function (name) {
            this.axios({ url: `attendance/${this.candidateId ? 'candidate' : ''}`, method: "GET", params: { candidateId: this.candidateId, begin: this.begin, end: this.end, attributes: this.attributes, ...(name ? { withName: 1 } : {}) } }).then((response) => {
                if (response.data.success) {
                    if (name) this.candidateName = response.data.data.candidateName
                    this.attendances = response.data.data.attendances
                }
            })
        },
        rewardImage: function (id) {
            return `/api/rewardImage/${id}`
        }

    },
    mounted() {
        if (this.$route.params.candidateId) this.candidateId = this.$route.params.candidateId;
        this.getAttendance(true)
    }
}
</script>
