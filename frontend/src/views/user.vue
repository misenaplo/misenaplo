<template>
  <div>
    <v-card>
      <v-toolbar flat color="primary" dark>
        <v-toolbar-title>{{ user.fullname }}</v-toolbar-title>
      </v-toolbar>
      <v-tabs :vertical="!isMobilephone">
        <v-tab>
          <v-icon left>
            fa-user
          </v-icon>
          Felhasználó
        </v-tab>
        <v-tab>
          <v-icon left>
            fa-users
          </v-icon>
          Tagságok
        </v-tab>


        <v-tab-item>
          <!--Felhasználó-->
          <v-simple-table>
            <tbody>
              <tr>
                <th style="text-align: right">Név</th>
                <td colspan="2" style="text-align: center">{{ user.fullname }}</td>
                <!--<td>
      						<v-btn
      							color="blue"
      							@click="dialogus.megjelenik = true, dialogus.modositandoertek=0, dialogus.modositottertek=nev"
      						>
      							Módosítás<v-icon>fa-edit</v-icon>
      						</v-btn>
      					</td>-->
              </tr>
              <tr>
                <th style="text-align: right">Jogkör</th>
                <td colspan="2" style="text-align: center">{{ roleNames[user.role] }}</td>
              </tr>
              
              <tr>
                <th style="text-align: right">Email</th>
                <td style="text-align: center">{{ user.email }}</td>
                <td>
                  <v-btn color="blue"
                    @click="dialogs.editUser.show = true, dialogs.editUser.changedProperty = 'email', dialogs.editUser.changedValue = user.email">
                    Módosítás<v-icon>fa-edit</v-icon>
                  </v-btn>
                </td>
              </tr>
              <tr>
                <th style="text-align: right">Jelszó</th>
                <td style="text-align: center" colspan="2">TITOK</td>
              </tr>
            </tbody>
          </v-simple-table>
        </v-tab-item>
        <!--/Felhasználó-->
        <v-tab-item>
          <!--Tagságok-->
        </v-tab-item>
        <!--/Tagságok-->

      </v-tabs>
    </v-card>
    <template>
      <v-row justify="center">
        <v-dialog v-model="dialogs.editUser.show" persistent max-width="600px">

          <v-card>
            <v-card-title>
              <span class="headline">{{ dialogs.editUser.changedProperty == 'fullname' ? "Név" :
                  (dialogs.editUser.changedProperty == "email" ? "Email-cím" :  "Jelszó")
              }} módosítása</span>
            </v-card-title>
            <v-card-text>
              <v-container>
                <v-text-field v-model="dialogs.editUser.changedValue"
                  :label="dialogs.editUser.changedProperty == 'fullname' ? 'Név' : (dialogs.editUser.changedProperty == 'email' ? 'Email-cím' : 'Új jelszó')"
                  :prepend-inner-icon="dialogs.editUser.changedProperty == 'fullname' ? 'fa-user' : (dialogs.editUser.changedProperty == 'email' ? 'fa-envelope' : 'fa-key')"
                  :type="dialogs.editUser.changedProperty == 'password' ? 'password' : 'text'">
                </v-text-field>
              </v-container>
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="blue darken-1" text @click="dialogs.editUser.show = false">
                Mégsem
              </v-btn>
              <v-btn color="blue darken-1" text @click="changeUser()">
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
import userDelete from '../components/user-delete'
import roleNames from '../plugins/roleNames';
import groups from '../components/groups.vue'

export default {
  props: ['id'],
  components: {
    userDelete,
    groups
  },
  data: function () {
    return {
      user: {},
      dialogs: {
        editUser: {
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
    changeUser: function () {
      var changed = {};
      changed[this.dialogs.editUser.changedProperty] = this.dialogs.editUser.changedValue;
      this.axios({ url: "user/" + this.$route.params.id, method: "PUT", data: { ...changed } }).then((response) => {
        this.dialogs.editUser.show = false;
        this.user[this.dialogs.editUser.changedProperty] = this.dialogs.editUser.changedValue
        this.dialogs.editUser.changedProperty = ''
        this.dialogs.editUser.changedValue = '';
        this.$store.commit('setSnack', 'A módosítás sikeresen megtörtént')
      })
    }
  },
  mounted() {
    this.axios({ url: "user/" + this.$route.params.id, method: "GET", params: { full: true } }).then((response) => {
      if (response.data.success) {
        this.user = response.data.data;
      }
    })
  }
}
</script>
