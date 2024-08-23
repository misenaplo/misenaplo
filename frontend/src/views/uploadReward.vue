<template>
    <div>
      <h1>Kép feltöltése</h1>
      <v-file-input
                v-model="file"
                rounded
                label="Kép"
                outlined
    />
    <v-btn
            color="blue darken-1"
            text
            v-if="file"
            @click="uploadFile()"
          >
            Feltöltés
          </v-btn>
    </div>
  </template>
  
  <script>
  export default {
    name: 'uploadReward',
    props: [
    ],
    data () {
      return {
        file: null
      }
    },
    computed: {
  
    },
    methods: {
      uploadFile: function() {
        var formData = new FormData();
        formData.append('file',this.file);
        this.axios.post(`rewardImage`, formData, {headers: { 'Content-Type': 'multipart/form-data'}}).then((response) => {
          if(response.data.success) {
            this.$store.commit('setSnack', 'Sikeresen feltöltve.')
          }
        })
      },
  
    },
    mounted() {

    }
  }
  </script>
  