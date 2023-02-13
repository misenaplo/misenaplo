import Vue from 'vue'
import Vuex from 'vuex'
import axios from 'axios'
import router from '../router/index.js'
Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    status: 'unchecked',
    user: {},
    snack: '',
    maintenanceDialogTime: -1
  },
  mutations: {
    auth_request(state) {
      state.status = 'loading'
    },
    auth_success(state, user) {
      state.status = 'success'
      state.user = user
    },
    auth_error(state) {
      state.status = 'error'
    },
    logout(state) {
      state.status = 'unauthenticated'
      state.user = {};
    },
    setSnack(state, snack) {
      state.snack = snack;
    },
    setMaintenanceDialogTime(state, time) {
      state.maintenanceDialogTime = time
    },
    checkAuthStatus(state, user) {
      state.status = user == {} ? "unauthenticated" : "success"
      state.user = user;
    },
    changeUser(state, change) {
      state.user[change.property] = change.value;
    }
  },
  actions: {
    login({ commit }, user) {
      return new Promise((resolve, reject) => {
        commit('auth_request')
        axios({ url: 'user/login', data: user, method: 'POST' })
          .then(resp => {
            if(resp.data.success) {
              const user = resp.data.data.user
              commit('auth_success', user)  
            }
            resolve(resp)
          })
          .catch(err => {
            commit('auth_error')
            reject(err)
          })
      })
    },
    logout({ commit }) {
      return new Promise((resolve, reject) => {
        axios({ url: 'user/logout', method: 'POST' })
        commit('logout')
        router.push('/')
        resolve()
      })
    }
  },
  getters: {
    userRole: state => state.user.role>=0?state.user.role : -1,
    authStatus: state => state.status,
    userId: state => state.user.id || null,
    userFullname: state => state.user.fullname || ""
  },
  modules: {
  }
})
