<template>
  <div>
    <h1>Hardening TP</h1>
    <p>Status backend : {{ status }}</p>
  </div>
</template>

<script>
import { checkHealth } from '../services/api.js'

export default {
  data() {
    return {
      status: 'Chargement...'
    }
  },
  async mounted() {
    this.status = await checkHealth()
  }
}
</script>