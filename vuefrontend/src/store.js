import Vue from 'vue'
import Vuex from 'vuex'
import axios from 'axios'
const { version } = require("../package.json");
Vue.use(Vuex);
export default new Vuex.Store({
  state: {
    defaultUsername: "Scan Badge",
    username: "Scan Badge",
    printName: '',
    validuser: true,
    currentRouteName: "Home",
    slideDistributionID: "",
    slideTrayID: "",
    slideID: "",
    slidesData: [],
    blockColor: "",
    blockData: [],
    engData: [],
    blockCountTableFields: ["location", "block_count"],
    blockCountTableItems: [],
    toastData: {},
    // Backend Variables
    nodeBackendTestMode: true,
    backendVersion: "",
    BackendSocketConn: false,
    backendConn: false,
    testLocalapiURL: "http://localhost:2082",
    testapiURL: "http://10.24.4.9:2082",
    prodapiURL: "http://10.24.4.9:2081",
    // Frontend Variables
    production: false,
    vueFrontendTestMode: false,
    frontendVersion: version,
    // Local Variables
    localSocketConn: false,
    localVersion: "",
    localComPort: "",
    stationName: "",
    slideQueuePath: "",
  },
  mutations: {
    backend_connect: (state) => {
      state.BackendSocketConn = true;
      this._vm.$socket.emit("version", state.frontendVersion);
    },
    backend_toast: (state, message) => {
      this.commit('SetToastData', message);
      this.dispatch("makeToast");
    },
    local_stream: (state, context) => {
      state.localSocketConn = true;
      this.dispatch('validateScanData', { state, context });
    },
    backend_disconnect: state => state.BackendSocketConn = false,
    backend_message: context => console.log("backend_socket_message: " + context),
    backend_BackendVersion: (state, context) => state.backendVersion = context,
    localVersion: (state, context) => state.localVersion = context,
    SetUserName: (state, strUsername) => state.username = strUsername,
    SetValidUser: (state, blTemp) => state.validuser = blTemp,
    SetStationName: (state, strTemp) => state.stationName = strTemp,
    SetSlideQueuePath: (state, strTemp) => state.slideQueuePath = strTemp,
    SetSlidesData: (state, strTemp) => state.slidesData = strTemp,
    SetLocalSocketConn: (state, strTemp) => state.localSocketConn = strTemp,
    SetBackendSocketConn: (state, strTemp) => state.BackendSocketConn = strTemp,
    SetbackendVersion: (state, strTemp) => state.backendVersion = strTemp,
    SetLocalVersion: (state, strTemp) => state.localVersion = strTemp,
    SetToastData: (state, strTemp) => {
      state.toastData = strTemp;
      this.dispatch("makeToast");
    },
    SetbackendConn: (state, strTemp) => state.backendConn = strTemp,
    SetPrintName: (state, strTemp) => state.printName = strTemp,
    ClearBlockCountTableItems: state => state.blockCountTableItems = [],
    PushBlockCountTableItems: (state, objTmp) => state.blockCountTableItems.push(objTmp),
    production: (state, strTemp) => state.production = strTemp,
    SetCurrentRouteName: (state, strTemp) => {
      this.commit("blockData", []);
      state.currentRouteName = strTemp;
    },
    setBlockColor: (state, strTemp) => state.blockColor = strTemp,
    setBlockData: (state, strTemp) => state.blockData = strTemp,
  },
  getters: {
    BlockCountTableFields:     () => ["location", "block_count"],
    GetEngData:                state => state.engData,
    BlockCountTableItems:      state => state.blockCountTableItems,
    GetValidUser:              state => state.validuser,
    GetUsername:               state => state.username,
    GetPrintName:              state => state.printName,
    GetDefaultUsername:        state => state.defaultUsername,
    getBackendTestMode:        state => state.nodeBackendTestMode,
    GetBlockData:              state => state.blockData,
    GetStationName:            state => state.stationName,
    GetSlidesData:             state => state.slidesData,
    GetToastData:              state => state.toastData,
    GetCurrentRouteName:       state => state.currentRouteName,
    GetnodeBackendTestMode:    state => state.nodeBackendTestMode,
    GetvueFrontendTestMode:    state => state.vueFrontendTestMode,
    GetBEVersion:              state => state.backendVersion,
    GetFEVersion:              state => state.frontendVersion,
    GetLocalVersion:           state => state.localVersion,
    GetSlideQueuePath:         state => state.slideQueuePath,
    GetSlideDistributionID:    state => state.slideDistributionID,
    GetLocalSocketStatus:      state => state.localSocketConn,
    GetBackendSocketStatus:    state => state.BackendSocketConn,
    GetSlideID:                state => state.slideID,
    GetBackendStatus:          state => state.backendConn,
    GetSlideTrayID:            state => state.slideTrayID,
    GetProduction:             state => state.production,
    getApiUrl:                 state => state.nodeBackendTestMode ? state.testLocalapiURL : (state.production ? state.prodapiURL : state.testapiURL)
  },
  actions: {
    async updateEngraverLocations() {
      await this._vm.$socket.emit('engraverUpdate', '');
    },
    async loadBlockCountTableData({ commit }) {
      const apiUrl = this.getters.getApiUrl;
      try {
        const response = await axios.post(`${apiUrl}/reports`, {
          action: 'blockcount',
        });
        const blockCountTableItems = response.data.map(element => ({
          isActive: false,
          location: element.SlideDistributionLocation.replace('LOCN', ''),
          block_count: element.BlockCount,
        }));
        commit('setBlockCountTableItems', blockCountTableItems);
      } catch (error) {
        console.error(error);
      }
    },
    async validateScanData({ getters: { getValidUser }, commit, dispatch }, { context: { barcodeScanData, localVersion }, state: { currentRouteName } }) {
      commit('setLocalVersion', localVersion || 'OLD');
      
      const scanType = barcodeScanData.substring(0, 4);
      const materialData = barcodeScanData.substring(4);
      const validUser = getValidUser;
      const typeRoute = `${scanType}_${currentRouteName}`;
      
      const invalidScans = ['HSLD_SlidePrinting', 'LOCN_SlidePrinting', 'SLTR_SlidePrinting', 'HBLK_SlideDistribution', 'HSLD_Embedding', 'LOCN_Embedding', 'SLTR_Embedding', 'HBLK_Home', 'HSLD_Home', 'LOCN_Home', 'SLTR_Home'];
      const materialLookup = { 'HBLK': 'Block', 'HSLD': 'Slide', 'LOCN': 'Location', 'SLTR': 'Slide Tray', 'SBDG': 'Badge' };
    
      if (scanType === 'SBDG') {
        await dispatch('scanBadge', { badge_id: materialData, scan_data: barcodeScanData });
      } else if (!validUser) {
        commit('setToastData', { title: 'Invalid User', content: 'Please login before scanning material' });
      } else if (invalidScans.includes(typeRoute)) {
        commit('setToastData', { title: 'Incorrect Material', content: `${materialLookup[scanType]} Material cannot be scanned from ${typeRoute.split('_')[1]}` });
      } else if (typeRoute === 'HBLK_SlidePrinting') {
        await dispatch('pullSlides', { blockID: materialData });
      } else if (typeRoute.endsWith('SlideDistribution')) {
        const type = typeRoute.split('_')[0];
        await dispatch(`Scan${materialLookup[type]}`, { ScanData: barcodeScanData });
      } else if (typeRoute === 'HBLK_Embedding') {
        await dispatch('loadBlockData', { blockID: materialData });
      }
    },
    async pullSlides({ commit, getters: { getApiUrl } }, { blockID }) {
      if (!blockID) {
        alert('Please enter block ID to pull up slides');
        return;
      }
      try {
        const { data } = await axios.post(`${getApiUrl}/pullSlides`, { blockID });
        commit('SetSlidesData', data);
        commit('setFormStatus', { status: 'readytoprint', label: 'Print Slides' });
        await axios.post(`${getApiUrl}/GetPartBlockCurrentAndTotals`, { blockID });
      } catch (error) {
        console.error(error);
      }
    },
    async scanBadge({ commit, getters: { getApiUrl, GetUsername } }, { badge_id: userId, scan_data: { slideQueuePath, StationName } }) {
      try {
        const { data: [userInfo] } = await axios.post(`${getApiUrl}/getUserInfo`, { userId });
        const { username, printname } = userInfo;
        commit('SetUserName', username);
        commit('SetPrintName', printname);
        if (GetUsername.length) {
          commit('SetValidUser', true);
          commit('SetSlideQueuePath', slideQueuePath);
          commit('SetStationName', StationName);
        }
      } catch (error) {
        console.error(error);
      }
    },
    
    async printSlides({ commit, getters: { getApiUrl, GetUsername, GetSlideQueuePath, GetStationName, GetCurrentRouteName } }, blockID) {
      try {
        const { files } = await axios.post(`${getApiUrl}/printslides`, {
          action: 'PrintSlides',
          blockID,
          printRequestedBy: GetUsername,
          slideQueuePath: GetSlideQueuePath,
          printLocation: GetStationName,
          curRoute: GetCurrentRouteName,
        });
        if (files) {
          commit('SetToastData', { title: 'Slide Printer Issues', content: `Files waiting to be printed:\n ${files}`, variant: 'danger' });
        }
      } catch (error) {
        console.error(error);
      }
      commit('setFormStatus', { status: 'loadslides', label: 'Load Slides' });
      this.clearCurrentSlide();
    },
    async MarkSlideToBeDistributed({ getters, commit, state }, { strSlideID, strSlideDistributionID }) {
      // Only mark id slide tray is loaded
      if (!state.slideTrayID) {
        commit('setToastData', { title: 'Error', message: 'Scan Slide Tray Before Slide' });
        return;
      }
      try {
        const { data } = await axios.post(`${getters.getApiUrl}/slidedistribution`, {
          action: 'MarkSlideToBeDistributed',
          slidedistid: strSlideDistributionID,
          slidetray: state.slideTrayID,
          slideid: strSlideID,
          curRoute: state.currentRouteName,
        });
        const [slides, obApiResult02, obApiResult03] = data;
        commit('setSlidesData', slides);
        commit('setTableData', { field: 'SlidesInTray', value: obApiResult02[0].SlidesInTray });
        commit('setTableData', { field: 'BlockCountInTray', value: obApiResult03[0].BlockCountInTray });
      } catch (error) {
        console.error(error);
      }
    },
    async LoadTableData() {
      return this.dispatch("LoadBlockCountTableData").then(() => {
        this.datacollection = this.getters.objChartDataCollection;
      });
    },
    
    async CreateNewSlideDistribution() {
      let { GetUsername, GetSlideTrayID, GetStationName, GetCurrentRouteName, GetSlideID, GetSlideDistributionID } = this.getters;
      if (this.rdSlideTrayBehaviorSelected === "EditExisting") {
        this.blFirstSlideScanned = true;
        await this.dispatch("MarkSlideToBeDistributed", { strSlideID: GetSlideID, SlideDistributionID: GetSlideDistributionID });
      } else {
        try {
          const { data } = await axios.post(`${this.getters.getApiUrl}/slidedistribution`, {
            action: "CreateNewSlideDistribution",
            userid: GetUsername,
            slidetray: GetSlideTrayID,
            scanlocation: GetStationName,
            curRoute: GetCurrentRouteName,
          });
          this.blFirstSlideScanned = true;
          this.SlideDistributionID = data.insertId;
          await this.dispatch("MarkSlideToBeDistributed", { strSlideID: GetSlideID, SlideDistributionID: this.SlideDistributionID });
          this.strInTraySlideCount = data[2][0].SlidesInTray;
          this.strInTrayBlockCount = data[3][0].BlockCountInTray;
          await this.LoadTableData();
        } catch (e) {
          console.error(e);
        }
      }
    },
    
    async MarkSlidesReadyForCourier() {
      const { GetUsername, GetSlideDistributionID, GetStationName, GetSlideTrayID, GetCurrentRouteName } = this.getters;
      try {
        if (this.blFirstSlideScanned) {
          await axios.post(`${this.getters.getApiUrl}/slidedistribution`, {
            action: "MarkSlidesReadyForCourier",
            slidedistid: this.SlideDistributionID,
            userid: GetUsername,
            slidedistrloc: GetSlideDistributionID,
            scanlocation: GetStationName,
            curRoute: GetCurrentRouteName,
          });
        } else {
          await axios.post(`${this.getters.getApiUrl}/slidedistribution`, {
            action: "AssignTrayNewLocation",
            userid: GetUsername,
            slidedistrloc: GetSlideDistributionID,
            scanlocation: GetStationName,
            slidetray: GetSlideTrayID,
            curRoute: GetCurrentRouteName,
          });
        }
        this.clearVariables();
      } catch (e) {
        this.clearVariables();
        this.inputtext = "Error";
      }
      this.loadTableData();
    },
    clearVariables() {
      Object.assign(this, {
        slidetrayID: "",
        blSlideTrayLoaded: false,
        currentslidetray: this.nextslidetray,
        inputtext: "Scan Slide Tray to Proceed",
        strInputTextLabel: this.defaultstrInputTextLabel,
        slides: {},
        SlideDistributionID: null,
        rdSlideTrayBehaviorOptions: Object.assign(this.rdSlideTrayBehaviorOptions, { 0: { disabled: false }, 1: { disabled: false } })
      });
    },
    
    loadTableData() {
      Object.assign(this, {
        loading: false,
        strInTrayBlockCount: "0",
        strInTraySlideCount: "0"
      });
      return this.LoadTableData();
    },
    
    clearCurrentSlide() {
      Object.assign(this, {
        blockID: "",
        formstatus: "loadslides",
        formstatuslabel: "Load Slides",
        totalBlocks: "",
        currentBlock: "",
        totalParts: "",
        currentPart: "",
        slides: {}
      });
    },
    
    async ScanSlideTray(strSlideTrayID) {
      const { GetSlideTrayID, GetSlideDistributionID, GetUsername, GetStationName } = this.getters;
    
      if (this.blSlideTrayLoaded) {
        this.inputtext = "Scan Slide or Location to close Slide Tray";
        return;
      }
    
      Object.assign(this, {
        blSlideTrayLoaded: true,
        slidetrayID: strSlideTrayID,
        currentslidetray: strSlideTrayID,
      });
    
      if (this.rdSlideTrayBehaviorSelected === "EditExisting") {
        try {
          this.loading = true;
          const { data } = await axios.post(`${this.getters.getApiUrl}/slidedistribution`, {
            action: "LoadSlideTray",
            userid: GetUsername,
            slidetray: GetSlideTrayID,
            scanlocation: GetStationName,
            curRoute: this.currentRouteName,
          });
    
          this.SlideDistributionID = GetSlideDistributionID;
    
          const [slides, fields, obApiResult02, obApiResult03] = data;
          Object.assign(this, {
            slides: slides,
            fields: Object.assign(Object.keys(slides[0]), {
              3: {
                key: Object.keys(slides[0])[3],
                label: "Case Slides Not In Tray",
              }
            }),
            obApiResult02: obApiResult02,
            strInTraySlideCount: obApiResult02[0].SlidesInTray,
            obApiResult03: obApiResult03,
            strInTrayBlockCount: obApiResult03[0].BlockCountInTray,
            rdSlideTrayBehaviorOptions: Object.assign(this.rdSlideTrayBehaviorOptions, { 0: { disabled: true } })
          });
        } catch (error) {
          console.error(error);
        } finally {
          this.loading = false;
        }
      } else {
        this.rdSlideTrayBehaviorOptions[1].disabled = true;
      }
    
      Object.assign(this, {
        inputtext: "Scan Slide to Proceed",
        strInputTextLabel: this.defaultstrInputTextLabel,
      });
    },
    
    ScanLocation(strLocID) {
      if (this.blSlideTrayLoaded) {
        this.loading = true;
        this.MarkSlidesReadyForCourier(strLocID);
      } else {
        this.inputtext = "Scan Slide Tray Before Location";
      }
    },
    
    ScanSlide(strSlideID) {
      if (!this.blSlideTrayLoaded) {
        this.inputtext = "Scan Slide Tray First";
        return;
      }
    
      this.blFirstSlideScanned ? this.dispatch("MarkSlideToBeDistributed", { strSlideID: this.getters.GetSlideID, SlideDistributionID: this.getters.GetSlideDistributionID }) : this.CreateNewSlideDistribution(strSlideID);
    },
    
    async LoadBlockData(state, { ScanData }) {
      try {
        const apidata = await axios.post(`${this.getters.getApiUrl}/GetBlockData`, {
          action: "GetBlockData",
          blockID: ScanData,
          curRoute: this.getters.GetCurrentRouteName,
        });
        this.commit('setBlockData', apidata);
        await Promise.all([
          this.dispatch('findBlockColor', { 'hopperColor': apidata.data[0].Hopper }),
          this.dispatch('saveBlockData', { state, blk_data: apidata.data[0] })
        ]);
      } catch (error) {
        this.commit('SetToastData', { 'title': "Failed to get block: " + error, 'content': "Block Failure", 'variant': 'danger' });
      }
    },
    
    async saveBlockData({ state }) {
      const { GetBlockData, GetStationName, GetUsername, GetCurrentRouteName, BlockID } = this.getters;
    
      try {
        const response = await axios.post(`${this.getters.getApiUrl}/SetBlockData`, {
          action: "SetBlockData",
          blockData: GetBlockData,
          scanlocation: GetStationName,
          userid: GetUsername,
          curRoute: GetCurrentRouteName,
        });
        this.commit('SetToastData', { content: '', title: "Block Status", 'variant': 'success' });
      } catch (error) {
        this.commit('SetToastData', { 'title': "Failed to Embed: " + error, 'content': "AXIOS ERROR", 'variant': 'danger' });
      }
    },
    
    makeToast() {
      const { GetToastData } = this.getters;
      const { content, title, variant = "warning", time = 99999 } = GetToastData;
      GetToastData.instance.toast(content, {
        title,
        variant,
        solid: true,
        autoHideDelay: time,
        toaster: "b-toaster-top-center",
        autohide: false,
      });
    },
    
    findBlockColor(hopperColor) {
      const colors = {
        101: "primary",
        102: "primary",
        103: "success",
        104: "success",
        105: "danger",
        106: "warning",
        107: "dark",
        108: "dark"
      };
      if (colors[hopperColor]) { this.commit('setBlockColor', colors[hopperColor]); }
    }
  },
});
