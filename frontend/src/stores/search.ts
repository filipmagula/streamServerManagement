import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useSearchStore = defineStore('search', () => {
  const query = ref('')

  function setQuery(q: string) {
    query.value = q
  }

  function clearQuery() {
    query.value = ''
  }

  return {
    query,
    setQuery,
    clearQuery
  }
})
