<script setup lang="ts">
import { usePageStore } from './store/page';
import { useAuthStore } from './store/auth';
import { useRouter, useRoute } from 'vue-router';
import { computed } from 'vue';

const page = usePageStore()
const auth = useAuthStore()
const router = useRouter()
const route = useRoute()

const isLoggedIn = computed(() => !!auth.token)
const isLoginPage = computed(() => route.path === '/login')

const logout = () => {
  auth.clearToken()
  router.push('/login')
}
</script>

<template>
 <div class="min-h-screen bg-gray-200" v-loading="page.loading">
  <nav v-if="isLoggedIn && !isLoginPage" class="bg-white shadow-sm sticky top-0 z-50">
    <div class="w-full max-w-screen-xl mx-auto px-4 flex items-center justify-between h-14">
      <div class="flex items-center gap-1">
        <router-link
          to="/articles"
          class="px-4 py-2 rounded text-sm font-medium transition-colors"
          :class="route.path === '/articles' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-100'"
        >
          文章列表
        </router-link>
        <router-link
          to="/analytics"
          class="px-4 py-2 rounded text-sm font-medium transition-colors"
          :class="route.path === '/analytics' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-100'"
        >
          數據資料
        </router-link>
      </div>
      <button
        class="px-3 py-1.5 text-sm text-gray-500 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
        @click="logout"
      >
        登出
      </button>
    </div>
  </nav>
  <div class="w-full max-w-screen-xl mx-auto pt-6 px-4">
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
