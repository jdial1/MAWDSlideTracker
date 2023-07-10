<template>
  <div class="container" v-if="$store.getters.GetValidUser">
    <div class="mx-auto">
      <b-form @submit.prevent="pullOrPrintSlides">
        <b-button-toolbar>
          <b-button class="ml-5">
            <h3>Scan BlockID:</h3>
          </b-button>
          <b-input-group size="sm" class="align-content-center" :disabled="inputTextBoxDisabled">
            <b-form-input id="InputBlockID" ref="InputBlockField" v-model="blockID"></b-form-input>
          </b-input-group>
          <b-button type="submit" variant="primary" size="lg" :disabled="inputButtonDisabled">{{ formStatusLabel
          }}</b-button>
          <b-button id="btnManualBlockIDToggle" :disabled="inputNoBarcodeButtonDisabled" v-b-toggle.collapse-manualbockid
            variant="outline-secondary">No Barcode</b-button>
          <b-button variant="secondary" size="sm" @click="clearCurrentSlide">Cancel</b-button>
        </b-button-toolbar>
      </b-form>
    </div>
    <div v-if="loading" class="loader">
      <b-spinner variant="primary" label="Spinning"></b-spinner>
    </div>
    <div v-else-if="errorMessage">
      <h3>{{ errorMessage }}</h3>
    </div>
    <b-collapse id="collapse-manualbockid" class="mt-2">
      <b-card>
        <p class="card-text">
          If you cannot scan the barcode, you can manually input the full block ID in the fields below:<br />
          **Double check the slides that pull up correspond to the block**
        </p>
        <b-row v-for="input in manualInputs" :key="input.id">
          <b-col>
            <label>{{ input.label }}:</label>
          </b-col>
          <b-col>
            <b-input :id="input.id" v-model="input.model"></b-input>
          </b-col>
        </b-row>
        <b-row>
          <div class="col-md-12 text-center">
            <b-button type="submit" variant="secondary" size="lg" @click="manuallyLoadBlockID()">
              Pull Slides From Manual Block ID
            </b-button>
          </div>
        </b-row>
      </b-card>
    </b-collapse>
    <br />
    <div v-if="slideData.length" class="customsubheadertext">
      <h5>Part {{ currentPart }} of {{ totalParts }}</h5>
      <h5>Block {{ currentBlock }} of {{ totalBlocks }}</h5>
      <h5>Slides on this block: {{ slideData.length }}</h5>
    </div>

    <div v-if="slideData.length" class="container">
      <b-row>
        <b-col md="2" sm="6" v-for="result in slideData" :key="result.id">
          <div class="glassslide">
            <label>
              <div class="slidelabel">
                <div class="slideheader">
                  {{ result.AccessionID }}-{{ result.PartDesignator }}{{ result.BlockDesignator }}<br />
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
              <div class="slideimage">
                <img :src="result.image" />
              </div>
            </label>
          </div>
        </b-col>
      </b-row>
    </div>
  </div>
</template>

<!--components/Slides.vue -->
<script>
import axios from "axios";
import store from "../store.js";
import { mapState, mapActions } from 'vuex';
import { BButton, BButtonToolbar, BInputGroup, BFormInput, BButtonGroup, BCollapse, BCard, BRow, BCol, BInput, BSpinner } from 'bootstrap-vue';

// define the external API URL
const API_URLWithSlideParameters =
  store.getters.getApiUrl + "/slidetracker/slideparameters?blockid=";
const buildUrl = (blockID) => `${API_URLWithSlideParameters}${blockID}`
export default {
  name: "slides", // component name
  props: {
    lastname: String,
    userid: String,
  },
  components: {
    BButton,
    BButtonToolbar,
    BInputGroup,
    BFormInput,
    BButtonGroup,
    BCollapse,
    BCard,
    BRow,
    BCol,
    BInput,
    BSpinner,
  },
  data() {
    return {
      manualInputs: [
        { id: 'InputCasePrefix', label: 'Case Prefix', model: '' },
        { id: 'InputCaseTwoDigitYear', label: 'Year', model: '' },
        { id: 'InputCaseNo', label: 'Case Number', model: '' },
        { id: 'InputPart', label: 'Part', model: '' },
        { id: 'InputBlock', label: 'Block', model: '' },
      ],
    };
  },

  computed: {
    ...mapState(['validUser', 'loading', 'errorMessage', 'formStatusLabel', 'inputButtonDisabled', 'inputNoBarcodeButtonDisabled', 'inputTextBoxDisabled', 'slideData', 'currentPart', 'totalParts', 'currentBlock', 'totalBlocks', 'blockID']),

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
      if (slides) {
        if ('data' in slides) {
          console.log('setting slides data')
          console.log(slides)
          return slides.data
        }
      }
      return null
    }

  },
  methods: {
    ...mapActions(['pullOrPrintSlides', 'manuallyLoadBlockID', 'clearCurrentSlide']),
  }
};
</script>

