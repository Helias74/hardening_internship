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
      <button @click="verifyToken">Accéder</button>
      <p v-if="error" style="color: red;">{{ error }}</p>
    </div>

    <!-- Dashboard une fois authentifié -->
    <div v-else>
      <h1>Dashboard Étudiant</h1>
      <p>Bonjour <strong>{{ student.username }}</strong> ({{ student.etu_id }})</p>
      <p>Email : {{ student.email }}</p>
      <p>Ip attribué : {{ student.container_ip }}</p>

      <!-- Scoring -->
      <div v-if="scoring">
        <h2>Mon score</h2>

        <p v-if="scoring.score">
          Score actuel : <strong>{{ scoring.score.score }} / {{ scoring.score.max_score }}</strong>
        </p>
        <p v-else>Score non disponible — le robot n'a pas encore effectué de vérification.</p>

        <p>Failles corrigées : {{ scoring.passed_vulns.length }} / {{ scoring.total_vulns }}</p>
        <p>Il reste <strong>{{ scoring.remaining }}</strong> faille(s) à corriger.</p>

        <div v-if="scoring.passed_vulns.length > 0">
          <h3>Failles corrigées</h3>
          <div v-for="vuln in scoring.passed_vulns" :key="vuln.name">
            <p>
              <strong>{{ vuln.name }}</strong> — {{ vuln.description }}
              <br />
              <small>Corrigée le {{ new Date(vuln.last_checked_at).toLocaleString() }}</small>
            </p>
          </div>
        </div>

        <p v-else>Aucune faille corrigée pour le moment.</p>
      </div>

      <div v-else>
        <p>Chargement du score...</p>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref } from 'vue';
import { getStudentScore } from '@/services/api';

const token   = ref('');
const student = ref(null);
const scoring = ref(null);
const error   = ref('');

async function verifyToken() {
  error.value = '';
  try {
    const res = await fetch(`/api/student/me?token=${token.value}`);
    if (!res.ok) {
      error.value = 'Token invalide';
      return;
    }
    student.value = await res.json();
    await loadScore();
  } catch (e) {
    error.value = 'Erreur de connexion au serveur';
  }
}

async function loadScore() {
  try {
    scoring.value = await getStudentScore(token.value);
  } catch (e) {
    error.value = 'Erreur lors du chargement du score';
  }
}
</script>