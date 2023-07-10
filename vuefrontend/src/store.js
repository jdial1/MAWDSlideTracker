import Vue from 'vue'
import Vuex from 'vuex'
import axios from 'axios'
import {BToast} from 'bootstrap-vue'
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
    backend_connect(state) {
      state.BackendSocketConn = true;
      this._vm.$socket.emit("version", state.frontendVersion);
    },
    backend_toast(state, message) {
      this.commit('SetToastData', message);
      this.dispatch("makeToast");
    },
    local_stream(state, context) {
      state.localSocketConn = true;
      this.dispatch('validateScanData', { state, context });
    },
    backend_disconnect(state) {
      state.BackendSocketConn = false;
    },
    backend_message(context) {
      console.log("backend_socket_message: " + context);
    },
    backend_BackendVersion(state, context) {
      state.backendVersion = context;
    },
    localVersion(state, context) {
      state.localVersion = context;
    },
    SetUserName(state, strUsername) {
      state.username = strUsername;
    },
    SetValidUser(state, blTemp) {
      state.validuser = blTemp;
    },
    SetStationName(state, strTemp) {
      state.stationName = strTemp;
    },
    SetSlideQueuePath(state, strTemp) {
      state.slideQueuePath = strTemp;
    },
    SetSlidesData(state, strTemp) {
      state.slidesData = strTemp;
    },
    SetLocalSocketConn(state, strTemp) {
      state.localSocketConn = strTemp;
    },
    SetBackendSocketConn(state, strTemp) {
      state.BackendSocketConn = strTemp;
    },
    SetbackendVersion(state, strTemp) {
      state.backendVersion = strTemp;
    },
    SetLocalVersion(state, strTemp) {
      state.localVersion = strTemp;
    },
    SetToastData(state, strTemp) {
      state.toastData = strTemp;
      this.dispatch("makeToast");
    },
    SetbackendConn(state, strTemp) {
      state.backendConn = strTemp;
    },
    SetPrintName(state, strTemp) {
      state.printName = strTemp;
    },
    ClearBlockCountTableItems(state) {
      state.blockCountTableItems = [];
    },
    PushBlockCountTableItems(state, objTmp) {
      state.blockCountTableItems.push(objTmp);
    },
    production(state, strTemp) {
      state.production = strTemp;
    },
    SetCurrentRouteName(state, strTemp) {
      this.commit("blockData", []);
      state.currentRouteName = strTemp;
    },
    setBlockColor(state, strTemp) {
      state.blockColor = strTemp;
    },
    setBlockData(state, strTemp) {
      state.blockData = strTemp;
    },
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
    getApiUrl: state => {
      if (state.nodeBackendTestMode) {
        return state.testLocalapiURL
      } else {
        return state.production ? state.prodapiURL : state.testapiURL;
      }
    },
  },
  actions: {
    async updateEngraverLocations() {
      await this._vm.$socket.emit('engraverUpdate','');
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
    async validateScanData({ getters, commit, dispatch }, { context, state }) {
      const { barcodeScanData, localVersion } = context;
      const { currentRouteName } = state;
      const scanType = barcodeScanData.substring(0, 4);
      const materialData = barcodeScanData.substring(4);
      const validUser = getters.getValidUser;
      commit('setLocalVersion', localVersion || 'OLD');
      const typeRoute = `${scanType}_${currentRouteName}`;
      const invalidScans = ['HSLD_SlidePrinting', 'LOCN_SlidePrinting', 'SLTR_SlidePrinting', 'HBLK_SlideDistribution', 'HSLD_Embedding', 'LOCN_Embedding', 'SLTR_Embedding', 'HBLK_Home', 'HSLD_Home', 'LOCN_Home', 'SLTR_Home'];
      const materialLookup = { 'HBLK': 'Block', 'HSLD': 'Slide', 'LOCN': 'Location', 'SLTR': 'Slide Tray', 'SBDG': 'Badge' };
    
      switch (scanType) {
        case 'SBDG':
          await dispatch('scanBadge', { badge_id: materialData, scan_data: context });
          break;
        case !validUser:
          commit('setToastData', { title: 'Invalid User', content: 'Please login before scanning material' });
          break;
        case invalidScans.includes(typeRoute):
          commit('setToastData', { title: 'Incorrect Material', content: `${materialLookup[scanType]} Material cannot be scanned from ${typeRoute.split('_')[1]}` });
          break;
        case typeRoute === 'HBLK_SlidePrinting':
          await dispatch('pullSlides', { blockID: materialData });
          break;
        case typeRoute === 'HSLD_SlideDistribution':
          await dispatch('ScanSlide', { ScanData: context });
          break;
        case typeRoute === 'LOCN_SlideDistribution':
          await dispatch('ScanLocation', { ScanData: context });
          break;
        case typeRoute === 'SLTR_SlideDistribution':
          await dispatch('ScanSlideTray', { ScanData: context });
          break;
        case typeRoute === 'HBLK_Embedding':
          await dispatch('loadBlockData', { blockID: materialData });
          break;
        default:
          break;
      }
    },
    async pullSlides({ commit, getters }, { blockID }) {
      if (!blockID) {
        alert('Please enter block ID to pull up slides');
        return;
      }
      try {
        const { data } = await axios.post(`${getters.getApiUrl}/pullSlides`, { blockID });
        commit('SetSlidesData', data);
        commit('setFormStatus', { status: 'readytoprint', label: 'Print Slides' });
        await axios.post(`${getters.getApiUrl}/GetPartBlockCurrentAndTotals`, { blockID });
      } catch (error) {
        console.error(error);
      }
    },
    async scanBadge({ commit, getters }, { badge_id: userId, scan_data: data }) {
      try {
        const { data: userInfo } = await axios.post(`${getters.getApiUrl}/getUserInfo`, { userId });
        const { username, printname } = userInfo[0];
        commit('SetUserName', username);
        commit('SetPrintName', printname);
        if (getters.GetUsername.length) {
          commit('SetValidUser', true);
          commit('SetSlideQueuePath', data.slideQueuePath);
          commit('SetStationName', data.StationName);
        }
      } catch (error) {
        console.error(error);
      }
    },
    async printSlides({ commit, getters }, blockID) {
      try {
        const response = await axios.post(`${getters.getApiUrl}/printslides`, {
          action: 'PrintSlides',
          blockID,
          printRequestedBy: getters.GetUsername,
          slideQueuePath: getters.GetSlideQueuePath,
          printLocation: getters.GetStationName,
          curRoute: getters.GetCurrentRouteName,
        });
        const { files } = response;
        if (files) {
          commit('SetToastData', { title: 'Slide Printer Issues', content: `Files waiting to be printed:\n ${files}`, variant: 'danger' });
        }
      } catch (error) {
        console.error(error);
      }
      // Done printing, scan new block
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
    LoadTableData() {
      this.dispatch("LoadBlockCountTableData").then(() => {
        this.datacollection = this.getters.objChartDataCollection;
      });
    },
    CreateNewSlideDistribution() {
      var { GetUsername, GetSlideTrayID, GetStationName, GetCurrentRouteName, GetSlideID, GetSlideDistributionID } = this.getters;
      // Only create new slide distribution if New Slide Tray, otherwise, existing tray has already been loaded.
      if (this.rdSlideTrayBehaviorSelected === "EditExisting") {
        // Already have slide distribution ID, do not get new one.
        this.blFirstSlideScanned = true;
        this.dispatch("MarkSlideToBeDistributed", { strSlideID: GetSlideID, SlideDistributionID: GetSlideDistributionID });
      } else {
        // Clear Slide Distrib ID
        GetSlideDistributionID = null;
        // Call API to create new slide distribution for slide tray.
        axios.post(GetApiUrl + "/slidedistribution", {
            action: "CreateNewSlideDistribution",
            userid: GetUsername,
            slidetray: GetSlideTrayID,
            scanlocation: GetStationName,
            curRoute: GetCurrentRouteName,
          })
          .then((apidata) => {
            this.blFirstSlideScanned = true;
            this.SlideDistributionID = apidata.data.insertId;
            this.dispatch("MarkSlideToBeDistributed", { strSlideID: GetSlideID, SlideDistributionID: this.SlideDistributionID });
            const { data } = apidata;
            this.strInTraySlideCount = data[2][0].SlidesInTray;
            this.strInTrayBlockCount = data[3][0].BlockCountInTray;
            // Update block count table
            this.LoadTableData();
          })
          .catch((e) => {});
      }
    },
    MarkSlidesReadyForCourier() {
      const { GetUsername, GetSlideDistributionID, GetStationName, GetSlideTrayID, GetCurrentRouteName } = this.getters;
      if (this.blFirstSlideScanned) {
        axios.post(this.getters.getApiUrl + "/slidedistribution", {
          action: "MarkSlidesReadyForCourier",
          slidedistid: this.SlideDistributionID,
          userid: GetUsername,
          slidedistrloc: GetSlideDistributionID,
          scanlocation: GetStationName,
          curRoute: GetCurrentRouteName,
        }).then(() => {
          this.clearVariables();
          this.loadTableData();
        }).catch(() => {
          this.clearVariables();
          this.inputtext = "Error";
        });
      } else {
        axios.post(this.getters.getApiUrl + "/slidedistribution", {
          action: "AssignTrayNewLocation",
          userid: GetUsername,
          slidedistrloc: GetSlideDistributionID,
          scanlocation: GetStationName,
          slidetray: GetSlideTrayID,
          curRoute: GetCurrentRouteName,
        }).then(() => {
          this.clearVariables();
        }).catch(() => {
          this.clearVariables();
          this.inputtext = "Error";
        });
      }
    },
    clearVariables() {
      this.slidetrayID = "";
      this.blSlideTrayLoaded = false;
      this.currentslidetray = this.nextslidetray;
      this.inputtext = "Scan Slide Tray to Proceed";
      this.strInputTextLabel = this.defaultstrInputTextLabel;
      this.slides = {};
      this.SlideDistributionID = null;
      this.rdSlideTrayBehaviorOptions[1].disabled = false;
      this.rdSlideTrayBehaviorOptions[0].disabled = false;
    },
    loadTableData() {
      this.loading = false;
      this.strInTrayBlockCount = "0";
      this.strInTraySlideCount = "0";
      this.LoadTableData();
    },    
    clearCurrentSlide() {
      this.blockID = "";
      this.formstatus = "loadslides";
      this.formstatuslabel = "Load Slides";
      this.totalBlocks = "";
      this.currentBlock = "";
      this.totalParts = "";
      this.currentPart = "";
      this.slides = {};
    },
    async ScanSlideTray(strSlideTrayID) {
      const { GetSlideTrayID, GetSlideDistributionID, GetUsername, GetStationName } = this.getters;
      if (this.blSlideTrayLoaded) {
        this.inputtext = "Scan Slide or Location to close Slide Tray";
        return;
      }
      this.blSlideTrayLoaded = true;
      this.slidetrayID = strSlideTrayID;
      this.currentslidetray = this.slidetrayID;
      if (this.rdSlideTrayBehaviorSelected === "EditExisting") {
        try {
          this.loading = true;
          const { data } = await axios.post(this.getters.getApiUrl + "/slidedistribution", {
            action: "LoadSlideTray",
            userid: GetUsername,
            slidetray: GetSlideTrayID,
            scanlocation: GetStationName,
            curRoute: this.currentRouteName,
          });
          this.SlideDistributionID = GetSlideDistributionID;
          //Load Slide Tray now
          const temp = data;
          this.slides = temp[1];
          this.fields = Object.keys(this.slides[0]);
          this.fields[3] = {
            key: Object.keys(this.slides[0])[3],
            label: "Case Slides Not In Tray",
          };
          this.fields[3] = "Case Slides Not In Tray";
          this.obApiResult02 = temp[2];
          this.strInTraySlideCount = this.obApiResult02[0].SlidesInTray;
          this.obApiResult03 = temp[3];
          this.strInTrayBlockCount = this.obApiResult03[0].BlockCountInTray;
          this.rdSlideTrayBehaviorOptions[0].disabled = true;
        } catch (error) {
          // handle error
        } finally {
          this.loading = false;
        }
      } else {
        this.rdSlideTrayBehaviorOptions[1].disabled = true;
      }
      this.inputtext = "Scan Slide to Proceed";
      this.strInputTextLabel = this.defaultstrInputTextLabel;
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
    async LoadBlockData(state, {ScanData}) {
      try {
        const apidata = await axios.post(this.getters.getApiUrl + "/GetBlockData", {
          action: "GetBlockData",
          blockID: ScanData,
          curRoute: this.getters.GetCurrentRouteName,
        });
        this.commit('setBlockData', apidata);
        await this.dispatch('findBlockColor', {'hopperColor': apidata.data[0].Hopper});
        await this.dispatch('saveBlockData', {state, blk_data: apidata.data[0]});
      } catch (error) {
        this.commit('SetToastData', { 'title': "Failed to get block: " + error, 'content': "Block Failure", 'variant': 'danger' });
      }
    },    
    async saveBlockData({state}) {
      const {GetBlockData, GetStationName, GetUsername, GetCurrentRouteName, BlockID} = this.getters;
      try {
        const response = await axios.post(this.getters.getApiUrl + "/SetBlockData", {
          action: "SetBlockData",
          blockData: GetBlockData,
          scanlocation: GetStationName,
          userid: GetUsername,
          curRoute: GetCurrentRouteName,
        });
        const ToastString = `${BlockID} Status Updated to Embedded: ${response}`;
        this.commit('SetToastData', { content: '',title: "Block Status",'variant': 'success' });
      } catch (error) {
        this.commit('SetToastData', { 'title': "Failed to Embed: " + error,'content':"AXIOS ERROR",'variant':'danger' });
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
      let colors = {
        101: "primary", //blue
        102: "primary", //blue
        103: "success", //green
        104: "success", //green
        105: "danger",  //red
        106: "warning", //yellow
        107: "dark",    //purple
        108: "dark",    //purple
      };
      if (colors[hopperColor]) {this.commit('setBlockColor', colors[hopperColor]);}
    },
  },
});
