<script setup lang="ts">
import { usePageStore } from './store/page';
const page = usePageStore()

</script>

<template>
 <div class="min-h-screen bg-gray-200" v-loading="page.loading">
  <div class="w-full max-w-screen-xl mx-auto pt-10">
    <router-view></router-view>
  </div>
 </div>
</template>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
