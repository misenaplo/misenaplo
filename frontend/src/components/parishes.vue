<template>
    <div>
        <template>
            <v-data-table :headers="tables.parishes.headers" :items="parishes" hide-default-footer disable-pagination>
                <template v-slot:top>
                    <v-row>
                        <v-col cols="12"
                            sm="11">
                            <!--  <v-text-field
			          v-model="options.search"
			          label="Keresés"
			          prepend-inner-icon="fa-search"
			          class="mx-4"
								rounded
								outlined
								@change=""
			        />-->
                        </v-col>
                        <v-col cols="12" sm="1">
                            <v-tooltip top>
                                Hozzáadás
                                <template v-slot:activator="{ on, attrs }">
                                    <v-btn fab color="success" v-on="on" v-bind="attrs" @click="dialog.show = true">
                                        <v-icon>fa-plus</v-icon>
                                    </v-btn>
                                </template>
                            </v-tooltip>
                        </v-col>
                    </v-row>
                </template>
                <template v-slot:item.view="{ item }">
                    <v-btn icon :href="$router.resolve({ name: 'parish', params: { id: item.id } }).href"
                        target="_blank">
                        <v-icon>fa-eye</v-icon>
                    </v-btn>
                </template>
                <template v-slot:footer>
                    <v-row align="center" justify="end">
                        <v-col cols="12" sm="3" align="center">
                            <v-select align="center" label="Plébániák egy oldalon"
                                :items="[{ text: 10, value: 10 }, { text: 15, value: 15 }, { text: 25, value: 25 }, { text: 50, value: 50 }, { text: 'Mind', value: 0 }]"
                                v-model="options.itemsPerPage" prepend-inner-icon="fa-users" rounded outlined
                                @change="options.page = options.page > Math.ceil(totalParishes / options.itemsPerPage) ? Math.ceil(totalParishes / options.itemsPerPage) : options.page, getParishes()" />
                        </v-col>
                        <v-col cols="12" sm="1" align="center" justify="center">
                            {{ (options.page - 1) * options.itemsPerPage + 1 }}-{{ options.itemsPerPage != 0 ? (((options.page - 1) * options.itemsPerPage + options.itemsPerPage) > totalParishes ? totalParishes : ((options.page - 1) * options.itemsPerPage + options.itemsPerPage)) : totalParishes }}/{{ totalParishes }}
                        </v-col>
                        <v-col cols="12" sm="2" align="center">
                            <v-btn icon :disabled="options.page < 2" @click="changePage(false)">
                                <v-icon>fa-arrow-left</v-icon>
                            </v-btn>{{ options.page }}. oldal<v-btn icon
                                :disabled="options.page == Math.ceil(totalParishes / options.itemsPerPage)"
                                @click="changePage(true)">
                                <v-icon>fa-arrow-right</v-icon>
                            </v-btn>
                        </v-col>
                    </v-row>
                </template>
            </v-data-table>
            <v-row justify="center">
                <v-dialog v-model="dialog.show" persistent max-width="600px">

                    <v-card>
                        <v-card-title>
                            <span class="headline">Új plébánia</span>
                        </v-card-title>
                        <v-card-text>
                            <v-container>
                                <v-text-field prepend-inner-icon="fa-church" label="Név" v-model="dialog.parish.name"
                                    rounded outlined />
                                    <v-text-field prepend-inner-icon="fa-phone" label="Telefonszám" v-model="dialog.parish.phone"
                                    rounded outlined />
                                    <v-text-field prepend-inner-icon="fa-envelope" label="Email" v-model="dialog.parish.email"
                                    rounded outlined />
                                    <v-text-field prepend-inner-icon="fa-map-marker" label="Helyszín" v-model="dialog.parish.location"
                                    rounded outlined />
                            </v-container>
                        </v-card-text>
                        <v-card-actions>
                            <v-spacer></v-spacer>
                            <v-btn color="blue darken-1" text @click="dialog.show = false">
                                Mégsem
                            </v-btn>
                            <v-btn color="blue darken-1" text @click="create()"
                                v-if="dialog.parish.name && dialog.parish.phone && dialog.parish.email && dialog.parish.location">
                                Hozzáadás
                            </v-btn>
                        </v-card-actions>
                    </v-card>
                </v-dialog>
            </v-row>

        </template>
    </div>
</template>

<script>
export default {
    props: [],
    data: function () {
        return {
            parishes: [],
            options: {
                page: 1,
                itemsPerPage: 25,
                search: "",
                attributes: 'full'
            },
            totalParishes: 1,
            tables: {
                parishes: {
                    headers: [
                        {
                            text: "Plébánia",
                            align: "center",
                            sortable: true,
                            filterable: false,
                            value: "name"
                        },
                        {
                            text: "Email",
                            align: "center",
                            sortable: false,
                            filterable: false,
                            value: "email"
                        },
                        {
                            text: "Telefonszám",
                            align: "center",
                            sortable: true,
                            filterable: false,
                            value: "phone"
                        },
                        {
                            text: "Hely",
                            align: "center",
                            sortable: false,
                            filterable: false,
                            value: "location"
                        },
                        {
                            text: 'Megtekintés',
                            align: "center",
                            sortable: false,
                            filterable: false,
                            value: "view"
                        },
                    ]
                }
            },
            dialog: {
                show: false,
                parish: {
                    name: '',
                    email: '',
                    phone: '',
                    location: ''
                }
            }
        }
    },
    computed: {
    },
    watch: {

    },
    methods: {
        create: function () {
            this.axios({ url: "parish", method: "POST", data: { ...this.dialog.parish } }).then((response) => {
                if (response.data.success) {
                    this.parishes.push({ ...this.dialog.parish, id: response.data.data.id });
                    this.dialog.show = false;
                    this.dialog.parish = { name: '', email: '', phone: '', location: '' }
                    this.$store.commit('setSnack', 'A hozzáadás sikeresen megtörtént.')
                }
            })
        },
        search: function () {
            this.options.page = 1;
            this.getParishes()
        },
        changePage: function (plus) {
            this.options.page += (plus ? 1 : -1)
            this.getParishes()
        },
        getParishes: function () {
            this.axios({ url: "parish", method: "GET", params: this.options }).then((response) => {
                if (response.data.success) {
                    this.parishes = response.data.data.parishes
                    this.totalParishes = response.data.data.totalParishes
                }
            })
        }
    },
    mounted() {

        this.getParishes()
    }
}
</script>
