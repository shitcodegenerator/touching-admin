<script setup lang="ts">


</script>

<template>
 <div class="min-h-screen bg-gray-200">
  <div class="w-full max-w-screen-xl mx-auto pt-40">
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
