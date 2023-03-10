<template>
  <div class="outer-container">
    <div class="container">
      <b-progress :max="max" height="8rem" v-show="!loading">
        <b-progress-bar :value="barValue(PreEmbedded)">
          <span>PreEmbedded <h3>{{ PreEmbedded }}</h3></span>
        </b-progress-bar>
        <b-progress-bar :value="barValue(Embedded)">
          <span>Embedded <h3>{{ Embedded }}</h3></span>
        </b-progress-bar>
        <b-progress-bar :value="barValue(Stained)">
          <span>Stained <h3>{{ Stained }}</h3></span>
        </b-progress-bar>
        <b-progress-bar :value="barValue(slidesCut)">
          <span>Slides Cut <h3>{{ slidesCut }}</h3></span>
        </b-progress-bar>
        <b-progress-bar :value="barValue(Distributed)">
          <span>Distributed <h3>{{ Distributed }}</h3></span>
        </b-progress-bar>
      </b-progress>
      <b-icon v-show="loading" icon="arrow-clockwise" animation="spin" font-scale="2"></b-icon>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import store from "../store.js";

export default {
  name: "home", // component name
  data() {
    return {
      blockStatusData: null,
      PreEmbedded: 0,
      Embedded: 0,
      slidesCut: 0,
      Distributed: 0,
      Stained: 0,
      Staining: 0,
      max: 0,
      loading: true,
    };
  },
  mounted() {
    this.loadData();
  },
  methods: {
    async loadData() {
      this.loading = true;
      try {
        const response = await axios.post(store.getters.getApiUrl + "/GetStatusData", {
          action: "GetStatusData",
          curRoute: this.currentRouteName,
        });
        this.blockStatusData = response.data;
        this.parseBlockStatusData();
        this.max =
          this.PreEmbedded +
          this.Embedded +
          this.Stained +
          this.Staining +
          this.slidesCut +
          this.Distributed;
      } catch (error) {
        console.error(error);
        this.makeToast("Error loading data", "Error", "danger");
      } finally {
        this.loading = false;
      }
    },
    parseBlockStatusData() {
      for (const data of this.blockStatusData) {
        switch (data.Action) {
          case "PreEmbedded":
            this.PreEmbedded = data.count;
            break;
          case "Embedded":
            this.Embedded = data.count;
            break;
          case "SlidesPrintedOffBlock":
            this.slidesCut = data.count;
            break;
          case "distributed":
            this.Distributed = data.count;
            break;
          case "Stained":
            this.Stained = data.count;
            break;
        }
      }
    },
    barValue(value) {
      const threshold = this.max / 7;
      const newValue = value * 0.5 + threshold;
      return newValue > 200 ? newValue : 200;
    },
    makeToast(content, title, variant = null, time = 1500, locn = "b-toaster-top-left") {
      this.$bvToast.toast(content, {
        title,
        variant,
        solid: true,
        autoHideDelay: time,
        toaster: locn,
        appendToast: true,
      });
    },
  },
  computed: {
    currentRouteName() {
      return store.getters.GetCurrentRouteName;
    },
  },
};
</script>