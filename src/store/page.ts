import { defineStore } from 'pinia'
import { ref } from 'vue'
export const usePageStore = defineStore('page', () => {
    const loading = ref(false)
    function setLoading(status: boolean) {
        loading.value = status
    }
  
    return { loading, setLoading }
  })