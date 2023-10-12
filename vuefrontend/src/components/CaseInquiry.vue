<template>
  <b-container class="container wrapper" v-if="$store.getters.GetValidUser">
    <b-button-toolbar class="my-2 p-1">
      <b-input v-model="strCaseNo" placeholder="Input Case No" @keyup.enter="EnterKeyTrigger" class="m-2" size="lg"
        style="max-width: 75%;" />
      <b-button size="lg" class="m-1" @click="LoadTableData" ref="btnLoadTableData">
        <div v-if="loading">
          <b-icon disabled icon="arrow-clockwise" animation="spin" font-scale="1" />
        </div>
        <div v-else>
          <b-icon icon="search" /> Search
        </div>
      </b-button>
      <b-form-group v-if="!loading" class="m-auto">
        <b-dropdown text="Settings" boundary="window" class="full-height-dropdown">
          <template #button-content><b-icon icon="gear" size="lg" class="m-1" /></template>
          <div class="d-flex m-1">
            <b-checkbox v-model="exactMatch" size="md" switch class="ml-2" />
            <span>Exact Match</span>
          </div>
          <div class="d-flex  m-1">
            <b-checkbox v-model="materialAudit" :disabled="!adminPassValidate" size="md" switch class="ml-2" />
            <span>Material Audit</span>
          </div>
          <div class="d-flex m-1">
            <b-input v-model="AdminInputPass" id="AdminInputPass" placeholder="Admin Code" style="max-width:55%" />
          </div>
        </b-dropdown>
      </b-form-group>
    </b-button-toolbar>
    <div class="d-flex justify-content-center" v-if="queryResponse && queryData && queryData.length > 0">
      <b-table :items="queryData" :fields="fieldVals" small borderless striped hover class="mx-auto b-table"
        style="border-radius: 15px;" />
    </div>
    <div v-if="queryResponse && (!queryData || queryData.length === 0)">
      <h3 class="h1">No Data Found</h3>
    </div>
  </b-container>
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
      AdminInputPass: "",
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
          adminCode: this.AdminInputPass,
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
            delete e["timestamp"]
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
    adminPassValidate() {
      return this.AdminInputPass == this.AdminPass;
    },
  },
};
</script>
