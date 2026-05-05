<template>
    <div class="login">
        <h2>Accès enseignant</h2>
        <form @submit.prevent="handleLogin">
            <input 
                v-model="username" 
                type="text" 
                placeholder="Nom d'utilisateur"
                required 
            />
            <input 
                v-model="password" 
                type="password" 
                placeholder="Mot de passe"
                required 
            />
            <button type="submit">Se connecter</button>
            <p v-if="error" class="error">{{ error }}</p>
        </form>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { login } from '../services/auth.service.js'

const router = useRouter()
const username = ref('')
const password = ref('')
const error = ref('')

async function handleLogin() {
    try {
        await login(username.value, password.value)
        router.push('/teacher')
    } catch (e) {
        error.value = 'Identifiants incorrects'
    }
}
</script>