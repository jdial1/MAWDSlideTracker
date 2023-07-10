<template>
  <div v-if="$store.getters.GetValidUser">
    <b-card class="mx-auto p-5" style="max-width: 68%;border-radius: 15px; opacity: 0.9; border: 2px solid #0f3b52;">
      <b-iconstack class="m-5">
        <b-icon stacked icon="calendar" scale="6" flip-v />
        <b-icon stacked icon="grid3x3" scale="2.8" shift-h="-21" shift-v="21" />
        <b-icon stacked icon="grid3x3" scale="2.8" shift-h="-21" shift-v="-21" />
        <b-icon stacked icon="grid3x3" scale="2.8" shift-h="21" shift-v="21" />
        <b-icon stacked icon="grid3x3" scale="2.8" shift-h="21" shift-v="-21" />
      </b-iconstack>
      <div v-if="cardData">
        <b-table :items="cardText" striped small class="m-auto">
          <template #cell()="data">
            <h3>{{ data.value }}</h3>
          </template>
        </b-table>
      </div>
    </b-card>
  </div>
</template>

<script>
export default {
  name: "embedding",
  data() {
    return {
      cardText: [
        { text: "AccessionID", value: null },
        { text: "Block ID", value: null },
        { text: "Name", value: null },
        { text: "BlockStatus", value: null },
        { text: "BlockComment", value: null },
        { text: "PartDescription", value: null },
      ],
    };
  },
  computed: {
    cardData: {
      get() {
        var blkData = this.$store.getters.GetBlockData.data || null
        if (blkData) {
          this.cardText[0].value = blkData[0].SpecNumFormatted;
          this.cardText[1].value = blkData[0].BlockID;
          this.cardText[2].value = blkData[0].PatientName;
          this.cardText[3].value = blkData[0].BlockStatus;
          this.cardText[4].value = blkData[0].BlockComment;
          this.cardText[5].value = blkData[0].PartDescription;
        }
        return blkData
      }
    },
  },
  watch: {
    cardData: {
      handler() { },
      immediate: true,
    },
  },
};
</script>