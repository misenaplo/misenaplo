import Vue from 'vue';
import Vuetify from 'vuetify/lib';
import hu from 'vuetify/es5/locale/hu';
import '@fortawesome/fontawesome-free/css/all.css'
Vue.use(Vuetify);

export default new Vuetify({
  lang: {
    locales: { hu },
    current: 'hu',
  },
  icons: {
    iconfont: 'fa',
  },
});
