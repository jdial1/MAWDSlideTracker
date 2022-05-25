import Vue from 'vue'
import Vuex from 'vuex'
import axios from 'axios'
import {BToast} from 'bootstrap-vue'

const {version} = require('../package.json');

Vue.use(Vuex)


export default new Vuex.Store({
    state: {
        defaultUsername: 'Scan Badge',
        username: 'Scan Badge',
        validuser: false,
        currentRouteName: 'Home',
        SlideDistributionID: '',
        SlideTrayID: '',
        SlideID: '',
        blockCountTableFields: ['location', 'block_count'],
        blockCountTableItems: [],

        // Backend Variables
        nodeBackendTestMode: true,
        backendVersion: '',
        BackendSocketConn: false,
        backendConn: false,
        testLocalapiURL: 'http://localhost:2082',
        testapiURL: 'http://10.24.4.9:2082',
        prodapiURL: 'http://10.24.4.9:2081',

        // Frontend Variables
        production: false,
        vueFrontendTestMode: false,
        frontendVersion: version,

        // Local Variables
        LocalSocketConn: false,
        localVersion: '',
        localComPort: '',
        stationName: '',
        slideQueuePath: ''

    },
    mutations: {
        backend_connect: function (state) {
            state.BackendSocketConn = true;
            this._vm.$socket.emit('version', state.frontendVersion);
        },
        local_stream: function (state, context) {
            this.dispatch('validateScanData', {state, context})
        },
        backend_disconnect: (state) => state.BackendSocketConn = false,
        backend_message: (context) => console.log('backend_socket_message: ' + context),
        backend_BackendVersion: (state, context) => state.backendVersion = context,
        localVersion: (state, context) => state.localVersion = context,
        SetUserName: (state, strUsername) => state.username = strUsername,
        SetValidUser: (state, blTemp) => state.validuser = blTemp,
        SetStationName: (state, strTemp) => state.stationName = strTemp,
        SetSlideQueuePath: (state, strTemp) => state.slideQueuePath = strTemp,
        SetLocalSocketConn: (state, strTemp) => state.LocalSocketConn = strTemp,
        SetBackendSocketConn: (state, strTemp) => state.BackendSocketConn = strTemp,
        SetbackendVersion: (state, strTemp) => state.backendVersion = strTemp,
        SetLocalVersion: (state, strTemp) => state.localVersion = strTemp,
        SetbackendConn: (state, strTemp) => state.backendConn = strTemp,
        ClearBlockCountTableItems: (state) => state.blockCountTableItems = [],
        PushBlockCountTableItems: (state, objTmp) => state.blockCountTableItems.push(objTmp),
        production: (state, strTemp) => state.production = strTemp,
        SetCurrentRouteName: (state, strTemp) => state.currentRouteName = strTemp
    },
    getters: {
        BlockCountTableFields: (state) => state.blockCountTableFields,
        BlockCountTableItems: (state) => state.blockCountTableItems,
        GetValidUser: (state) => state.validuser,
        GetUsername: (state) => state.username,
        GetDefaultUsername: (state) => state.defaultUsername,
        getBackendTestMode: (state) => state.nodeBackendTestMode,
        GetStationName: (state) => state.stationName,
        GetCurrentRouteName: (state) => state.currentRouteName,
        GetnodeBackendTestMode: (state) => state.nodeBackendTestMode,
        GetvueFrontendTestMode: (state) => state.vueFrontendTestMode,
        GetBEVersion: (state) => state.backendVersion,
        GetFEVersion: (state) => state.frontendVersion,
        GetLocalVersion: (state) => state.localVersion,
        GetSlideQueuePath: (state) => state.slideQueuePath,
        GetSlideDistributionID: (state) => state.SlideDistributionID,
        GetLocalSocketStatus: (state) => state.LocalSocketConn,
        GetBackendSocketStatus: (state) => state.BackendSocketConn,
        GetSlideID: (state) => state.SlideID,
        GetBackendStatus: (state) => state.backendConn,
        GetSlideTrayID: (state) => state.SlideTrayID,
        getApiUrl: (state) => state.nodeBackendTestMode ? state.testLocalapiURL : !state.production ? state.testapiURL : state.prodapiURL,
        GetProduction: (state) => state.production
    },
    actions: {
        ClearUsername(){
            this.commit('SetUserName', this.defaultUsername)
        },
        LoadBlockCountTableData({commit}) {
            return new Promise((resolve, reject) => {
                let strFullAPICall = this.getters.getApiUrl + '/reports'
                axios.post(strFullAPICall, {
                    action: 'blockcount'
                })
                    .then((response) => {
                        commit('ClearBlockCountTableItems')
                        for (var i = 0; i < response.data.length; i++) {
                            commit('PushBlockCountTableItems',
                                {
                                    isActive: false,
                                    location: response.data[i].SlideDistributionLocation.replace('LOCN', ''),
                                    block_count: response.data[i].BlockCount
                                })
                        }
                        resolve()
                    })
                    .catch((error) => {
                        reject(error)
                    })
            })
        },


        validateScanData(state, data) {
            let scanData = data.context;
            let currentRoute = data.state.currentRouteName;
            let ScanType = scanData.barcodeScanData.substring(0, 4);
            let materialData = scanData.barcodeScanData.substring(4);
            let valid_user = this.getters.GetValidUser;

            if (scanData.localVersion) {
                this.commit('SetLocalVersion', data.context.localVersion)
            } else {
                this.commit('SetLocalVersion', 'OLD')
            }


            let type_route = `${ScanType}_${currentRoute}`;
            
            // Badge Scanning

            if (ScanType === 'SBDG') {
                console.log('SBDG')
                this.dispatch('scanBadge', {state: this.state, badge_id: materialData, scan_data: scanData})

            } else if (!valid_user) {
                this.dispatch('makeToast', {
                    content: 'Not Logged In',
                    title: 'Please scan badge before scanning material'
                })
            }
            
            // Slide Printing

            else if (type_route ==='HBLK_SlidePrinting') {
                console.log('HBLK - SlidePrinting')
                let blockID = scanData.barcodeScanData
                this.dispatch('pullSlides',{blockID:blockID})

            } else if (type_route ==='HSLD_SlidePrinting') {
                console.log('HSLD - SlidePrinting')
                this.dispatch('makeToast', {
                    content: 'Incorrect Material',
                    title: 'Slides cannot be scanned from this page'
                })
            }


            // Slide Distribution

            else if (type_route === 'HBLK_SlideDistribution') {
                console.log('HBLK - SlideDistribution')
                this.dispatch('makeToast', {
                    content: 'Incorrect Material',
                    title: 'Blocks cannot be scanned from this page'
                })

            } else if (type_route === 'HSLD_SlideDistribution') {
                console.log('HSLD - SlideDistribution')
                // this.dispatch('ScanSlide',{ScanData:scanData})

            } else if (type_route === 'LOCN_SlideDistribution') {
                console.log('LOCN - SlideDistribution')
                // this.dispatch('ScanLocation', {ScanData: scanData})

            } else if (type_route === 'SLTR_SlideDistribution') {
                console.log('SLTR - SlideDistribution')
                // this.dispatch('ScanSlideTray',{ScanData:scanData})

            }


            // Embedding

            else if (type_route === 'HBLK_Embedding') {
                console.log('HBLK - Embedding')
                // this.dispatch('getBlockData')
            }

        },
        pullSlides() {
            console.log('start pull slides');
            let blockID = this.blockID
            if (!blockID) {
                alert('please enter block ID to pull up slides')
                return
            }
            this.loading = true

            //uses fetch as opposed to Axios
            const API_URLWithSlideParameters = this.getters.getApiUrl + '/slidetracker/slideparameters?blockid='  //For Get Call
            fetch(`${API_URLWithSlideParameters}${blockID}`)
                //.then(response => response.json())
                .then((response) => {
                    return response.json()
                })
                .then(data => {
                    this.loading = false
                    this.error_message = ''
                    console.log(this.currentRouteName)
                    this.slides = data;
                    this.formstatus = 'readytoprint';
                    document.getElementById("InputBlockID").disabled = true;
                    this.formstatuslabel = 'Print Slides';
                }).catch((e) => {
                console.log(e)
            })
            this.GetPartBlockCurrentAndTotals()
        },
        scanBadge(state, badge_data) {
            const {badge_id: userid, scan_data: data} = badge_data;
            axios.post(this.getters.getApiUrl + '/getUserInfo', {
                userid: userid
            })
                .then(userinfodata => {
                    let userinfo = userinfodata.data;
                    this.commit('SetUserName', userinfo[0].username)
                    if (this.getters.GetUsername.length) {
                        this.commit('SetValidUser', true)
                        this.commit('SetSlideQueuePath', data.slideQueuePath)
                        this.commit('SetStationName', data.stationName)
                    }
                })
        },
        printSlides(){

            axios.post(this.getters.getApiUrl + '/printslides', {
                action: 'PrintSlides',
                blockID: this.blockID,
                printRequestedBy: this.getters.GetUsername,
                slideQueuePath: this.getters.GetSlideQueuePath,
                printLocation: this.getters.GetStationName,
                curRoute : this.getters.GetCurrentRouteName

            })
                .then((response) =>{
                    console.log('slides printed')
                    console.log(response.info)
                    if (response.files){
                        this.makeToast("Files waiting to be printed:\n "+response.files, "Slide Printer Issues", "danger",10000)
                    }
                })
                .catch( (error) => {
                    console.log(error)
                });

            //Done printing, scan new block
            this.formstatus = 'loadslides'
            this.formstatuslabel = 'Load Slides'
            this.clearCurrentSlide()
            console.log("Done printing slides")
        },
        MarkSlideToBeDistributed(strSlideID, strSlideDistributionID){
            //Only mark id slide tray is loaded
            if (this.blSlideTrayLoaded) {

                axios.post(this.getters.getApiUrl + '/slidedistribution', {
                    action: 'MarkSlideToBeDistributed',
                    slidedistid: strSlideDistributionID,
                    slidetray: this.slidetrayID,
                    slideid: strSlideID,
                    curRoute : this.currentRouteName
                })
                    .then(apidata => {
                        this.loading = false;
                        this.error_message = '';

                        // console.log('MarkSlideToBeDistributed apidata:')
                        // console.log(apidata)
                        let temp = {}
                        temp = apidata.data
                        this.slides = temp[1]
                        this.fields = Object.keys(this.slides[0])
                        this.fields[3] = { key: Object.keys(this.slides[0])[3], label: 'Case Slides Not In Tray' }
                        this.obApiResult02 = temp[2]
                        this.strInTraySlideCount = this.obApiResult02[0].SlidesInTray
                        this.obApiResult03 = temp[3]
                        this.strInTrayBlockCount = this.obApiResult03[0].BlockCountInTray
                        // Update block count table
                        this.LoadTableData()

                    }).catch((e) => {
                    console.log(e)
                })
                    .catch( (error)  => {
                        console.log(`error:${error}`)
                    })
            } else {
                this.inputtext = 'Scan Slide Tray Before Slide'
            }
        },
        LoadTableData() {
            this.dispatch('LoadBlockCountTableData').then(() => {
                this.datacollection = this.getters.objChartDataCollection
                console.log(this.getters.blockCountTableItems)
            })
        },
        CreateNewSlideDistribution(){
            //Only create new slide distribution if New Slide Tray, otherwise, existing tray has already been loaded.
            switch (this.rdSlideTrayBehaviorSelected) {
                case 'EditExisting':
                    // Already have slide distribution ID, do not get new one.
                    this.blFirstSlideScanned = true
                    this.dispatch('MarkSlideToBeDistributed',{strSlideID:this.getters.GetSlideID, SlideDistributionID:this.getters.GetSlideDistributionID})
                    break

                default:
                    // Clear Slide Distrib ID
                    this.getters.GetSlideDistributionID = null
                    // Call API to create new slide distribution for slide tray.
                    axios.post(this.getters.getApiUrl + '/slidedistribution', {
                        action: 'CreateNewSlideDistribution',
                        userid: this.getters.GetUsername,
                        slidetray: this.getters.GetSlideTrayID,
                        scanlocation: this.getters.GetStationName,
                        curRoute : this.getters.GetCurrentRouteName
                    })
                        .then(apidata => {
                            this.loading = false;
                            this.error_message = '';

                            // console.log('apidata:')
                            // console.log(apidata)
                            let temp = {}
                            temp = apidata.data
                            this.SlideDistributionID = temp.insertId
                            this.blFirstSlideScanned = true
                            this.dispatch('MarkSlideToBeDistributed',{strSlideID:this.getters.GetSlideID, SlideDistributionID:this.getters.GetSlideDistributionID})

                        }).catch((e) => { console.log(e)})
                    break
            }
        },
        MarkSlidesReadyForCourier(){
            if (this.blFirstSlideScanned) {
                axios.post(this.getters.getApiUrl + '/slidedistribution', {
                    action: 'MarkSlidesReadyForCourier',
                    slidedistid: this.SlideDistributionID,
                    userid: this.getters.GetUsername,
                    slidedistrloc: this.getters.GetSlideDistributionID,
                    scanlocation: this.getters.GetStationName,
                    curRoute : this.getters.GetCurrentRouteName
                })
                    .then(() => {
                        // console.log(response)
                        this.slidetrayID = ''
                        this.blSlideTrayLoaded = false
                        this.blFirstSlideScanned = false
                        this.currentslidetray = this.nextslidetray
                        this.inputtext = 'Scan Slide Tray to Proceed'
                        this.strInputTextLabel = this.defaultstrInputTextLabel
                        this.slidedistid = null
                        this.loading = false
                        this.strInTrayBlockCount = '0'
                        this.strInTraySlideCount = '0'
                        this.slides = {}
                        //Clear Slide Distrib ID
                        this.SlideDistributionID = null

                        //Enable Radio Buttons
                        this.rdSlideTrayBehaviorOptions[1].disabled = false
                        this.rdSlideTrayBehaviorOptions[0].disabled = false

                        console.log('MarkSlidesReadyForCourier - LOADING TABLE DATA')
                        this.LoadTableData()
                    })
                    .catch((error) => {
                        console.log(error)
                        this.loading = false
                        this.inputtext = 'Error'
                    })
            } else {
                // Slide tray scanned location without any slides, need to get slide distr id and assign location
                axios.post(this.getters.getApiUrl + '/slidedistribution', {
                    action: 'AssignTrayNewLocation',
                    userid: this.getters.GetUsername,
                    slidedistrloc: this.getters.GetSlideDistributionID,
                    scanlocation: this.getters.GetStationName,
                    slidetray: this.getters.GetSlideTrayID,
                    curRoute : this.getters.GetCurrentRouteName
                })
                    .then(()=> {
                        this.slidetrayID = ''
                        this.blSlideTrayLoaded = false
                        this.currentslidetray = this.nextslidetray
                        this.inputtext = 'Scan Slide Tray to Proceed'
                        this.strInputTextLabel = this.defaultstrInputTextLabel
                        this.loading = false
                        //Clear Slide Distrib ID
                        this.SlideDistributionID = null
                        console.log('else - NOT LOADING TABLE DATA')
                        //this.LoadTableData()
                    })
                    .catch((error) => {
                        console.log(error)
                        this.loading = false
                        this.inputtext = 'Error'
                    })
            }

        },
        clearCurrentSlide(){
            console.log("hellocancelbutton")
            this.blockID =""
            this.formstatus = 'loadslides'
            this.formstatuslabel = 'Load Slides'
            this.totalBlocks = ''
            this.currentBlock = ''
            this.totalParts = ''
            this.currentPart = ''
            this.slides = {}
        },
        ScanSlideTray(strSlideTrayID){
            if (this.blSlideTrayLoaded === false) {
                this.blSlideTrayLoaded = true
                this.slidetrayID = strSlideTrayID
                this.currentslidetray = this.slidetrayID

                if (this.rdSlideTrayBehaviorSelected === 'EditExisting') {

                    // Get slidedistr id from slide tray and load slides
                    this.loading = 'true'
                    axios.post(this.getters.getApiUrl + '/slidedistribution', {
                        action: 'LoadSlideTray',
                        userid: this.getters.GetUsername,
                        slidetray: this.getters.GetSlideTrayID,
                        scanlocation: this.getters.GetStationName,
                        curRoute : this.currentRouteName
                    })
                        .then(apidata => {
                            this.loading = false;
                            this.error_message = '';

                            let temp = apidata.data


                            this.SlideDistributionID = this.getters.GetSlideDistributionID
                            //Load Slide Tray now
                            this.slides = temp[1]
                            this.fields = Object.keys(this.slides[0])
                            this.fields[3] = { key: Object.keys(this.slides[0])[3], label: 'Case Slides Not In Tray' }
                            this.fields[3] = "Case Slides Not In Tray"
                            this.obApiResult02 = temp[2]
                            this.strInTraySlideCount = this.obApiResult02[0].SlidesInTray
                            this.obApiResult03 = temp[3]
                            this.strInTrayBlockCount = this.obApiResult03[0].BlockCountInTray

                            this.rdSlideTrayBehaviorOptions[0].disabled = true
                        }).catch((e) => {
                        console.log(e)
                    })
                        .catch( (error)  => {
                            console.log(`error: ${error}`)
                        })

                } else {
                    this.rdSlideTrayBehaviorOptions[1].disabled = true
                }
                this.inputtext = 'Scan Slide to Proceed'
                this.strInputTextLabel = this.defaultstrInputTextLabel
            } else {
                this.inputtext = 'Scan Slide or Location to close Slide Tray'
            }
        },
        ScanLocation(strLocID){
            if (this.blSlideTrayLoaded) {
                this.loading = true
                this.MarkSlidesReadyForCourier(strLocID)
            } else {
                this.inputtext = 'Scan Slide Tray Before Location'
            }


        },
        ScanSlide(strSlideID) {
            this.inputtext = strSlideID

            if (this.blSlideTrayLoaded) {
                if (this.blFirstSlideScanned) {
                    this.dispatch('MarkSlideToBeDistributed',{strSlideID:this.getters.GetSlideID, SlideDistributionID:this.getters.GetSlideDistributionID})
                } else {
                    this.CreateNewSlideDistribution(strSlideID)
                }
            } else {
                this.inputtext = 'Scan Slide Tray First'
            }
        },
        getBlockData() {
            axios.post(this.getters.getApiUrl + '/GetBlockData', {
                action: 'GetBlockData',
                blockID:   this.blockID,
                curRoute : this.getters.GetCurrentRouteName
            })
                .then(apidata => {
                    this.blockData = apidata;
                    this.setBlockColor(apidata.data[0].Hopper);
                    this.setBlockData();
                }).catch((e) => {
                console.log("AXIOS ERROR: "+e)
                this.makeToast("Failed to get block: "+e, "Block Failure", "danger",10000)
            })
        },
        makeToast(state, data) {
            let bootStrapToaster = new BToast();
            bootStrapToaster.$bvToast.toast(data.title, {
                title: data.content,
                variant: data.variant || 'warning',
                solid: true,
                autoHideDelay: data.time || 99999,
                toaster: 'b-toaster-top-center',
                autohide: false
            })
        }
    }
})
