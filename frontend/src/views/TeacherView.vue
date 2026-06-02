<template>
  <div>
    <h1>Dashboard Professeur</h1>
    <nav>
      <RouterLink to="/teacher/sessions" @click="scoringVisible = false">Sessions</RouterLink>
      <span> | </span>
      <a href="#" @click.prevent="showScoring">Scoring</a>
    </nav>

    <!-- Vue scoring -->
    <div v-if="scoringVisible">

      <!-- Détail d'un étudiant -->
      <div v-if="selectedStudent && selectedStudent.student">
        <button @click="selectedStudent = null">← Retour à la liste</button>

        <h2>{{ selectedStudent.student.username }} ({{ selectedStudent.student.etu_id }})</h2>
        <p>Email : {{ selectedStudent.student.email }}</p>
        <p>IP conteneur : {{ selectedStudent.student.container_ip }}</p>

        <p v-if="selectedStudent.score">
          Score : <strong>{{ selectedStudent.score.score }} / {{ selectedStudent.score.max_score }}</strong>
          — dernière mise à jour : {{ new Date(selectedStudent.score.snapshot_at).toLocaleString() }}
        </p>
        <p v-else>Aucun score disponible.</p>

        <h3>Détail des failles</h3>
        <div v-for="vuln in selectedStudent.vulnerabilities" :key="vuln.name">
          <p>
            <strong>{{ vuln.name }}</strong>
            ({{ vuln.category }}) —
            {{ vuln.passed ? '✅ Corrigée' : '❌ Non corrigée' }}
            <br />
            <small>{{ vuln.description }}</small>
            <br />
            <small v-if="vuln.last_checked_at">
              Dernière vérification : {{ new Date(vuln.last_checked_at).toLocaleString() }}
            </small>
          </p>
        </div>
      </div>

      <!-- Liste des étudiants -->
      <div v-else>
        <h2>Scoring — Session active</h2>
        <p v-if="loadingList">Chargement...</p>
        <p v-else-if="students.length === 0">Aucun étudiant dans la session active.</p>

        <div v-for="s in students" :key="s.enrollment_id">
          <a href="#" @click.prevent="loadDetail(s.enrollment_id)">
            {{ s.username }} ({{ s.etu_id }})
          </a>
          — Score :
          <strong>{{ s.score ?? '—' }} / {{ s.max_score ?? '—' }}</strong>
          — Token : <code>{{ s.token }}</code>
        </div>
      </div>

    </div>

    <RouterView v-if="!scoringVisible" />
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { getStudentsList, getStudentDetail } from '@/services/api';

const scoringVisible  = ref(false);
const students        = ref([]);
const loadingList     = ref(false);
const selectedStudent = ref(null);

async function showScoring() {
  scoringVisible.value = true;
  selectedStudent.value = null;
  loadingList.value = true;
  students.value = await getStudentsList();
  loadingList.value = false;
}

async function loadDetail(enrollmentId) {
  selectedStudent.value = await getStudentDetail(enrollmentId);
}
</script>