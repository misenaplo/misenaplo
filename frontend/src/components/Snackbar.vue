<template>
  <v-snackbar v-model="show">
    {{message}}
    <v-btn text color="pink" @click="show = false">Bezárás</v-btn>
  </v-snackbar>
</template>

<script>
export default {
  data () {
    return {
      show: false,
      message: ''
    }
  },
  created: function () {
    this.$store.watch(state => state.snack, () => {
      const msg = this.$store.state.snack
      if (msg !== '') {
        this.show = true
        this.message = this.$store.state.snack
        this.$store.commit('setSnack', '')
      }
    })
  }
}
</script>
