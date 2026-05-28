<template>
  <div>
    <h1>Sessions</h1>

    <!-- Créer une session -->
    <div>
      <input v-model="newSessionName" placeholder="Nom de la session" />
      <button @click="handleCreate">Créer</button>
    </div>

    <!-- Liste des sessions -->
    <div v-if="loading">Chargement...</div>

    <div v-for="session in sessions" :key="session.id">
      <span>{{ session.name }} — {{ session.active ? 'Active' : 'Inactive' }}</span>

      <button v-if="!session.active" @click="handleStart(session.id)">Démarrer</button>
      <button v-if="session.active" @click="handleStop(session.id)">Arrêter</button>
      <button @click="handleDelete(session.id)">Supprimer</button>
      <button @click="openImport(session.id)">Importer étudiants</button>
    </div>

    <!-- Import CSV -->
    <div v-if="importSessionId">
      <textarea v-model="csvContent" placeholder="etu_id,email&#10;p2200001,jean.dupont@univ.fr" />
      <button @click="handleImport">Importer</button>
      <button @click="importSessionId = null">Annuler</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import {
  getSessions,
  createSession,
  startSession,
  stopSession,
  deleteSession,
  importStudents,
} from '@/services/api'

const sessions = ref([])
const loading = ref(false)
const newSessionName = ref('')
const importSessionId = ref(null)
const csvContent = ref('')

async function fetchSessions() {
  loading.value = true
  sessions.value = await getSessions()
  loading.value = false
}

async function handleCreate() {
  if (!newSessionName.value) return
  await createSession(newSessionName.value)
  newSessionName.value = ''
  await fetchSessions()
}

async function handleStart(id) {
  await startSession(id)
  await fetchSessions()
}

async function handleStop(id) {
  await stopSession(id)
  await fetchSessions()
}

async function handleDelete(id) {
  if (!confirm('Supprimer cette session ?')) return
  await deleteSession(id)
  await fetchSessions()
}

function openImport(id) {
  importSessionId.value = id
  csvContent.value = 'etu_id,email\n'
}

async function handleImport() {
  await importStudents(importSessionId.value, csvContent.value)
  importSessionId.value = null
  await fetchSessions()
}

onMounted(fetchSessions)
</script>


<style scoped>
textarea {
  width: 500px;
  height: 200px;
}
</style>