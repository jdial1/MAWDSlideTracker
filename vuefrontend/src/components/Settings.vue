<template>
  <div class="container">
    <b-button-group class="float-right">
      <b-button
        v-if="!table_loading"
        title="Save"
        :disabled="!saveButtonStatus"
        @click="saveAllChanges"
        style="background-color: #8ecae6 !important"
      >
        <b-icon
          v-if="loading"
          :disabled="!saveButtonStatus"
          style="color: #fff"
          icon="arrow-clockwise"
          animation="spin"
        ></b-icon>
        <b-icon v-else icon="cloud-upload"></b-icon>
        Save
      </b-button>
    </b-button-group>
    <br />
    <b-icon
      v-if="table_loading"
      :disabled="!saveButtonStatus"
      style="color: #8ecae6"
      icon="arrow-clockwise"
      animation="spin"
      font-scale="3"
    ></b-icon>
    <b-table
      v-if="!table_loading"
      small
      :items="items"
      :fields="fields"
    >
      <template v-slot:cell(old_value)="row">
        <b-form-input v-model="row.item.old_value" :disabled="true" />
      </template>
      <template v-slot:cell(right_left_value)="row">
        <b-form-group>
          <b-form-checkbox v-model="row.item.right_left_value" switch>
            <span v-if="row.item.right_left_value">RIGHT SIDE</span>
            <span v-else>LEFT SIDE</span>
          </b-form-checkbox>
        </b-form-group>
      </template>
      <template v-slot:cell(new_value)="row">
        <b-form-select v-model="row.item.new_value" :options="engraver_locations" />
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
      setAllValue: "",
      loading: false,
      table_loading: false,
      setDirections: "",
      engraver_locations: [
        "PLAZA01",
        "MAWD01",
        "MAWD02",
        "MAWD03",
        "CASSETTELABELS01",
      ],
      directions: ["  ", "Left", "Right"],
      fields: [
        { key: "old_value", label: "Workstation ID" },
        { key: "right_left_value", label: "Side" },
        { key: "new_value", label: "Cassette Engraver ID" },
      ],
      items: [],
      origItems: [],
    };
  },
  mounted() {
    this.getValues();
  },
  methods: {
    async getValues(sleep = 0) {
      this.table_loading = true;
      try {
        const apidata = await axios.post(`${store.getters.getApiUrl}/GetCassEngLoc`, {
          action: "GetCassEngLoc",
        });
        await new Promise(resolve => setTimeout(resolve, sleep));
        const newEngraverLocations = [];
        const data = apidata.data.map(item => {
          newEngraverLocations.push(item.new_value);
          return {
            ...item,
            right_left_value: !!item.right_left_value,
          };
        });
        this.engraver_locations = [...new Set(this.engraver_locations.concat(newEngraverLocations))];
        this.items = JSON.parse(JSON.stringify(data));
        this.origItems = JSON.parse(JSON.stringify(data));
        this.table_loading = false;
      } catch (error) {
        console.error(error);
        this.makeToast("Error: Network Error", "Loading Failed", "danger", 10000);
        this.table_loading = false;
      }
    },
    async SaveAllChanges() {
      this.loading = true;
      try {
        const response = await axios.post(`${store.getters.getApiUrl}/SetCassEngLoc`, {
          action: "SetCassEngLoc",
          data: this.items,
        });
        this.makeToast(response.data.info, "Saved Successfully", "success", 10000, "b-toaster-top-right");
        this.loading = false;
        await this.getValues(2500);
      } catch (error) {
        console.error(error);
        this.makeToast("Error: Network Error", "Saving Failed", "danger", 10000);
        this.loading = false;
      }
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
    saveButtonStatus() {
      for (let i = 0; i < this.items.length; i++) {
        if (this.origItems[i] &&JSON.stringify(this.origItems[i]) !== JSON.stringify(this.items[i])) { return true; }
      }
      return false;
    },
  },
};
</script>