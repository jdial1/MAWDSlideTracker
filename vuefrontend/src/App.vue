<template>
  <div id="app">
    <div class="bg-image"></div>
    <b-navbar class="navbar fixed-top">
      <b-navbar-brand  to="/" v-on:click="setRoute('Home');" class="rounded-pill">
        <img src="./assets/title.png" >
      </b-navbar-brand>
      <b-navbar-nav class="ml-auto">
        <b-nav-item v-if="ValidUser"
                    :active="CurrentRoute == 'caseinquiry'"
                    v-on:click="setRoute('caseinquiry');"
                    to="/caseinquiry">
          <b-iconstack font-scale="1" style="display: flex;align-items: center; justify-content: center;margin:auto;">
            <b-icon stacked icon="search"></b-icon>
          </b-iconstack>
          Search
        </b-nav-item>
        <b-nav-item v-if="ValidUser"
                    :active="CurrentRoute == 'Engraving'"
                    v-on:click="setRoute('Engraving');"
                    to="/settings">
          <b-iconstack style="display: flex;align-items: center; justify-content: center;margin:auto;" >
            <b-icon stacked icon="circle" scale="1" flip-v ></b-icon>
            <b-icon stacked icon="circle-fill" scale=".1" shift-h="0" shift-v="3"></b-icon>
            <b-icon stacked icon="circle-fill" scale=".14" shift-h="-1" shift-v="-1"></b-icon>
            <b-icon stacked icon="circle-fill" scale=".16" shift-h="3"  shift-v="3"></b-icon>
            <b-icon stacked icon="circle-fill" scale=".1" shift-h="2"  shift-v="-4"></b-icon>
          </b-iconstack>
          Grossing
        </b-nav-item>
        <b-nav-item v-if="ValidUser"
                :active="CurrentRoute == 'Embedding'"
                    v-on:click="setRoute('Embedding');"
                to="/embedding"
        >
          <b-iconstack style="display: flex;align-items: center; justify-content: center;margin:auto" >
            <b-icon stacked icon="calendar" scale="1" flip-v ></b-icon>
            <b-icon stacked icon="grid3x3" scale=".45" shift-h="-3.3" shift-v="3.3"></b-icon>
            <b-icon stacked icon="grid3x3" scale=".45" shift-h="-3.3" shift-v="-3.3"></b-icon>
            <b-icon stacked icon="grid3x3" scale=".45" shift-h="3.3"  shift-v="3.3"></b-icon>
            <b-icon stacked icon="grid3x3" scale=".45" shift-h="3.3"  shift-v="-3.3"></b-icon>
          </b-iconstack>
          Embedding
        </b-nav-item>
        <b-nav-item v-if="ValidUser"
                :active="CurrentRoute == 'SlidePrinting'"
                v-on:click="setRoute('SlidePrinting');"
                to="/slideprinting"
                    >
          <b-iconstack font-scale="1" style="display: flex;align-items: center; justify-content: center;margin:auto" >
            <b-icon stacked icon="bookmark" shift-v="-1" flip-v></b-icon>
            <b-icon stacked scale=".7" icon="chat-left-text" shift-v="4"></b-icon>
          </b-iconstack>
          Printing
        </b-nav-item>
        <b-nav-item v-if="ValidUser"
                :active="CurrentRoute == 'SlideDistribution'"
                 v-on:click="setRoute('SlideDistribution');"
                to="/slidedistribution"
                    >
          <b-iconstack style="display: flex;align-items: center; justify-content: center;margin:auto" >
            <b-icon stacked icon="book" scale="1" ></b-icon>
            <b-icon stacked icon="bookshelf" scale=".45" shift-h="-3.3" shift-v="3.3"></b-icon>
            <b-icon stacked icon="bookshelf" scale=".45" shift-h="-3.3" shift-v="-3"></b-icon>
            <b-icon stacked icon="bookshelf" scale=".45" shift-h="3.3"  shift-v="3.3"></b-icon>
            <b-icon stacked icon="bookshelf" scale=".45" shift-h="3.3"  shift-v="-3"></b-icon>
          </b-iconstack>
          Distribution
        </b-nav-item>
        <b-nav-item v-if="ValidUser"
                    :active="CurrentRoute == 'Diagnosis'"
                    v-on:click="setRoute('Diagnosis');"
                    to="/Diagnosis"
        >
          <b-iconstack style="display: flex;align-items: center; justify-content: center;margin:auto" >
            <b-icon stacked icon="journal-text" scale="1" ></b-icon>
          </b-iconstack>
          Diagnosis
        </b-nav-item>

      </b-navbar-nav>
        <b-nav-item-dropdown no-caret right style="max-width:10rem;margin-left:auto;margin-right: 2rem;box-shadow: 0 0 4px 0 rgba(0, 0, 0, 0.5);" >
          <template #button-content class="badge-scan rounded-pill">
            {{ UserName}}
          </template>
          <b-dropdown-item to="/caseinquiry">Search</b-dropdown-item>
          <b-dropdown-item to="/settings">Settings</b-dropdown-item>
          <b-dropdown-item v-if="ValidUser" @click="logout()">Log Out </b-dropdown-item>
          <b-dropdown-item class="m-auto" disabled>

          </b-dropdown-item>
          <b-dropdown-item   disabled>
            Frontend<span v-if="FEVersion" style='color: #007bff;text-shadow:none !important;font-size: smaller'>&nbsp;v {{ FEVersion }} ({{this.nodeEnv}})</span>
          </b-dropdown-item>
          <b-dropdown-item style='color: #007bff;'  disabled>
            Local <span v-if="LocalVersion" style='color: #007bff;text-shadow:none !important;font-size: smaller'>&nbsp;v {{ LocalVersion }} ({{StationName}})</span>&nbsp;
          <b-icon-check2-circle v-if="LocalStatus" variant="success"></b-icon-check2-circle><b-icon-x-circle v-if="!LocalStatus" variant="danger"></b-icon-x-circle>
        </b-dropdown-item>
          <b-dropdown-item style='color: #007bff;'  disabled>
            Backend<span v-if="BEVersion" style='color: #007bff;text-shadow:none !important;font-size: smaller'>&nbsp;v {{ BEVersion }}(TestMode:{{BETestMode}})</span>&nbsp;
            <b-icon-check2-circle v-if="BEStatus" variant="success"></b-icon-check2-circle><b-icon-x-circle v-if="!BEStatus" variant="danger"></b-icon-x-circle>
          </b-dropdown-item>
        </b-nav-item-dropdown>
    </b-navbar>
    <br>
        <router-view></router-view>
  </div>
</template>

<style>
@import './assets/app_style.css';
</style>
<script>
import store from './store.js'
import { mapGetters } from 'vuex';
import { mapMutations } from 'vuex'


export default {
  name: 'app',
  data() {
    return {
      userinfo: {},
      scannedbadgeinput: "Scan Badge To Start",
      defaultbadgeinput: this.scannedbadgeinput,
    }
  },
  mounted() {
    if (this.nodeEnv === 'production') {
      store.commit('production', true)
    } else {
      store.commit('production', false)
    }
  },
  methods: {
    ...mapMutations({
      setRoute: 'SetCurrentRouteName'
    }),
    refresh() {
      setTimeout( () => {
        location.reload()
      }, 1000*60*5); //5 mins
    },
    logout() {
      store.commit('SetValidUser', false)
      store.commit('SetUserName', this.DefaultUserName)
      this.scannedbadgeinput = this.defaultbadgeinput
      this.makeToast("Logging out user", "Logged Out", "warning")
    },
    getInputColor(text) {
      if (text !== this.defaultbadgeinput && !/\d/.test(text) && text.length > 0) return {'background-color': '#28a745'};
      if (text !== this.defaultbadgeinput && /\d/.test(text) && text.length > 0) return {'background-color': '#ffc107'};
      if (text === this.defaultbadgeinput) return {'background-color': '#dc3545'};
      return {'background-color': '#ffc107'};
    }
  },
  computed: {
    currentRouteName() {
      return this.$route.name;
    },
    nodeEnv() {
      return process.env.NODE_ENV
    },
    ...mapGetters({
      StationName:'GetStationName',
      DefaultUserName:'GetDefaultUsername',
      LocalVersion:'GetLocalVersion',
      BEVersion:'GetBEVersion',
      LocalStatus:'GetLocalSocketStatus',
      FEVersion:'GetFEVersion',
      BEStatus:'GetBackendSocketStatus',
      ValidUser :'GetValidUser',
      UserName :'GetUsername',
      CurrentRoute :'GetCurrentRouteName',
      BETestMode:'getBackendTestMode'
    })
  }
}
</script>
