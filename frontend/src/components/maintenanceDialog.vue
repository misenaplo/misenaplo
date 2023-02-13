<template>
  <v-dialog
    v-model="show"
    persistent
    max-width="600px"
  >

    <v-card>
      <v-card-text>
        <span class="headline">Karbantartás</span>
      </v-card-text>
      <v-card-text>
        <v-container>
          {{message}}
        </v-container>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn
          color="blue darken-1"
          text
          @click="show = false"
        >
          Ok
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
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
    this.$store.watch(state => state.maintenanceDialogTime, () => {
      const time = this.$store.state.maintenanceDialogTime
      if (time > 0) {
        this.show = true
        this.message = `${time} másodperc múlva 1-2 perces karbantartás lesz, a szoftver akadozhat, kérem amennyiben rendellenes működést tapasztal, frissítse az oldalt!`
      } else if (time == 0) {
        this.show = true
        this.message = `Hamarosan 1-2 perces karbantartás lesz, a szoftver akadozhat, kérem amennyiben rendellenes működést tapasztal, frissítse az oldalt!`
      }
    })
  }
}
</script>
