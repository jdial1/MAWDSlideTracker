<template>
  <div id="app">
    <div class="bg-image"></div>
    <b-navbar class="navbar fixed-top">
      <b-navbar-brand class="rounded-pill" to="/" v-on:click="setRoute('Home')">
        <img src="./assets/title.png" alt="title"/>
      </b-navbar-brand>
      <b-navbar-nav class="ml-auto">
        <b-nav-item
            v-if="ValidUser"
            :active="CurrentRoute == 'caseinquiry'"
            to="/caseinquiry"
            v-on:click="setRoute('caseinquiry')"
        >
          <b-iconstack
              font-scale="1"
              style="
              display: flex;
              align-items: center;
              justify-content: center;
              margin: auto;
            "
          >
            <b-icon icon="search" stacked></b-icon>
          </b-iconstack>
          Search
        </b-nav-item>
        <b-nav-item
            v-if="ValidUser"
            :active="CurrentRoute == 'Engraving'"
            to="/settings"
            v-on:click="setRoute('Engraving')"
        >
          <b-iconstack
              style="
              display: flex;
              align-items: center;
              justify-content: center;
              margin: auto;
            "
          >
            <b-icon flip-v icon="circle" scale="1" stacked></b-icon>
            <b-icon
                icon="circle-fill"
                scale=".1"
                shift-h="0"
                shift-v="3"
                stacked
            ></b-icon>
            <b-icon
                icon="circle-fill"
                scale=".14"
                shift-h="-1"
                shift-v="-1"
                stacked
            ></b-icon>
            <b-icon
                icon="circle-fill"
                scale=".16"
                shift-h="3"
                shift-v="3"
                stacked
            ></b-icon>
            <b-icon
                icon="circle-fill"
                scale=".1"
                shift-h="2"
                shift-v="-4"
                stacked
            ></b-icon>
          </b-iconstack>
          Grossing
        </b-nav-item>
        <b-nav-item
            v-if="ValidUser"
            :active="CurrentRoute == 'Embedding'"
            to="/embedding"
            v-on:click="setRoute('Embedding')"
        >
          <b-iconstack
              style="
              display: flex;
              align-items: center;
              justify-content: center;
              margin: auto;
            "
          >
            <b-icon flip-v icon="calendar" scale="1" stacked></b-icon>
            <b-icon
                icon="grid3x3"
                scale=".45"
                shift-h="-3.3"
                shift-v="3.3"
                stacked
            ></b-icon>
            <b-icon
                icon="grid3x3"
                scale=".45"
                shift-h="-3.3"
                shift-v="-3.3"
                stacked
            ></b-icon>
            <b-icon
                icon="grid3x3"
                scale=".45"
                shift-h="3.3"
                shift-v="3.3"
                stacked
            ></b-icon>
            <b-icon
                icon="grid3x3"
                scale=".45"
                shift-h="3.3"
                shift-v="-3.3"
                stacked
            ></b-icon>
          </b-iconstack>
          Embedding
        </b-nav-item>
        <b-nav-item
            v-if="ValidUser"
            :active="CurrentRoute == 'SlidePrinting'"
            to="/slideprinting"
            v-on:click="setRoute('SlidePrinting')"
        >
          <b-iconstack
              font-scale="1"
              style="
              display: flex;
              align-items: center;
              justify-content: center;
              margin: auto;
            "
          >
            <b-icon flip-v icon="file" shift-v="-2" scale="1" stacked></b-icon>
            <b-icon
                icon="justify"
                scale=".8"
                shift-v="2"
                stacked
            ></b-icon>
          </b-iconstack>
          Printing
        </b-nav-item>
        <b-nav-item
            v-if="ValidUser"
            :active="CurrentRoute == 'SlideDistribution'"
            to="/slidedistribution"
            v-on:click="setRoute('SlideDistribution')"
        >
          <b-iconstack
              style="
              display: flex;
              align-items: center;
              justify-content: center;
              margin: auto;
            "
          >
            <b-icon icon="book" scale="1" stacked></b-icon>
            <b-icon
                icon="bookshelf"
                scale=".45"
                shift-h="-3.3"
                shift-v="3.3"
                stacked
            ></b-icon>
            <b-icon
                icon="bookshelf"
                scale=".45"
                shift-h="-3.3"
                shift-v="-3"
                stacked
            ></b-icon>
            <b-icon
                icon="bookshelf"
                scale=".45"
                shift-h="3.3"
                shift-v="3.3"
                stacked
            ></b-icon>
            <b-icon
                icon="bookshelf"
                scale=".45"
                shift-h="3.3"
                shift-v="-3"
                stacked
            ></b-icon>
          </b-iconstack>
          Distribution
        </b-nav-item>
        <b-nav-item
            v-if="ValidUser"
            :active="CurrentRoute == 'Diagnosis'"
            to="/Diagnosis"
            v-on:click="setRoute('Diagnosis')"
        >
          <b-iconstack
              style="
              display: flex;
              align-items: center;
              justify-content: center;
              margin: auto;
            "
          >
            <b-icon icon="journal-text" scale="1" stacked></b-icon>
          </b-iconstack>
          Diagnosis
        </b-nav-item>
      </b-navbar-nav>
      <b-nav-item-dropdown
          no-caret
          right
          style="
          max-width: 10rem;
          margin-left: auto;
          margin-right: 2rem;
          box-shadow: 0 0 4px 0 rgba(0, 0, 0, 0.5);
        "
      >
        <template #button-content class="badge-scan rounded-pill">
          <div :style="getInputColor(UserName)">{{ UserName}}</div>
        </template>
        <b-dropdown-item to="/caseinquiry">Search</b-dropdown-item>
        <b-dropdown-item to="/settings">Settings</b-dropdown-item>
        <b-dropdown-item v-if="ValidUser" @click="logout()"
        >Log Out
        </b-dropdown-item>
        <b-dropdown-item class="m-auto" disabled>{{printName}} </b-dropdown-item>
        <b-dropdown-item disabled>
          Frontend<span
            v-if="FEVersion"
            style="
              color: #007bff;
              text-shadow: none !important;
              font-size: smaller;
            "
        >&nbsp;v {{ FEVersion }} ({{ this.nodeEnv }})</span
        >
        </b-dropdown-item>
        <b-dropdown-item disabled style="color: #007bff">
          Local
          <span
              v-if="LocalVersion"
              style="
              color: #007bff;
              text-shadow: none !important;
              font-size: smaller;
            "
          >&nbsp;v {{ LocalVersion }} ({{ StationName }})</span
          >&nbsp;
          <b-icon-check2-circle
              v-if="LocalStatus"
              variant="success"
          ></b-icon-check2-circle
          >
          <b-icon-x-circle
              v-if="!LocalStatus"
              variant="danger"
          ></b-icon-x-circle>
        </b-dropdown-item>
        <b-dropdown-item disabled style="color: #007bff">
          Backend<span
            v-if="BEVersion"
            style="
              color: #007bff;
              text-shadow: none !important;
              font-size: smaller;
            "
        >&nbsp;v {{ BEVersion }}(TestMode:{{ BETestMode }})
        </span>
        &nbsp;
          <b-icon-check2-circle v-if="BEStatus" variant="success"></b-icon-check2-circle>
          <b-icon-x-circle v-if="!BEStatus" variant="danger"></b-icon-x-circle>
        </b-dropdown-item>
      </b-nav-item-dropdown>
    </b-navbar>
    <br/>
    <router-view></router-view>
  </div>
</template>

<style>
@import "./assets/app_style.css";
</style>
<script>
import store from "./store.js";
import {mapGetters, mapMutations} from "vuex";

export default {
  name: "app",
  data() {
    return {
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
      var results = {"border-radius":"15px"}
      if (
          text !== this.defaultbadgeinput &&
          !/\d/.test(text) &&
          text.length > 0
      ){
        results["background-color"]='#8ecae6';
        results["color"]="white";
        return results
          }
      if (text !== this.defaultbadgeinput && /\d/.test(text) && text.length > 0)
        {
        results["background-color"]='#8ecae6';
        results["color"]="white";
        return results
        }
      if (text === this.defaultbadgeinput){
        return {"background-color": "#9e363a", "color":"white"};}
      results["background-color"]='#8ecae6';
      results["color"]="white";
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
