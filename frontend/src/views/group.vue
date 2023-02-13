<template>
  <div>
    <v-card>
      <v-toolbar flat color="primary" dark>
        <v-toolbar-title>{{ group.name }}</v-toolbar-title>
      </v-toolbar>
      <v-tabs :vertical="!isMobilephone">
        <v-tab>
          <v-icon left>
            fa-users
          </v-icon>
          Csoport
        </v-tab>



        <v-tab-item>
          <!--Csoport-->
          <v-simple-table>
            <tbody>
              <tr>
                <th style="text-align: right">Név</th>
                <td colspan="2" style="text-align: center">{{ group.name }}</td>
            </tr>
              <tr>
                <th style="text-align: right">Plébánia</th>
                <td colspan="2" style="text-align: center">{{ group.Parish.name }}</td>
              </tr>
              <tr>
                <th style="text-align: right">Csoportvezető{{group.Leader.length>1?'k':''}}</th>
                <td style="text-align: center" colspan="2" class="justify-center">
                    <v-chip-group class="justify-center">
                        <v-chip v-for="leader in group.Leader" :key="leader.id" color="primary">
                            {{leader.fullname}}
                        </v-chip>
                    </v-chip-group>
                </td>
              </tr>
            </tbody>
          </v-simple-table>
          <h1>Csoporttagok</h1>
          <v-btn color="primary" rounded :href="`${this.axios.defaults.baseURL}group/${$route.params.id}/generateCards`" target="_blank"><v-icon>fa-download</v-icon>Kártyák tömeges letöltése</v-btn>
          <candidates :groupId="$route.params.id"/>
        </v-tab-item>
        <!--/Csoport-->

      </v-tabs>
    </v-card>
    <template>

    </template>

  </div>
</template>

<script>
import roleNames from '../plugins/roleNames';
import candidates from '../components/candidates.vue'

export default {
  props: ['id'],
  components: {
    candidates
  },
  data: function () {
    return {
      group: {},
      dialogs: {

      },
      roleNames,
    }
  },
  computed: {

  },
  watch: {

  },
  methods: {

  },
  mounted() {
    this.axios({ url: "group/" + this.$route.params.id, method: "GET" }).then((response) => {
      if (response.data.success) {
        this.group = response.data.data.group;
      }
    })
  }
}
</script>
