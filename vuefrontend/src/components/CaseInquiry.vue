<template>
  <div class="container" v-if="$store.getters.GetValidUser">
    <b-button-toolbar key-nav pills
      style="border-radius: 15px; opacity: 0.9; border: 2px solid #ccc; background-color: #eef7fb !important">
      <b-input v-model="strCaseNo" placeholder="Input Case No" @keyup.enter="EnterKeyTrigger" class="m-2"
        style="max-width:75%;" />
      <b-button pill class="ml-3" @click="LoadTableData" ref="btnLoadTableData" variant="dark">
        <div v-if="loading">
          <b-icon disabled icon="arrow-clockwise" animation="spin" font-scale="1" />
        </div>
        <div v-else>
          <b-icon icon="search" /> Search
        </div>
      </b-button>
      <b-form-group class="m-0" v-if="!loading" pill variant="dark">
        <b-dropdown right text="Settings">
          <template #button-content>
            <b-icon icon="gear" />
          </template>
          <div class="d-flex justify-content-center">
            <b-checkbox v-model="exactMatch" size="md" switch /> Exact Match
          </div>
          <div class="d-flex justify-content-center">
            <b-checkbox v-model="materialAudit" :disabled="AdminInputPassword !== AdminPass" size="md" switch />
            Material Audit
          </div>
          <b-input v-model="AdminInputPassword" id="AdminInputPassword" placeholder="Admin Code" class="mx-auto"
            style="max-width: 150px" />
        </b-dropdown>
      </b-form-group>
    </b-button-toolbar>
    <br />
    <b-table v-if="queryResponse && queryData && queryData.length > 0" :items="queryData" :fields="fieldVals" small
      borderless striped hover />
    <div v-else-if="queryResponse && (!queryData || queryData.length === 0)">
      <h3
        style="color: #0f3b52; background-color: black;border-radius: 15px; opacity: 0.9; border: 2px solid #0f3b52; background-color: #eef7fb !important;">
        No Data Found</h3>
    </div>
  </div>
</template>


<script>
import axios from "axios";
import store from "../store.js";

export default {
  name: "CaseInquiry",
  data() {
    return {
      strCaseNo: "D19-99999",
      fieldVals: [],
      exactMatch: true,
      materialAudit: false,
      queryData: [],
      loading: false,
      queryResponse: false,
      AdminInputPassword: "",
      AdminPass: "HISTO001!",
    };
  },
  methods: {
    LoadTableData() {
      this.loading = true;
      this.queryResponse = false;
      this.fieldVals = [];
      this.queryData = [];
      let strFullAPICall = store.getters.getApiUrl + "/GetCaseInquery";
      let accId = this.strCaseNo;
      if (!this.exactMatch) {
        accId = "%" + this.strCaseNo + "%";
      }

      axios
        .post(strFullAPICall, {
          ACCESSIONID: accId,
          apitoken: store.state.apitoken,
          curRoute: this.currentRouteName,
          adminCode: this.AdminInputPassword,
          materialAudit: this.materialAudit,
        })
        .then((apidata) => {
          this.loading = false;
          let temp = {};
          temp = apidata.data;
          console.log(JSON.stringify(temp));
          temp.forEach((e) => {
            if (e["Order Time"])
              e["Order Time"] = this.dateFormatter(e["Order Time"]);
            if (e["Embedded Time"])
              e["Embedded Time"] = this.dateFormatter(e["Embedded Time"]);
            if (e["Slide Printed Time"])
              e["Slide Printed Time"] = this.dateFormatter(
                e["Slide Printed Time"]
              );
            if (e["StainOrderDate"])
              e["StainOrderDate"] = this.dateFormatter(e["StainOrderDate"]);
            if (e["DTReadyForCourier"])
              e["DTReadyForCourier"] = this.dateFormatter(
                e["DTReadyForCourier"]
              );
            if (e["DateTimeEngraved"])
              e["DateTimeEngraved"] = this.dateFormatter(e["DateTimeEngraved"]);
          });
          this.queryData = temp;
          this.queryResponse = true;
          console.log(this.queryData);
          if (!this.materialAudit) {
            this.fieldVals = Object.keys(this.queryData[0]);
          } else {
            this.fieldVals = [
              "Action",
              "IDOfMaterial",
              "User",
              "Station",
              "ActionDateTime",
            ];
          }
          this.loading = false;
        })
        .catch((e) => {
          console.log(e);
        })
        .catch((error) => {
          console.log("error:");
          console.log(error);
        });
    },
    dateFormatter(str) {
      return str
        .replace("T", " ")
        .replace("Z", " ")
        .split(".")[0]
        .substring(2, 99);
    },
    EnterKeyTrigger() {
      this.$refs.btnLoadTableData.click();
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
  mounted() { },
  computed: {
    currentRouteName() {
      return store.getters.GetCurrentRouteName;
    },
  },
};
</script>
