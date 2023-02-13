<template>
  <v-app>
    <v-app-bar app>
      <v-btn icon @click.stop="navigationBar = !navigationBar" class="d-lg-none">
        <v-icon>fa-bars</v-icon>
      </v-btn>
      <v-toolbar-title class="headline text-uppercase">
        <span>{{ $route.meta.name || "" }}</span>
      </v-toolbar-title>

      <v-spacer></v-spacer>
      <v-img class="shrink" max-width="50" min-width="50" transition="scale-transition"
        :src="require('@/assets/ikon.png')" />
    </v-app-bar>
    <v-navigation-drawer :expand-on-hover="$vuetify.breakpoint.name == 'lg' || $vuetify.breakpoint.name == 'xl'" app
      v-model="navigationBar">
      <v-list nav>
        <router-link v-for="r in $router.options.routes" :key="r.name"
          v-if="r.meta.showInMenu && roleCheck(r.meta.minUserRole, r.meta.maxUserRole)" :to="{ name: r.name }">
          <v-list-item>
            <v-list-item-icon>
              <v-icon>{{ r.meta.icon }}</v-icon>
            </v-list-item-icon>
            <v-list-item-content>{{ r.meta.name || r.meta.menuName }}</v-list-item-content>
          </v-list-item>
        </router-link>
        <!--<v-list-item>
          <v-list-item-icon><v-icon>fa-moon</v-icon></v-list-item-icon>
          <v-list-item-content><v-switch v-model="$vuetify.theme.dark" @click="localStorage.darkMode=$vuetify.theme.dark?1:0" label="Sötét mód"></v-switch></v-list-item-content>
        </v-list-item>-->
      </v-list>
      <v-btn rounded color="red" block @click="$store.dispatch('logout')" v-if="authenticated">
        <v-icon left dark>
          fa-sign-out-alt
        </v-icon>
        Kijelentkezés
      </v-btn>
    </v-navigation-drawer>
    <v-main>
      <v-container fluid>
        <router-view class="view"></router-view>
      </v-container>
      <Snackbar />
      <maintenanceDialog />
    </v-main>
    <v-footer app class="justify-center">
      Fejlesztés alatt
    </v-footer>
  </v-app>
</template>

<style>
#app {
  background: url('./assets/tomjenezo.jpg') no-repeat center center fixed !important;
  background-size: cover;
}
</style>

<script>


import roles from './plugins/roles.js'
import Snackbar from './components/Snackbar'
import maintenanceDialog from './components/maintenanceDialog'

export default {
  name: 'App',
  components: {
    Snackbar,
    maintenanceDialog
  },
  data: function () {
    return {
      navigationBar: this.$vuetify.breakpoint.name == 'lg' || this.$vuetify.breakpoint.name == 'xl',
      roles,
      localStorage,
    }
  },
  computed: {
    minHeight() {
      const height = this.$vuetify.breakpoint.mdAndUp ? '100vh' : '50vh'

      return `calc(${height} - ${this.$vuetify.application.top}px)`
    },
    authenticated() {
      return this.$store.getters.userRole > roles.unauthenticated
    },
    routes() {
      return this.$router.options.routes;
    }
  },
  methods: {
    roleCheck: function (minRole, maxRole) {
      return this.$store.getters.userRole >= minRole && (maxRole !== undefined ? this.$store.getters.userRole <= maxRole : true)
    }
  },
  mounted() {
    this.$vuetify.theme.dark = true
  }
}
</script>
