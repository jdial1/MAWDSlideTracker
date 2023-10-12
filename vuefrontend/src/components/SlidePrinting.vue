<template>
  <div class="container wrapper" v-if="$store.getters.GetValidUser">
    <div class="mx-auto">
      <b-button-toolbar class="my-2 p-1 ml-auto">
        <b-button class="ml-auto" :disabled="inputButtonDisabled">{{ formStatusLabel }}</b-button>
        <b-button @click="clearCurrentSlide">Cancel</b-button>
      </b-button-toolbar>
    </div>
    <div v-if="loading" class="text-center">
      <b-icon icon="arrow-clockwise" animation="spin" font-scale="3"></b-icon>
    </div>
    <div v-if="errorMessage">
      <h3>{{ errorMessage }}</h3>
    </div>
    <b-container v-if="slidesData.length" class="customsubheadertext">
      <h5>Part {{ currentPart }} of {{ totalParts }}</h5>
      <h5>Block {{ currentBlock }} of {{ totalBlocks }}</h5>
      <h5>Slides on this block: {{ slidesData.length }}</h5>
    </b-container>
    <div v-if="slidesData.length" class="container">
      <b-row>
        <b-col md="2" sm="6" v-for="result in slidesData" :key="result.id">
          <b-card class="glassslide">
            <label>
              <div class="slidelabel">
                <div class="slideheader">
                  {{ result.AccessionID }}-{{ result.PartDesignator }}{{ result.BlockDesignator }}
                  <br />
                  {{ result.Patient.substring(0, 9) }}
                </div>
                <div class="slidebody">
                  {{ result.StainLabel }}<br />
                  Level {{ result.SlideInst }} of {{ result.slidecount }}
                  <br />
                  {{ result.StainOrderDate }}<br />
                  {{ result.OrderPathInitials }}<br />
                </div>
                <div class="slidefooter">
                  {{ result.SiteLabel }}
                </div>
              </div>
              <div class="slideimage">
                <b-img :src="result.image" fluid alt="Slide Image" />
              </div>
            </label>
          </b-card>
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
import { BButton, BButtonToolbar, BInputGroup, BFormInput, BCollapse, BCard, BRow, BCol, BInput, BSpinner } from 'bootstrap-vue';

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
    BCollapse,
    BCard,
    BRow,
    BCol,
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
    ...mapState(['validUser', 'loading', 'errorMessage', 'formStatusLabel', 'inputButtonDisabled', 'inputBarcodeDisabled', 'inputTextBoxDisabled', 'slidesData', 'currentPart', 'totalParts', 'currentBlock', 'totalBlocks', 'blockID']),

    inputButtonDisabled() {
      return !(store.state.validuser && this.blockID);
    },
    inputTextBoxDisabled() {
      return true;
    },
    inputBarcodeDisabled() {
      return !(store.state.validuser && !this.blockID);
    },
    currentRouteName() {
      return store.getters.GetCurrentRouteName;
    },
    // slidesData() {
    //   let slides = this.$store.getters.slidesData;
    //   if (slides) {
    //     if ('data' in slides) {
    //       console.log('setting slides data')
    //       console.log(slides)
    //       return slides.data
    //     }
    //   }
    //   return null
    // }

  },
  methods: {
    ...mapActions(['pullOrPrintSlides', 'manuallyLoadBlockID', 'clearCurrentSlide']),
  }
};
</script>