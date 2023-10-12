<template>
  <div class="outer-container">
    <transition name="progress">
      <div class="container" v-show="!loading">
        <b-progress :max="max" height="8rem" class="progress">
          <b-progress-bar :key="'PreEmbedded'" :value="PreEmbedded" :max="PreEmbeddedMax" class="progress-bar">
            <span>PreEmbedded <div class="h3">{{ PreEmbedded }}</div></span>
          </b-progress-bar>
          <b-progress-bar :key="'Embedded'" :value="Embedded" :max="EmbeddedMax" class="progress-bar">
            <span>Embedded <div class="h3">{{ Embedded }}</div></span>
          </b-progress-bar>
          <b-progress-bar :key="'Stained'" :value="Stained" :max="StainedMax" class="progress-bar">
            <span>Stained <div class="h3">{{ Stained }}</div></span>
          </b-progress-bar>
          <b-progress-bar :key="'slidesCut'" :value="slidesCut" :max="slidesCutMax" class="progress-bar">
            <span>Slides Cut <div class="h3">{{ slidesCut }}</div></span>
          </b-progress-bar>
          <b-progress-bar :key="'Distributed'" :value="Distributed" :max="DistributedMax" class="progress-bar">
            <span>Distributed <div class="h3">{{ Distributed }}</div></span>
          </b-progress-bar>
        </b-progress>
      </div>
    </transition>
    <b-icon v-show="loading" icon="arrow-clockwise" animation="spin" font-scale="2"></b-icon>
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
            this.slidesCut = data.count * 3;
            break;
          case "distributed":
            this.Distributed = data.count * 3;
            break;
          case "Stained":
            this.Stained = data.count * 3;
            break;
        }
      }
    },
    barValue(value) {
      const threshold = this.max / 18;
      const newValue = value + threshold;
      return newValue > 150 ? newValue : 150;
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


<style>
.progress-enter-active {
  transition: width 1s linear;
}

.progress-leave-active {
  transition: width 1s ease-out;
}

.progress-enter,
.progress-leave-to {
  width: 0;
}

.progress-bar {
  min-width: 150px;
}
</style>