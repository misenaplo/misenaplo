import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../views/Home.vue'
import store from '../store'
import roles from '../plugins/roles.js'
import axios from 'axios'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'home',
    component: Home,
    meta: {
      minUserRole: roles.unauthenticated,
      maxUserRole: roles.unauthenticated,
      name: 'Kezdőlap',
      showInMenu: true,
      icon: 'fa-home'
    }
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('../views/loginPage.vue'),
    meta: {
      minUserRole: roles.unauthenticated,
      maxUserRole: roles.unauthenticated,
      name: 'Bejelentkezés',
      showInMenu: true,
      icon: 'fa-sign-in-alt'
    }
  },
  {
    path: '/profile',
    name: 'profile',
    component: () => import('../views/profile.vue'),
    meta: {
      minUserRole: roles.believer,
      name: 'Felhasználói profil',
      showInMenu: true,
      icon: 'fa-user-edit'
    },
  },

  {
    path: '/groups',
    name: 'groups',
    component: () => import('../components/groups.vue'),
    meta: {
      minUserRole: roles.catechist,
      name: "Csoportok",
      showInMenu: true,
      icon: 'fa-users'
    }
  },

  {
    path: '/group/:id',
    name: 'group',
    component: () => import('../views/group.vue'),
    meta: {
      minUserRole: roles.catechist,
      showInMenu: false
    }
  },


  {
    path: '/users',
    name: 'users',
    component: () => import('../components/users.vue'),
    meta: {
      minUserRole: roles.chaplain,
      name: 'Felhasználók',
      showInMenu: true,
      icon: 'fa-user-cog'
    }
  },
  {
    path: '/user/:id',
    name: 'user',
    component: () => import('../views/user.vue'),
    meta: {
      minUserRole: roles.admin,
      showInMenu: false,
    }
  },

  {
    path: '/parishes',
    name: 'parishes',
    component: () => import("../components/parishes.vue"),

    meta: {
      minUserRole: roles.parishOfficer,
      showInMenu: true,
      name: "Plébániák",
      icon: 'fa-church'
    },

    

  },

  {
    path: '/parish/:id',
    name: 'parish',
    component: () => import("../views/parish.vue"),

    meta: {
      minUserRole: roles.parishOfficer,
      showInMenu: false
    },

    

  },

  {
    path: '/attendance/:candidateId',
    name: 'attendanceForCandidate',
    component: () => import("../components/attendanceForCandidate.vue"),

    meta: {
      minUserRole: roles.unauthenticated,
      showInMenu: false
    },
  },

  {
    path: '/scanTask',
    name: 'scanTask',
    component: () => import('../views/scanTask.vue'),

    meta: {
      minUserRole: roles.catechist,
      showInMenu: true,
      name: "Csoportba rögzítés",
      icon: 'fa-qrcode'
    }
  },
  {
    path: '/uploadReward',
    name: 'uploadReward',
    component: () => import('../views/uploadReward.vue'),
    meta: {
      minUserRole: roles.catechist,
      showInMenu: false
    }
  },
  {
    path: '/rewardPuzzle/:attendanceId/:rewardImageId',
    name: 'rewardPuzzle',
    component: () => import('../components/rewardPuzzle.vue'),
    meta: {
      showInMenu: false,
      minUserRole: roles.unauthenticated
    },
    props: true
  },


]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

router.beforeEach((to, from, next) => {
  const checkAuthStatus = function () {
    return new Promise((resolve, reject) => {
      if (store.getters.authStatus == "unchecked") {
        axios({ url: 'user', method: 'GET', params: { full: true } }).then((response) => {
          store.commit('checkAuthStatus', response.data.data)
          resolve()
        })
          .catch((error) => {
            store.commit('checkAuthStatus', {})
            resolve()
          })
      }
      else resolve();
    })
  }
  checkAuthStatus().then(() => {
    if (to.meta.minUserRole <= store.getters.userRole) next()
    else next('/login')
  })

})

export default router
