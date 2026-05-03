<template>
  <div class="container">
    <h1>Hardening TP</h1>
    <h2>Professeur ou étudiant ?</h2>

    <div class="choices">
      <div class="choice-box">
        <h2>Étudiant</h2>
        <p>Accéder à mon dashboard</p>
        <RouterLink to="/student" class="btn">Je suis étudiant</RouterLink>
      </div>

      <div class="choice-box">
        <h2>Professeur</h2>
        <p>Gérer les sessions et les attaques</p>
        <RouterLink to="/teacher" class="btn">Je suis professeur</RouterLink>
      </div>
    </div>
  </div>
</template>

<style scoped>
.container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 70vh;
  background-color: #f8fafc;
  color: #0f172a;
}

h1 {
  font-size: 2rem;
  margin-bottom: 8px;
  color: #0f172a;
}

h2 {
  color: #64748b;
  font-size: 1.7rem;
  margin-bottom: 32px;
}

.choices {
  display: flex;
  gap: 24px;
}

.choice-box {
  background-color: #ffffff;
  padding: 32px;
  width: 200px;
  text-align: center;
  border: 2px solid #e2e8f0;
  transition: border 0.2s, box-shadow 0.2s;
}

.choice-box:hover {
  border: 2px solid #6366f1;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.15);
}

.choice-box h2 {
  color: #0f172a;
  margin-bottom: 8px;
}

.choice-box p {
  font-size: 0.85rem;
  color: #64748b;
  margin-bottom: 16px;
}

a {
  color: #6366f1;
  text-decoration: none;
  font-weight: bold;
}

a:hover {
  color: #4f46e5;
}

.btn {
  display: inline-block;
  padding: 10px 20px;
  border: 2px solid #6366f1;
  color: #6366f1;
  text-decoration: none;
  font-weight: bold;
  transition: background-color 0.2s, color 0.2s;
}

.btn:hover {
  background-color: #6366f1;
  color: white;
}
</style>