<template>

  <div class="container"  >
<!--    <h1>Cassette Engraver Location</h1>-->
    <b-button-group class="float-right">
      <b-button   title="Save" v-on:click="SaveAllChanges()" class="active-btn">
        <b-icon v-if="this.loading" style='color: #ffffff;' icon="arrow-clockwise" animation="spin" font-scale="1"></b-icon>
        <b-icon v-if="!this.loading" icon="cloud-upload"></b-icon>
        Save
      </b-button>
    </b-button-group>
    <br>
    <b-icon v-if="this.table_loading" icon="arrow-clockwise" animation="spin" font-scale="2"></b-icon>
    <b-table v-if="!this.table_loading" style="white-space: nowrap;"   small    :items="items" :fields="fields" >
      <template v-slot:cell(old_value)="row">    <b-form-input v-model="row.item.old_value" :disabled='true'/></template>
      <template v-slot:cell(right_left_value)="row">
        <b-form-group>
          <b-form-checkbox v-model="row.item.right_left_value" switch>
            <span v-if="row.item.right_left_value">RIGHT SIDE</span>
            <span v-if="!row.item.right_left_value">LEFT SIDE</span>
          </b-form-checkbox>
        </b-form-group>
      </template>
      <template   v-slot:cell(new_value)="row">
        <b-form-select v-model="row.item.new_value" :options="engraver_locations">
        </b-form-select>
      </template>
    </b-table>
  </div>
</template>


<script>
import axios from "axios";
import store from "@/store";

export default {
  data() {
    return {
      setAllValue:'',
      loading:false,
      table_loading:false,
      setDirections:'',
      engraver_locations: ['PLAZA01','MAWD01','MAWD02','MAWD03','CASSETTELABELS01'],
      directions: ['  ','Left','Right'],
      fields: [{ key: 'old_value', label: 'Workstation ID' },{ key: 'right_left_value', label: 'Side' },{ key: 'new_value', label: 'Cassette Engraver ID' }],
      items: []
    }
  },
  mounted() {
    this.getValues()
  },
  methods: {
    getValues(){
      this.table_loading = true
      axios.post(store.getters.getApiUrl + '/GetCassEngLoc', {
        action: 'GetCassEngLoc'
      })
          .then(apidata => {
            apidata.data.forEach((item)=>{item.right_left_value = (item.right_left_value) ? true : false})
            this.items = apidata.data;
            this.table_loading = false
          })
    },
    SaveAllChanges(){
      this.loading = true
      axios.post(store.getters.getApiUrl + '/SetCassEngLoc', {
        action: 'SetCassEngLoc',
        data:this.items
      })
          .then(response => {
            this.makeToast(response['data']['info'], "Saved Successfully", "success",10000,'b-toaster-top-right')
            console.log(response)
            this.loading = false
          })
          .catch((error) => {
        console.log(error)
        this.makeToast('Error: Network Error', "Saving Failed", "danger",10000)
        this.loading = false
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
  }
}
</script>
