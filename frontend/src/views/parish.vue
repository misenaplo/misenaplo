<template>
    <div>
        <v-card>
            <v-toolbar flat color="primary" dark>
                <v-toolbar-title>{{ parish.name }}</v-toolbar-title>
            </v-toolbar>
            <v-tabs :vertical="!isMobilephone">
                <v-tab>
                    <v-icon left>
                        fa-church
                    </v-icon>
                    Plébánia
                </v-tab>
                <v-tab>
                    <v-icon left>
                        fa-user
                    </v-icon>
                    Felhasználók
                </v-tab>

                <v-tab>
                    <v-icon left>
                        fa-users
                    </v-icon>
                    Csoportok
                </v-tab>
                <v-tab-item>
                    <!--Plébánia-->
                    <v-simple-table>
                        <tbody>
                            <tr>
                                <th style="text-align: right">Név</th>
                                <td colspan="2" style="text-align: center">{{ parish.name }}</td>

                            </tr>


                            <tr>
                                <th style="text-align: right">Email</th>
                                <td style="text-align: center">{{ parish.email }}</td>
                                <td>
                                    <v-btn color="blue"
                                        @click="dialogs.editParish.show = true, dialogs.editParish.changedProperty = 'email', dialogs.editParish.changedValue = parish.email">
                                        Módosítás<v-icon>fa-edit</v-icon>
                                    </v-btn>
                                </td>
                            </tr>
                            <tr>
                                <th style="text-align: right">Telefonszám</th>
                                <td style="text-align: center">{{ parish.phone }}</td>
                                <td>
                                    <v-btn color="blue"
                                        @click="dialogs.editParish.show = true, dialogs.editParish.changedProperty = 'phone', dialogs.editParish.changedValue = parish.phone">
                                        Módosítás<v-icon>fa-edit</v-icon>
                                    </v-btn>
                                </td>
                            </tr>
                            <tr>
                                <th style="text-align: right">Helyszín</th>
                                <td style="text-align: center">{{ parish.location }}</td>
                                <td>
                                    <v-btn color="blue"
                                        @click="dialogs.editParish.show = true, dialogs.editParish.changedProperty = 'location', dialogs.editParish.changedValue = parish.location">
                                        Módosítás<v-icon>fa-edit</v-icon>
                                    </v-btn>
                                </td>
                            </tr>
                        </tbody>
                    </v-simple-table>
                </v-tab-item>
                <!--/Plébánia-->
                <v-tab-item>
                    <!--Felhasználók-->
                    <users :parishId="id || $route.params.id" />
                </v-tab-item>
                <!--/Felhasználók-->
                <v-tab-item>
                    <!--Csoportok-->
                    <groups :parishId="id || $route.params.id"/>
                    <!--/Csoportok-->
                </v-tab-item>
            </v-tabs>
        </v-card>
        <template>
            <v-row justify="center">
                <v-dialog v-model="dialogs.editParish.show" persistent max-width="600px">

                    <v-card>
                        <v-card-title>
                            <span class="headline">{{ dialogs.editParish.changedProperty == 'name' ? "Név" :
                                    (dialogs.editParish.changedProperty == "email" ? "Email-cím" :
                                        (dialogs.editParish.changedProperty ==
                                            "phone" ? "Telefonszám" : "Helyszín"))
                            }} módosítása</span>
                        </v-card-title>
                        <v-card-text>
                            <v-container>
                                <v-text-field v-model="dialogs.editParish.changedValue"
                                    :label="dialogs.editParish.changedProperty == 'name' ? 'Név' : (dialogs.editParish.changedProperty == 'email' ? 'Email-cím' : (dialogs.editParish.changedProperty == 'phone' ? 'Telefonszám' : 'Helyszín'))"
                                    :prepend-inner-icon="dialogs.editParish.changedProperty == 'name' ? 'fa-church' : (dialogs.editParish.changedProperty == 'email' ? 'fa-envelope' : (dialogs.editParish.changedProperty == 'phone' ? 'fa-phone' : 'fa-map-marker'))"
                                    type="text">
                                </v-text-field>
                            </v-container>
                        </v-card-text>
                        <v-card-actions>
                            <v-spacer></v-spacer>
                            <v-btn color="blue darken-1" text @click="dialogs.editParish.show = false">
                                Mégsem
                            </v-btn>
                            <v-btn color="blue darken-1" text @click="changeParish()">
                                Módosítás
                            </v-btn>
                        </v-card-actions>
                    </v-card>
                </v-dialog>
            </v-row>

        </template>

    </div>
</template>

<script>
import router from '../router';
import roleNames from '../plugins/roleNames';
import users from '../components/users.vue';
import groups from '../components/groups.vue';
export default {
    props: ['id'],
    components: {
        users,
        groups
    },
    data: function () {
        return {
            parish: {},
            dialogs: {
                editParish: {
                    show: false,
                    changedProperty: '',
                    changedValue: "",
                }
            },
            roleNames,
        }
    },
    computed: {

    },
    watch: {

    },
    methods: {
        changeParish: function () {
            var changed = {};
            changed[this.dialogs.editParish.changedProperty] = this.dialogs.editParish.changedValue;
            this.axios({ url: "parish/" + this.$route.params.id, method: "PUT", data: { ...changed } }).then((response) => {
                this.dialogs.editParish.show = false;
                this.parish[this.dialogs.editParish.changedProperty] = this.dialogs.editParish.changedValue
                this.dialogs.editParish.changedProperty = ''
                this.dialogs.editParish.changedValue = '';
                this.$store.commit('setSnack', 'A módosítás sikeresen megtörtént')
            })
        }
    },
    mounted() {
        this.axios({ url: "parish/" + this.$route.params.id, method: "GET" }).then((response) => {
            if (response.data.success) {
                this.parish = response.data.data.parish;
            }
        })
    }
}
</script>
