<template>
  <div>
    A felhasználó törléséhez adja meg saját jelszavát!
    <v-text-field
      prepend-inner-icon="fa-key"
      rounded
      outlined
      v-model="password"
      type="password"
      label="Jelszó"
    />
    <v-btn v-if="password.length>0" rounded color="red accent-4" @click="deleteUser()"><v-icon>fa-trash</v-icon>Törlés</v-btn>
  </div>
</template>

<script>
export default {
  name: 'userDelete',
  props: [
    "userId",
  ],
  data () {
    return {
      password: ''
    }
  },
  computed: {

  },
  methods: {
    deleteUser: function() {
      this.axios({url: `user/${this.userId}`, method: 'DELETE', data: {password: this.password}}).then(response => {
        if(response.data.success) {
          this.$store.commit('setSnack', 'Törölve')
          this.$router.push({name: 'users'})
        }
      })
    }

  },
  mounted() {

  }
}
</script>
