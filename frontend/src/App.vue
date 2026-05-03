<template>
  <nav v-if="showNav">
    <span>Hardening TP</span>
    <div class="nav-links">
      <RouterLink to="/">Accueil</RouterLink>
      <RouterLink to="/student">Étudiant</RouterLink>
      <RouterLink to="/teacher">Professeur</RouterLink>
    </div>
  </nav>
  <RouterView />
</template>

<script>
import { useRoute } from 'vue-router'

export default {
  computed: {
    showNav() {
      return this.$route.path !== '/'
    }
  }
}
</script>


<style scoped>
  nav {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    padding: 12px 24px;
    background-color: #6366f1;
  }

  .nav-links {
    position: absolute;    
    left: 50%;             
    transform: translateX(-50%);
    display: flex;
    gap: 16px;
  }

  span {
    color: white;
    font-weight: bold;
  }

  a {
    color: white;
    text-decoration: none;
    padding: 8px 12px;
  }

  a:hover {
    background-color: #34495e;
    border-radius: 4px;
  }
</style>