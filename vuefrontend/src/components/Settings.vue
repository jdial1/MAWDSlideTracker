<template>
  <div class="container">
    <b-modal id="modal1" size="lg" title="Data Outdated" @hidden="resetModal" class="w-5 b-2" hide-footer>
      <div class="d-block text-center">
        <br>
        <h5>The table data is outdated compared to the database, </h5>
        <h4> <b> Reload the page and lose your changes</b> or <b>overwrite any changes?</b></h4>
        <div class="d-flex justify-content-between">
          <b-button variant="outline-danger" @click="cancelChange" class="mr-auto" size="lg">Reload Page</b-button>
          <b-button variant="outline-warning" @click="sendChange" class="ml-auto" size="lg">Overwrite Changes</b-button>
        </div>
        <br>
        <h5>Below are the differences between your table data and the database </h5>
        <br>
        <b-table v-if="outOfSyncItems" :items="outOfSyncItems" :fields="dif_fields" small></b-table>
      </div>
    </b-modal>
    <b-button-toolbar key-nav pills class="mb-1"
      style="border-radius: 15px; opacity: 0.9; border: 2px solid #ccc; background-color: #eef7fb !important">
      <b-button :disabled="!saveButtonStatus" @click="SaveAllChanges" size="lg" class="ml-auto">
        <b-icon v-if="loading" icon="arrow-clockwise" animation="spin"></b-icon>
        <b-icon v-else icon="cloud-upload"></b-icon>
        Save
      </b-button>
    </b-button-toolbar>
    <div class="wrapper">
      <b-icon v-if="table_loading" icon="arrow-clockwise" animation="spin" font-scale="3"></b-icon>
      <b-table v-if="!table_loading" :items="items" :fields="fields">
        <template v-slot:cell(old_value)="row">
          <b-form-input v-model="row.item.old_value" disabled />
        </template>
        <template v-slot:cell(right_left_value)="row">
          <b-form-checkbox v-model="row.item.right_left_value" switch>
            <template v-if="row.item.right_left_value">RIGHT SIDE</template>
            <template v-else>LEFT SIDE</template>
          </b-form-checkbox>
        </template>
        <template v-slot:cell(new_value)="row">
          <b-form-select v-model="row.item.new_value" :options="engraver_locations" />
        </template>
      </b-table>
    </div>
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
      resetModal: false,
      outOfSyncItems: [],
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
      dif_fields: [
        { key: "old_value", label: "Workstation ID" },
        { key: "right_left_value", label: "Current Table Side" },
        { key: "changed_right_left_value", label: "Database Side" },
        { key: "new_value", label: "Current Table Engraver" },
        { key: "changed_value", label: "Database Engraver" },
      ],
      items: [],
      changedItems: [],
      origItems: [],
      prevItems: [],
    };
  },
  mounted() {
    this.getValues();
  },
  methods: {
    openModal() {
      this.$bvModal.show('modal1');
    },
    closeModal() {
      this.$bvModal.hide('modal1');
    },
    async getValues(sleep = 0, hide_table = false) {
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
        if (!hide_table) this.table_loading = false;
      } catch (error) {
        console.error(error);
        this.makeToast("Error: Network Error", "Loading Failed", "danger", 10000);
        if (!hide_table) this.table_loading = false;
      }
    },
    async compareArrays(arr1, arr2) {
      return arr2.filter(obj2 => {
        const matchingObj = arr1.find(obj1 => obj1.old_value === obj2.old_value);
        if (matchingObj && new Date(obj2.updt_dt_tm) > new Date(matchingObj.updt_dt_tm)) {
          var dif = false
          if (obj2.new_value != matchingObj.new_value) {
            obj2.changed_value = matchingObj.new_value
            dif = true
          }
          else {
            this.dif_fields = this.dif_fields.filter(e => e.key != 'new_value' && e.key != 'changed_value')
          }
          if (obj2.right_left_value != matchingObj.right_left_value) {
            obj2.changed_right_left_value = matchingObj.right_left_value
            dif = true
          } else {
            this.dif_fields = this.dif_fields.filter(e => e.key != 'right_left_value' && e.key != 'changed_right_left_value')
          }
          if (dif) return true;
        }
        return false;
      });
    },
    async SaveAllChanges() {
      this.loading = true;
      this.table_loading = true;
      this.changedItems = [...this.items]
      this.prevItems = [...this.origItems]
      await this.getValues(0, true)
      // this.origItems gets updated on function call getValues
      // compare items updt_dt_tm before data sync with items after updt_dt_tm
      this.outOfSyncItems = await this.compareArrays(this.prevItems, this.origItems)
      if (this.outOfSyncItems.length > 0) {
        this.openModal()
      }
      else {
        this.sendChange()
      }
    },
    async cancelChange() {
      this.closeModal()
      await this.getValues()
      this.loading = false;
    },
    async sendChange() {
      try {
        console.log(JSON.stringify(this.changedItems))
        const response = await axios.post(`${store.getters.getApiUrl}/SetCassEngLoc`, {
          action: "SetCassEngLoc",
          data: this.changedItems,
        })
        this.makeToast(response.data.info, "Saved Successfully", "success", 10000, "b-toaster-top-right");
        this.loading = false;
        this.closeModal();
        await this.getValues(3000);
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
        if (this.origItems[i] && JSON.stringify(this.origItems[i]) !== JSON.stringify(this.items[i])) { return true; }
      }
      return false;
    },
  },
};
</script>