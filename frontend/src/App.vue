<template>
  <div>
    <select v-model="selectedStation">
      <option v-for="station in stations" :key="station" :value="station">
        {{ station }}
      </option>
    </select>

    <select v-model="selectedPolygon" @change="fetchBlocksInIsochrone">
      <option value="5">5</option>
      <option value="15">15</option>
    </select>

    <select v-model="selectedProperty">
      <option v-for="property in properties" :key="property" :value="property">
        {{ property }}
      </option>
    </select>

    <select v-model="selectedBlock">
      <option v-for="block in blocks" :key="block" :value="block">
        {{ block }}
      </option>
    </select>


    <button @click="fetchData">查询</button>


    <pre>{{ result }}</pre>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import axios from 'axios';

export default {
  setup() {
    const stations = ref([]);
    const selectedStation = ref(null);
    const selectedPolygon = ref(null);
    const properties = ref(['location', 'floorAreaRatio', 'buildingDensity', 'avgHeight']);
    const selectedProperty = ref(null);
    const blocks = ref([]);
    const selectedBlock = ref(null);
    const result = ref('');
    const serverUrl = ref('http://localhost:3001');


    const test_allBlock = ref([]);
    const test_fetchAllBlocks = async () => {
      const response = await axios.get(`${serverUrl.value}/query/city/block`);
      test_allBlock.value = response.data;
      blocks.value = test_allBlock.value;
    };

    // eslint-disable-next-line no-unused-vars
    const fetchStations = async () => {
      const response = await axios.get(`${serverUrl.value}/query/city/station`);
      stations.value = response.data;
    };

    // eslint-disable-next-line no-unused-vars
    const fetchBlocksInIsochrone = async () => {
      const response = await axios.get(`${serverUrl.value}/query/city/${selectedStation.value}/block`);
      blocks.value = response.data;
    };

    const fetchData = async () => {
      if (!selectedStation.value || !selectedPolygon.value) {
        result.value = '请至少选择站点和等时圈轮廓。';
        return;
      }

      let url = `${serverUrl.value}/query/city/${selectedStation.value}/${selectedPolygon.value}`;

      if (selectedProperty.value && selectedBlock.value) {
        url += `/${selectedBlock.value}/${selectedProperty.value}`;
      } else if (selectedProperty.value) {
        url += `/block/${selectedProperty.value}`;
      }

      try {
        const response = await axios.get(url);
        result.value = JSON.stringify(response.data, null, 2);
      } catch (error) {
        result.value = 'Error: ' + error;
      }
    };


    onMounted(() => {
      //fetchStations();
      test_fetchAllBlocks();
    });
    return {
      stations,
      selectedStation,
      selectedPolygon,
      properties,
      selectedProperty,
      blocks,
      selectedBlock,
      result,
      fetchData
    };
  }
};
</script>
