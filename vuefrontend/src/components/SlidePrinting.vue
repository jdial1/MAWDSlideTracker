<!-- ===========================================================================================

    File: SlidesV3.vue

    Authors: Drew Spencer

    Description: This is the compent for slide printing, and is referenced in App.vue

    Notes: Working towards StandardJS.
============================================================================================ -->
<template>
<div class="container"  v-if="this.$store.getters.GetValidUser">
  <div class="mx-auto">

<!--Scan Block......................-->
    <b-form v-on:submit.prevent="pullOrPrintSlides()" inline>
    <div class="customheadertext">
        <h3>Scan BlockID:  </h3>
    </div>
      <b-input id="InputBlockID" class="mb-2 mr-sm-2 mb-sm-0" v-model="blockID" :disabled=inputTextBoxDisabled placeholder="Scan Block to Proceed" />
      <b-button type="submit" variant="primary lg" :disabled=inputButtonDisabled>{{formstatuslabel}}</b-button>
      <b-button id="btnManualBlockIDToggle" :disabled=inputNoBarcodeButtonDisabled v-b-toggle.collapse-manualbockid variant="outline-secondary"> No Barcode </b-button>
       <b-button variant="secondary sm" @click="clearCurrentSlide()">Cancel</b-button>
    </b-form>
  </div>
  <div v-if="loading" class="loader">
    <b-spinner variant="primary" label="Spinning"></b-spinner>
  </div>

  <div v-else-if="error_message">
    <h3>{{ error_message }}</h3>
  </div>
  <b-collapse id="collapse-manualbockid" class="mt-2">
    <b-card>
      <p class="card-text">If you cannot scan the barcode, you can manually input the full block ID in the fields below:<br>**Double check the slides that pull up correspond to the block**</p>
      <b-row>
          <b-col>
            <label>Case Prefix:</label>
          </b-col>
          <b-col>
           <b-input id="InputCasePrefix" v-model="manualcaseprefix" />
          </b-col>
      </b-row>
            <b-row>
          <b-col>
            <label>Year:</label>
          </b-col>
          <b-col>
           <b-input id="InputCaseTwoDigitYear" v-model="manualcasetwodigityear" />
          </b-col>
      </b-row>
      <b-row>
          <b-col>
            <label>Case Number:</label>
          </b-col>
          <b-col>
           <b-input id="InputCaseNo" v-model="manualcasenumber" />
          </b-col>
      </b-row>
            <b-row>
          <b-col>
            <label> Part:</label>
          </b-col>
          <b-col>
           <b-input id="InputPart" v-model="manualpart" />
          </b-col>
      </b-row>
      <b-row>
          <b-col>
            <label> Block: </label>
          </b-col>
          <b-col>
           <b-input id="InputBlock" v-model="manualblock" />
          </b-col>
      </b-row>
      <b-row>
          <b-col>
            <label> Full Block ID:</label>
          </b-col>
          <b-col>
              <label> HBLK{{manualcaseprefix}}{{manualcasetwodigityear}}-{{manualcasenumber}}_{{manualpart}}_{{manualblock}} </label>
          </b-col>
      </b-row>
      <b-row>
          <div class="col-md-12 text-center">
            <b-button type="submit" variant="secondary lg" @click="manuallyLoadBlockID()"> Pull Slides From Manual Block ID</b-button>
          </div>
      </b-row>
    </b-card>
  </b-collapse>
  <br>
  <div class="customsubheadertext">
    <h5>Part {{ this.currentPart }} of {{ this.totalParts }}</h5>
    <h5>Block {{ this.currentBlock }} of {{ this.totalBlocks }}</h5>
    <h5>Slides on this block: {{ slides.length }}</h5>
  </div>

<div class="container">
 <div class="row row-flex">
  <!--<div class="col-sm-2 mt-2" v-for="result in slides">-->
        <div class="col-md-2 col-sm-6" v-for="result in slides" v-if="slides.length>0">
           <div class="glassslide">
             <label>
             <div class=slidelabel>
                    <div class=slideheader>
                        {{ result.AccessionID }}-{{ result.PartDesignator }}{{ result.BlockDesignator }}<br>
                        {{ result.Patient.substring(0,9) }}
                        </div>
                      <div class=slidebody>
                      {{ result.StainLabel }}
                        <br>
                      Level {{ result.SlideInst}} of {{ result.slidecount}}
                        <br>
                      {{ dateFormatter(result.StainOrderDate)}}
                        <br>
                      {{ result.OrderPathInitials}}
                        <br>
                      </div>

                      <div class=slidefooter>
                      {{ result.SiteLabel}}

                      </div>
            </div> <!-- /Slidelabel -->
              <p>
            {{ result.SlideDistributionKeyword}}
              <br>
                <br><br>
<<<<<<< Updated upstream
                Print Slide <input type="checkbox" v-model=result.ToBePrinted @change="updateSlideToPrintValue(result.SlideID, result.ToBePrinted)" >
=======
                <b-checkbox v-model=result.ToBePrinted @change="updateSlideToPrintValue(result.SlideID, result.ToBePrinted)" >Print Slide </b-checkbox>
>>>>>>> Stashed changes
                  <br><br>
                  Status:
                  <br>
                {{ result.Status}}
                <br>
<<<<<<< Updated upstream
                <b-button :value="result.SlideID" variant="warning" @click="addSlide($event,result.SlideID)" v-if="result.SlideInst===result.slidecount">Add Slide</b-button>
=======
                <b-button :value="result.SlideID" block   variant="warning" @click="addSlide($event,result.SlideID)" v-if="result.SlideInst===result.slidecount">Add Slide</b-button>
>>>>>>> Stashed changes
              </p>
            </label>

            </div> <!-- /GlassSlide -->
          </div>
    </div>
  </div>
</div>
<!-- /container -->
</template>


<!--components/Slides.vue -->
<script>
import axios from 'axios'
import store from '../store.js'

export default {
  name: 'slides', // component name
  props: {

    lastname: String,
    userid: String,

    },
    data() {
    return {
      blockID: '',
      error_message: '',
      loading: false, // to track when app is retrieving data
      slides: {},
      formstatus: 'loadslides',
      formstatuslabel: 'Load Slides',
      info: null,
      totalBlocks: null,
      currentBlock: null,
      totalParts: null,
      currentPart: null,
      manualblockid: null,
      manualcaseprefix: null,
      manualcasetwodigityear: '19',
      manualcasenumber: null,
      manualaccid: null,
      manualpart: null,
      manualblock: null
    }
  },


  sockets: {
      stream: function(data) {
          console.log('socket on within slide')
          console.log('within slide:',data)
          //validate scan data
          this.validateScanData(data)
      }
  },
  methods: {
    addSlide(e,slideID){
      console.log("TESTING: "+slideID)
      console.log(e.target.value)
      let obj = this.slides.find(o => o.SlideID === e.target.value)
      console.log(obj)
      console.log(JSON.stringify(obj))
      console.log(this.slides)
      
      axios.post(store.getters.getApiUrl + '/addSlide', {
        action: 'AddSlide'
      })
          .then(function (response) {
            console.log('addSlide')
            console.log(response)
          })
          .catch(function (error) {
            console.log(error)
          });

    },

    validateScanData(data){
      if (store.state.validuser) {
        console.log('Slide Queue Path: ', data.slideQueuePath)
        store.commit('SetSlideQueuePath', data.slideQueuePath)
        console.log('slide station name:', data.stationName)
        store.commit('SetStationName', data.stationName)
        //Depending on prefix, send to correct placeholder
        console.log('slide: barcodescan', data.barcodeScanData)
        console.log('slide: prefix', data.barcodeScanData.substring(0,4))

        switch(data.barcodeScanData.substring(0,4)) {
          case 'HBLK':
            //BlockScan Detected Pull Slides
            this.blockID = data.barcodeScanData
            //this.pullSlidesViaPost();
            this.pullSlides();
            break
          case 'SBDG':
            break
          case 'HSLD':
          this.blockID = 'Scan block not slide'
            break
          default:
            // code block
        }
      } else {
        this.blockID = ''
      }

    },
    addSlide(e,slideID){
      console.log("TESTING: "+slideID)
      let obj = this.slides.find(o => o.SlideID === e.target.value)
      let newSlideVals = {}
      for(var k in obj) newSlideVals[k]=obj[k];

      newSlideVals["ToBePrinted"]=0
      newSlideVals["SlideInst"]=obj['SlideInst']+1
      newSlideVals["SlideID"]=obj['SlideID'].match(/(.*)\.(.*)/)[1]+'.'+(parseInt(obj['SlideID'].match(/(.*)\.(.*)/)[2])+1)
      newSlideVals["OldSlideID"]=obj['SlideID']

      this.slides.splice(this.slides.indexOf(obj)+1, 0, newSlideVals);
      let updtList = this.slides.filter(o => o.SlideID.match(/(.*)\.(.*)/)[1] === obj['SlideID'].match(/(.*)\.(.*)/)[1])
      for (var item in updtList){
        updtList[item]['slidecount']++
      }
      axios.post(store.getters.getApiUrl + '/addSlide', {
        action: 'AddSlide',
        slideVals:newSlideVals,
        curRoute : this.currentRouteName
      })
          .then(function (response) {
            console.log('addSlide')
            console.log(response)
          })
          .catch(function (error) {
            console.log(error)
          });
    },
    pullOrPrintSlides() {

      if (this.formstatus == 'loadslides') {
        this.pullSlides();
      }
    else if (this.formstatus == 'readytoprint') {
      console.log('goto print slides');
      this.printSlides();
    }{

    }

  },
<<<<<<< Updated upstream

  printSlides()
  {
    console.log('start print slides')
    console.log(store.state.slideQueuePath)
=======
    printSlides() {
>>>>>>> Stashed changes

      axios.post(store.getters.getApiUrl + '/printslides', {
      action: 'PrintSlides',
      blockID: this.blockID,
      printRequestedBy: store.state.username,
      slideQueuePath: store.state.slideQueuePath,
      printLocation: store.state.stationName

      })
      .then(function (response) {
        console.log('slides printed')
      console.log(response)
      })
      .catch(function (error) {
      console.log(error)
      });

    //Done printing, scan new block
    this.formstatus = 'loadslides'
    this.formstatuslabel = 'Load Slides'
    this.clearCurrentSlide()
    console.log("Done printing slides")
  },

    pullSlides() {
      console.log('start pull slides');
      this.loading = true
      axios.post(store.getters.getApiUrl + '/pullSlides', {
        action: 'pullSlides',
        blockID: this.blockID,
        curRoute : this.currentRouteName
      })
        .then(response => {
          this.loading = false
<<<<<<< Updated upstream
          this.error_message = ''
          if (data.errorcode) {
            this.error_message = `Sorry, block with blockID '${blockID}' not found.`
            console.log('error')
            return
          }

          this.slides = data;
=======
          this.slides = response.data;
>>>>>>> Stashed changes
          this.formstatus = 'readytoprint';
          document.getElementById("InputBlockID").disabled = true;
          this.formstatuslabel = 'Print Slides';
          console.log("Made it to this.slide=data");
          console.log(data);
        }).catch((e) => {
          console.log(e)
        })
        //this.GetPartBlockCurrentAndTotals()
    },
    updateSlideToPrintValue(strSlideID, blChecked) {
            //Send api the following:  action: UpdateSlideToPrint slideid=? value=?
      axios.post(store.getters.getApiUrl + '/updateslidetoprint', {
        action: 'UpdateSlideToPrintValue',
        slideId: strSlideID,
        toPrintStatus: blChecked
      })
      .then(function (response) {
        console.log(response);
      })
      .catch(function (error) {
        console.log(error);
      });

    },
    GetPartBlockCurrentAndTotals() {
        console.log('start GetPartBlockCurrentAndTotals')
<<<<<<< Updated upstream
              axios.post(store.getters.getApiUrl + '/getpartblockcurrentandtotals', {
              blockID: this.blockID
=======
              axios.post(store.getters.getApiUrl + '/getPartBlockCurrentAndTotals', {
              blockID: this.blockID,
              curRoute : this.currentRouteName
>>>>>>> Stashed changes
            })
            .then(apidata => {
              this.loading = false;
              this.error_message = '';
              console.log('apidata:', apidata);
              let temp = {}
              temp = apidata.data
              console.log(temp)
              this.totalBlocks = temp.totalblocks
              this.currentBlock = temp.currentblock
              this.totalParts = temp.totalparts
              this.currentPart = temp.currentpart
            })
            .catch(function (error) {
              console.log("error:")
              console.log(error)
            })
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
      this.setFocusToInputBlockID()
    },
    setFocusToInputBlockID(){
      document.getElementById("InputBlockID").focus();
    },
    manuallyLoadBlockID(){
      this.blockID = "HBLK" + this.manualcaseprefix + this.manualcasetwodigityear + '-' + this.manualcasenumber + '_' + this.manualpart + '_' + this.manualblock
      this.pullSlides()
      //Collapse additional options
      document.getElementById("btnManualBlockIDToggle").click()
    },
    dateFormatter(str){
      return str.replace('T', ' ').replace('Z', ' ').split('.')[0].slice(0,-3)
    },
  },
  computed:{
    inputButtonDisabled(){
      //if (this.validuser=='f' || !blockID ) {
      if (store.state.validuser && this.blockID) {
        return false;
      } else {
        return true;
      }
    },
    inputTextBoxDisabled(){
      return true
    },
    inputNoBarcodeButtonDisabled(){
      //if (this.validuser=='f' || !blockID ) {
      if (store.state.validuser && !this.blockID) {
        return false
      } else {
        return true
      }
    }
  }
}
</script>

<style scoped>
#slides {
  margin: 30px 0;
}

.loader {
  text-align: center;
}
</style>
