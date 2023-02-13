import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import vuetify from './plugins/vuetify';
import 'roboto-fontface/css/roboto/roboto-fontface.css'

import VNumeric from 'vuetify-numeric/vuetify-numeric.umd.min'
Vue.use(VNumeric)

import VueYouTubeEmbed from 'vue-youtube-embed'
Vue.use(VueYouTubeEmbed)

import VueTrumbowyg from 'vue-trumbowyg';
import 'trumbowyg/dist/ui/trumbowyg.css';
Vue.use(VueTrumbowyg);


import axios from 'axios'
axios.defaults.withCredentials = true
axios.defaults.baseURL = process.env.NODE_ENV === 'production' ? "/api/" : "http://localhost:3000/api/"
Vue.prototype.axios = axios;


import InputMask from './components/InputMask'



Vue.component('input-mask', InputMask)


import VueQRCodeComponent from 'vue-qr-generator'
Vue.component('qr-code', VueQRCodeComponent)


import errorMessages from './plugins/errorMessages.js'
function maintenancetime(xMaintenanceIn) {
  if (xMaintenanceIn !== null && xMaintenanceIn !== undefined && !isNaN(xMaintenanceIn)) {
    if (xMaintenanceIn > -1) {
      if (xMaintenanceIn > 120) {
        store.commit('setSnack', `${xMaintenanceIn} másodperc múlva 1-2 perces karbantartás lesz, a szoftver akadozhat, kérem amennyiben rendellenes működést tapasztal, frissítse az oldalt!`)
      } else {
        store.commit("setMaintenanceDialogTime", xMaintenanceIn)
      }
    }
  }
}
axios.interceptors.response.use(res => {
  if (res.data.success !== true && res.data.error && store.getters.authStatus != 'unchecked') store.commit('setSnack', res.data.error.code + ": " + errorMessages[res.data.error.code] + (res.data.error.message ? (" - " + res.data.error.message) : ''))

  if (res.headers["x-maintenance-in"]) {
    maintenancetime(parseInt(res.headers["x-maintenance-in"]))
  }

  return res
}, err => {
  if (store.getters.authStatus != "unchecked") {
    if (err.response.status === 401) {
      store.dispatch('logout');
      router.push('/login')
    }


    store.commit('setSnack', err.response.status + ": " + errorMessages[err.response.status] + " " + (err.response.data.error ? ("\n" + err.response.data.error.code + ": " + errorMessages[err.response.data.error.code] + (err.response.data.error.message ? (" - " + err.response.data.error.message) : '')) : ''))
  }


  return err;
});

Vue.config.productionTip = false


Vue.mixin({
  data: function () {
    return {
      roles: require('./plugins/roles'),
      config: require('./config'),
      isMobilephone: false,
      fieldRules: {
        required: value => !!value || 'Töltse ki ezt a mezőt!',
        isNumber: value => (!isNaN(value) ? (typeof value.replace === 'function' ? value.replace(',', '.') >= 0 : true) : false) || "0-t vagy annál nagyobb számot adjon meg!",
        isTime: value => {
          const timeCriteriaPattern = /^(?<time>(?<hours>\d{2}):(?<minutes>[0-5]\d):(?<seconds>[0-5]\d)\.(?<milliseconds>\d{3}))$/;
          return timeCriteriaPattern.test(value.replace(',', '.')) || "Időt adjon meg hh:mm:ss.mss formában!"
        },
        'isHH:MM': value => {
          const pattern = /^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/gm;
          return pattern.test(value) || "Időt adjon meg hh:mm formátumban!"
        },

      }
    }
  },

  methods: {
    onResize() {
      this.isMobilephone = window.innerWidth < 600
    },
    dateParse: function (date) {
      var arr = date.split(/[. :]/),
        d = new Date(arr[0], arr[1] - 1, arr[2], arr[3], arr[4], "00");
      return d;
    },
    dayOfWeek: function (day) {
      switch (day % 7) {
        case 0: return 'Vasárnap'
        case 1: return 'Hétfő'
        case 2: return 'Kedd'
        case 3: return 'Szerda'
        case 4: return 'Csütörtök'
        case 5: return 'Péntek'
        case 6: return 'Szombat'
      }
    },
    addMonths: function (date, months) {
      var d = date.getDate();
      date.setMonth(date.getMonth() + +months);
      if (date.getDate() != d) {
        date.setDate(0);
      }
      return date;
    },
    time: function (time) {
      if (time === null) return "";
      const ms = time % 1000;
      time = (time - ms) / 1000;
      const h = Math.floor(time / 3600)
      time = time - h * 3600;
      const min = Math.floor(time / 60);
      const s = time - min * 60;
      return h.toLocaleString('en-US', { minimumIntegerDigits: 2, useGrouping: false }) + ":" + min.toLocaleString('en-US', { minimumIntegerDigits: 2, useGrouping: false }) + ":" + s.toLocaleString('en-US', { minimumIntegerDigits: 2, useGrouping: false }) + "." + ms.toLocaleString('en-US', { minimumIntegerDigits: 3, useGrouping: false })
    },
    timeInputToMs: function (input) {
      const splitted = input.split(":");
      const splittedSmS = splitted[2].split(".")
      return (splitted[0] * 3600000 + splitted[1] * 60000 + splittedSmS[0] * 1000 + splittedSmS[1] * 1)
    },
    tableHeader: function (text, align, filterable, sortable, groupable, value) {
      return {
        text,
        align,
        filterable,
        sortable,
        groupable,
        value
      }
    }
  },
  beforeDestroy() {
    if (typeof window === 'undefined') return

    window.removeEventListener('resize', this.onResize, { passive: true })
  },

  mounted() {
    this.onResize()

    window.addEventListener('resize', this.onResize, { passive: true })
  },
})

new Vue({
  router,
  store,
  vuetify,
  render: h => h(App)
}).$mount('#app')
