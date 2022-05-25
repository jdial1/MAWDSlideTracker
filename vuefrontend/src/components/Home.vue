// Home.vue

<template>
  <div class="outer-container">
    <div class="container">
<!--      <h1>Slide Status</h1>-->
      <br>
      <b-progress v-if="!this.loading" :max="max" height="8rem">
        <b-progress-bar :value=this.barValue(preEmbedded) ><span>PreEmbeded<h3>{{ preEmbedded }}</h3></span> </b-progress-bar>
        <b-progress-bar :value=this.barValue(embedded)  ><span>Embeded<h3>{{ embedded }}</h3></span></b-progress-bar>
        <b-progress-bar :value=this.barValue(Stained)  ><span>Stained<h3>{{ Stained}}</h3> </span></b-progress-bar>
        <b-progress-bar :value=this.barValue(slidesCut)  ><span>Slides Cut<h3>{{ slidesCut}}</h3> </span></b-progress-bar>
        <b-progress-bar :value=this.barValue(distributed)  ><span>Distributed<h3>{{ distributed }}</h3></span></b-progress-bar>
      </b-progress>
      <b-icon v-if="this.loading" icon="arrow-clockwise" animation="spin" font-scale="2"></b-icon>
  </div>
  </div>
</template>

<script>

import axios from 'axios'
import store from '../store.js'

export default {
  name: 'home', // component name
  data() {
    return {
      blockStatusData:'',
      preEmbedded:0,
      embedded:0,
      slidesCut:0,
      distributed:0,
      Stained:0,
      Staining:0,
      max:0,
      timestamp:0,
      loading:true
    }
  },
  mounted() {
    this.LoadData()
  },
  methods: {
    barValue(value) {
      return (value*.5)+this.max/6 > 200 ? (value*.5)+this.max/6 : 200
    },
     LoadData(){
       this.loading=true
     axios.post(store.getters.getApiUrl + '/GetStatusData', {
       action: 'GetStatusData',
       curRoute : this.currentRouteName
     })
         .then(apidata => {
           this.blockStatusData = apidata
           console.log(typeof (apidata))
           apidata.data.forEach((data)=>{
             console.log(data['count']+' '+data['Action'])
             if (data['Action'] ==='PreEmbedded'){
               this.preEmbedded = data['count']
             }
             if (data['Action'] ==='Embedded'){
               this.embedded = data['count']
             }
             if (data['Action'] ==='SlidesPrintedOffBlock'){
               this.slidesCut = data['count']
             }
             if (data['Action'] ==='distributed'){
               this.distributed = data['count']
             }
             if (data['Action'] ==='Stained'){
               this.Stained = data['count']
             }
           })
           this.max = this.preEmbedded+ this.embedded+this.Stained+this.Staining+ this.slidesCut+ this.distributed
           this.loading=false
         })


     },
    makeToast(content, title, variant = null,time=1500,locn='b-toaster-top-left') {
      this.$bvToast.toast(content, {
        title: title,
        variant: variant,
        solid: true,
        autoHideDelay: time,
        toaster: locn,
        appendToast: true
      })
    }
  },
  computed:{
    currentRouteName() {
      return store.getters.GetCurrentRouteName;
    }
  }
}
</script>
