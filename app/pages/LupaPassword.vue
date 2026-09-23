<template>
  <div class="forgot-password-page">
    <button class="theme-toggle-btn" @click="toggleDarkMode" title="Ganti Tema">
      <Icon :name="isDarkMode ? 'ph:sun-duotone' : 'ph:moon-duotone'" />
    </button>
    <div class="forgot-password-container">
      <!-- Logo Section -->
      <div class="logo-wrapper">
        <NuxtLink to="/">
          <img src="/logo.png" alt="KAIH Logo" class="logo" />
        </NuxtLink>
      </div>

      <!-- Forgot Password Card -->
      <div class="forgot-password-card">
        <h1 class="card-title">Lupa Password</h1>
        <p class="card-subtitle">Masukkan email terdaftar Anda, dan kami akan mengirimkan instruksi untuk mereset password.</p>
        
        <form v-if="!isSent" @submit.prevent="handleReset" class="reset-form">
          <div class="form-group">
            <label for="email" class="form-label">Email</label>
            <div class="input-wrapper">
              <Icon name="ph:envelope-simple" class="input-icon" />
              <input 
                type="email" 
                id="email" 
                v-model="email" 
                class="form-input" 
                placeholder="Masukkan email Anda" 
                required 
              />
            </div>
          </div>

          <button type="submit" class="btn-primary" :disabled="isLoading">
            <span v-if="isLoading" class="loader"></span>
            <span v-else>Kirim Link Reset</span>
          </button>
        </form>

        <div v-else class="success-message">
          <Icon name="ph:check-circle-fill" class="success-icon" />
          <p>Link reset password telah dikirim ke <strong>{{ email }}</strong>. Silakan periksa inbox atau folder spam Anda.</p>
        </div>

        <div class="card-footer">
          <NuxtLink to="/Login" class="back-link">
            <Icon name="ph:arrow-left" /> Kembali ke Login
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

definePageMeta({
  layout: false
})

const isDarkMode = ref(false)

const toggleDarkMode = () => {
  isDarkMode.value = !isDarkMode.value
  if (import.meta.client) {
    if (isDarkMode.value) {
      document.body.classList.add('dark-theme')
      localStorage.setItem('landing-theme', 'dark')
    } else {
      document.body.classList.remove('dark-theme')
      localStorage.setItem('landing-theme', 'light')
    }
  }
}

onMounted(() => {
  if (import.meta.client) {
    const savedTheme = localStorage.getItem('landing-theme')
    if (savedTheme === 'dark') {
      isDarkMode.value = true
      document.body.classList.add('dark-theme')
    }
  }
})

const email = ref('')
const isLoading = ref(false)
const isSent = ref(false)

const handleReset = async () => {
  isLoading.value = true
  
  // Simulasi proses kirim email reset password
  setTimeout(() => {
    isLoading.value = false
    isSent.value = true
  }, 1500)
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800&display=swap');

.forgot-password-page {
  font-family: 'Nunito', sans-serif;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f0f9ff 0%, #e0e7ff 100%);
  padding: 2rem;
}

.forgot-password-container {
  width: 100%;
  max-width: 420px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.logo-wrapper {
  margin-bottom: 2rem;
  animation: slideDown 0.6s ease-out;
}

.logo {
  height: 80px;
  object-fit: contain;
  transition: transform 0.3s ease;
}

.logo:hover {
  transform: scale(1.05);
}

.forgot-password-card {
  width: 100%;
  background: white;
  border-radius: 20px;
  padding: 2.5rem 2.5rem;
  box-shadow: 0 20px 40px -10px rgba(0,0,0,0.1), 0 10px 15px -3px rgba(0,0,0,0.05);
  animation: fadeIn 0.8s ease-out;
  border: 1px solid rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(10px);
}

.card-title {
  font-size: 2rem;
  font-weight: 800;
  color: #1e293b;
  text-align: center;
  margin-bottom: 0.5rem;
  letter-spacing: -0.02em;
}

.card-subtitle {
  font-size: 0.95rem;
  color: #64748b;
  text-align: center;
  margin-bottom: 2rem;
  line-height: 1.5;
}

.reset-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-label {
  font-weight: 700;
  color: #475569;
  font-size: 0.95rem;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: 1rem;
  color: #94a3b8;
  font-size: 1.25rem;
  transition: color 0.3s ease;
}

.form-input {
  width: 100%;
  padding: 0.85rem 1rem 0.85rem 3rem;
  border: 1px solid #cbd5e1;
  border-radius: 12px;
  font-family: 'Nunito', sans-serif;
  font-size: 1rem;
  color: #0f172a;
  background-color: #f8fafc;
  transition: all 0.3s ease;
}

.form-input::placeholder {
  color: #94a3b8;
}

.form-input:focus {
  outline: none;
  border-color: #3b82f6;
  background-color: white;
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
}

.form-input:focus + .input-icon,
.input-wrapper:focus-within .input-icon {
  color: #3b82f6;
}

.btn-primary {
  width: 100%;
  padding: 0.85rem;
  background-color: #2563eb;
  color: white;
  border: none;
  border-radius: 12px;
  font-family: 'Nunito', sans-serif;
  font-weight: 800;
  font-size: 1.1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.25);
  display: flex;
  justify-content: center;
  align-items: center;
  height: 50px;
}

.btn-primary:hover {
  background-color: #1d4ed8;
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(37, 99, 235, 0.35);
}

.btn-primary:disabled {
  background-color: #94a3b8;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.loader {
  width: 20px;
  height: 20px;
  border: 3px solid rgba(255,255,255,0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 1s ease-in-out infinite;
}

.success-message {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  text-align: center;
  background-color: #f0fdf4;
  border: 1px solid #bbf7d0;
  padding: 1.5rem;
  border-radius: 16px;
  color: #166534;
  line-height: 1.5;
}

.success-icon {
  font-size: 3rem;
  color: #22c55e;
}

.card-footer {
  margin-top: 2rem;
  text-align: center;
  font-size: 0.95rem;
  font-weight: 700;
}

.back-link {
  color: #64748b;
  text-decoration: none;
  transition: color 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.back-link:hover {
  color: #1e293b;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@keyframes slideDown {
  from { opacity: 0; transform: translateY(-20px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

@media (max-width: 480px) {
  .forgot-password-card {
    padding: 2rem 1.5rem;
  }
  .card-title {
    font-size: 1.7rem;
  }
}
</style>

<style>
/* Lupa Password Page Dark Mode Overrides */
.theme-toggle-btn {
  position: absolute;
  top: 1.5rem;
  right: 2rem;
  background: white;
  border: 1px solid #e2e8f0;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: #475569;
  cursor: pointer;
  box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
  transition: all 0.3s ease;
  z-index: 100;
}
.theme-toggle-btn:hover {
  background: #f8fafc;
  color: #3b82f6;
  transform: translateY(-2px);
}

@media (max-width: 768px) {
  .theme-toggle-btn {
    top: 1rem;
    right: 1rem;
    width: 40px;
    height: 40px;
    font-size: 1.2rem;
  }
}

body.dark-theme .forgot-password-page {
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
}

body.dark-theme .forgot-password-card {
  background: rgba(30, 41, 59, 0.8);
  border-color: #334155;
  box-shadow: 0 20px 40px -10px rgba(0,0,0,0.5);
}

body.dark-theme .card-title { color: #f8fafc; }
body.dark-theme .card-subtitle { color: #94a3b8; }
body.dark-theme .form-label { color: #cbd5e1; }
body.dark-theme .card-footer { color: #94a3b8; }
body.dark-theme .back-link { color: #cbd5e1; }
body.dark-theme .back-link:hover { color: #f8fafc; }

body.dark-theme .success-message {
  background-color: rgba(22, 163, 74, 0.1);
  border-color: #166534;
  color: #86efac;
}

body.dark-theme .theme-toggle-btn {
  background: #1e293b;
  border-color: #334155;
  color: #cbd5e1;
}
body.dark-theme .theme-toggle-btn:hover {
  background: #334155;
  color: #f8fafc;
}
</style>
