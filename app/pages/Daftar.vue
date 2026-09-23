<template>
  <div class="register-page">
    <button class="theme-toggle-btn" @click="toggleDarkMode" title="Ganti Tema">
      <Icon :name="isDarkMode ? 'ph:sun-duotone' : 'ph:moon-duotone'" />
    </button>
    <div class="register-container">
      <!-- Logo Section -->
      <div class="logo-wrapper">
        <NuxtLink to="/">
          <img src="/logo.png" alt="KAIH Logo" class="logo" />
        </NuxtLink>
      </div>

      <!-- Register Card -->
      <div class="register-card">
        <h1 class="register-title">Buat akun baru</h1>
        
        <form @submit.prevent="handleRegister" class="register-form">
          <div class="form-group">
            <label for="name" class="form-label">Nama Lengkap Orang Tua</label>
            <div class="input-wrapper">
              <Icon name="ph:user" class="input-icon" />
              <input 
                type="text" 
                id="name" 
                v-model="name" 
                class="form-input" 
                placeholder="Masukkan nama lengkap Anda" 
                required 
              />
            </div>
          </div>

          <div class="form-group">
            <label for="childName" class="form-label">Nama Lengkap Anak</label>
            <div class="input-wrapper">
              <Icon name="ph:student" class="input-icon" />
              <input 
                type="text" 
                id="childName" 
                v-model="childName" 
                class="form-input" 
                placeholder="Masukkan nama lengkap anak Anda" 
                required 
              />
            </div>
          </div>

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

          <div class="form-group">
            <label for="password" class="form-label">Password</label>
            <div class="input-wrapper">
              <Icon name="ph:lock-key" class="input-icon" />
              <input 
                :type="showPassword ? 'text' : 'password'" 
                id="password" 
                v-model="password" 
                class="form-input" 
                placeholder="Buat password Anda" 
                required 
              />
              <button 
                type="button" 
                class="toggle-password" 
                @click="showPassword = !showPassword"
              >
                <Icon :name="showPassword ? 'ph:eye-slash' : 'ph:eye'" />
              </button>
            </div>
          </div>

          <div class="form-group">
            <label for="confirmPassword" class="form-label">Konfirmasi Password</label>
            <div class="input-wrapper">
              <Icon name="ph:lock-key" class="input-icon" />
              <input 
                :type="showConfirmPassword ? 'text' : 'password'" 
                id="confirmPassword" 
                v-model="confirmPassword" 
                class="form-input" 
                placeholder="Ulangi password Anda" 
                required 
              />
              <button 
                type="button" 
                class="toggle-password" 
                @click="showConfirmPassword = !showConfirmPassword"
              >
                <Icon :name="showConfirmPassword ? 'ph:eye-slash' : 'ph:eye'" />
              </button>
            </div>
          </div>

          <button type="submit" class="btn-register" :disabled="isLoading">
            <span v-if="isLoading" class="loader"></span>
            <span v-else>Daftar</span>
          </button>
        </form>

        <div class="register-footer">
          <p>Sudah punya akun? <NuxtLink to="/Login" class="login-link">Log in di sini</NuxtLink></p>
        </div>
      </div>
    </div>

    <!-- Modal Dialog -->
    <div v-if="modalState.show" class="modal-overlay">
      <div class="modal-content modal-sm">
        <div class="modal-header">
          <h2>{{ modalState.title }}</h2>
          <button class="btn-close" @click="modalState.show = false"><Icon name="ph:x-bold" /></button>
        </div>
        <div class="modal-body text-center">
          <div :style="{ fontSize: '3rem', color: modalState.iconColor, marginBottom: '1rem' }">
            <Icon :name="modalState.icon" />
          </div>
          <p style="font-size: 1.05rem; color: #475569;" v-html="modalState.message"></p>
        </div>
        <div class="modal-actions" style="justify-content: center;">
          <button class="btn-primary" :style="{ backgroundColor: modalState.confirmBtnColor }" @click="handleModalConfirm">{{ modalState.confirmBtnText }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

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

const supabase = useSupabase()
const router = useRouter()
const name = ref('')
const childName = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const isLoading = ref(false)

const modalState = ref({
  show: false,
  icon: 'ph:warning-circle-duotone',
  iconColor: '#ef4444',
  title: '',
  message: '',
  confirmBtnText: 'OK',
  confirmBtnColor: '#2563eb',
  onConfirm: null
})

const showAlert = (options) => {
  modalState.value = {
    ...modalState.value,
    show: true,
    confirmBtnText: 'OK',
    confirmBtnColor: '#2563eb',
    ...options
  }
}

const handleModalConfirm = () => {
  if (modalState.value.onConfirm) {
    modalState.value.onConfirm()
  } else {
    modalState.value.show = false
  }
}

const generateStudentPassword = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789'
  let result = ''
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

const handleRegister = async () => {
  if (password.value !== confirmPassword.value) {
    showAlert({
      icon: 'ph:warning-circle-duotone',
      iconColor: '#ef4444',
      title: 'Password Tidak Cocok',
      message: 'Password dan konfirmasi password tidak sama!'
    })
    return
  }
  
  isLoading.value = true
  
  // Otomatis generate akun anak (siswa) ketika orang tua mendaftar
  const studentPassword = generateStudentPassword()
  const studentUsername = childName.value.toLowerCase().replace(/[^a-z0-9]/g, '') + Math.floor(Math.random() * 1000)
  
  try {
    // 1. Daftar ke Supabase
    const { data, error } = await supabase.auth.signUp({
      email: email.value,
      password: password.value,
      options: {
        data: {
          name: name.value,
          role: 'orangtua', // Role otomatis sebagai orang tua
          child_name: childName.value,
          student_username: studentUsername,
          student_password: studentPassword
        }
      }
    })

    if (error) {
      showAlert({
        icon: 'ph:warning-circle-duotone',
        iconColor: '#ef4444',
        title: 'Registrasi Gagal',
        message: error.message === 'User already registered' 
          ? 'Email ini sudah terdaftar. Silakan gunakan email lain atau langsung Login.'
          : error.message
      })
      isLoading.value = false
      return
    }

    // Tampilkan informasi akun anak yang di-generate otomatis kepada orang tua
    showAlert({
      icon: 'ph:check-circle-duotone',
      iconColor: '#10b981',
      title: 'Registrasi Berhasil!',
      message: `
        <p>Akun Supabase Anda berhasil dibuat. Sistem juga telah otomatis membuat akses untuk anak Anda:</p>
        <div style="background: #f1f5f9; padding: 1rem; border-radius: 8px; text-align: left; margin: 1rem 0; color: #0f172a;">
          <strong>Username Siswa:</strong> ${studentUsername}<br/>
          <strong>Password Siswa:</strong> ${studentPassword}
        </div>
        <p style="font-size: 0.9em; color: #64748b;">Silakan simpan informasi ini untuk login anak Anda.</p>
      `,
      confirmBtnColor: '#2563eb',
      confirmBtnText: 'Lanjut Login',
      onConfirm: () => {
        modalState.value.show = false
        router.push('/Login')
      }
    })

  } catch (err) {
    showAlert({
      icon: 'ph:warning-circle-duotone',
      iconColor: '#ef4444',
      title: 'Terjadi Kesalahan',
      message: 'Tidak dapat terhubung ke server database. Silakan coba lagi.'
    })
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800&display=swap');

.register-page {
  font-family: 'Nunito', sans-serif;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f0f9ff 0%, #e0e7ff 100%);
  padding: 2rem;
}

.register-container {
  width: 100%;
  max-width: 440px;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 2rem 0;
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

.register-card {
  width: 100%;
  background: white;
  border-radius: 20px;
  padding: 2.5rem;
  box-shadow: 0 20px 40px -10px rgba(0,0,0,0.1), 0 10px 15px -3px rgba(0,0,0,0.05);
  animation: fadeIn 0.8s ease-out;
  border: 1px solid rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(10px);
}

.register-title {
  font-size: 2rem;
  font-weight: 800;
  color: #1e293b;
  text-align: center;
  margin-bottom: 2rem;
  letter-spacing: -0.02em;
}

.register-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
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

.toggle-password {
  position: absolute;
  right: 1rem;
  background: none;
  border: none;
  color: #94a3b8;
  font-size: 1.25rem;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.3s ease;
}

.toggle-password:hover {
  color: #475569;
}

.btn-register {
  width: 100%;
  margin-top: 0.5rem;
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

.btn-register:hover {
  background-color: #1d4ed8;
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(37, 99, 235, 0.35);
}

.btn-register:disabled {
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

.register-footer {
  margin-top: 2rem;
  text-align: center;
  font-size: 0.95rem;
  color: #64748b;
  font-weight: 600;
}

.login-link {
  color: #2563eb;
  font-weight: 700;
  text-decoration: none;
  transition: color 0.3s ease;
}

.login-link:hover {
  color: #1d4ed8;
  text-decoration: underline;
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
  .register-card {
    padding: 2rem 1.5rem;
  }
}
</style>

<style>
/* Register Page Dark Mode Overrides */
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

body.dark-theme .register-page {
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
}

body.dark-theme .register-card {
  background: rgba(30, 41, 59, 0.8);
  border-color: #334155;
  box-shadow: 0 20px 40px -10px rgba(0,0,0,0.5);
}

body.dark-theme .register-title { color: #f8fafc; }
body.dark-theme .form-label { color: #cbd5e1; }
body.dark-theme .register-footer { color: #94a3b8; }

body.dark-theme .theme-toggle-btn {
  background: #1e293b;
  border-color: #334155;
  color: #cbd5e1;
}
body.dark-theme .theme-toggle-btn:hover {
  background: #334155;
  color: #f8fafc;
}

/* Modal Overrides */
.modal-overlay {
  position: fixed; top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(15, 23, 42, 0.6); backdrop-filter: blur(4px);
  display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 1rem;
}
.modal-content {
  background: white; border-radius: 20px; width: 100%; max-width: 500px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  display: flex; flex-direction: column; max-height: 90vh;
}
.modal-sm { max-width: 400px; }
.text-center { text-align: center; }
.modal-header {
  padding: 1.5rem; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center;
}
.modal-header h2 { margin: 0; font-size: 1.25rem; font-weight: 800; color: #0f172a; }
.btn-close {
  background: none; border: none; font-size: 1.2rem; color: #64748b; cursor: pointer; padding: 0.5rem; border-radius: 8px; transition: all 0.2s;
}
.btn-close:hover { background: #f1f5f9; color: #0f172a; }
.modal-body { padding: 1.5rem; overflow-y: auto; display: flex; flex-direction: column; gap: 1.25rem; }
.modal-actions {
  padding: 1.5rem; border-top: 1px solid #e2e8f0; display: flex; justify-content: flex-end; gap: 1rem;
}
.btn-primary {
  padding: 0.75rem 1.5rem; border-radius: 10px; border: none; color: white; font-weight: 700; cursor: pointer; transition: all 0.2s; font-family: inherit;
}
.btn-primary:hover { opacity: 0.9; transform: translateY(-1px); }

body.dark-theme .modal-content { background: #1e293b; border: 1px solid #334155; }
body.dark-theme .modal-header { border-bottom-color: #334155; }
body.dark-theme .modal-header h2 { color: #f8fafc; }
body.dark-theme .btn-close { color: #94a3b8; }
body.dark-theme .btn-close:hover { background: #334155; color: #f8fafc; }
body.dark-theme .modal-actions { border-top-color: #334155; }
</style>
