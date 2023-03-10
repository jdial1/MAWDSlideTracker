import Vue from 'vue'
import Vuex from 'vuex'
import axios from 'axios'
import {BToast} from 'bootstrap-vue'

const { version } = require("../package.json");

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    defaultUsername       : "Scan Badge",
    username              : "Scan Badge",
    printName             : '',
    validuser             : true,
    currentRouteName      : "Home",
    slideDistributionID   : "",
    slideTrayID           : "",
    slideID               : "",
    slidesData            : [],
    blockColor            : "",
    blockData             : [],
    blockCountTableFields : ["location", "block_count"],
    blockCountTableItems  : [],

    // Backend Variables
    nodeBackendTestMode   : false,
    backendVersion        : "",
    BackendSocketConn     : false,
    backendConn           : false,
    testLocalapiURL       : "http://localhost:2081",
    testapiURL            : "http://10.24.4.9:2082",
    prodapiURL            : "http://10.24.4.9:2081",

    // Frontend Variables
    production            : false,
    vueFrontendTestMode   : false,
    frontendVersion       : version,

    // Local Variables
    localSocketConn       : false,
    localVersion          : "",
    localComPort          : "",
    stationName           : "",
    slideQueuePath        : "",
  },
  mutations: {
    backend_connect: function (state) {
      state.BackendSocketConn = true;
      this._vm.$socket.emit("version", state.frontendVersion);
    },
    local_stream: function (state, context) {
      state.localSocketConn = true;
      this.dispatch('validateScanData', { state, context })
    },
    backend_disconnect        : (state) => (state.BackendSocketConn = false),
    backend_message           : (context) => console.log("backend_socket_message: " + context),
    backend_BackendVersion    : (state, context) => (state.backendVersion = context),
    localVersion              : (state, context) => (state.localVersion = context),
    SetUserName               : (state, strUsername) => (state.username = strUsername),
    SetValidUser              : (state, blTemp) => (state.validuser = blTemp),
    SetStationName            : (state, strTemp) => (state.stationName = strTemp),
    SetSlideQueuePath         : (state, strTemp) => (state.slideQueuePath = strTemp),
    SetSlidesData             : (state, strTemp) => (state.slidesData = strTemp),
    SetLocalSocketConn        : (state, strTemp) => (state.localSocketConn = strTemp),
    SetBackendSocketConn      : (state, strTemp) => (state.BackendSocketConn = strTemp),
    SetbackendVersion         : (state, strTemp) => (state.backendVersion = strTemp),
    SetLocalVersion           : (state, strTemp) => (state.localVersion = strTemp),
    SetbackendConn            : (state, strTemp) => (state.backendConn = strTemp),
    SetPrintName              : (state, strTemp) => (state.printName = strTemp),
    ClearBlockCountTableItems : (state) => (state.blockCountTableItems = []),
    PushBlockCountTableItems  : (state, objTmp) => state.blockCountTableItems.push(objTmp),
    production                : (state, strTemp) => (state.production = strTemp),
    SetCurrentRouteName: function (state, strTemp) {
      this.commit("blockData", []);
      state.currentRouteName = strTemp
  },
    setBlockColor   : (state, strTemp) => (state.blockColor = strTemp),
    setBlockData    : (state, strTemp) => (state.blockData = strTemp),
  },
  getters: {
    BlockCountTableFields   : (state) => state.blockCountTableFields,
    BlockCountTableItems    : (state) => state.blockCountTableItems,
    GetValidUser            : (state) => state.validuser,
    GetUsername             : (state) => state.username,
    GetPrintName            : (state) => state.printName,
    GetDefaultUsername      : (state) => state.defaultUsername,
    getBackendTestMode      : (state) => state.nodeBackendTestMode,
    GetBlockData            : (state) => state.blockData,
    GetStationName          : (state) => state.stationName,
    GetSlidesData           : (state) => state.slidesData,
    GetCurrentRouteName     : (state) => state.currentRouteName,
    GetnodeBackendTestMode  : (state) => state.nodeBackendTestMode,
    GetvueFrontendTestMode  : (state) => state.vueFrontendTestMode,
    GetBEVersion            : (state) => state.backendVersion,
    GetFEVersion            : (state) => state.frontendVersion,
    GetLocalVersion         : (state) => state.localVersion,
    GetSlideQueuePath       : (state) => state.slideQueuePath,
    GetSlideDistributionID  : (state) => state.slideDistributionID,
    GetLocalSocketStatus    : (state) => state.localSocketConn,
    GetBackendSocketStatus  : (state) => state.BackendSocketConn,
    GetSlideID              : (state) => state.slideID,
    GetBackendStatus        : (state) => state.backendConn,
    GetSlideTrayID          : (state) => state.slideTrayID,
    GetProduction           : (state) => state.production,
    getApiUrl: (state) => {
      if (state.nodeBackendTestMode) {
        return state.testLocalapiURL
      }
      if (!state.production) {
        return state.testapiURL
      }
      return state.prodapiURL
    }
  },
  actions: {
    LoadBlockCountTableData({ commit }) {
      return new Promise((resolve, reject) => {
        let strFullAPICall = this.getters.getApiUrl + "/reports";
        axios
          .post(strFullAPICall, {
            action: "blockcount",
          })
          .then((response) => {
            commit("ClearBlockCountTableItems");
            for (const element of response.data) {
              commit("PushBlockCountTableItems", {
                isActive: false,
                location: element.SlideDistributionLocation.replace(
                  "LOCN",
                  ""
                ),
                block_count: element.BlockCount,
              });
            }
            resolve();
          })
          .catch((error) => {
            reject(error);
          });
      });
    },

    validateScanData(state, data) {
      console.log('data '+JSON.stringify(data))
      let scanData = data.context;
      console.log('scanData '+JSON.stringify(scanData))
      let currentRoute = data.state.currentRouteName;
      console.log('currentRoute '+JSON.stringify(currentRoute))
      let ScanType = scanData.barcodeScanData.substring(0, 4);
      console.log('ScanType '+JSON.stringify(ScanType))
      let materialData = scanData.barcodeScanData.substring(4);
      console.log('materialData '+JSON.stringify(materialData))
      let valid_user = this.getters.GetValidUser;
      console.log('valid_user '+JSON.stringify(valid_user))

      if (scanData.localVersion) {
        this.commit("SetLocalVersion", data.context.localVersion);
      } else {
        this.commit("SetLocalVersion", "OLD");
      }

      let type_route = `${ScanType}_${currentRoute}`;

      let invalid_scans = [

        'HSLD_SlidePrinting',
        'LOCN_SlidePrinting',
        'SLTR_SlidePrinting',

        'HBLK_SlideDistribution',

        'HSLD_Embedding',
        'LOCN_Embedding',
        'SLTR_Embedding',

        'HBLK_Home',
        'HSLD_Home',
        'LOCN_Home',
        'SLTR_Home'
      ]

      // ---Badge Scanning---

      if (ScanType === "SBDG") {
        console.log("SBDG");
        this.dispatch("scanBadge", {
          state: state,
          badge_id: materialData,
          scan_data: scanData,
        });
      } else if (!valid_user) {
        this.dispatch("makeToast", {
          content: "Not Logged In",
          title: "Please scan badge before scanning material",
        });
      }
        
        
      // Catch invalid routes
      else if (invalid_scans.includes(type_route)) {
        console.log(type_route);
        this.dispatch("makeToast", {
          content: "Incorrect Material",
          title: `${ScanType} cannot be scanned from this page`,
        });
      }

        
      // ---Slide Printing---
      else if (type_route === "HBLK_SlidePrinting") {
        console.log("HBLK - SlidePrinting");
        this.dispatch("pullSlides", {state, data: data.context.barcodeScanData });

      

      // ---Slide Distribution---

      } else if (type_route === "HSLD_SlideDistribution") {
        console.log("HSLD - SlideDistribution");
        this.dispatch('ScanSlide',{ScanData:scanData})

      } else if (type_route === "LOCN_SlideDistribution") {
        console.log("LOCN - SlideDistribution");
        // this.dispatch('ScanLocation', {ScanData: scanData})

      } else if (type_route === "SLTR_SlideDistribution") {
        console.log("SLTR - SlideDistribution");
        // this.dispatch('ScanSlideTray',{ScanData:scanData})
      }

        
      // ---Embedding---
      else if (type_route === "HBLK_Embedding") {
        console.log("HBLK - Embedding");
        this.dispatch('LoadBlockData',{state,ScanData:scanData.barcodeScanData})
      }
    },

    pullSlides(state, data) {
      let blockID = data.data
      console.log("start pull slides");
      console.log(data)
      if (!blockID) {
        alert("please enter block ID to pull up slides");
        return;
      }
      this.loading = true;

      axios.post(this.getters.getApiUrl + "/pullSlides", {
          blockID:blockID
        })
        .then((data) => {
          console.log(data)
          this.loading = false;
          this.error_message = "";
          console.log(this.currentRouteName);
          this.slides = data.data;
          this.commit("SetSlidesData",this.slides)
          this.formstatus = "readytoprint";
          this.formstatuslabel = "Print Slides";
        })
        .catch((e) => {
          console.log(e);
        });
      
      axios.post(this.getters.getApiUrl + "/GetPartBlockCurrentAndTotals", {
        blockID:blockID
      })
      .then((data) => {
        console.log(data)
      })
      .catch((e) => {
        console.log(e);
      });
    },
    scanBadge( state,badge_data) {
      const { badge_id: userid, scan_data: data } = badge_data;
      console.log(badge_data)
      console.log(state)
      axios
        .post(this.getters.getApiUrl + "/getUserInfo", {
          userid: userid
        })
        .then((userinfodata) => {
          let userinfo = userinfodata.data;
          this.commit("SetUserName", userinfo[0].username);
          this.commit("SetPrintName", userinfo[0].printname);
          if (this.getters.GetUsername.length) {
            this.commit("SetValidUser", true);
            this.commit("SetSlideQueuePath", data.slideQueuePath);
            this.commit("SetStationName", data.StationName);
          }
        });
    },
    printSlides() {
      axios
        .post(this.getters.getApiUrl + "/printslides", {
          action: "PrintSlides",
          blockID: this.blockID,
          printRequestedBy: this.getters.GetUsername,
          slideQueuePath: this.getters.GetSlideQueuePath,
          printLocation: this.getters.GetStationName,
          curRoute: this.getters.GetCurrentRouteName,
        })
        .then((response) => {
          console.log("slides printed");
          console.log(response.info);
          if (response.files) {
            this.makeToast(
              "Files waiting to be printed:\n " + response.files,
              "Slide Printer Issues",
              "danger",
              10000
            );
          }
        })
        .catch((error) => {
          console.log(error);
        });

      //Done printing, scan new block
      this.formstatus = "loadslides";
      this.formstatuslabel = "Load Slides";
      this.clearCurrentSlide();
      console.log("Done printing slides");
    },
    MarkSlideToBeDistributed(strSlideID, strSlideDistributionID) {
      //Only mark id slide tray is loaded
      if (this.blSlideTrayLoaded) {
        axios
          .post(this.getters.getApiUrl + "/slidedistribution", {
            action: "MarkSlideToBeDistributed",
            slidedistid: strSlideDistributionID,
            slidetray: this.slidetrayID,
            slideid: strSlideID,
            curRoute: this.currentRouteName,
          })
          .then((apidata) => {
            this.loading = false;
            this.error_message = "";
            let temp = {};
            temp = apidata.data;
            this.slides = temp[1];
            this.fields = Object.keys(this.slides[0]);
            this.fields[3] = {
              key: Object.keys(this.slides[0])[3],
              label: "Case Slides Not In Tray",
            };
            this.obApiResult02 = temp[2];
            this.strInTraySlideCount = this.obApiResult02[0].SlidesInTray;
            this.obApiResult03 = temp[3];
            this.strInTrayBlockCount = this.obApiResult03[0].BlockCountInTray;
            // Update block count table
            this.LoadTableData();
          })
          .catch((e) => {
            console.log(e);
          })
          .catch((error) => {
            console.log(`error:${error}`);
          });
      } else {
        this.inputtext = "Scan Slide Tray Before Slide";
      }
    },
    LoadTableData() {
      this.dispatch("LoadBlockCountTableData").then(() => {
        this.datacollection = this.getters.objChartDataCollection;
        console.log(this.getters.blockCountTableItems);
      });
    },
    CreateNewSlideDistribution() {
      //Only create new slide distribution if New Slide Tray, otherwise, existing tray has already been loaded.
      switch (this.rdSlideTrayBehaviorSelected) {
        case "EditExisting":
          // Already have slide distribution ID, do not get new one.
          this.blFirstSlideScanned = true;
          this.dispatch("MarkSlideToBeDistributed", {
            strSlideID: this.getters.GetSlideID,
            SlideDistributionID: this.getters.GetSlideDistributionID,
          });
          break;

        default:
          // Clear Slide Distrib ID
          this.getters.GetSlideDistributionID = null;
          // Call API to create new slide distribution for slide tray.
          axios
            .post(this.getters.getApiUrl + "/slidedistribution", {
              action: "CreateNewSlideDistribution",
              userid: this.getters.GetUsername,
              slidetray: this.getters.GetSlideTrayID,
              scanlocation: this.getters.GetStationName,
              curRoute: this.getters.GetCurrentRouteName,
            })
            .then((apidata) => {
              this.loading = false;
              this.error_message = "";
              let temp = {};
              temp = apidata.data;
              this.SlideDistributionID = temp.insertId;
              this.blFirstSlideScanned = true;
              this.dispatch("MarkSlideToBeDistributed", {
                strSlideID: this.getters.GetSlideID,
                SlideDistributionID: this.getters.GetSlideDistributionID,
              });
            })
            .catch((e) => {
              console.log(e);
            });
          break;
      }
    },
    MarkSlidesReadyForCourier() {
      if (this.blFirstSlideScanned) {
        axios
          .post(this.getters.getApiUrl + "/slidedistribution", {
            action: "MarkSlidesReadyForCourier",
            slidedistid: this.SlideDistributionID,
            userid: this.getters.GetUsername,
            slidedistrloc: this.getters.GetSlideDistributionID,
            scanlocation: this.getters.GetStationName,
            curRoute: this.getters.GetCurrentRouteName,
          })
          .then(() => {
            // console.log(response)
            this.slidetrayID = "";
            this.blSlideTrayLoaded = false;
            this.blFirstSlideScanned = false;
            this.currentslidetray = this.nextslidetray;
            this.inputtext = "Scan Slide Tray to Proceed";
            this.strInputTextLabel = this.defaultstrInputTextLabel;
            this.slidedistid = null;
            this.loading = false;
            this.strInTrayBlockCount = "0";
            this.strInTraySlideCount = "0";
            this.slides = {};
            //Clear Slide Distrib ID
            this.SlideDistributionID = null;

            //Enable Radio Buttons
            this.rdSlideTrayBehaviorOptions[1].disabled = false;
            this.rdSlideTrayBehaviorOptions[0].disabled = false;

            console.log("MarkSlidesReadyForCourier - LOADING TABLE DATA");
            this.LoadTableData();
          })
          .catch((error) => {
            console.log(error);
            this.loading = false;
            this.inputtext = "Error";
          });
      } else {
        // Slide tray scanned location without any slides, need to get slide distr id and assign location
        axios
          .post(this.getters.getApiUrl + "/slidedistribution", {
            action: "AssignTrayNewLocation",
            userid: this.getters.GetUsername,
            slidedistrloc: this.getters.GetSlideDistributionID,
            scanlocation: this.getters.GetStationName,
            slidetray: this.getters.GetSlideTrayID,
            curRoute: this.getters.GetCurrentRouteName,
          })
          .then(() => {
            this.slidetrayID = "";
            this.blSlideTrayLoaded = false;
            this.currentslidetray = this.nextslidetray;
            this.inputtext = "Scan Slide Tray to Proceed";
            this.strInputTextLabel = this.defaultstrInputTextLabel;
            this.loading = false;
            //Clear Slide Distrib ID
            this.SlideDistributionID = null;
            console.log("else - NOT LOADING TABLE DATA");
            //this.LoadTableData()
          })
          .catch((error) => {
            console.log(error);
            this.loading = false;
            this.inputtext = "Error";
          });
      }
    },
    clearCurrentSlide() {
      console.log("hellocancelbutton");
      this.blockID = "";
      this.formstatus = "loadslides";
      this.formstatuslabel = "Load Slides";
      this.totalBlocks = "";
      this.currentBlock = "";
      this.totalParts = "";
      this.currentPart = "";
      this.slides = {};
    },
    ScanSlideTray(strSlideTrayID) {
      if (this.blSlideTrayLoaded === false) {
        this.blSlideTrayLoaded = true;
        this.slidetrayID = strSlideTrayID;
        this.currentslidetray = this.slidetrayID;

        if (this.rdSlideTrayBehaviorSelected === "EditExisting") {
          // Get slidedistr id from slide tray and load slides
          this.loading = "true";
          axios
            .post(this.getters.getApiUrl + "/slidedistribution", {
              action: "LoadSlideTray",
              userid: this.getters.GetUsername,
              slidetray: this.getters.GetSlideTrayID,
              scanlocation: this.getters.GetStationName,
              curRoute: this.currentRouteName,
            })
            .then((apidata) => {
              this.loading = false;
              this.error_message = "";

              let temp = apidata.data;

              this.SlideDistributionID = this.getters.GetSlideDistributionID;
              //Load Slide Tray now
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
            })
            .catch((e) => {
              console.log(e);
            })
            .catch((error) => {
              console.log(`error: ${error}`);
            });
        } else {
          this.rdSlideTrayBehaviorOptions[1].disabled = true;
        }
        this.inputtext = "Scan Slide to Proceed";
        this.strInputTextLabel = this.defaultstrInputTextLabel;
      } else {
        this.inputtext = "Scan Slide or Location to close Slide Tray";
      }
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
      this.inputtext = strSlideID;
      console.log(this.inputtext)
      if (this.blSlideTrayLoaded) {
        if (this.blFirstSlideScanned) {
          this.dispatch("MarkSlideToBeDistributed", {
            strSlideID: this.getters.GetSlideID,
            SlideDistributionID: this.getters.GetSlideDistributionID,
          });
        } else {
          this.CreateNewSlideDistribution(strSlideID);
        }
      } else {
        this.inputtext = "Scan Slide Tray First";
      }
    },
    LoadBlockData(state,blk_data) {
      axios
        .post(this.getters.getApiUrl + "/GetBlockData", {
          action: "GetBlockData",
          blockID: blk_data.ScanData,
          curRoute: this.getters.GetCurrentRouteName,
        })
        .then((apidata) => {
          this.commit('setBlockData',apidata);
          console.log('response:' + JSON.stringify(apidata[0]))
          this.dispatch('findBlockColor', {'hopperColor':apidata.data[0].Hopper})
          this.dispatch('saveBlockData', {state,blk_data});
        })
        .catch((e) => {
          console.log("AXIOS ERROR: " + e);
          this.dispatch('makeToast', {'title':"Failed to get block: " + e,'content':"Block Failure",'variant':'danger','time':10000});
        });
    },
    saveBlockData() {
      console.log("sbd1 "+ JSON.stringify(this.getters.GetBlockData))
      axios
        .post(this.getters.getApiUrl + "/SetBlockData", {
          action: "SetBlockData",
          blockData: this.getters.GetBlockData,
          scanlocation: this.getters.GetStationName,
          userid: this.getters.GetUsername,
          curRoute: this.getters.GetCurrentRouteName,
        })
        .then((response) => {
          console.log("SET BLOCK DATA AXIOS CALL");
          console.log(this.getters.GetCurrentRouteName);
          let ToastString =
          this.getters.BlockID + " Status Updated to Embedded: "+ response;
          // this.dispatch('makeToast', { 'title': 'Block Status', 'content': ToastString, 'variant': 'success', 'time': 3000 });
          this.dispatch("makeToast", {
            content: "test",
            title: "Block Status",
          });
        })
        .catch((e) => {
          console.log("AXIOS ERROR: " + e);
          this.dispatch('makeToast', {'title':"Failed to Embed: " + e,'content':"AXIOS ERROR",'variant':'danger','time':10000});
        });
    },
    makeToast(data) {
      let bootStrapToaster = new BToast();
      bootStrapToaster.$bvToast.toast(data.title, {
        title: data.content,
        variant: data.variant || "warning",
        solid: true,
        autoHideDelay: data.time || 99999,
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
        105: "danger", //red
        106: "warning", //yellow
        107: "dark", //purple
        108: "dark", //purple
      };
      if (colors[hopperColor]) {
        this.commit('setBlockColor', colors[hopperColor]);
      }
    },
  },
});
