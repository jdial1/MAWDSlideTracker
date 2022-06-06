<!-- ===========================================================================================

    File: Embedding.vue

    Authors: Justin Dial

    Description: This is the component for handling the embedding process
============================================================================================ -->
<template>
  <div class="container" v-if="this.$store.getters.GetValidUser">
    <br />
    <b-card
      class="mx-auto"
      style="
        max-width: 68%;
        opacity: 0.75;
        font: normal small-caps normal 30px/1.4 'Arial';
        padding: 35px 0 10px 0;
        margin: 15px 0 10px 0;
        border-radius: 15px;
      "
    >
      <b-card-text>
        <b-iconstack class="mb-5 py-md-1">
          <b-icon stacked icon="calendar" scale="6" flip-v></b-icon>
          <b-icon
            stacked
            icon="grid3x3"
            scale="2.8"
            shift-h="-21"
            shift-v="21"
          ></b-icon>
          <b-icon
            stacked
            icon="grid3x3"
            scale="2.8"
            shift-h="-21"
            shift-v="-21"
          ></b-icon>
          <b-icon
            stacked
            icon="grid3x3"
            scale="2.8"
            shift-h="21"
            shift-v="21"
          ></b-icon>
          <b-icon
            stacked
            icon="grid3x3"
            scale="2.8"
            shift-h="21"
            shift-v="-21"
          ></b-icon>
        </b-iconstack>
      </b-card-text>
      <span v-if="this.STRblockData">
        <b-card-text
          >AccessionID:
          <b-badge
            >{{ this.STRblockData.SpecNumFormatted }}
          </b-badge></b-card-text
        >
        <b-card-text
          >Block ID:
          <b-badge>
            {{ this.STRblockData.PartDesignator
            }}{{ this.STRblockData.BlockDesignator }}
          </b-badge></b-card-text
        >
        <b-card-text
          >Name:
          <b-badge
            >{{ this.STRblockData.PatientName }}
          </b-badge></b-card-text
        >
        <b-card-text
          >BlockStatus:
          <b-badge
            >{{ this.STRblockData.BlockStatus }}
          </b-badge></b-card-text
        >
        <b-card-text
          >BlockComment:
          <b-badge
            >{{ this.STRblockData.BlockComment }}
          </b-badge></b-card-text
        >
        <b-card-text
          >PartDescription:
          <b-badge
            >{{ this.STRblockData.PartDescription }}
          </b-badge></b-card-text
        >
      </span>
    </b-card>
  </div>
</template>

<!--components/Slides.vue -->
<script>
import axios from "axios";
import store from "../store.js";

export default {
  name: "embedding", // component name
  method:{
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
    STRblockData() { 
      let blockData = this.$store.getters.GetBlockData;
        if (blockData){
          if ('data' in blockData){
            console.log('setting block data')
            return blockData.data[0]
        }
        return null
      }
    }
  },
}
</script>
