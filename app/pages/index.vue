<template>
  <div class="landing-page">
    <button class="theme-toggle-btn" @click="toggleDarkMode" title="Ganti Tema">
      <Icon :name="isDarkMode ? 'ph:sun-duotone' : 'ph:moon-duotone'" />
    </button>
    <div class="landing-content">
      <div class="header-section">
        <div class="logo-container">
          <img src="/logo.png" alt="KAIH Logo" class="main-logo" />
        </div>
        <h1 class="main-title">
          Sistem Monitoring <span class="text-highlight">KAIH</span>
        </h1>
        <p class="subtitle">
          Membangun 7 Kebiasaan Anak Indonesia Hebat bersama Orang Tua dan Guru
          untuk masa depan yang lebih cerah.
        </p>

        <div class="action-buttons">
          <NuxtLink to="/Login" class="btn btn-primary">
            <Icon name="ph:sign-in-bold" class="btn-icon" />
            Login ke Sistem
          </NuxtLink>
          <NuxtLink to="/Daftar" class="btn btn-secondary">
            <Icon name="ph:user-plus-bold" class="btn-icon" />
            Daftar Akun Baru
          </NuxtLink>
        </div>
      </div>

      <div class="features-grid">
        <div class="feature-card">
          <div class="feature-icon-wrapper bg-blue">
            <Icon name="ph:book-open-duotone" class="feature-icon text-blue" />
          </div>
          <h3 class="feature-title">Jurnal Harian</h3>
          <p class="feature-text">
            Catat 7 kebiasaan hebat setiap hari: bangun pagi, ibadah, olahraga,
            makan sehat, belajar, bermasyarakat, dan tidur tepat waktu.
          </p>
        </div>

        <div class="feature-card">
          <div class="feature-icon-wrapper bg-green">
            <Icon
              name="ph:chart-line-up-duotone"
              class="feature-icon text-green"
            />
          </div>
          <h3 class="feature-title">Monitoring Berkala</h3>
          <p class="feature-text">
            Pantau perkembangan kebiasaan anak secara real-time dengan laporan
            bulanan dan evaluasi komprehensif.
          </p>
        </div>

        <div class="feature-card">
          <div class="feature-icon-wrapper bg-purple">
            <Icon
              name="ph:users-three-duotone"
              class="feature-icon text-purple"
            />
          </div>
          <h3 class="feature-title">Kolaborasi</h3>
          <p class="feature-text">
            Kerjasama antara orang tua, guru, dan sekolah dalam membentuk
            karakter anak Indonesia yang hebat.
          </p>
        </div>
      </div>

      <div class="habits-section">
        <h2 class="habits-title">7 Kebiasaan Anak Indonesia Hebat</h2>
        <div class="habits-list">
          <div class="habit-item">
            <div class="habit-icon-wrapper bg-yellow">
              <Icon name="ph:sun-duotone" class="habit-icon" />
            </div>
            <span class="habit-label">Bangun Pagi</span>
          </div>
          <div class="habit-item">
            <div class="habit-icon-wrapper bg-blue-light">
              <Icon name="fa6-solid:person-praying" class="habit-icon" />
            </div>
            <span class="habit-label">Beribadah</span>
          </div>
          <div class="habit-item">
            <div class="habit-icon-wrapper bg-green-light">
              <Icon name="ph:person-simple-run-duotone" class="habit-icon" />
            </div>
            <span class="habit-label">Olahraga</span>
          </div>
          <div class="habit-item">
            <div class="habit-icon-wrapper bg-red-light">
              <Icon name="ph:bowl-food-duotone" class="habit-icon" />
            </div>
            <span class="habit-label">Makan Sehat</span>
          </div>
          <div class="habit-item">
            <div class="habit-icon-wrapper bg-purple-light">
              <Icon name="ph:book-bookmark-duotone" class="habit-icon" />
            </div>
            <span class="habit-label">Gemar Belajar</span>
          </div>
          <div class="habit-item">
            <div class="habit-icon-wrapper bg-indigo-light">
              <Icon name="ph:users-duotone" class="habit-icon" />
            </div>
            <span class="habit-label">Bermasyarakat</span>
          </div>
          <div class="habit-item">
            <div class="habit-icon-wrapper bg-gray-light">
              <Icon name="ph:bed-duotone" class="habit-icon" />
            </div>
            <span class="habit-label">Tidur Tepat</span>
          </div>
        </div>
      </div>
    </div>

    <AppFooter />
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";

definePageMeta({
  layout: false, // Do not use any wrapper layout, we render full screen
});

const isDarkMode = ref(false);

const toggleDarkMode = () => {
  isDarkMode.value = !isDarkMode.value;
  if (import.meta.client) {
    if (isDarkMode.value) {
      document.body.classList.add("dark-theme");
      localStorage.setItem("landing-theme", "dark");
    } else {
      document.body.classList.remove("dark-theme");
      localStorage.setItem("landing-theme", "light");
    }
  }
};

onMounted(() => {
  if (import.meta.client) {
    const savedTheme = localStorage.getItem("landing-theme");
    if (savedTheme === "dark") {
      isDarkMode.value = true;
      document.body.classList.add("dark-theme");
    }
  }
});
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800;900&display=swap");

.landing-page {
  font-family: "Nunito", sans-serif;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  color: #0f172a;
  overflow-x: hidden;
  width: 100%;
}

.landing-page * {
  box-sizing: border-box;
}

.landing-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 6rem 2rem 8rem;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

.header-section {
  text-align: center;
  margin-bottom: 5rem;
  max-width: 800px;
}

.logo-container {
  display: inline-block;
  padding: 1.5rem;
  background: white;
  border-radius: 30px;
  box-shadow: 0 20px 40px -10px rgba(37, 99, 235, 0.15);
  margin-bottom: 2rem;
  position: relative;
}

.logo-container::before {
  content: "";
  position: absolute;
  inset: -4px;
  border-radius: 34px;
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  z-index: -1;
  opacity: 0.5;
  filter: blur(8px);
}

.main-logo {
  height: 110px;
  animation: float 6s ease-in-out infinite;
}

@keyframes float {
  0% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-8px);
  }
  100% {
    transform: translateY(0px);
  }
}

.main-title {
  font-size: 3.5rem;
  font-weight: 900;
  color: #0f172a;
  margin-bottom: 1rem;
  letter-spacing: -0.02em;
  line-height: 1.2;
  word-wrap: break-word;
}

.text-highlight {
  background: linear-gradient(135deg, #2563eb, #7c3aed);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.subtitle {
  font-size: 1.25rem;
  color: #475569;
  margin-bottom: 3rem;
  line-height: 1.6;
  font-weight: 500;
}

.action-buttons {
  display: flex;
  gap: 1.5rem;
  justify-content: center;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 1rem 2rem;
  border-radius: 12px;
  font-weight: 700;
  font-size: 1.1rem;
  text-decoration: none;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
}

.btn-primary {
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  color: white;
  box-shadow: 0 10px 20px -5px rgba(37, 99, 235, 0.4);
  border: none;
}

.btn-primary:hover {
  transform: translateY(-3px);
  box-shadow: 0 15px 25px -5px rgba(37, 99, 235, 0.5);
}

.btn-secondary {
  background-color: white;
  color: #1e293b;
  border: 2px solid #e2e8f0;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
}

.btn-secondary:hover {
  background-color: #f8fafc;
  border-color: #cbd5e1;
  transform: translateY(-3px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05);
}

.btn-icon {
  font-size: 1.4rem;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 2rem;
  width: 100%;
  margin-bottom: 7rem;
}

.feature-card {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(10px);
  border-radius: 24px;
  padding: 2.5rem;
  border: 1px solid rgba(255, 255, 255, 0.5);
  box-shadow: 0 15px 35px -10px rgba(0, 0, 0, 0.05);
  transition: all 0.4s ease;
}

.feature-card:hover {
  transform: translateY(-8px);
  background: white;
  box-shadow: 0 25px 45px -15px rgba(37, 99, 235, 0.15);
  border-color: #e2e8f0;
}

.feature-icon-wrapper {
  width: 64px;
  height: 64px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.5rem;
}

.feature-icon {
  font-size: 2rem;
}

.bg-blue {
  background-color: #eff6ff;
}
.text-blue {
  color: #3b82f6;
}

.bg-green {
  background-color: #f0fdf4;
}
.text-green {
  color: #22c55e;
}

.bg-purple {
  background-color: #faf5ff;
}
.text-purple {
  color: #a855f7;
}

.feature-title {
  font-size: 1.4rem;
  font-weight: 800;
  color: #0f172a;
  margin-bottom: 1rem;
}

.feature-text {
  color: #475569;
  line-height: 1.7;
  font-size: 1.05rem;
}

.habits-section {
  text-align: center;
  width: 100%;
  background: white;
  padding: 4rem 2rem;
  border-radius: 32px;
  box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.05);
}

.habits-title {
  font-size: 2.5rem;
  font-weight: 900;
  color: #0f172a;
  margin-bottom: 3.5rem;
  letter-spacing: -0.02em;
}

.habits-list {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 3.5rem 2rem;
}

.habit-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  transition: transform 0.3s ease;
  width: 120px;
}

.habit-item:hover {
  transform: translateY(-8px);
}

.habit-icon-wrapper {
  width: 80px;
  height: 80px;
  border-radius: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  position: relative;
  z-index: 1;
}

.habit-icon-wrapper::after {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: inherit;
  filter: blur(10px);
  z-index: -1;
  opacity: 0.6;
  transition: opacity 0.3s ease;
}

.habit-item:hover .habit-icon-wrapper::after {
  opacity: 0.9;
}

.habit-item:hover .habit-icon-wrapper {
  transform: scale(1.1) rotate(5deg);
}

.habit-icon {
  font-size: 2.5rem;
}

/* Specific colors for 7 habits */
.bg-yellow {
  background: linear-gradient(135deg, #fef08a, #fde047);
}
.bg-yellow .habit-icon {
  color: #ca8a04;
}

.bg-blue-light {
  background: linear-gradient(135deg, #bfdbfe, #93c5fd);
}
.bg-blue-light .habit-icon {
  color: #2563eb;
}

.bg-green-light {
  background: linear-gradient(135deg, #bbf7d0, #86efac);
}
.bg-green-light .habit-icon {
  color: #16a34a;
}

.bg-red-light {
  background: linear-gradient(135deg, #fecaca, #fca5a5);
}
.bg-red-light .habit-icon {
  color: #dc2626;
}

.bg-purple-light {
  background: linear-gradient(135deg, #e9d5ff, #d8b4fe);
}
.bg-purple-light .habit-icon {
  color: #9333ea;
}

.bg-indigo-light {
  background: linear-gradient(135deg, #c7d2fe, #a5b4fc);
}
.bg-indigo-light .habit-icon {
  color: #4f46e5;
}

.bg-gray-light {
  background: linear-gradient(135deg, #e2e8f0, #cbd5e1);
}
.bg-gray-light .habit-icon {
  color: #475569;
}

.habit-label {
  font-weight: 800;
  color: #1e293b;
  font-size: 1rem;
  text-align: center;
  line-height: 1.3;
}

/* Responsiveness */
@media (max-width: 1024px) {
  .main-title {
    font-size: 3rem;
  }

  .habits-title {
    font-size: 2.2rem;
  }
}

@media (max-width: 768px) {
  .landing-content {
    padding: 4rem 1.5rem 5rem;
  }

  .main-title {
    font-size: 2.4rem;
  }

  .subtitle {
    font-size: 1.1rem;
    margin-bottom: 2rem;
  }

  .action-buttons {
    flex-direction: column;
    width: 100%;
    max-width: 300px;
    margin: 0 auto;
  }

  .btn {
    width: 100%;
  }

  .features-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
    margin-bottom: 4rem;
  }

  .habits-section {
    padding: 3rem 1.5rem;
    border-radius: 24px;
  }

  .habits-title {
    font-size: 1.8rem;
    margin-bottom: 2.5rem;
  }

  .habits-list {
    gap: 2rem 1.5rem;
  }

  .habit-item {
    width: 100px;
  }

  .habit-icon-wrapper {
    width: 64px;
    height: 64px;
    border-radius: 20px;
  }

  .habit-icon {
    font-size: 2rem;
  }
}

@media (max-width: 480px) {
  .landing-content {
    padding: 3rem 1rem 4rem;
  }

  .main-title {
    font-size: 2rem;
  }

  .logo-container {
    padding: 1rem;
    border-radius: 20px;
  }

  .main-logo {
    height: 80px;
  }

  .feature-card {
    padding: 1.5rem;
  }

  .habit-item {
    width: 80px;
  }

  .habit-icon-wrapper {
    width: 56px;
    height: 56px;
    border-radius: 16px;
  }

  .habit-icon {
    font-size: 1.6rem;
  }

  .habit-label {
    font-size: 0.85rem;
  }
}
</style>

<style>
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
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
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

/* Landing Page Dark Mode Overrides */
body.dark-theme .landing-page {
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
  color: #f8fafc;
}

body.dark-theme .logo-container {
  background: #1e293b;
  box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.5);
}

body.dark-theme .main-title {
  color: #f8fafc;
}
body.dark-theme .subtitle {
  color: #94a3b8;
}

body.dark-theme .btn-secondary {
  background-color: #1e293b;
  border-color: #334155;
  color: #cbd5e1;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3);
}
body.dark-theme .btn-secondary:hover {
  background-color: #334155;
  border-color: #475569;
  color: #f8fafc;
}

body.dark-theme .feature-card {
  background: rgba(30, 41, 59, 0.7);
  border-color: #334155;
}
body.dark-theme .feature-card:hover {
  background: #1e293b;
  border-color: #475569;
  box-shadow: 0 25px 45px -15px rgba(0, 0, 0, 0.5);
}
body.dark-theme .feature-title {
  color: #f8fafc;
}
body.dark-theme .feature-text {
  color: #94a3b8;
}

body.dark-theme .habits-section {
  background: #1e293b;
  box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.5);
}
body.dark-theme .habits-title {
  color: #f8fafc;
}
body.dark-theme .habit-label {
  color: #cbd5e1;
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

body.dark-theme .bg-blue {
  background-color: rgba(59, 130, 246, 0.2);
}
body.dark-theme .bg-green {
  background-color: rgba(34, 197, 94, 0.2);
}
body.dark-theme .bg-purple {
  background-color: rgba(168, 85, 247, 0.2);
}
</style>
