<template>
  <div class="student-view">

    <!-- Formulaire de saisie du token -->
    <div v-if="!student">
      <h1>Accès étudiant</h1>
      <input
        v-model="token"
        placeholder="Colle ton token ici"
        type="text"
      />
      <button @click="verify">Accéder</button>
      <p v-if="error" style="color: red;">{{ error }}</p>
    </div>

    <!-- Dashboard une fois authentifié -->
    <div v-else>
      <h1>Dashboard Étudiant</h1>
      <p>Bonjour <strong>{{ student.username }}</strong> ({{ student.etu_id }})</p>
      <p>Email : {{ student.email }}</p>
    </div>

  </div>
</template>

<script setup>
import { ref } from 'vue';

const token   = ref('');
const student = ref(null);
const error   = ref('');

async function verify() {
  error.value = '';
  try {
    const res = await fetch(`http://localhost:3000/student/me?token=${token.value}`);
    if (!res.ok) {
      error.value = 'Token invalide';
      return;
    }
    student.value = await res.json();
  } catch (e) {
    error.value = 'Erreur de connexion au serveur';
  }
}
</script>