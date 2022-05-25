<!-- ===========================================================================================

    File: CaseInquiry.vue

    Authors: Justin Dial

    Description: This is the component for handling Case Querying
============================================================================================ -->

<template>
  <div class="justify-content-center container"  >
<!--    <h1>Case Inquiry</h1>-->

    <b-button-toolbar style="width: 50%;margin: auto">
    <b-input-group style="width: 100%;" >
        <b-input style="margin: 5px;padding: 5px 5px" id="InputCaseNo"  v-model="strCaseNo" placeholder="Input Case No: ie D19-99999" @keyup.enter="EnterKeyTrigger" />
        <b-button style="margin: 5px;padding: 5px 5px"  title="Save" v-on:click="LoadTableData()" ref="btnLoadTableData">
<div v-if="this.loading" ><b-icon  v-if="this.loading" style='color: #ffffff;' icon="arrow-clockwise" animation="spin" font-scale="1"></b-icon></div>
<div v-if="!this.loading" ><b-icon icon="search"></b-icon> Search</div>
        </b-button>

      <b-form-group style="margin: 5px">
        <b-dropdown right text="Settings">
<template #button-content>
  <b-icon icon="gear"></b-icon>
</template>
 <div style="display: flex;justify-content:center;"><b-checkbox size="md" v-model="exactMatch" switch></b-checkbox>    Exact Match</div>
 <div style="display: flex;justify-content:center;"><b-checkbox :disabled="this.AdminInputPassword !== this.AdminPass" size="md" v-model="materialAudit" switch></b-checkbox>Material Audit</div>
   <b-input style="max-width:150px;margin: 5px;padding: 5px 5px" class="mx-auto" id="AdminInputPassword"  v-model="AdminInputPassword" placeholder="Admin Code" />
        </b-dropdown>
      </b-form-group>





    </b-input-group>
    </b-button-toolbar>
    <br>
    <b-table style="opacity: .90;font-size: smaller;" striped   small borderless :items="queryData" :fields="fieldVals"></b-table>
 </div>
</template>
<script>

import axios from 'axios'
import store from '../store.js'

export default {
  name: 'CaseInquiry',
  data() {
    return {
      strCaseNo: 'D19-99999',
      fieldVals: [],
      exactMatch: true,
      materialAudit: false,
      queryData: [],
      loading:false,
      AdminInputPassword:'',
      AdminPass:'HISTO001!'
    }
  },
  methods: {
    LoadTableData() {
      this.loading = true;
      this.fieldVals = [];
      this.queryData = [];
      let strFullAPICall = store.getters.getApiUrl + '/GetCaseInquery'
      let accId=this.strCaseNo
      if(!this.exactMatch){accId="%"+this.strCaseNo+"%"}

      axios.post(strFullAPICall, {
        ACCESSIONID: accId,
        apitoken: store.state.apitoken,
        curRoute : this.currentRouteName,
        adminCode : this.AdminInputPassword,
        materialAudit : this.materialAudit
      })
.then(apidata => {
  let temp = {}
  temp = apidata.data
  console.log(JSON.stringify(temp))
  temp.forEach((e)=>{
    if(e['Order Time'])         e['Order Time'] =         this.dateFormatter(e['Order Time']);
    if(e['Embedded Time'])      e['Embedded Time'] =      this.dateFormatter(e['Embedded Time']);
    if(e['Slide Printed Time']) e['Slide Printed Time'] = this.dateFormatter(e['Slide Printed Time']);
    if(e['StainOrderDate'])     e['StainOrderDate'] =     this.dateFormatter(e['StainOrderDate']);
    if(e['DTReadyForCourier'])  e['DTReadyForCourier'] =  this.dateFormatter(e['DTReadyForCourier']);
    if(e['DateTimeEngraved'])   e['DateTimeEngraved'] =   this.dateFormatter(e['DateTimeEngraved']);
  })
  this.queryData = temp
  // const split_data = (array, chunk_size) => Array(Math.ceil(array.length / chunk_size)).fill()
  //     .map((_, index) => index * chunk_size).map(begin => array.slice(begin, begin + chunk_size));
  // this.queryData = split_data(temp,2)
  console.log(this.queryData)
  if (!this.materialAudit){
    this.fieldVals = Object.keys(this.queryData[0])
  }
  else{
    this.fieldVals = ['Action','IDOfMaterial' ,'User','Station','ActionDateTime' ]
  }
  this.loading = false;
}).catch((e) => {
        console.log(e)
      })
.catch( (error) => {
  console.log("error:")
  console.log(error)
})
    },
    dateFormatter(str){
      return str.replace('T', ' ').replace('Z', ' ').split('.')[0].substring(2,99)
    },
    EnterKeyTrigger() {
      this.$refs.btnLoadTableData.click()
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
  mounted() {
  },
  computed:{
    currentRouteName() {
      return store.getters.GetCurrentRouteName;
    }
  }
}
</script>