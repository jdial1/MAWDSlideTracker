import Vue from 'vue'
import Vuex from 'vuex'
import axios from 'axios'

Vue.use(Vuex)



export default new Vuex.Store({
  state: {
    count: 0,
    username: '',
    validuser: false,
    stationName: '',
    backendVersion:'--',
    frontendVersion:'4.3',
    nodeBackendTestMode: false,
    vueFrontendTestMode:false,
    production:false,
    LocalSocketConn:false,
    BackendSocketConn:false,
    backendConn:false,
    slideQueuePath: '',
    testLocalapiURL: 'http://localhost:2082',
    testapiURL: 'http://10.24.4.9:2082',
    prodapiURL: 'http://10.24.4.9:2081',
    blockCountTableFields: ['location', 'block_count'],
    blockCountTableItems: []
  },
  mutations: {
    increment (state) {
      state.count++
    },
    local_connect (state) {
      state.LocalSocketConn = true
      console.log('local_socket_connect')
    },
    backend_connect (state) {
      state.BackendSocketConn = true
      console.log('backend_socket_connect')
      this._vm.$socket.emit('version',state.frontendVersion)
    },
    local_disconnect (state) {
      state.LocalSocketConn = false
      console.log('local_disconnect')
    },
    backend_disconnect (state) {
      state.BackendSocketConn = false
      console.log('backend_disconnect')
    },
    local_stream(context) {
      console.log('local_socket_stream: '+context)
    },
    backend_message (context) {
      console.log('backend_socket_message: '+context)
    },
    backend_BackendVersion (state,context) {
      console.log('backend_backendVersion: '+context)
      state.backendVersion = context
    },
    SetUserName (state, strUsername) {
      state.username = strUsername
    },
    SetValidUser (state, blTemp) {
      state.validuser = blTemp
    },
    SetStationName (state, strTemp) {
      state.stationName = strTemp
    },
    SetSlideQueuePath (state, strTemp) {
      state.slideQueuePath = strTemp
    },
    SetLocalSocketConn (state, strTemp) {
      state.LocalSocketConn = strTemp
    },
    SetBackendSocketConn (state, strTemp) {
      state.BackendSocketConn = strTemp
    },
    SetbackendVersion (state, strTemp) {
      state.backendVersion = strTemp
    },
    SetbackendConn (state, strTemp) {
      state.backendConn = strTemp
    },
    ClearBlockCountTableItems (state) {
      state.blockCountTableItems = []
    },
    PushBlockCountTableItems (state, objTmp) {
      state.blockCountTableItems.push(objTmp)
    },
    production(state, strTemp){
      state.production = strTemp;
    }
  },
  actions: {
    LoadBlockCountTableData ({ commit }) {
      return new Promise((resolve, reject) => {
        let strFullAPICall = this.getters.getApiUrl + '/reports'
        axios.post(strFullAPICall, {
          action: 'blockcount'
        })
          .then(function (response) {
            commit('ClearBlockCountTableItems')
            for (var i = 0; i < response.data.length; i++) {
              commit('PushBlockCountTableItems', { isActive: false, location: response.data[i].SlideDistributionLocation.replace('LOCN', ''), block_count: response.data[i].BlockCount })
            }
            resolve()
          })
          .catch(function (error) {
            reject(error)
          })
      })
    }
  },
  getters: {
    BlockCountTableFields: (state) => {
      return state.blockCountTableFields
    },
    BlockCountTableItems: (state) => {
      return state.blockCountTableItems
    },
    GetValidUser: (state) => {
      if (state.nodeBackendTestMode){
        return true
      }
      return state.validuser
    },
    GetUsername: (state) => {
      return state.username
    },
    GetnodeBackendTestMode: (state) => {
      return state.nodeBackendTestMode
    },
    GetvueFrontendTestMode: (state) => {
      return state.vueFrontendTestMode
    },
    GetBEVersion: (state) => {
      return state.backendVersion
    },
    GetFEVersion: (state) => {
      return state.frontendVersion
    },
    GetLocalSocketStatus: (state) => {
      return state.LocalSocketConn
    },
    GetBackendSocketStatus: (state) => {
      return state.BackendSocketConn
    },
    GetBackendStatus: (state) => {
      return state.backendConn
    },
    getApiUrl: (state) => {
      if (state.nodeBackendTestMode){return state.testLocalapiURL}
      if (!state.production){return state.testapiURL}
      else {return state.prodapiURL}
    },
    GetProduction: (state) => {
      return state.production
    }
  }
})
