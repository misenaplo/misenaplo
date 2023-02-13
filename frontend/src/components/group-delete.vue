<template>
  <div>
    A csoport törléséhez adja meg jelszavát!
    <v-text-field
      prepend-inner-icon="fa-key"
      rounded
      outlined
      v-model="password"
      type="password"
      label="Jelszó"
      :disabled="!groupOwner"
    />
    <v-btn v-if="password.length>0" rounded color="red accent-4" :disabled="!groupOwner" @click="deleteGroup()"><v-icon>fa-trash</v-icon>Törlés</v-btn>
  </div>
</template>

<script>
export default {
  name: 'groupDelete',
  props: [
    "groupId",
    "groupOwner"
  ],
  data () {
    return {
      password: ''
    }
  },
  computed: {

  },
  methods: {
    deleteGroup: function() {
      this.axios({url: `group/${this.groupId}`, method: 'DELETE', data: {password: this.password}}).then(response => {
        if(response.data.success) {
          this.$store.commit('setSnack', 'Törölve')
          this.$router.push({name: 'groups'})
        }
      })
    }

  },
  mounted() {

  }
}
</script>
