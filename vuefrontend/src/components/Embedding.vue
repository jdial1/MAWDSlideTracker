<template>
  <b-container v-if="validUser" class="container wrapper" :style="`background-color: ${currentColor} !important;`">
    <b-card class="card shadow mx-1 p-1">

      <b-iconstack class="m-5 iconstack-container">
        <b-icon stacked icon="calendar" scale="6" flip-v />
        <b-icon stacked icon="grid3x3" scale="2.8" shift-h="-21" shift-v="21" />
        <b-icon stacked icon="grid3x3" scale="2.8" shift-h="-21" shift-v="-21" />
        <b-icon stacked icon="grid3x3" scale="2.8" shift-h="21" shift-v="21" />
        <b-icon stacked icon="grid3x3" scale="2.8" shift-h="21" shift-v="-21" />
      </b-iconstack>

      <h3 class="pt-3">Use the barcode scanner to scan a pathology block.</h3>
      <b-table v-if="cardData" :items="cardText" class="m-auto" striped small>
        <template #cell()="{ value }">
          <h4 class="step-title">{{ value }}</h4>
        </template>
      </b-table>
    </b-card>
  </b-container>
</template>

<script>
import { mapGetters } from 'vuex';

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
      currentColor: 'primary',
      colors: ['primary', 'success', 'danger', 'warning', 'dark'],
      colorIndex: 0,
    };
  },
  computed: {
    ...mapGetters(['GetValidUser', 'GetBlockData']),
    validUser() {
      return this.GetValidUser;
    },
    cardData() {
      const data = this.GetBlockData.data || null;
      if (data) {
        this.cardText.forEach((card, index) => {
          card.value = data[0][Object.keys(data[0])[index]];
        });
      }
      return data;
    },
  },
  created() {
    this.startColorAnimation();
  },
  beforeDestroy() {
    clearInterval(this.intervalId);
  },
  methods: {
    startColorAnimation() {
      this.intervalId = setInterval(() => {
        this.colorIndex = (this.colorIndex + 1) % this.colors.length;
        this.currentColor = this.colors[this.colorIndex];
      }, 1000);
    },
  },
};
</script>

<style>
.iconstack-container {
  background: linear-gradient(-45deg, #ee7752, #e73c7e, #23a6d5, #23d5ab);
  background-size: 400% 400%;
  animation: gradient 15s ease infinite;
}

@keyframes gradient {
  0% {
    background-position: 0% 50%;
  }

  50% {
    background-position: 100% 50%;
  }

  100% {
    background-position: 0% 50%;
  }
}
</style>
