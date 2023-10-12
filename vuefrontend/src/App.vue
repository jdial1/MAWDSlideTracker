<template>
  <div id="app">
    <div class="bg-image"></div>
    <b-navbar class="navbar fixed-top">
      <b-navbar-brand class="rounded-pill" to="/" v-on:click="setRoute('Home')">
        <img src="./assets/title.png" alt="title" />
      </b-navbar-brand>
      <b-navbar-nav class="ml-auto mr-4">
        <b-nav-item v-if="ValidUser" :active="CurrentRoute == 'caseinquiry'" to="/caseinquiry"
          v-on:click="setRoute('caseinquiry')">
          <i class="fa-solid fa-search fa-lg m-2"></i>
          Search
        </b-nav-item>
        <b-nav-item v-if="ValidUser" :active="CurrentRoute == 'Engraving'" to="/settings"
          v-on:click="setRoute('Engraving')">
          <i class="fa-solid fa-bacteria"></i>
          Grossing
        </b-nav-item>
        <b-nav-item v-if="ValidUser" :active="CurrentRoute == 'Embedding'" to="/embedding"
          v-on:click="setRoute('Embedding')">
          <i class="fa-solid fa-calendar fa-lg m-2"></i>
          Embedding
        </b-nav-item>
        <b-nav-item v-if="ValidUser" :active="CurrentRoute == 'SlidePrinting'" to="/slideprinting"
          v-on:click="setRoute('SlidePrinting')">
          <i class="fa-solid fa-file fa-lg m-2"></i>
          Printing
        </b-nav-item>
        <b-nav-item v-if="ValidUser" :active="CurrentRoute == 'SlideDistribution'" to="/slidedistribution"
          v-on:click="setRoute('SlideDistribution')">
          <i class="fa-solid fa-book-open fa-lg m-2"></i>
          Distribution
        </b-nav-item>
        <b-nav-item v-if="ValidUser" :active="CurrentRoute == 'Diagnosis'" to="/Diagnosis"
          v-on:click="setRoute('Diagnosis')">
          <i class="fa-solid fa-microscope fa-lg m-2"></i>
          Diagnosis
        </b-nav-item>

      </b-navbar-nav>
      <b-nav-item-dropdown no-caret right pill>
        <template #button-content>
          <div class="badge-scan rounded-pill p-2 m-1 " :style="getInputColor(UserName)">{{ UserName }} ▽</div>
        </template>
        <b-dropdown-item to="/caseinquiry">Search</b-dropdown-item>
        <b-dropdown-item to="/settings">Settings</b-dropdown-item>
        <b-dropdown-item v-if="ValidUser" @click="logout()">Log Out</b-dropdown-item>
        <b-dropdown-item class="m-auto" disabled>{{ printName }}</b-dropdown-item>
      </b-nav-item-dropdown>
    </b-navbar>
    <br />
    <router-view></router-view>
    <div class="nav-items-container">
      <b-button disabled>
        Local<span v-if="LocalVersion">&nbsp;v {{ LocalVersion }} ({{ StationName
        }})</span>&nbsp;
        <b-icon-check2-circle v-if="LocalStatus" variant="success"></b-icon-check2-circle>
        <b-icon-x-circle v-if="!LocalStatus" variant="danger"></b-icon-x-circle>

        Backend<span v-if="BEVersion">&nbsp;v
          {{ BEVersion }}(TestMode:{{ BETestMode }})</span>&nbsp;
        <b-icon-check2-circle v-if="BEStatus" variant="success"></b-icon-check2-circle>
        <b-icon-x-circle v-if="!BEStatus" variant="danger"></b-icon-x-circle>
      </b-button>
    </div>
  </div>
</template>

<style>
@import "./assets/app_style.css";
</style>
<script>
import store from "./store.js";
import { mapGetters, mapMutations } from "vuex";

export default {
  name: "app",
  data() {
    return {
      navItems: [
        { route: 'caseinquiry', name: 'Search', icon: 'fa-solid fa-search fa-lg m-2' },
        { route: 'Engraving', name: 'Grossing', icon: 'fa-solid fa-bacteria' },
        { route: 'Embedding', name: 'Embedding', icon: 'fa-solid fa-calendar fa-lg m-2' },
        { route: 'SlidePrinting', name: 'Printing', icon: 'fa-solid fa-file fa-lg m-2' },
        { route: 'SlideDistribution', name: 'Distribution', icon: 'fa-solid fa-book-open fa-lg m-2' },
        { route: 'Diagnosis', name: 'Diagnosis', icon: 'fa-solid fa-microscope fa-lg m-2' },
      ],
      userinfo: {},
      scannedbadgeinput: "Scan Badge",
      defaultbadgeinput: "Scan Badge",
    };
  },
  mounted() {
    if (this.nodeEnv === "production") {
      store.commit("production", true);
    } else {
      store.commit("production", false);
    }
  },
  methods: {
    ...mapMutations({
      setRoute: "SetCurrentRouteName",
    }),
    logout() {
      store.commit("SetValidUser", false);
      store.commit("SetUserName", this.DefaultUserName);
      store.commit("SetPrintName", '');
      this.scannedbadgeinput = this.DefaultUserName;
      this.makeToast("Logging out user", "Logged Out", "warning");
    },
    getInputColor(text) {
      var results = { "border-radius": "15px" }
      if (
        text !== this.defaultbadgeinput &&
        !/\d/.test(text) &&
        text.length > 0
      ) {
        results["background-color"] = '#8ecae6';
        results["color"] = "white";
        return results
      }
      if (text !== this.defaultbadgeinput && /\d/.test(text) && text.length > 0) {
        results["background-color"] = '#8ecae6';
        results["color"] = "white";
        return results
      }
      if (text === this.defaultbadgeinput) {
        return { "background-color": '#8ecae6', "color": "white" };
      }
      results["background-color"] = '#8ecae6';
      results["color"] = "white";
      return results
    },
    makeToast(
      content,
      title,
      variant = null,
      time = 1500,
      locn = "b-toaster-top-left"
    ) {
      this.$bvToast.toast(content, {
        title: title,
        variant: variant,
        solid: true,
        autoHideDelay: time,
        toaster: locn,
        appendToast: true,
      });
    },
  },
  computed: {
    currentRouteName() {
      return this.$route.name;
    },
    nodeEnv() {
      return process.env.NODE_ENV;
    },
    ...mapGetters({
      StationName: "GetStationName",
      DefaultUserName: "GetDefaultUsername",
      LocalVersion: "GetLocalVersion",
      BEVersion: "GetBEVersion",
      LocalStatus: "GetLocalSocketStatus",
      FEVersion: "GetFEVersion",
      BEStatus: "GetBackendSocketStatus",
      ValidUser: "GetValidUser",
      UserName: "GetUsername",
      printName: "GetPrintName",
      CurrentRoute: "GetCurrentRouteName",
      BETestMode: "getBackendTestMode",
    }),
  },
};
</script>
