<!-- ===========================================================================================



    Authors: Drew Spencer

    Description: This is the compent for slide printing, and is referenced in App.vue

    Notes: Working towards StandardJS.
============================================================================================ -->
<template>
  <div class="container" v-if="this.$store.getters.GetValidUser">
    <!--  <h1>Slide Printing</h1>-->
    <div class="mx-auto">
      <!--Scan Block......................-->
      <b-button-toolbar v-on:submit.prevent="pullOrPrintSlides()">
        <b-button class="ml-5">
          <h3>Scan BlockID:</h3>
        </b-button>
        <b-input-group
          size="sm"
          class="align-content-center"
          v-model="blockID"
          :disabled="inputTextBoxDisabled"
          placeholder="Scan Block to Proceed"
        >
          <b-form-input
            id="InputBlockID"
            ref="InputBlockField"
            v-model="blockID"
          ></b-form-input>
        </b-input-group>
        <b-button
          type="submit"
          variant="primary lg"
          :disabled="inputButtonDisabled"
          >{{ formstatuslabel }}</b-button
        >
        <b-button
          id="btnManualBlockIDToggle"
          :disabled="inputNoBarcodeButtonDisabled"
          v-b-toggle.collapse-manualbockid
          variant="outline-secondary"
        >
          No Barcode
        </b-button>
        <b-button variant="secondary sm" @click="clearCurrentSlide()"
          >Cancel</b-button
        >
      </b-button-toolbar>
    </div>
    <div v-if="loading" class="loader">
      <b-spinner variant="primary" label="Spinning"></b-spinner>
    </div>

    <div v-else-if="error_message">
      <h3>{{ error_message }}</h3>
    </div>
    <b-collapse id="collapse-manualbockid" class="mt-2">
      <b-card>
        <p class="card-text">
          If you cannot scan the barcode, you can manually input the full block
          ID in the fields below:<br />**Double check the slides that pull up
          correspond to the block**
        </p>
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
            <b-input
              id="InputCaseTwoDigitYear"
              v-model="manualcasetwodigityear"
            />
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
            <label>
              HBLK{{ manualcaseprefix }}{{ manualcasetwodigityear }}-{{
                manualcasenumber
              }}_{{ manualpart }}_{{ manualblock }}
            </label>
          </b-col>
        </b-row>
        <b-row>
          <div class="col-md-12 text-center">
            <b-button
              type="submit"
              variant="secondary lg"
              @click="manuallyLoadBlockID()"
            >
              Pull Slides From Manual Block ID</b-button
            >
          </div>
        </b-row>
      </b-card>
    </b-collapse>
    <br />
    <div v-if="SlideData().length" class="customsubheadertext">
      <h5>Part {{ this.currentPart }} of {{ this.totalParts }}</h5>
      <h5>Block {{ this.currentBlock }} of {{ this.totalBlocks }}</h5>
      <h5>Slides on this block: {{ SlideData().length }}</h5>
    </div>

    <div v-if="SlideData().length" class="container">
      <div class="row row-flex">
        <!--<div class="col-sm-2 mt-2" v-for="result in slides">-->
        <div class="col-md-2 col-sm-6" v-for="result in SlideData()">
          <div class="glassslide">
            <label>
              <div class="slidelabel">
                <div class="slideheader">
                  {{ result.AccessionID }}-{{ result.PartDesignator
                  }}{{ result.BlockDesignator }}<br />
                  {{ result.Patient.substring(0, 9) }}
                </div>
                <div class="slidebody">
                  {{ result.StainLabel }}<br />
                  Level {{ result.SlideInst }} of {{ result.slidecount }}<br />
                  {{ result.StainOrderDate }}<br />
                  {{ result.OrderPathInitials }}<br />
                </div>

                <div class="slidefooter">
                  {{ result.SiteLabel }}
                </div>
              </div>
              <!-- /Slidelabel -->
              <p>
                {{ result.SlideDistributionKeyword }}
                <br />

                <br /><br />
                Print Slide
                <input
                  type="checkbox"
                  v-model="result.ToBePrinted"
                  @change="
                    updateSlideToPrintValue(result.SlideID, result.ToBePrinted)
                  "
                />
                <br /><br />
                Status:
                <br />
                {{ result.Status }}
              </p>
            </label>
          </div>
          <!-- /GlassSlide -->
        </div>
      </div>
    </div>
  </div>
  <!-- /container -->
</template>

<!--components/Slides.vue -->
<script>
import axios from "axios";
import store from "../store.js";

// define the external API URL
const API_URLWithSlideParameters =
  store.getters.getApiUrl + "/slidetracker/slideparameters?blockid=";
const buildUrl = (blockID) =>  `${API_URLWithSlideParameters}${blockID}`
export default {
  name: "slides", // component name
  props: {
    lastname: String,
    userid: String,
  },
  data() {
    return {
      blockID: "",
      error_message: "",
      loading: false, // to track when app is retrieving data
      formstatus: "loadslides",
      formstatuslabel: "Load Slides",
      info: null,
      totalBlocks: null,
      currentBlock: null,
      totalParts: null,
      currentPart: null,
      manualblockid: null,
      manualcaseprefix: null,
      manualcasetwodigityear: "19",
      manualcasenumber: null,
      manualaccid: null,
      manualpart: null,
      manualblock: null,
    };
  },

  computed: {
    inputButtonDisabled() {
      return !(store.state.validuser && this.blockID);
    },
    inputTextBoxDisabled() {
      return true;
    },
    inputNoBarcodeButtonDisabled() {
      return !(store.state.validuser && !this.blockID);
    },
    currentRouteName() {
      return store.getters.GetCurrentRouteName;
    },
    SlideData() { 
    let slides = this.$store.getters.slidesData;
      if (slides){
        if ('data' in slides){
          console.log('setting slides data')
          console.log(slides)
          return slides.data
      }
    }
    return null
  }

  },
};
</script>

<style scoped>
#slides {
  margin: 30px 0;
}

.loader {
  text-align: center;
}
</style>
